<template>
  <div class="app-container">

    <!-- 筛选栏 -->
    <div ref="filterhight" class="filter-container">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="名称：">
          <el-input clearable v-model="filterConditions['name'].value" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="密钥：">
          <el-input clearable v-model="filterConditions['appSecret'].value" placeholder="请输入密钥" />
        </el-form-item>
        <el-form-item label="状态：">
          <el-select v-model="filterConditions['disable'].value" placeholder="请选择状态">
            <el-option :value="null" label="全部" />
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
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
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleBachDelete">删除</el-button>
          <el-button v-waves size="small" class="filter-item" type="info" icon="el-icon-download" @click="handleDownloadTemplate">下载模板</el-button>
          <el-button v-waves size="small" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button>
          <el-upload
            action="#"
            style="display: inline-block;vertical-align: middle;margin-bottom: 10px; margin-left: 10px; margin-right: 10px;"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleUpload"
          >
            <el-button size="small" type="primary" icon="el-icon-upload2">导入</el-button>
          </el-upload>
          <el-button v-waves size="small" class="filter-item" type="danger" icon="el-icon-download" @click="getMyErrorTest">模拟异常</el-button>
        </div>
      </el-form>
    </div>

    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      element-loading-text="加载中..."
      :height="tableHeight"
      :data="list"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" align="center" width="55" />

      <el-table-column v-if="AllProp.findIndex(o=> o == moduleIdKey+'_Id') != -1" label="ID" prop="id" align="center" width="300px" />

      <el-table-column v-if="AllProp.findIndex(o=> o == moduleIdKey+'_Name') != -1" label="名称" prop="name" sortable="custom" align="center" min-width="100px" />

      <el-table-column v-if="AllProp.findIndex(o=> o == moduleIdKey+'_AppSecret') != -1" label="密钥" prop="appSecret" align="center" min-width="100px" />

      <el-table-column v-if="AllProp.findIndex(o=> o == moduleIdKey+'_Icon') != -1" label="图标" min-width="80px" prop="icon" align="center" />

      <el-table-column v-if="AllProp.findIndex(o=> o == moduleIdKey+'_CreateTime') != -1" label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="AllProp.findIndex(o=> o == moduleIdKey+'_Disable') != -1" label="是否启用" class-name="status-col" align="center" width="100">
        <template slot-scope="{row}">
          {{ row.disable | statusFilter }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">修改</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageIndex" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog v-el-drag-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入名称" />
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
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, createArticle, updateArticle, deleteArticle, uploadArticle, getMyErrorTest } from '@/api/system/test'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import ConditionOper from '@/utils/condition'
import { getToken } from '@/utils/auth'
import requestBase from '@/api/request-base'
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui

