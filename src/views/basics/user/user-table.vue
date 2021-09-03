<template>
  <div class="app-container">

    <!-- 筛选栏 -->
    <div ref="filterhight" class="filter-container">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="账号：">
          <el-input clearable v-model="orgUserQuery.name" placeholder="请输入角色名" />
        </el-form-item>
        <el-form-item label="用户名：">
          <el-input clearable v-model="orgUserQuery.account" placeholder="请输入代码" />
        </el-form-item>
        <el-form-item label="状态：">
          <el-select v-model="orgUserQuery.status" clearable placeholder="请选择">
            <el-option  v-for="item in resultType" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button v-waves class="filter-item" type="info" icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <div>
          <el-button v-waves class="filter-item" size="small" type="primary" icon="el-icon-search" @click="getOrgs(true)">刷新</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">添加</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleUpdate">修改</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleDelete">删除</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="warning" icon="el-icon-delete" @click="changePassword">重置密码</el-button>
        </div>
      </el-form>
    </div>

    <el-row :gutter="10">
      <el-col :span="4" style="border: 1px solid #dfe6ec">
        <div class="tree-container" :style="'overflow: auto; height:' + tableHeight + 'px'">
          <!-- 树形菜单 -->
          <el-tree :data="list" v-loading="listLoading" default-expand-all node-key="id" :expand-on-click-node="false" :props="defaultProps" 
            :highlight-current="true" @node-click="elTreeClick"> 
            <span class="custom-tree-node" slot-scope="{ node }">
              <span :name="node.label">
                  <i v-if="node.childNodes.length>0"
                  :class="node.expanded ? 'el-icon-folder-opened' : 'el-icon-folder'"></i>
                  <i v-else class="el-icon-document-remove"></i>  {{ node.label }}
              </span>
            </span>
          </el-tree>
        </div>
      </el-col>

      <el-col :span="20">
        <!-- 表格 -->
        <el-table
          :key="tableKey"
          v-loading="listElementLoading"
          :height="tableHeight + 1"
          :data="elements"
          stripe
          border
          fit
          highlight-current-row
          lazy
          ref="multipleTable"
          style="width: 100%;"
          :header-cell-style="{'text-align':'center'}"
          @current-change="currentChange">

          <el-table-column label="账号" align="center" prop="account" min-width="80px">
          </el-table-column>

          <el-table-column label="部门" min-width="300px" prop="orgNames" align="left" >
            <template slot-scope="{row}">
              <el-tag effect="plain" v-for = "(data,index) in row.orgNames" :key="index">{{ data }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="用户名" align="center" prop="name" min-width="80px">
          </el-table-column>

          <el-table-column label="代码" align="center" prop="bizCode" min-width="80px">
          </el-table-column>

          <el-table-column label="状态" min-width="50px" class-name="status-col" align="center" prop="status">
            <template slot-scope="{row}">
              {{ row.status | statusFilter }}
            </template>
          </el-table-column>

          <el-table-column label="性别" align="center" prop="sex" min-width="50px">
            <template slot-scope="{row}">
              {{ row.sex | sexFilter }}
            </template>
          </el-table-column>
        
          <el-table-column label="创建时间" align="center" prop="createTime" min-width="100px">
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="orgUserQuery.page" :limit.sync="orgUserQuery.limit" @pagination="loadUsersPage" />
      </el-col>
    </el-row>

    <!-- 添加 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" v-if='dialogFormVisible' width="40%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="110px" >
        <el-row>
          <el-col :span="12">
            <el-form-item label="账号：" prop="account">
              <el-input v-model="temp.account" clearable placeholder="请输入账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名：" prop="name">
              <el-input v-model="temp.name" clearable placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="代码：" prop="bizCode">
              <el-input v-model="temp.bizCode" clearable placeholder="请输入代码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门：" prop="orgNames">
              <MultiSelectTree
               :props="props"
               :options="options"
               :value="temp.orgIds || []"
               :clearable="isClearable"
               :accordion="isAccordion"
               @getValue="selectTreeGetValue($event)"
               />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态：" prop="status">
              <el-switch v-model="temp.status" active-color="#13ce66" inactive-color="#ff4949" :active-value=0 :inactive-value=1></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别：" prop="sex">
              <el-select v-model="temp.sex" class="filter-item" placeholder="请选择">
                <el-option v-for="item in sexList" :key="item.value" :label="item.name" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?addUser():updateUser()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrgs, getOrgsName } from '@/api/basics/org'
