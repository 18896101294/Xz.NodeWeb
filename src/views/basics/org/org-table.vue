<template>
  <div class="app-container">

    <!-- 筛选栏 -->
    <div ref="filterhight" class="filter-container">
      <el-form :inline="true" @submit.native.prevent>
        <div>
          <el-button v-waves class="filter-item" size="small" type="primary" icon="el-icon-search" @click="getOrgs(true)">刷新</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">添加</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleUpdate">修改</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleDelete">删除</el-button>
          <el-button size="small" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="getOrgUsers">查看用户</el-button>
        </div>
      </el-form>
    </div>

    <el-row :gutter="10">
      <el-col :span="5" style="border: 1px solid #dfe6ec">
        <div class="tree-container" :style="'overflow: auto; height:' + tableHeight + 'px'">
          <!-- 树形菜单 -->
          <el-tree :data="list" v-loading="listLoading" element-loading-text="加载中..." default-expand-all node-key="id" :expand-on-click-node="false" :props="defaultProps" 
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

      <el-col :span="19">
        <!-- 表格 -->
        <el-table
          :key="tableKey"
          v-loading="listElementLoading"
          element-loading-text="加载中..."
          :height="tableHeight+1"
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

          <el-table-column label="状态" min-width="40px" class-name="status-col" align="center" prop="status">
            <template slot-scope="{row}">
              {{ row.status | statusFilter }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 添加 -->
    <el-dialog :title="textMap[dialogStatus]" v-if="dialogFormVisible" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="110px" >
        <el-row>
          <el-col :span="12">
            <el-form-item label="层级：" prop="cascadeId">
              <el-tag size="small">{{ temp.cascadeId }}</el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代码：" prop="customCode">
              <el-input v-model="temp.customCode" clearable placeholder="请输入代码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称：" prop="name">
              <el-input v-model="temp.name" clearable placeholder="请输入名称" />
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
            <el-form-item label="状态：" prop="status">
              <el-switch v-model="temp.status" active-color="#13ce66" inactive-color="#ff4949" :active-value=0 :inactive-value=1></el-switch>
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
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?addOrg():updateOrg()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog id="orgTable-dialog" top="10vh" v-if="dialogUserFormVisible" :visible.sync="dialogUserFormVisible" :close-on-click-modal="false" :close-on-press-escape="false" width="80%">
      <!-- 筛选栏 -->
      <div ref="filterhight" class="filter-container">
        <el-form :inline="true" @submit.native.prevent>
          <el-form-item label="账号：">
            <el-input size="small" clearable v-model="orgUserQuery.account" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="用户名：">
            <el-input size="small" clearable v-model="orgUserQuery.name" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="状态：">
            <el-select size="small" v-model="orgUserQuery.status" clearable placeholder="请选择">
              <el-option  v-for="item in resultType" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-button v-waves size="small" class="filter-item" type="primary" icon="el-icon-search" @click="getOrgUsers">搜索</el-button>
          <el-button v-waves size="small" class="filter-item" type="info" icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form>
      </div>

      <el-table
        :key="tableKey"
        v-loading="listUserLoading"
        element-loading-text="加载中..."
        :data="userList"
        stripe
        border
        fit
        lazy
        ref="multipleTableUser"
        height="570px"
        style="width: 100%;"
        >

        <el-table-column label="账号" align="center" prop="account" min-width="80px">
        </el-table-column>

        <!-- <el-table-column label="头像" align="center" prop="avatar" min-width="200px">
        </el-table-column> -->

        <el-table-column label="部门" prop="orgNames" min-width="300px" align="left">
          <template slot-scope="{row}">
            <el-tag effect="plain" v-for = "(data,index) in row.orgNames" :key="index">{{ data }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="用户名" min-width="80px" prop="name" align="center" >
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
        
        <el-table-column label="创建时间" align="center" prop="createTime" min-width="80px">
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" :page.sync="orgUserQuery.pageIndex" :limit.sync="orgUserQuery.pageSize" @pagination="getOrgUsers" />
    </el-dialog>
  </div>
</template>

<script>
import { getOrgs, getOrgsName, getChildOrgs, getOrgUsers, addOrg, updateOrg, deleteOrg } from '@/api/basics/org'
import waves from '@/directive/waves' // waves directive
import SelectTree from '@/components/SelectTree'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'OrgTable',
  components: { SelectTree, Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: '√',
        1: '×'
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
      selectParentId: '0',
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
      temp: {
        id: '',
        cascadeId: '.0.',
        name: '',
        hotKey: '',
        parentName: '',
        isLeaf: false,
        isAutoExpand: false,
        iconName: '',
        status: 0,
        bizCode: '',
        customCode: '',
        createTime: new Date(),
        createId: 0,
        sortNo: 0,
        parentId: '',
        typeName: '',
        typeId: '',
      },
      dialogFormVisible: false,
      dialogUserFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改部门',
        create: '添加部门'
      },
      rules: {
        customCode: [{ required: true, message: '代码必填', trigger: 'change' }],
        name: [{ required: true, message: '名称必填', trigger: 'change' }]
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
      let tableH = 280 // 默认的高度
      const tableHeightDetil = window.innerHeight - tableH
      if (tableHeightDetil <= 300) {
        this.tableHeight = 300
      } else {
        this.tableHeight = window.innerHeight - tableH + 100
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
      this.listElementLoading = true
      getOrgs(this.moduleQuery).then(response => {
        this.responseList = response.data
        this.fatherData.children = this.treeData(response.data, 'id', 'parentId', 'children')
        this.list.push(this.fatherData)
        getChildOrgs('0').then(response => {
          this.elements = response.data
        })
        setTimeout(() => {
          this.listLoading = false
          this.listElementLoading = false
        }, 1 * 1000)
      })
      this.getTableHeight()
    },

    // 重置筛选
    handleReset() {
      this.orgUserQuery.name = ''
      this.orgUserQuery.account = ''
      this.orgUserQuery.status = null
    },
    // 查询部门下用户
    getOrgUsers() {
      if (this.multipleSelection == null || this.multipleSelection.id == '') {
        this.$message({
          message: '请勾选部门', type: 'warning'
        })
        return
      }
      this.orgUserQuery.orgId = this.multipleSelection.id
      this.dialogUserFormVisible = true
      this.userList = []
      this.listUserLoading = true
      getOrgUsers(this.orgUserQuery).then(response => {
        this.userList = response.data.datas
        this.total = response.data.total
        setTimeout(() => {
          this.listUserLoading = false
        }, 1 * 1000)
      })
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
    elTreeClick(treeData, node, tree) {
      const id = treeData.id
      getChildOrgs(id).then(response => {
          this.elements = response.data
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

    //重置下拉框
    resetFatherData() {
      this.fatherData = {
        id: '0',
        name: '根节点',
        parentId: '',
        children: []
      }
    },

    resetTemp() {
      this.temp = {
        id: '',
        cascadeId: '.0.',
        name: '',
        hotKey: '',
        parentName: '',
        isLeaf: false,
        isAutoExpand: false,
        iconName: '',
        status: 0,
        bizCode: '',
        customCode: '',
        createTime: new Date(),
        createId: 0,
        sortNo: 0,
        parentId: '',
        typeName: '',
        typeId: '',
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
    addOrg() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.parentId = this.selectParentId
          addOrg(this.temp).then(response => {
            this.dialogFormVisible = false
            this.$notify({
              message: response.message, type: 'success'
            })

            console.log(this.responseList)
            this.list = []
            this.responseList.push(response.data)
            console.log(this.responseList)
            this.resetFatherData()
            this.fatherData.children = this.treeData(this.responseList, 'id', 'parentId', 'children')
            console.log(this.fatherData)
            this.list.push(this.fatherData)
            console.log(this.list)

            this.elements.push(this.temp)
          })
        }
      })
    },

    handleUpdate(row, isClick = false) {
      if (!isClick && this.multipleSelection == null) {
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
      this.temp = isClick? row: Object.assign({}, this.multipleSelection) 
    },

    // 修改
    updateOrg() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if(this.selectParentId != '0'){
            this.temp.parentId = this.selectParentId
          }
          const tempData = Object.assign({}, this.temp)
          updateOrg(tempData).then(response => {
            this.dialogFormVisible = false
            this.$notify({
              message: response.message, type: 'success'
            })
            this.list = []
            const index = this.responseList.findIndex(v => v.id === this.temp.id)
            this.responseList.splice(index, 1, this.temp)
            this.resetFatherData()
            this.fatherData.children = this.treeData(this.responseList, 'id', 'parentId', 'children')
            this.list.push(this.fatherData)

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
          deleteOrg({ids: [deleteId]}).then(response => {
            this.$notify({
              message: response.message, type: 'success'
            })

            this.list = []
            const index = this.responseList.findIndex(v => v.id === deleteId)
            this.responseList.splice(index, 1)
            this.resetFatherData()
            this.fatherData.children = this.treeData(this.responseList, 'id', 'parentId', 'children')
            this.list.push(this.fatherData)

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
    }
  }
}
</script>

<style>
  /* 注意：这里如果用class去包裹样式 会造成全局样式都改变，而影响到其他页面组件的样式。
    这里采用每个页面单独用一个id来控制，因为id是唯一的，所以就解决了样式权重和冲突的问题
  */
  #orgTable-dialog .el-dialog__header {
    padding: 0 !important;
    padding-bottom: 0 !important;
  }
  #orgTable-dialog .el-dialog__body {
    padding: 30px 20px !important;
  }
</style>