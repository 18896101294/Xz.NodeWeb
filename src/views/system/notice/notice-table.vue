<template>
  <div class="app-container">
    <!-- 筛选栏 -->
    <div ref="filterhight" class="filter-container">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="标题：">
          <el-input clearable v-model="filterConditions['title'].value" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="通知分类：">
          <el-select clearable v-model="filterConditions['type'].value" placeholder="请选择">
            <el-option :value="null" label="全部" />
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行方式：">
          <el-select clearable v-model="filterConditions['execType'].value" placeholder="请选择">
            <el-option :value="null" label="全部" />
            <el-option
              v-for="item in execTypeList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="filterStatus == 0" label="通知范围：">
          <el-select clearable v-model="filterConditions['rangeType'].value" placeholder="请选择">
            <el-option  v-for="item in rangeTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="filterStatus == 0" label="是否执行：">
          <el-select clearable v-model="filterConditions['isExec'].value" placeholder="请选择">
            <el-option :value="null" label="全部" />
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button v-waves class="filter-item" type="info" icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button v-waves class="filter-item" type="primary" :icon="filterStatus===0?'el-icon-zoom-out':'el-icon-zoom-in'" @click="handleShow">高级</el-button>
        <div>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleBachDelete">删除</el-button>
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
      ref="multipleTable"
      :header-cell-style="{'text-align':'center'}"
      @selection-change="selectionChange"
      @current-change="currentChange"
    >
      <el-table-column type="selection" width="55" />

      <el-table-column label="通知标题" prop="titile" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          {{ row.titile }}
        </template>
      </el-table-column>

      <el-table-column label="通知内容" prop="content" sortable="custom" min-width="200px" align="left" />

      <el-table-column label="通知分类" class-name="status-col" width="80px">
        <template slot-scope="{row}">
          {{ row.type | typeFilter }}
        </template>
      </el-table-column>

      <el-table-column label="通知范围" class-name="status-col" width="130px">
        <template slot-scope="{row}" v-if="rangeTypeList.length>0">
          {{ rangeTypeList[row.rangeType].label }}
        </template>
      </el-table-column>

      <el-table-column label="执行方式" class-name="status-col" width="80px">
        <template slot-scope="{row}">
          {{ row.execType | execTypeFilter }}
        </template>
      </el-table-column>

      <el-table-column label="执行时间" prop="execTime" class-name="status-col" width="180px">
        <template slot-scope="{row}">
          {{ row.execTime }}
        </template>
      </el-table-column>

      <el-table-column label="html格式" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          {{ row.isHtml | trueFilter }}
        </template>
      </el-table-column>

      <el-table-column label="已执行" class-name="status-col" width="100px">
        <template slot-scope="{row}">
          {{ row.isExec | trueFilter }}
        </template>
      </el-table-column>

      <el-table-column label="状态" class-name="status-col" width="80px">
        <template slot-scope="{row}">
          {{ row.status | statusFilter }}
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

    <!-- 添加菜单 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="110px" >
        <el-row>
          <el-col :span="12">
            <el-form-item label="通知标题：" prop="titile">
              <el-input v-model="temp.titile" clearable placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通知类型：" prop="type">
              <el-select v-model="temp.type" clearable class="filter-item" placeholder="请选择">
                <el-option v-for="item in typeList" :key="item.name" :label="item.name" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="通知范围：" prop="rangeType">
               <el-select v-model="temp.rangeType" clearable class="filter-item" placeholder="请选择">
                <el-option v-for="item in rangeTypeList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="temp.rangeType === 1">
            <el-form-item label="通知部门：" prop="rangeType">
              <el-select v-model="temp.RangeIds" clearable multiple lass="filter-item" placeholder="请选择">
                <el-option
                  v-for="item in orgList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="temp.rangeType === 2">
            <el-form-item label="通知角色：" prop="rangeType">
              <el-select v-model="temp.RangeIds" clearable multiple lass="filter-item" placeholder="请选择">
                <el-option
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="temp.rangeType === 3">
            <el-form-item label="通知用户：" prop="rangeType">
              <el-select v-model="temp.RangeIds" clearable multiple lass="filter-item" placeholder="请选择">
                <el-option
                  v-for="item in orgList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Html：" prop="isHtml">
              <el-switch v-model="temp.isHtml" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态：" prop="status">
              <el-switch v-model="temp.status" active-color="#ff4949" inactive-color="#13ce66"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="执行方式：" prop="execType">
              <el-select v-model="temp.execType" clearable class="filter-item" placeholder="请选择">
                <el-option v-for="item in execTypeList" :key="item.name" :label="item.name" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="temp.execType === 2" :span="12">
            <el-form-item label="执行时间：" prop="execTime">
              <el-date-picker v-model="temp.execTime" clearable type="datetime" placeholder="请输入开始日期" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="内容：" prop="content">
              <el-input v-model="temp.content" clearable type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getPageData, deleteArticle, reExecute, add, update } from '@/api/system/notice'
