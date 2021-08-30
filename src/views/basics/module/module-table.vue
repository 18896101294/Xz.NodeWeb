<template>
  <div class="app-container">

    <!-- 筛选栏 -->
    <div ref="filterhight" class="filter-container">
      <el-form :inline="true" @submit.native.prevent>
        <div>
          <el-button v-waves class="filter-item" size="small" type="primary" icon="el-icon-search" @click="getModulesTree(true)">刷新</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">添加模块</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleUpdate">修改模块</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleDelete">删除模块</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreateElement">添加元素</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleUpdateElement">修改元素</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleDeleteElement">删除元素</el-button>
        </div>
      </el-form>
    </div>

    <el-row :gutter="10">
      <el-col :span="12">
        <!-- 表格 -->
        <el-table
          :key="tableKey"
          row-key="cascadeId"
          v-loading="listLoading"
          :height="tableHeight"
          :data="list"
          border
          fit
          highlight-current-row
          ref="multipleTable"
          :tree-props="{hasChildren: 'hasChildren'}"
          lazy
          :load="load"
          style="width: 100%;"
          @current-change="currentChange"
        >
          <el-table-column label="名称" min-width="80px" prop="name" align="center" >
          </el-table-column>

          <el-table-column label="标识" align="center" prop="code" min-width="100px">
          </el-table-column>

          <el-table-column label="排序" min-width="40px" prop="sortNo" align="center">
          </el-table-column>

          <el-table-column label="Url" min-width="100px" prop="url" align="center">
          </el-table-column>

          <!-- <el-table-column label="ID" prop="row.item.id" align="center" width="300px" />  -->
          <el-table-column label="图标" align="center" prop="iconName" min-width="70px" >
            <template slot-scope="{row}">
              <i style="font-size:25px" :class="row.iconName" />
            </template>
          </el-table-column>

        </el-table>
      </el-col>

      <el-col :span="12">
        <!-- 表格 -->
        <el-table
          :key="tableKey"
          v-loading="listElementLoading"
          :height="tableHeight"
          :data="elements"
          stripe
          border
          fit
          highlight-current-row
          lazy
          :load="load"
          ref="multipleTableElement"
          style="width: 100%;"
          @current-change="currentChangeElement">

          <el-table-column label="代码" min-width="80px" prop="domId" align="center" >
            <template slot-scope="{row}">
              <span class="link-type" @click="handleUpdateElement(row, true)">{{ row.domId }}</span>
            </template>
          </el-table-column>

          <el-table-column label="名称" align="center" prop="name" min-width="100px">
          </el-table-column>

          <el-table-column label="排序" min-width="40px" prop="sort" align="center">
          </el-table-column>

          <el-table-column label="预览" min-width="80px" prop="class" align="center">
            <template slot-scope="{row}">
              <el-button :type="row.class" size="mini" :icon="row.icon">{{row.name}}</el-button>
            </template>
          </el-table-column>

          <el-table-column label="备注" min-width="150px" prop="remark" align="center">
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!-- 添加模块 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="110px" >
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称：" prop="name">
              <el-input v-model="temp.name" clearable placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标识：" prop="code">
              <el-input v-model="temp.code" clearable placeholder="请输入标识" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Url：" prop="url">
              <el-input v-model="temp.url" clearable placeholder="请输入Url" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序：" prop="sortNo">
              <el-input-number v-model="temp.sortNo" :min="1" label="请输入顺序号"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="图标：" prop="iconName">
              <el-input placeholder="请选择图标" v-model="temp.iconName" >
                <el-button slot="append" icon="el-icon-search" @click="changeIcon"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级：" prop="parentId">
              <selectTree
               :props="props"
               :options="options"
               :value="temp.parentId || '0'"
               :clearable="isClearable"
               :accordion="isAccordion"
               @getValue="selectTreeGetValue($event)"
               />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="层级：" prop="cascadeId">
              <el-tag size="small">{{ temp.cascadeId }}</el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否系统：" style="display:block" prop="isSys">
              <el-switch v-model="temp.isSys" active-color="#13ce66" inactive-color="#ff4949"></el-switch>  
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createModule():updateModule()">确定</el-button>
      </div>
    </el-dialog>
    <!-- 添加元素 -->
    <el-dialog :title="textMapElement[dialogElementStatus]" :visible.sync="dialogFormVisibleElement" width="40%">
      <el-form ref="dataForm" :rules="rulesElement" :model="tempElement" label-position="right" label-width="110px" >
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称：" prop="name">
              <el-input v-model="tempElement.name" clearable placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代码：" prop="domId">
              <el-input v-model="tempElement.domId" clearable placeholder="请输入代码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="图标：" prop="icon">
              <el-input placeholder="请选择图标" v-model="tempElement.icon" >
                <el-button slot="append" icon="el-icon-search" @click="changeIcon"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序：" prop="sort">
              <el-input-number v-model="tempElement.sort" :min="1" label="请输入顺序号"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="样式：" prop="class">
              <el-select v-model="tempElement.class" placeholder="请选择样式">
                <el-option
                  v-for="item in calssSelect"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                  v-html="'<span style=color:'+item.color+'>'+item.name+'</span>'"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属模块：" prop="moduleId">
              <selectTree
               :props="props"
               :options="options"
               :value="tempElement.moduleId || '0'"
               :clearable="isClearable"
               :accordion="isAccordion"
               @getValue="selectTreeGetValueElement($event)"
               />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注：" prop="remark">
              <el-input v-model="tempElement.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleElement = false">取消</el-button>
        <el-button type="primary" @click="dialogElementStatus==='create'?createModuleElement():updateModuleElement()">确定</el-button>
      </div>
    </el-dialog>
    <!-- 选择图标 -->
    <el-dialog title="图标" :visible.sync="dialogIconFormVisible">
      <IconsView @getIcomText="getIcomText" />
    </el-dialog>
  </div>
