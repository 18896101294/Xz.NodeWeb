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
        </div>
      </el-form>
    </div>

    <el-row :gutter="10">
      <el-col :span="4" style="border: 1px solid #dfe6ec">
        <div class="tree-container" style="overflow: auto; height: 100%">
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
          height="100%"
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
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="orgUserQuery.page" :limit.sync="orgUserQuery.limit" @pagination="loadUsersPage" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getOrgs } from '@/api/basics/org'
import { loadUsersPage } from '@/api/basics/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'AllocationUsers',
  components: { Pagination },
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
      listLoading: true,
      listElementLoading: true,
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
      // 勾选
      multipleSelection: null,
    }
  },
  created() {
    this.getOrgs()
  },
  methods: {
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

    treeData(source, id, parentId, children){  
      let cloneData = JSON.parse(JSON.stringify(source))
      return cloneData.filter(father=>{
        let branchArr = cloneData.filter(child => father[id] == child[parentId]);
        branchArr.length>0 ? father[children] = branchArr : ''
        return father[parentId] == ''    // 如果第一层不是parentId=0，请自行修改
      })
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
    }

  } 
}
</script>