import { loadOrgAll } from '@/api/basics/org'
import { loadRoleAll } from '@/api/basics/role'
import { getSysConfigurations } from '@/api/system/configuration'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import ConditionOper from '@/utils/condition'
import { parseTime } from '@/utils'

export default {
  name: 'NoticeTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    trueFilter(status) {
      const statusMap = {
        true: '√',
        false: '×'
      }
      return statusMap[status]
    },
    statusFilter(status) {
      const statusMap = {
        0: '启用',
        1: '禁用'
      }
      return statusMap[status]
    },
    typeFilter(status) {
      const statusMap = {
        1: '系统通知',
        2: '更新通知'
      }
      return statusMap[status]
    },
    execTypeFilter(status) {
      const statusMap = {
        1: '立马执行',
        2: '稍后执行'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      typeList: [
        { name: '系统通知', value: 1 },
        { name: '更新通知', value: 2 }
      ],
      execTypeList: [
        { name: '立马执行', value: 1 },
        { name: '稍后执行', value: 2 }
      ],
      rangeTypeList: [],

      orgList: [],
      roleList: [],

      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 20,
        sorts: [
          {
            columnName: 'CreateTime',
            direction: ConditionOper.SortEnum.DESC
          }
        ],
        conditions: []
      },
      temp: {
        id: undefined,
        titile: '',
        content: '',
        type: 0,
        execType: 0,
        execTime: new Date(),
        rangeType: 0,
        rangeIds: '',
        isHtml: false,
        status: 0,
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '添加'
      },
      rules: {
        titile: [{ required: true, message: '标题必填', trigger: 'change' }],
        content: [{ required: true, message: '内容必填', trigger: 'change' }],
        type: [{ required: true, message: '分类必填', trigger: 'change' }],
        execType: [{ required: true, message: '执行类型必填', trigger: 'change' }],
        rangeType: [{ required: true, message: '通知范围必填', trigger: 'change' }],
        rangeIds: [{ required: true, message: '通知人必填', trigger: 'change' }],
      },
      statusList: [
        { name: '是', value: true },
        { name: '否', value: false }
      ],
      typeList: [
        { name: '系统通知', value: 1 },
        { name: '更新通知', value: 2 },
      ],
      execTypeList: [
        { name: '立马执行', value: 1 },
        { name: '稍后执行', value: 2 },
      ],
      // 勾选
      multipleSelection: [],
      // 状态开关
      filterStatus: 1,
      // 筛选条件
      filterConditions: {
        'title': {
          columnName: 'Title',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'type': {
          columnName: 'Type',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Int,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'execType': {
          columnName: 'ExecType',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Int,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'rangeType': {
          columnName: 'RangeType',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Int,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'isExec': {
          columnName: 'IsExec',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Boolean,
          operator: ConditionOper.ConditionOperEnum.Equal
        }
      }
    }
  },
  created() {
    this.getSysConfigurations()
    this.loadRoleAll()
    this.loadOrgAll()
    this.getList()
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
      getPageData(this.listQuery).then(response => {
        this.list = response.data.datas
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      this.getTableHeight()
    },

    // 获取分类
    getSysConfigurations() {
      getSysConfigurations({ category: 'NoticeRangeType' }).then(response => {
        response.data.forEach((item, index) => {
           this.rangeTypeList.push({value: parseInt(item.value), label: item.text})
        })
        console.log(this.rangeTypeList)
      })
    },

    // 获取所有部门
    loadOrgAll() {
      loadOrgAll().then(response => {
        this.orgList = response.data
      })
    },

    // 获取所有角色
    loadRoleAll() {
      loadRoleAll().then(response => {
        this.roleList = response.data
      })
    },

    // 条件筛选
    handleFilter() {
      this.listQuery.pageIndex = 1
      this.getList()
    },
    // 重置筛选
    handleReset() {
      this.filterConditions= {
        'title': {
          columnName: 'Value',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'type': {
          columnName: 'Text',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Int,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'execType': {
          columnName: 'Category',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Int,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'rangeType': {
          columnName: 'DisplayNo',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Int,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'isExec': {
          columnName: 'IsHide',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Boolean,
          operator: ConditionOper.ConditionOperEnum.Equal
        }
      }
    },
    // 勾选事件
    selectionChange(selection) {
      this.multipleSelection = selection
    },

    // 单选事件
    currentChange(val) {
      this.$refs.multipleTable.clearSelection()
      this.$refs.multipleTable.toggleRowSelection(val)
      this.multipleSelection = [val]
    },

    // 高级
    handleShow() {
      this.filterStatus = this.filterStatus ? 0 : 1
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        titile: '',
        content: '',
        type: null,
        execType: null,
        execTime: new Date(),
        rangeType: null,
        rangeIds: '',
        isHtml: false,
        status: 0
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
          add(this.temp).then(response => {
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
          update(tempData).then(response => {
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