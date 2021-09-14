<template>
  <div class="app-container" style="padding:20px 20px 0 20px" v-loading="listLoading" element-loading-text="加载中...">
    <el-row :gutter="10">
      <div class="tree-container" style="overflow: auto; height:600px;">
        <el-steps id="module-steps" style="padding-bottom: 15px;" :active="active" finish-status="success">
          <el-step title="分配模块"></el-step>
          <el-step title="分配菜单"></el-step>
          <el-step title="分配字段"></el-step>
        </el-steps>
        <!-- 勾选模块 -->
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

        <!-- 勾选菜单 -->
        <div v-show="active==1" style="height:520px;overflow:auto">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <!-- <el-checkbox-group v-model="currentCheckedMenu"> -->
          <div v-for="item in checkedModules" :id="item.id" :key="item.id" style="padding: 10px">
            <i class="el-icon-menu" style="padding-right:5px;">{{item.fullName}}</i>
            <el-checkbox-group v-model="currentCheckedMenu" @change="handleCheckedCitiesChange">
            <div>
              <el-checkbox v-for="element in item.elements" :label="element.id" :id="element.id" :key="element.id" 
                style="padding-left:15px;padding-top:15px"
                @change="(value) => handleCheckChange(value, element)">{{element.name}}</el-checkbox>
            </div>
            </el-checkbox-group>
          </div>
          <!-- </el-checkbox-group> -->
        </div>

        <!-- 勾选字段 -->
        <div v-show="active==2" style="height:520px;overflow:auto">
          <el-checkbox :indeterminate="isIndeterminateProperties" v-model="checkAllProperties" @change="handlecheckAllPropertiesChange">全选</el-checkbox>
          <div v-for="item in checkedModulesProperties" :id="item.id" :key="item.id" style="padding: 10px">
            <i class="el-icon-menu" style="padding-right:5px;">{{item.fullName}}<font style="font-size: 13px;color: red;">(非系统模块才可配置数据字段)</font></i>
            <el-checkbox-group v-model="currentCheckedKey" @change="handleCheckedCitiesPropChange">
            <div>
              <el-checkbox v-for="key in item.keys" :label="key.key" :id="key.key" :key="key.key" 
                style="padding-left:15px;padding-top:15px"
                @change="(value) => handleCheckPropChange(value, key)">{{key.description}}</el-checkbox>
            </div>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </el-row>
  </div>
</template>

<script>
import { getModulesName, getCheckedModules, getCheckedProperties } from '@/api/basics/module'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'AllocationModules',
  props:{
    // 已绑定的模块
    roleModuleDatas: { type: Array, default: [] },
    // 已绑定的菜单
    roleMenuDatas: { type: Array, default: [] },
    // 已绑定的字段
    rolePropDatas: { type: Array, default: [] },
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
      checkedMenu: [],
      checkedModulesProperties: [],
      checkedProperties: [],
      // 当前选中的菜单
      currentCheckedMenu: [],
      // 当前选中的字段
      currentCheckedKey: [],

      isIndeterminate: true,
      checkAll: false,
      isIndeterminateProperties: true,
      checkAllProperties: false,
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
      this.$emit('getValue', { moduleChecked: this.roleModuleDatas })
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

    // 节点点击回调
    elTreeClick(treeData, node, tree) {
      this.$emit('getValue', { moduleChecked: this.$refs.tree.getCheckedKeys() })
    },
    // 单个菜单勾选
    handleCheckChange(val, element) {
      const index = this.currentCheckedMenu.findIndex(u => u == element.id)
      if(val) {
        if(index == -1) {
          this.currentCheckedMenu.push(element.id)
        }
      } else {
        if(index > -1) {
          this.currentCheckedMenu.splice(index, 1)
        }
      }
      this.$emit('getValue', { menuChecked: this.currentCheckedMenu })
    },

    // 单个字段勾选
    handleCheckPropChange(val, key) {
      const index = this.currentCheckedKey.findIndex(u => u == key.key)
      if(val) {
        if(index == -1) {
          this.currentCheckedKey.push(key.key)
        }
      } else {
        if(index > -1) {
          this.currentCheckedKey.splice(index, 1)
        }
      }
      this.$emit('getValue', { propChecked: this.currentCheckedKey })
    },
    // 模块菜单全选
    handleCheckAllChange(val) {
      this.currentCheckedMenu = val ? this.checkedMenu : [];
      this.isIndeterminate = false;
      this.$emit('getValue', { menuChecked: this.currentCheckedMenu })
    },

    // 模块字段全选
    handlecheckAllPropertiesChange(val) {
      this.currentCheckedKey = val ? this.checkedProperties : [];
      this.isIndeterminateProperties = false;
      this.$emit('getValue', { propChecked: this.currentCheckedKey })
    },

    handleCheckedCitiesChange(val) {
      let checkedCount = val.length;
      this.checkAll = checkedCount === this.checkedMenu.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.checkedMenu.length;
    },

    handleCheckedCitiesPropChange(val) {
      let checkedCount = val.length;
      this.checkAllProperties = checkedCount === this.checkedProperties.length;
      this.isIndeterminateProperties = checkedCount > 0 && checkedCount < this.checkedProperties.length;
    }
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
          let elementDatas = []
          response.data.forEach((module, index) => {
            module.elements.forEach((element, index) => {
              elementDatas.push(element.id)
            })
          });
          this.checkedMenu = elementDatas
          this.roleMenuDatas.forEach((item, index) => {
            this.currentCheckedMenu.push(item)
          })
          setTimeout(() => {
            this.listLoading = false
            let checkedCount = this.currentCheckedMenu.length
            if(checkedCount == this.checkedMenu.length) {
              this.checkAll = true
              this.isIndeterminate = false
            }
          }, 1 * 1000)
          
        })
      }
      // 获取分配字段
      if(val == 2) {
        this.listLoading = true
        let treeChecked = this.$refs.tree.getCheckedKeys();
        getCheckedProperties({ ids: treeChecked }).then(response => {
          this.checkedModulesProperties = response.data
          let elementDatas = []
          response.data.forEach((module, index) => {
            module.keys.forEach((key, index) => {
              elementDatas.push(key.key)
            })
          });
          this.checkedProperties = elementDatas
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
</style>