export default {
  name: 'TestTable',
  components: { Pagination },
  directives: { waves, elDragDialog },
  filters: {
    statusFilter(status) {
      const statusMap = {
        false: '禁用',
        true: '启用'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      moduleIdKey: '', 
      AllProp: [],
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
            direction: ConditionOper.SortEnum.DESC
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
      rules: {
        name: [{ required: true, message: '名称必填', trigger: 'change' }],
        appSecret: [{ required: true, message: '密钥必填', trigger: 'change' }]
      },
      statusList: [
        { name: '启用', value: true },
        { name: '禁用', value: false }
      ],
      // 勾选
      multipleSelection: [],
      // 状态开关
      filterStatus: 1,
      // 筛选条件
      filterConditions: {
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
    this.checkProps()
  },
  updated() {
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
      const baseH = 135 // 基础的一个高度
      let tableH = 280 // 默认的高度
      if (this.$refs.filterhight != null) {
        tableH = baseH + this.$refs.filterhight.offsetHeight + 30 // 动态的高度加上分页组件的高度
      }
      const tableHeightDetil = window.innerHeight - tableH
      if (tableHeightDetil <= 300) {
        this.tableHeight = 300
      } else {
        this.tableHeight = window.innerHeight - tableH
      }
    },
    // 检查字段权限
    checkProps() {
      let routerDatas = JSON.parse(window.localStorage.router || '')
      this.AllProp = JSON.parse(window.localStorage.userProps || '')
      if(routerDatas.length > 0) {
        this.getPathModel(routerDatas)
      }
    },

    getPathModel(data) {
      data.forEach((item,index) => {
        if(item.item.url == this.$route.path) {
           this.moduleIdKey = item.item.id
           return
        }
        if(item.children.length > 0) {
          this.getPathModel(item.children)
        }
      })
    },

    // 查询
    getList() {
      this.listLoading = true
      const conditions = []
      for (const o in this.filterConditions) {
        if (this.filterConditions[o].value !== '' && this.filterConditions[o].value !== null) {
          // 时间查询条件格式化处理
          if (this.filterConditions[o].dataType === 'DateTime') {
            this.filterConditions[o].value = parseTime(this.filterConditions[o].value)
          }
          conditions.push(this.filterConditions[o])
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
    // 勾选事件
    selectionChange(selection) {
      this.multipleSelection = selection
    },
    // 高级
    handleShow() {
      this.filterStatus = this.filterStatus ? 0 : 1
    },
    // 排序
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'name') {
        this.sortByID(prop, order)
      }
    },
    sortByID(prop, order) {
      if (order === 'ascending') {
        for (const o in this.listQuery.sorts) {
          if (this.listQuery.sorts[o].columnName.toUpperCase() === prop.toUpperCase()) {
            this.listQuery.sorts[o].direction = ConditionOper.SortEnum.ASC
            break
          }
        }
      } else {
        for (const o in this.listQuery.sorts) {
          if (this.listQuery.sorts[o].columnName.toUpperCase() === prop.toUpperCase()) {
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
              message: response.message, type: 'success'
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
          updateArticle(tempData).then(response => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              message: response.message, type: 'success'
            })
          })
        }
      })
    },

    // 删除
    handleDelete(row, index) {
      if (row != null) {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const deleteIds = []
          deleteIds.push(row.id)
          deleteArticle(deleteIds).then(response => {
            this.$notify({
              message: response.message, type: 'success'
            })
            this.list.splice(index, 1)
          })
        }).catch(() => {
          this.$notify({
            message: '已取消删除', type: 'info'
          })
        })
      }
    },

    // 批量删除
    handleBachDelete() {
      if (this.multipleSelection.length) {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const deleteIds = this.multipleSelection.map(item => item.id)
          deleteArticle(deleteIds).then(response => {
            this.$notify({
              message: response.message, type: 'success'
            })
            this.getList()
          })
        }).catch(() => {
          this.$notify({
            message: '已取消删除', type: 'info'
          })
        })
      } else {
        this.$message({
          message: '请勾选需要删除的数据', type: 'warning'
        })
      }
    },

    // 上传文件
    handleUpload(file, fileList) {
      this.listLoading = true
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1) // 获取上传文件的类型
      const extension = testmsg === 'xls'
      const extension2 = testmsg === 'xlsx'
      // const isLt2M = file.size / 1024 / 1024 < 2
      if (!extension && !extension2) {
        this.$message.error('上传文件只能是xls或xlsx格式!')
        return false
      }
      const formData = new window.FormData()
      formData.append('formFile', file.raw)
      uploadArticle(formData).then(response => {
        this.$notify({
          message: response.message, type: 'success'
        })
        this.getList()
      })
    },

    // 下载模板
    handleDownloadTemplate() {
      window.open(
        requestBase + `/Test/DownloadTemplate` +
        `?Authorization=Bearer ${getToken()}&fileName=导出测试文件模板`, // 当前路由的名称
        '_blank'
      )
    },

    // 导出全部
    handleDownload(items) {
      try {
        const obj = {
          url: requestBase + `/Test/Export`,
          fileName: '导出测试文件',
          conditions: Object.keys(this.filterConditions).map(key => this.filterConditions[key]).filter(item => item.value !== ''),
          sorts: this.listQuery.sorts
        }
        let ExportPath = obj.url
        ExportPath += `?Authorization=Bearer ${getToken()}`
        if (obj.fileName !== '') {
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
          })
        }
        if (obj.sorts.length) {
          obj.sorts.forEach((item, index) => {
            ExportPath += `&sorts[${index}].columnName=${item['columnName']}`
            ExportPath += `&sorts[${index}].direction=${item['direction']}`
          })
        }
        window.open(ExportPath.toString(), '_blank')
      } catch (e) {
        console.log(e)
      }
    },
    // 模拟异常
    getMyErrorTest() {
      getMyErrorTest().then(response => {
        this.$notify({
          message: response.message, type: 'success'
        })
      })
    }
  }
}
</script>

<style>

  .el-dialog__header, .el-dialog__body {
    padding: 20px 10px 0px 10px;
  }
  
  .el-dialog__header .el-dialog__headerbtn  {
    top: 10px;
    right: 10px;
  }
</style>