<template>
  <div class="app-container">

    <!-- 筛选栏 -->
    <div class="filter-container" ref="filterhight">
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
        <el-form-item v-if="filterStatus == 0" label="创建时间：">
          <el-date-picker v-model="filterConditions['beginCreateTime'].value" type="datetime" placeholder="开始日期" />
        </el-form-item>
        <el-form-item v-if="filterStatus == 0">-</el-form-item>
        <el-form-item v-if="filterStatus == 0">
          <el-date-picker v-model="filterConditions['endCreateTime'].value" type="datetime" placeholder="结束日期" />
        </el-form-item>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button v-waves class="filter-item" type="info" icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button v-waves class="filter-item" type="primary" :icon="filterStatus===0?'el-icon-zoom-out':'el-icon-zoom-in'" @click="handleShow">高级</el-button>
        <div>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
          <el-button size="small" v-waves class="filter-item" type="info" icon="el-icon-download" @click="handleDownloadTemplate">下载模板</el-button>
          <el-button size="small" v-waves class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
        </div>
      </el-form>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :height="tableHeight"
      :key="tableKey"
      :data="list"
      stripe
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
import { fetchList, fetchPv, createArticle, updateArticle, deleteArticle, downloadTemplate } from '@/api/consul'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import ConditionOper from '@/utils/condition'
import { getToken } from '@/utils/auth'

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
      //状态开关
      filterStatus: 1,
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
        },
        'beginCreateTime': {
          columnName: 'CreateTime',
          value: null,
          dataType: ConditionOper.DataTypeEnum.DateTime,
          operator: ConditionOper.ConditionOperEnum.GreaterThanEqual
        },
        'endCreateTime': {
          columnName: 'CreateTime',
          value: null,
          dataType: ConditionOper.DataTypeEnum.DateTime,
          operator: ConditionOper.ConditionOperEnum.LessThanEqual
        }
      }
    }
  },
  created() {
    this.getList()
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
      const baseH = 135 // 基础的一个高度
      let tableH = 280 // 默认的高度
      if(this.$refs.filterhight != null) {
        tableH = baseH + this.$refs.filterhight.offsetHeight + 30 // 动态的高度加上分页组件的高度
      }
      let tableHeightDetil = window.innerHeight - tableH
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
    // 条件筛选
    handleFilter() {
      this.listQuery.pageIndex = 1
      this.getList()
    },
    // 重置筛选
    handleReset() {
      this.filterConditions = {
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
        },
        'beginCreateTime': {
          columnName: 'CreateTime',
          value: null,
          dataType: ConditionOper.DataTypeEnum.DateTime,
          operator: ConditionOper.ConditionOperEnum.GreaterThanEqual
        },
        'endCreateTime': {
          columnName: 'CreateTime',
          value: null,
          dataType: ConditionOper.DataTypeEnum.DateTime,
          operator: ConditionOper.ConditionOperEnum.LessThanEqual
        }
      }
    },
    //高级
    handleShow() {
      this.filterStatus = this.filterStatus ? 0 : 1
    },
    //排序
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
          createArticle(this.temp).then(response => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.list.unshift(response.data)
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
      console.log(row)
      if(row != null) {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let deleteIds = []
          deleteIds.push(row.id)
          deleteArticle(deleteIds).then(() => {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.list.splice(index, 1)
          })
        }).catch(() => {
          this.$notify({
            title: '取消',
            message: '已取消删除',
            type: 'info',
            duration: 2000
          })       
        });
      }
    },

    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    
    // 下载模板
    handleDownloadTemplate() {
      window.open(
        `http://192.168.1.109:80/ocelot/Test/DownloadTemplate` +
        `?Authorization=Bearer ${getToken()}&fileName=导出测试文件模板`, // 当前路由的名称
        '_blank'
      )
    },

    //导出全部
    handleDownload(items) {
      try {
        let obj = {
          url:`http://192.168.1.109/ocelot/Test/Export`,
          fileName: '导出测试文件',
          conditions: Object.keys(this.filterConditions).map(key => this.filterConditions[key]).filter(item => item.value !== ''),
          sorts: this.listQuery.sorts
        }
        let ExportPath = obj.url;
        ExportPath += `?Authorization=Bearer ${getToken()}`;
        if (obj.fileName != '') {
          ExportPath += `&fileName=${obj.fileName}`
        }
        if (obj.conditions.length) {
          obj.conditions.forEach((item, index) => {
            if (item['value'] != null) {
              ExportPath += `&conditions[${index}].columnName=${item['columnName']}`
              if (item.hasOwnProperty('operator')) {
                ExportPath += `&conditions[${index}].operator=${item['operator']}`
              }
              ExportPath += `&conditions[${index}].value=${item['value']}`
            }
          });
        }
        if(obj.sorts.length){
          obj.sorts.forEach((item, index) => {
            ExportPath += `&sorts[${index}].columnName=${item['columnName']}`
            ExportPath += `&sorts[${index}].direction=${item['direction']}`
          });
        }
        window.open(ExportPath.toString(), '_blank');
      } catch (e) {
        console.log(e);
      }
    }
  }
}
</script>
