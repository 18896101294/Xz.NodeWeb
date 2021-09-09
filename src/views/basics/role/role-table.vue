<template>
  <div class="app-container">
    <!-- 筛选栏 -->
    <div ref="filterhight" class="filter-container">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="角色名：">
          <el-input clearable v-model="listQuery.name" placeholder="请输入角色名" />
        </el-form-item>
        <el-form-item label="代码：">
          <el-input clearable v-model="listQuery.code" placeholder="请输入代码" />
        </el-form-item>
        <el-form-item label="状态：">
          <el-select v-model="listQuery.status" clearable placeholder="请选择">
            <el-option  v-for="item in resultType" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button v-waves class="filter-item" type="info" icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <div>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleBachDelete">删除</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="allocationUsers">分配用户</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="allocationModules">分配模块</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">分配资源</el-button>
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
      style="width: 100%;"
      :header-cell-style="{'text-align':'center'}"
      ref="multipleTable"
      @selection-change="selectionChange"
      @current-change="currentChange"
    >
      <el-table-column type="selection" align="center" width="55" />

      <el-table-column label="名称" prop="name" min-width="60px" align="center" />

      <el-table-column label="代码" prop="code" min-width="60px" align="center" />

      <el-table-column label="用户" prop="userNames" min-width="300px" align="left">
        <template slot-scope="{row}">
          <el-tag effect="plain" v-for = "(data,index) in row.userNames" :key="index">{{ data }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="状态" class-name="status-col" align="center" width="80px">
        <template slot-scope="{row}">
          {{ row.status | statusFilter }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="160px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">修改</el-button>
          <el-button type="warning" v-if="row.status === 0" size="mini" @click="disableRole(row)">停用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageIndex" :limit.sync="listQuery.pageSize" @pagination="getRolesPage" />

    <!-- 添加 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="110px" >
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称：" prop="name">
              <el-input v-model="temp.name" clearable placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代码：" prop="code">
              <el-input v-model="temp.code" clearable placeholder="请输入代码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态：" prop="status">
              <el-switch v-model="temp.status" active-color="#13ce66" inactive-color="#ff4949" :active-value=0 :inactive-value=1></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?addRole():updateRole()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 分配用户 -->
    <el-dialog id="roleUserTable-dialog" top="10vh" v-if="dialogAllocationUsersFormVisible" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="dialogAllocationUsersFormVisible" width="80%">
      <AllocationUsers :roleUserDatas="roleUserDatas" @getRoleUserValue="getRoleUserValue($event)" />
      <div slot="footer" class="dialog-footer" style="padding:0px">
        <el-button @click="dialogAllocationUsersFormVisible = false">取消</el-button>
        <el-button type="primary" @click="roleAllocationUsers()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 分配模块 -->
    <el-dialog id="roleModuleTable-dialog" top="10vh" v-if="dialogAllocationModulesFormVisible" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="dialogAllocationModulesFormVisible" width="50%">
      <AllocationModules :roleModuleDatas="roleModuleDatas" :active="active" />
      <div slot="footer" class="dialog-footer" style="padding:0px">
        <el-button @click="roleModuleCancel()">取消</el-button>
        <el-button type="primary" v-if="active>0" @click="backStep()">上一步</el-button>
        <el-button type="primary" @click="nextStep()">{{this.active===3?'完成':'下一步'}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRolesPage, getRoleBindUsers, addRole, updateRole, deleteRole, disableRole, roleAllocationUsers } from '@/api/basics/role'
import { loadForRole } from '@/api/basics/module'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import AllocationUsers from '@/views/basics/role/components/allocation-users.vue'
import AllocationModules from '@/views/basics/role/components/allocation-modules.vue'
import { parseTime } from '@/utils'

export default {
  name: 'RoleTable',
  components: { Pagination, AllocationUsers, AllocationModules},
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '×',
        0: '√'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      roleUserDatas: [],
      roleModuleDatas: [],
      active: 0,
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
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 20,
        name: '',
        code: '',
        status: null
      },
      temp: {
        id: '',
        name: '',
        code: '',
        status: 0,
      },
      dialogFormVisible: false,
      dialogAllocationUsersFormVisible: false,
      dialogAllocationModulesFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '添加'
      },
      rules: {
        code: [{ required: true, message: '代码必填', trigger: 'change' }],
        name: [{ required: true, message: '名称必填', trigger: 'change' }]
      },
      // 勾选
      multipleSelection: [],
      // 勾选的用户
      roleUserValues: [],
    }
  },
  created() {
    this.getRolesPage()
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
    getRolesPage() {
      this.listLoading = true
      getRolesPage(this.listQuery).then(response => {
        this.list = response.data.datas
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      this.getTableHeight()
    },

    // 条件筛选
    handleFilter() {
      this.listQuery.pageIndex = 1
      this.getRolesPage()
    },

    // 重置筛选
    handleReset() {
      this.listQuery.name = ''
      this.listQuery.code = ''
      this.listQuery.status = null
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

    // 分配用户对话框
    allocationUsers() {
      if (this.multipleSelection.length > 0) {
        if(this.multipleSelection.length > 1) {
          this.$message({
            message: '只能选中一个进行编辑', type: 'warning'
          })
          return
        }
        this.roleUserValues = []
        // 获取当前角色已经绑定的模块
        let roleId = this.multipleSelection[0].id
        getRoleBindUsers({ id: roleId }).then(response => {
          this.roleUserDatas = response.data
          this.dialogAllocationUsersFormVisible = true
        })
      } else {
        this.$message({
          message: '请勾选需要操作的数据', type: 'warning'
        })
      }
    },

    // 分配用户
    roleAllocationUsers() {
      // 获取当前角色已经绑定的用户
      let roleId = this.multipleSelection[0].id
      roleAllocationUsers({ roleId: roleId, userIds: this.roleUserValues }).then(response => {
        this.dialogAllocationUsersFormVisible = false
        this.$notify({
          message: response.message, type: 'success'
        })
        this.getRolesPage()
      })
    },

    // 获取勾选的用户
    getRoleUserValue(value) {
      this.roleUserValues = value
    },

    // 分配模块对话框
    allocationModules() {
      if (this.multipleSelection.length > 0) {
        if(this.multipleSelection.length > 1) {
          this.$message({
            message: '只能选中一个进行编辑', type: 'warning'
          })
          return
        }
        this.roleUserValues = []
        // 获取当前角色已经绑定的用户
        let roleId = this.multipleSelection[0].id
        loadForRole(roleId).then(response => {
          this.roleModuleDatas = response.data
          this.dialogAllocationModulesFormVisible = true
        })
      } else {
        this.$message({
          message: '请勾选需要操作的数据', type: 'warning'
        })
      }
    },

    // 分配模块下一步
    nextStep() {
      this.active++
    },
    // 分配模块上一步
    backStep() {
      this.active--
    },
    roleModuleCancel() {
      this.dialogAllocationModulesFormVisible = false
      this.active = 0
    },

    resetTemp() {
      this.temp = {
        id: '',
        name: '',
        code: '',
        status: 0,
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
    addRole() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addRole(this.temp).then(response => {
            this.dialogFormVisible = false
            this.$notify({
              message: response.message, type: 'success'
            })
            this.getRolesPage()
          })
        }
      })
    },

    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.temp = Object.assign({}, row) // copy obj
    },

    // 修改
    updateRole() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateRole(tempData).then(response => {
            this.dialogFormVisible = false
            this.$notify({
              message: response.message, type: 'success'
            })
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
          })
        }
      })
    },

    // 禁用角色
    disableRole(row) {
      this.$confirm('此操作将禁用该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        disableRole({ids:[row.id]}).then(response => {
          this.$notify({
            message: response.message, type: 'success'
          })
          let temp = this.list.find(v => v.id === row.id)
          temp.status = 1
          const index = this.list.findIndex(v => v.id === row.id)
          this.list.splice(index, 1, temp)
        })
      }).catch(() => {
        this.$notify({
          message: '已取消操作', type: 'info'
        })
      })
    },

    // 删除
    handleBachDelete() {
      if (this.multipleSelection.length > 0) {
        this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let deleteIds = this.multipleSelection.map(item => item.id)
          deleteRole({ids: deleteIds}).then(response => {
            this.$notify({
              message: response.message, type: 'success'
            })
            deleteIds.forEach((item, index) => {
              let itemIndex = this.list.findIndex(v => v.id === item)
              this.list.splice(itemIndex, 1)
            })
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

  #roleUserTable-dialog .el-dialog__header, .el-dialog__body {
    padding: 0px 10px 0px 0px;
  }

  #roleModuleTable-dialog .el-dialog__header, .el-dialog__body {
    padding: 0px 10px 0px 0px;
    font-size: 15px;
  }
  
  #roleModuleTable-dialog .el-dialog__header .el-dialog__headerbtn  {
    top: 10px;
    right: 10px;
  }
</style>