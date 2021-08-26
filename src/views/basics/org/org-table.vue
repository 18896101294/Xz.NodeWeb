<template>
  <div class="app-container">

    <!-- 筛选栏 -->
    <div ref="filterhight" class="filter-container">
      <el-form :inline="true" @submit.native.prevent>
        <div>
          <el-button v-waves class="filter-item" size="small" type="primary" icon="el-icon-search" @click="getModulesTree(true)">刷新</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">添加</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleUpdate">修改</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleDelete">删除</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreateElement">分配用户</el-button>
        </div>
      </el-form>
    </div>

    <el-row :gutter="10">
      <el-col :span="5" :style="'border: 1px solid #dfe6ec;height:' + tableHeight + 'px'">
        <!-- 树形菜单 -->
        <el-tree :data="list" default-expand-all node-key="id" :props="defaultProps" @node-click="elTreeClick"> 
          <span class="custom-tree-node" slot-scope="{ node }">
            <span :name="node.label">
                <i v-if="node.childNodes.length>0"
                :class="node.expanded ? 'el-icon-folder-opened' : 'el-icon-folder'"></i>
                <i v-else class="el-icon-document-remove"></i>  {{ node.label }}
            </span>
          </span>
        </el-tree>
      </el-col>

      <el-col :span="19">
        <!-- 表格 -->
        <el-table
          :key="tableKey"
          v-loading="listLoading"
          :height="tableHeight"
          :data="elements"
          stripe
          border
          fit
          highlight-current-row
          lazy
          ref="multipleTable"
          style="width: 100%;"
          @current-change="currentChange">

          <el-table-column label="层级" align="center" prop="cascadeId" min-width="80px">
          </el-table-column>

          <el-table-column label="代码" min-width="80px" prop="customCode" align="center" >
            <template slot-scope="{row}">
              <span class="link-type" @click="handleUpdate(row, true)">{{ row.customCode }}</span>
            </template>
          </el-table-column>

          <el-table-column label="名称" align="center" prop="name" min-width="100px">
          </el-table-column>

           <el-table-column label="排序" min-width="40px" prop="sortNo" align="center">
          </el-table-column>

          <el-table-column label="状态" min-width="40px" prop="status" align="center">
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getOrgs, getOrgsName, getChildOrgs, addOrg, updateOrg, deleteOrg } from '@/api/basics/org'
import waves from '@/directive/waves' // waves directive
import SelectTree from '@/components/SelectTree'
import IconsView from '@/views/icons/index'