</template>

<script>
import { getModules, getModulesTree, loadMenus, getModulesName, createModule, updateModule, deleteModule, addElement, updateElement, deleteElement } from '@/api/basics/module'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import SelectTree from '@/components/SelectTree'
import IconsView from '@/views/icons/index'

export default {
  name: 'ModuleTable',
  components: { Pagination, SelectTree, IconsView},
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      elements: [],
      total: 0,
      //自定义主键配置
      isClearable: true,      // 可清空（可选）
      isAccordion: true,      // 可收起（可选）
      valueId: '0',          // 初始ID（可选）
      props:{                // 配置项（必选）
        value: 'id',
        label: 'name',
        children: 'children',
        // disabled:true
      },
      calssSelect: [
        { name: '默认按钮', value: '', color: '#333333' },
        { name: '主要按钮', value: 'primary', color: '#409EFF' },
        { name: '成功按钮', value: 'success', color: '#67C23A' },
        { name: '信息按钮', value: 'info', color: '#909399' },
        { name: '警告按钮', value: 'warning', color: '#E6A23C' },
        { name: '危险按钮', value: 'danger', color: '#F56C6C' }
      ],
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
        code: '',
        sortNo: 0,
        isSys: false,
        iconName: '',
        name: '',
        icon: '',
        url: '',
        parentName: ''
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
    this.getModulesTree()
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
    },
    // 查询
    getModulesTree(isRefresh) {
      if(isRefresh) {
        this.$refs.multipleTable.clearSelection()
        this.elements = null
        this.moduleQuery.parentId = null
        this.tableKey = this.tableKey == 1 ? 0 : 1
      }
      this.listLoading = true
      this.selectModuleId = '0'
      getModulesTree(this.moduleQuery).then(response => {
        this.list = response.data
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      this.getTableHeight()
    },

    //获取节点下拉框
    getModulesName(){
       this.options = []
       getModulesName().then(response => {
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
    selectTreeGetValueElement(value) {
      this.selectModuleId = value
      if(value == '0') {
        this.selectModuleId = ''
      }
    },

    load(tree, treeNode, resolve) {
      this.moduleQuery.parentId = tree.id
        getModulesTree(this.moduleQuery).then(response => {
          resolve(response.data)
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
      this.tempElement = isClick? Object.assign({}, row): Object.assign({}, this.multipleSelectionElement) 
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