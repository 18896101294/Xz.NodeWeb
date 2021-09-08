<template>
  <div class="app-container" style="padding:20px 20px 0 20px" v-loading="listLoading" element-loading-text="加载中...">
    <el-row :gutter="10">
      <div class="tree-container" style="overflow: auto; height:600px;">
        <el-steps id="module-steps" style="padding-bottom: 15px;" :active="active" finish-status="success">
          <el-step title="分配模块"></el-step>
          <el-step title="分配菜单"></el-step>
          <el-step title="分配字段"></el-step>
        </el-steps>
        <!-- 树形菜单 -->
        <el-tree v-show="active==0" id="module-tree" :data="list" ref="tree" show-checkbox default-expand-all node-key="id" :expand-on-click-node="false" 
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
        <div v-show="active==1" style="height:520px;overflow:auto">
          <div v-for="item in checkedModules" :key="item.id" style="padding: 10px">
            <i class="el-icon-menu" style="padding-right:5px;"/>{{item.fullName}}<el-checkbox style="padding-left:15px ">全选</el-checkbox>
            <div>
              <el-checkbox v-for="element in item.elements" :key="element.id" style="padding-left:15px;padding-top:15px">{{element.name}}</el-checkbox>
            </div>
          </div>
        </div>
      </div>
    </el-row>
  </div>
</template>

<script>
import { getModulesName, getCheckedModules } from '@/api/basics/module'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

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

      checkedModules: [],
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
      if(val == 0) {
        this.listLoading = true
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
      }
      // 获取分配元素
      if(val == 1) {
        this.listLoading = true
        let treeChecked = this.$refs.tree.getCheckedKeys();
        getCheckedModules({ ids: treeChecked }).then(response => {
          this.checkedModules = response.data
          setTimeout(() => {
            this.listLoading = false
          }, 1 * 1000)
        })
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