export default {
  name: 'OrgTable',
  components: { SelectTree, IconsView},
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      elements: [],
      total: 0,
      //自定义主键配置
      isClearable: true,
      isAccordion: true,
      valueId: '0',
      props:{
        value: 'id',
        label: 'name',
        children: 'children',
        // disabled:true
      },
      options:[],
      selectParentId: '0',
      selectModuleId: '0',
      listLoading: true,
      listElementLoading: false,
      moduleQuery: {
        parentId: null
      },
      importanceOptions: [1, 2, 3],
      showReviewer: false,
      temp: {
        id: '',
        cascadeId: '.0.',
        name: '',
        hotKey: '',
        ParentName: '',
        IsLeaf: false,
        IsAutoExpand: false,
        IconName: '',
        Status: 0,
        BizCode: '',
        CustomCode: '',
        CreateTime: new Date(),
        CreateId: 0,
        sortNo: 0,
        ParentId: '',
        TypeName: '',
        TypeId: '',
      },
      tempElement: {
        id: '',
        moduleId: '',
        domId: '',
        name: '',
        sort: 0,
        icon: '',
        class: 'primary',
        remark: ''
      },
      dialogFormVisible: false,
      dialogFormVisibleElement: false,
      dialogIconFormVisible: false,
      dialogStatus: '',
      dialogElementStatus: '',
      textMap: {
        update: '修改模块',
        create: '添加模块'
      },
      textMapElement: {
        update: '修改元素',
        create: '添加元素'
      },
      rules: {
        code: [{ required: true, message: '标识必填', trigger: 'change' }],
        name: [{ required: true, message: '名称必填', trigger: 'change' }]
      },
      rulesElement: {
        domId: [{ required: true, message: '代码必填', trigger: 'change' }],
        name: [{ required: true, message: '名称必填', trigger: 'change' }],
      },
      statusList: [
        { name: '启用', value: true },
        { name: '禁用', value: false }
      ],
      // 勾选
      multipleSelection: null,
      multipleSelectionElement: null
    }
  },
  created() {
    this.getOrgs()
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
      let tableH = 280 // 默认的高度
      const tableHeightDetil = window.innerHeight - tableH
      if (tableHeightDetil <= 300) {
        this.tableHeight = 300
      } else {
        this.tableHeight = window.innerHeight - tableH + 100
      }
      console.log(this.tableHeight)
    },
    // 查询
    getOrgs(isRefresh) {
      if(isRefresh) {
        this.$refs.multipleTable.clearSelection()
        this.elements = null
        this.moduleQuery.parentId = null
        this.tableKey = this.tableKey == 1 ? 0 : 1
      }
      this.listLoading = false
      this.selectModuleId = '0'
      getOrgs(this.moduleQuery).then(response => {
        let fatherData = {
          id: '0',
          name: '根节点',
          parentId: '',
          children: []
        }
        fatherData.children = this.treeData(response.data, 'id', 'parentId', 'children')
        console.log(fatherData)
        this.list.push(fatherData)
        console.log(this.list)
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      this.getTableHeight()
    },

    //获取节点下拉框
    getOrgsName(){
       this.options = []
       getOrgsName().then(response => {
        let fatherData = {
          id: '0',
          name: '根节点',
          parentId: '',
          children: []
        }
        fatherData.children = this.treeData(response.data, 'id', 'parentId', 'children')
        this.options.push(fatherData)
      })
    },

    treeData(source, id, parentId, children){  
      let cloneData = JSON.parse(JSON.stringify(source))
      return cloneData.filter(father=>{
        let branchArr = cloneData.filter(child => father[id] == child[parentId]);
        branchArr.length>0 ? father[children] = branchArr : ''
        return father[parentId] == ''    // 如果第一层不是parentId=0，请自行修改
      })
    },
    //获取树形下拉框选中的值
    selectTreeGetValue(value) {
      this.selectParentId = value
      if(value == '0') {
        this.selectParentId = ''
      }
    },

    //节点点击回调
    elTreeClick(data, node, tree) {
      this.listLoading = true
      getChildOrgs(data.id).then(response => {
          this.elements = response.data
          setTimeout(() => {
            this.listLoading = false
          }, 1 * 1000)
      })
    },
    
    // 单选事件
    currentChange(val) {
      this.listElementLoading = true
      this.$refs.multipleTable.clearSelection()
      this.$refs.multipleTable.toggleRowSelection(val)
      this.multipleSelection = val
      this.selectModuleId = val.id
      loadMenus({ moduleId : val.id }).then(response => {
        this.elements = response.data
        setTimeout(() => {
          this.listElementLoading = false
        }, 1 * 1000)
      })
    },
    currentChangeElement(val ,index) {
      this.$refs.multipleTableElement.clearSelection()
      this.$refs.multipleTableElement.toggleRowSelection(val)
      this.multipleSelectionElement = val
    },

    //选择图标
    changeIcon() {
      this.dialogIconFormVisible = true
    },
    //获取图标值
    getIcomText(text) {
      this.dialogIconFormVisible = false
      this.temp.iconName = text
      this.tempElement.icon = text
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        cascadeId: '.0.',
        code: '',
        sortNo: 1,
        appSecret: '',
        icon: '',
        disable: true,
        parentId: ''
      }
    },
    resetTempElement() {
      this.tempElement = {
        id: undefined,
        moduleId: this.selectModuleId,
        domId: '',
        name: '',
        sort: 1,
        icon: '',
        class: 'primary',
        remark: ''
      }
    },

    handleCreate() {
      this.getModulesName()
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // 添加
    createModule() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.parentId = this.selectParentId
          createModule(this.temp).then(response => {
            this.dialogFormVisible = false
            this.$notify({
              message: response.message, type: 'success'
            })
            this.getModulesTree(true)
          })
        }
      })
    },

    handleCreateElement() {
      this.getModulesName()
      this.resetTempElement()
      this.dialogElementStatus = 'create'
      this.dialogFormVisibleElement = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // 添加元素
    createModuleElement() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.tempElement.moduleId = this.selectModuleId
          if(this.tempElement.moduleId == '') {
            this.$message({
              message: '元素所属模块不能为根节点', type: 'warning'
            })
          } else {
            addElement(this.tempElement).then(response => {
              this.dialogFormVisibleElement = false
              this.$notify({
                message: response.message, type: 'success'
              })
              this.elements.push(response.data)
            })
          }
        }
      })
    },

    handleUpdate(row) {
      if (this.multipleSelection != null) {
        this.getModulesName()
        this.temp = Object.assign({}, this.multipleSelection) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      } else {
        this.$message({
          message: '请勾选需要修改的数据', type: 'warning'
        })
      }
    },

    // 修改
    updateModule() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if(this.selectParentId != '0'){
            this.temp.parentId = this.selectParentId
          }
          const tempData = Object.assign({}, this.temp)
          updateModule(tempData).then(response => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              message: response.message, type: 'success'
            })
            this.getModulesTree(true)
          })
        }
      })
    },

    handleUpdateElement(row, isClick = false) {
      if (!isClick && this.multipleSelectionElement == null) {
        this.$message({
          message: '请勾选需要修改的数据', type: 'warning'
        })
        return
      }
      this.getModulesName()
      this.dialogElementStatus = 'update'
      this.dialogFormVisibleElement = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.tempElement = isClick? row: Object.assign({}, this.multipleSelectionElement) 
    },

    // 修改元素
    updateModuleElement() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if(this.selectModuleId != '0'){
            this.tempElement.moduleId = this.selectModuleId
          }
          const tempData = Object.assign({}, this.tempElement)
          updateElement(tempData).then(response => {
            this.dialogFormVisibleElement = false
            this.$notify({
              message: response.message, type: 'success'
            })
            const index = this.elements.findIndex(v => v.id === this.tempElement.id)
            this.elements.splice(index, 1, this.tempElement)
          })
        }
      })
    },

    // 删除
    handleDelete() {
      if (this.multipleSelection) {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const deleteId = this.multipleSelection.id
          deleteModule({id: deleteId}).then(response => {
            this.$notify({
              message: response.message, type: 'success'
            })
            this.getModulesTree(true)
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

    // 删除元素
    handleDeleteElement() {
      if (this.multipleSelectionElement) {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const deleteId = this.multipleSelectionElement.id
          deleteElement({id: deleteId}).then(response => {
            this.$notify({
              message: response.message, type: 'success'
            })
            const index = this.elements.findIndex(v => v.id === deleteId)
            this.elements.splice(index, 1)
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
  .abow_dialog {
    display: flex;
    justify-content: center;
    align-items: Center;
    overflow: hidden;
  }
  .abow_dialog .el-dialog {
    margin: 0 auto !important;
    height: 90%;
    overflow: hidden;
  }
  .abow_dialog .el-dialog .el-dialog__body {
    position: absolute;
    left: 0;
    top: 54px;
    bottom: 0;
    right: 0;
    padding: 0;
    z-index: 1;
    overflow: hidden;
    overflow-y: auto;
  }
</style>