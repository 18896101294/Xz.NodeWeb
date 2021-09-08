<template>
  <div class="app-container" style="padding:20px 20px 0 20px">
    <el-row :gutter="10">
      <div class="tree-container" style="overflow: auto; height:600px;">
        <el-steps id="module-steps" style="padding-bottom: 15px;" :active="active" finish-status="success">
          <el-step title="分配模块"></el-step>
          <el-step title="分配菜单"></el-step>
          <el-step title="分配字段"></el-step>
        </el-steps>
        <!-- 树形菜单 -->
        <el-tree id="module-tree" :data="list" ref="tree" show-checkbox v-loading="listLoading" element-loading-text="加载中..." default-expand-all node-key="id" :expand-on-click-node="false" 
          :props="defaultProps" :check-strictly="true" :check-on-click-node = "true"
          @node-click="elTreeClick"> 
          <span class="custom-tree-node" slot-scope="{ node }">
            <span :name="node.label">
                <i v-if="node.childNodes.length>0"
                :class="node.expanded ? 'el-icon-folder-opened' : 'el-icon-folder'"></i>
                <i v-else class="el-icon-document-remove"></i>  {{ node.label }}
            </span>
          </span>
        </el-tree>
      </div>
    </el-row>
  </div>
</template>

<script>
import { getModulesName } from '@/api/basics/module'
import { loadUsersPage } from '@/api/basics/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { string } from 'clipboard'

export default {
  name: 'AllocationModules',
  props:{
    // 已绑定的模块
    roleModuleDatas: { type: Array, default: [] },
    active: { type: Number, default: 0 },
  },
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      listLoading: true,
      // 勾选
      multipleSelection: [],
    }
  },
  created() {
    this.getModulesName()
  },
  mounted() {
    this.initTree()
  },
  methods: {
    // 初始化树目录
    initTree() {
      this.$refs.tree.setCheckedKeys(this.roleModuleDatas);
    },

    // 查询
    getModulesName(isRefresh) {
      if(isRefresh) {
        this.multipleSelection = null 
      }
      this.list = []
      this.listLoading = true
      getModulesName().then(response => {
        this.list = this.treeData(response.data, 'id', 'parentId', 'children')
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
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

    //节点点击回调
    elTreeClick(treeData, node, tree) {
      
    },
  },
  watch: {
    active(val, oldVal){
      // 获取分配元素
      if(val == 1) {

      }
    }
  }
}
</script>

<style>
  #module-steps .el-step__title {
    font-size: 14px;
  }
  #module-steps .el-step__title.is-process {
    font-size: 14px;
    line-height: 30px;
  }
  /* #module-tree .el-checkbox__inner {
    border: 1px solid #6a6d72;
  } */
</style>