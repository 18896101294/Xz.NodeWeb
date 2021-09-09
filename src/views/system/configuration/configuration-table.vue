<template>
  <div class="app-container">
    <!-- 筛选栏 -->
    <div ref="filterhight" class="filter-container">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="值：">
          <el-input clearable v-model="filterConditions['value'].value" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="显示值：">
          <el-input clearable v-model="filterConditions['text'].value" placeholder="请输入显示值" />
        </el-form-item>
        <el-form-item label="分类：">
          <el-select v-model="filterConditions['category'].value" clearable placeholder="请选择">
            <el-option  v-for="item in allCategory" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="filterStatus == 0" label="顺序号：">
          <el-input clearable v-model="filterConditions['displayNo'].value" min="0" type="number" placeholder="请输入顺序号" />
        </el-form-item>
        <el-form-item v-if="filterStatus == 0" label="是否隐藏：">
          <el-select v-model="filterConditions['isHide'].value" placeholder="请选择是否隐藏">
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
      :span-method="spanMethod"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%;"
      ref="multipleTable"
      @sort-change="sortChange"
      @selection-change="selectionChange"
      @current-change="currentChange"
    >
      <el-table-column type="selection" align="center" width="55" />

      <el-table-column label="分类" prop="category" min-width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag effect="plain" type="success">{{ row.category }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="顺序号" prop="displayNo" sortable="custom" min-width="80px" align="center" />

      <el-table-column label="显示值" prop="text" align="center" min-width="100px" />

      <el-table-column label="值" prop="value" align="center" min-width="100px" />

      <el-table-column label="备注" prop="remark" align="center" min-width="100px" />

      <el-table-column label="是否隐藏" class-name="status-col" align="center" width="80px">
        <template slot-scope="{row}">
          {{ row.isHide | statusFilter }}
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
            <el-form-item label="显示值：" prop="text">
              <el-input v-model="temp.text" clearable placeholder="请输入显示值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="值：" prop="value">
              <el-input v-model="temp.value" clearable placeholder="请输入值" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="分类：" prop="category">
              <el-input v-model="temp.category" clearable placeholder="请输入分类" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序：" prop="displayNo">
              <el-input-number v-model="temp.displayNo" :min="1" label="请输入顺序号"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="是否隐藏：" prop="isHide">
              <el-switch v-model="temp.isHide" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注：" prop="remark">
              <el-input v-model="temp.remark" type="textarea" placeholder="请输入备注" />
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
import { getPageData, createArticle, updateArticle, deleteArticle, getAllCategory } from '@/api/system/configuration'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import ConditionOper from '@/utils/condition'
import { parseTime } from '@/utils'

export default {
  name: 'ConfigurationTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        false: '×',
        true: '√'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      allCategory: [],
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 20,
        sorts: [
          {
            columnName: 'DisplayNo',
            direction: ConditionOper.SortEnum.ASC
          }
        ],
        conditions: []
      },
      importanceOptions: [1, 2, 3],
      showReviewer: false,
      temp: {
        id: '',
        value: '',
        text: '',
        category: '',
        displayNo: 0,
        remark: '',
        isHide: false
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '添加'
      },
      rules: {
        category: [{ required: true, message: '分类必填', trigger: 'change' }],
        text: [{ required: true, message: '显示值必填', trigger: 'change' }],
        value: [{ required: true, message: '值必填', trigger: 'change' }]
      },
      statusList: [
        { name: '是', value: true },
        { name: '否', value: false }
      ],
      // 勾选
      multipleSelection: [],
      // 状态开关
      filterStatus: 1,
      // 筛选条件
      filterConditions: {
        'value': {
          columnName: 'Value',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'text': {
          columnName: 'Text',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'category': {
          columnName: 'Category',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'displayNo': {
          columnName: 'DisplayNo',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Int,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'isHide': {
          columnName: 'IsHide',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Boolean,
          operator: ConditionOper.ConditionOperEnum.Equal
        }
      }
    }
  },
  created() {
    this.getList()
    this.getAllCategory()
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

    classGroup(category){
      return this.list.filter(o => o.category == category).length;
    },
    classNameLen(category){
      const tmp = this.list.map(o => o.category)
      const index = tmp.indexOf(category);
      let len = 0;
      for (let i = 0;i < index;i++){
        len += this.classGroup(tmp[i]);
      }
      return len;
    },
    spanMethod(data) {
      const {row,column,rowIndex,columnIndex} = data;
      if (columnIndex == 1) {  //合并展示区
        const len = this.classGroup(row.category);
        const lenName = this.classNameLen(row.category);
        if (rowIndex === lenName) {
          return {
            rowspan:len,
            colspan:1
          }
        } else return {
          rowspan: 0,
          colspan: 0
        };
      } else {
       return {
          rowspan: 1,
          colspan: 1
        };
      }
    },

    // 获取所有分类
    getAllCategory() {
      getAllCategory().then(response => {
        response.data.forEach((item, index) => {
           this.allCategory.push({value: item, label: item})
        })
        console.log(this.allCategory)
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
        'value': {
          columnName: 'Value',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'text': {
          columnName: 'Text',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'category': {
          columnName: 'Category',
          value: '',
          dataType: ConditionOper.DataTypeEnum.String,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'displayNo': {
          columnName: 'DisplayNo',
          value: null,
          dataType: ConditionOper.DataTypeEnum.Int,
          operator: ConditionOper.ConditionOperEnum.Equal
        },
        'isHide': {
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
    // 排序
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'displayNo') {
        this.sortByID(prop, order)
      }
    },
    sortByID(prop, order) {
      if (order === 'ascending') {
        for (const o in this.listQuery.sorts) {
          if (this.listQuery.sorts[o].columnName.toUpperCase() == prop.toUpperCase()) {
            this.listQuery.sorts[o].direction = ConditionOper.SortEnum.ASC
            break
          }
        }
      } else {
        for (const o in this.listQuery.sorts) {
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
        value: '',
        text: '',
        category: '',
        displayNo: 1,
        remark: '',
        isHide: false
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
    }
  }
}
</script>