import { loadUsersPage, saveUser, changePassword, deleteUser } from '@/api/basics/user'
import waves from '@/directive/waves' // waves directive
import SelectTree from '@/components/SelectTree'
import MultiSelectTree from '@/components/SelectTree/multi-select'
import IconsView from '@/views/icons/index'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'UserTable',
  components: { SelectTree, MultiSelectTree, IconsView, Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: '启用',
        1: '禁用'
      }
      return statusMap[status]
    },
    sexFilter(status) {
      const statusMap = {
        0: '男',
        1: '女'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      responseList: [],
      list: [],
      userList: [],
      fatherData: {
          id: '0',
          name: '根节点',
          parentId: '',
          children: []
      },
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
      selectedValue: {},
      listLoading: true,
      listElementLoading: true,
      listUserLoading: true,
      moduleQuery: {
        parentId: null
      },
      orgUserQuery: {
        page: 1,
        limit: 20,
        orgId: '',
        name: '',
        account: '',
        status: null
      },
      resultType: [
        {
          label: '所有',
          value: null
        },
        {
          label: '启用（√）',
          value: 0
        },
        {
          label: '禁用（×）',
          value: 1
        }
      ],
      sexList: [
        { name: '男', value: 0 },
        { name: '女', value: 1 }
      ],
      temp: {
        id: '',
        account: '',
        name: '',
        bizCode: '',
        sex: 0,
        status: 0,
        orgIds: [],
        roleIds: []
      },
      dialogFormVisible: false,
      dialogUserFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改用户',
        create: '添加用户'
      },
      rules: {
        account: [{ required: true, message: '账号必填', trigger: 'change' }],
        name: [{ required: true, message: '用户名必填', trigger: 'change' }],
        bizCode: [{ required: true, message: '代码必填', trigger: 'change' }],
      },
      // 勾选
      multipleSelection: null,
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
    getOrgs(isRefresh) {
      if(isRefresh) {
        this.$refs.multipleTable.clearSelection()
        this.elements = null
        this.moduleQuery.parentId = null
        this.multipleSelection = null 
      }
      this.list = []
      this.listLoading = true
      getOrgs(this.moduleQuery).then(response => {
        this.responseList = response.data
        this.fatherData.children = this.treeData(response.data, 'id', 'parentId', 'children')
        this.list.push(this.fatherData)
        // 查询部门下用户
        this.orgUserQuery.orgId = ''
        this.orgUserQuery.name = ''
        this.orgUserQuery.account = ''
        this.orgUserQuery.status = null
        this.loadUsersPage()
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
      })
      this.getTableHeight()
    },

    // 查询用户
    loadUsersPage() {
      this.listElementLoading = true
      loadUsersPage(this.orgUserQuery).then(response => {
        this.elements = response.data.datas
        this.total = response.data.total
        setTimeout(() => {
          this.listElementLoading = false
        }, 1 * 1000)
      })
    },

    // 条件筛选
    handleFilter() {
      this.orgUserQuery.pageIndex = 1
      this.loadUsersPage()
    },

    // 重置筛选
    handleReset() {
      this.orgUserQuery.name = ''
      this.orgUserQuery.account = ''
      this.orgUserQuery.status = null
    },

    //获取节点下拉框
    getOrgsName(){
       this.options = []
       getOrgsName().then(response => {
        this.options = this.treeData(response.data, 'id', 'parentId', 'children')
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
      // this.selectedValue = value.join(',')
      this.selectedValue = value
      console.log(this.selectedValue)
    },

    //节点点击回调
    elTreeClick(treeData, node, tree) {
      this.listElementLoading = true
      // 查询部门下用户
      this.orgUserQuery.orgId = treeData.id
      this.orgUserQuery.name = ''
      this.orgUserQuery.account = ''
      this.orgUserQuery.status = null
      loadUsersPage(this.orgUserQuery).then(response => {
          this.elements = response.data.datas
          setTimeout(() => {
            this.listElementLoading = false
          }, 1 * 1000)
      })
    },
    
    // 单选事件
    currentChange(val) {
      this.$refs.multipleTable.clearSelection()
      this.$refs.multipleTable.toggleRowSelection(val)
      this.multipleSelection = val
    },

    resetTemp() {
      this.temp = {
        id: '',
        account: '',
        name: '',
        bizCode: '',
        sex: 0,
        status: 0,
        orgIds: [],
        roleIds: []
      }
    },

    handleCreate() {
      this.getOrgsName()
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // 添加
    addUser() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.orgIds = this.selectedValue.values
          this.temp.orgNames = this.selectedValue.names
          saveUser(this.temp).then(response => {
            this.dialogFormVisible = false
            this.$notify({
              message: response.message, type: 'success'
            })
            this.loadUsersPage()
          })
        }
      })
    },

    handleUpdate(row) {
      if (this.multipleSelection == null) {
        this.$message({
          message: '请勾选需要修改的数据', type: 'warning'
        })
        return
      }
      this.getOrgsName()
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.temp = Object.assign({}, this.multipleSelection) 
    },

    // 修改
    updateUser() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.orgIds = this.selectedValue.values
          this.temp.roleIds = []
          this.temp.orgNames = this.selectedValue.names
          const tempData = Object.assign({}, this.temp)
          saveUser(tempData).then(response => {
            this.dialogFormVisible = false
            this.$notify({
              message: response.message, type: 'success'
            })
            const elementIndex = this.elements.findIndex(v => v.id === this.temp.id)
            this.elements.splice(elementIndex, 1, this.temp)
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
          deleteUser({ids: [deleteId]}).then(response => {
            this.$notify({
              message: response.message, type: 'success'
            })
            const elementsIndex = this.elements.findIndex(v => v.id === deleteId)
            this.elements.splice(elementsIndex, 1)
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

    // 重置密码
    changePassword() {
      if (this.multipleSelection) {
        this.$confirm('此操作将重置该用户密码, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const id = this.multipleSelection.id
          changePassword({id: id}).then(response => {
            this.$notify({
              message: response.message, type: 'success'
            })
          })
        }).catch(() => {
          this.$notify({
            message: '已取消操作', type: 'info'
          })
        })
      } else {
        this.$message({
          message: '请勾选需要操作的数据', type: 'warning'
        })
      }
    }

  } 
}
</script>

