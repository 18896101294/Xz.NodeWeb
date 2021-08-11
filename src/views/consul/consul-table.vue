<template>
  <div class="app-container">

    <!-- 筛选栏 -->
    <div class="filter-container">
     <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="名称：">
          <el-input v-model="filterConditions['name'].value" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="密钥：">
          <el-input v-model="filterConditions['appSecret'].value" placeholder="请输入密钥"></el-input>
        </el-form-item>
        <el-form-item label="状态：">
            <el-select v-model="filterConditions['disable'].value" placeholder="请选择状态">
              <el-option :value="null" label="全部"></el-option>
              <el-option
                v-for="item in statusList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
        <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
      </el-form>
    </div>

    <!-- 表格 -->
    <el-table
      v-if="tableHeight"
      :height="tableHeight"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" align="center" width="300px">
      </el-table-column>

      <el-table-column label='名称' prop="name"  sortable="custom" align="center" min-width="100px">
      </el-table-column>

      <el-table-column label="密钥" prop="appSecret" align="center" min-width="100px">
      </el-table-column>

      <el-table-column label="图标" min-width="80px" prop="icon" align="center" >
      </el-table-column>

      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="是否启用" class-name="status-col" align="center" width="100">
        <template slot-scope="{row}">
            {{ row.disable | statusFilter }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">修改</el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageIndex" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入名称"/>
        </el-form-item>

        <el-form-item label="密钥" prop="appSecret">
          <el-input v-model="temp.appSecret" placeholder="请输入密钥" />
        </el-form-item>

        <el-form-item label="图标">
          <el-input v-model="temp.icon" placeholder="请输入图标" />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-select v-model="temp.disable" class="filter-item" placeholder="请选择">
            <el-option v-for="item in statusList" :key="item.name" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/consul'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import ConditionOper from '@/utils/condition'

export default {
  name: 'ConsulTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        false: '禁用',
        true: '启用'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 20,
        sorts: [
          {
            columnName: 'Name',
            direction: ConditionOper.SortEnum.DESC,
          }
        ],
        conditions: []
      },
      importanceOptions: [1, 2, 3],
      showReviewer: false,
      temp: {
        id: '',
        name: '',
        appSecret: '',
        createTime: new Date(),
        icon: '',
        disable: false
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '新增'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '名称必填', trigger: 'change' }],
        appSecret: [{ required: true, message: '密钥必填', trigger: 'change' }]
      },
      statusList: [
        { name: '启用', value: true },
        { name: '禁用', value: false },
      ],
      downloadLoading: false,
      //筛选条件
      filterConditions : {
        'name': {
          columnName: 'Name',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.AllLike
        },
        'appSecret': {
          columnName: 'AppSecret',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.AllLike
        },
        'disable': {
          columnName: 'Disable',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Int,
          operator: ConditionOper.ConditionOperEnum.Equal
        }
      }
    }
  },
  created() {
    this.getList()
    this.getTableHeight()
  },
  // 挂载window.onresize事件
  mounted() {
    const _this = this
    window.onresize = () => {
      if (_this.resizeFlag) {
        clearTimeout(_this.resizeFlag)
      }
      _this.resizeFlag = setTimeout(() => {
        _this.getTableHeight()
        _this.resizeFlag = null
      }, 100)
    }
  },
  // 注销window.onresize事件
  beforeRouteLeave(to, from, next) {
    // 离开组件的时候触发
    window.onresize = null
    next()
  },
  methods: {
     // 计算高度
    getTableHeight() {
      const tableH = 230
      const tableHeightDetil = window.innerHeight - tableH
      if (tableHeightDetil <= 300) {
        this.tableHeight = 300
      } else {
        this.tableHeight = window.innerHeight - tableH
      }
    },
    getList() {
      this.listLoading = true
      let conditions = []
      for (let o in this.filterConditions) {
        if (this.filterConditions[o].value !== '' && this.filterConditions[o].value !== null) {
          // 时间查询条件格式化处理
          if (this.filterConditions[o].dataType === 'DateTime') {
            this.filterConditions[o].value = dayjs(this.filterConditions[o].value).format('YYYY-MM-DD HH:mm:ss');
          }
          conditions.push(this.filterConditions[o]);
        }
      }
      this.listQuery.conditions = conditions

      fetchList(this.listQuery).then(response => {
        this.list = response.data.datas
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      this.getTableHeight()
    },
    handleFilter() {
      this.listQuery.pageIndex = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'name') {
        this.sortByID(prop, order)
      }
    },
    sortByID(prop, order) {
      if (order === 'ascending') {
        for (let o in this.listQuery.sorts) {
          if (this.listQuery.sorts[o].columnName.toUpperCase() == prop.toUpperCase()) {
            this.listQuery.sorts[o].direction = ConditionOper.SortEnum.ASC
            break
          }
        }
      } else {
        for (let o in this.listQuery.sorts) {
          if (this.listQuery.sorts[o].columnName.toUpperCase() == prop.toUpperCase()) {
            this.listQuery.sorts[o].direction = ConditionOper.SortEnum.DESC
            break
          }
        }
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        appSecret: '',
        createTime: new Date(),
        icon: '',
        disable: true
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 添加
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createArticle(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 修改
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    
    // 删除
    handleDelete(row, index) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
