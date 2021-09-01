<template>
  <el-select :value="valueTitle" :clearable="clearable" v-model="selectValues" multiple @clear="clearHandle" placeholder="请选择"
  @remove-tag="removeTag">
    <el-option :value="valueTitle" :label="valueTitle" class="options">
      <el-tree
        id="tree-option"
        ref="MultiSelectTree"
        :accordion="accordion"
        :data="options"
        :props="props"
        :default-expand-all='true'
        :expand-on-click-node='false'
        :node-key="props.value"
        :default-expanded-keys="[]"
        :show-checkbox = 'true'
        :check-on-click-node = 'true'
        :check-strictly = 'true'
        @check="handleClick">
      </el-tree>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "MultiSelectTree",
  props:{

    // 配置项
    props:{
      type: Object,
      default: {
          value:"id",             // ID字段名
          label: 'title',         // 显示名称
          children: 'children'    // 子级字段名
      }
    },

    // 选项列表数据(树形结构的对象数组)
    options:{ type: Array, default: [] },

    // 初始值
    value:{ type: Array, default: [] },

    // 可清空选项
    clearable:{ type:Boolean, default: true },

    // 自动收起
    accordion:{ type:Boolean, default: false }

  },
  data() {
    return {
      valueId: [],
      valueTitle:'',
      defaultExpandedKey:[],
      selectValues:[],
      checkedNodes: [],
      checkTrre: {}
    }
  },
  mounted(){
    this.valueId = this.value
    if(this.value.length == 0){
      this.valueTitle =''
    }
    if(this.value.length>0){
      this.initHandle()
    }
    this.defaultExpandedKey = []
  },
  methods: {
    // 初始化值
    initHandle(){
      if(this.valueId.length > 0){
        this.$refs.MultiSelectTree.setCheckedKeys(this.valueId)       // 设置默认选中
        // this.defaultExpandedKey = []      // 设置默认展开
        let trreValues = []
        setTimeout(()=>{
          this.$refs.MultiSelectTree.getCheckedNodes().forEach((item,index) => {
            if(trreValues.indexOf(item.name) == -1) {
              trreValues.push(item.name)
            }
            if(this.checkedNodes.findIndex(v=>v.id === item.id) == -1) {
              this.checkedNodes.push(item)
            }
          })
          this.selectValues = trreValues
          this.$emit('getValue', {names: this.selectValues, values: this.valueId})
        }, 500)
      }else{
        this.valueTitle = ''
      }
      // this.$emit('getValue', {names: this.selectValues, values: this.valueId})

      this.initScroll()
    },
    // 初始化滚动条
    initScroll(){
      this.$nextTick(()=>{
        let scrollWrap = document.querySelectorAll('.el-scrollbar .el-select-dropdown__wrap')[0]
        let scrollBar = document.querySelectorAll('.el-scrollbar .el-scrollbar__bar')
        scrollWrap.style.cssText = 'margin: 0px; max-height: none; overflow: hidden;'
        scrollBar.forEach(ele => ele.style.width = 0)
      })
    },

    // 复选框被选中时调用
    handleClick(data, trre) {
      this.selectValues = []
      this.checkedNodes = []
      let trreValues = []
      let getValueIds = []
      trre.checkedNodes.forEach((item,index) => {
        if(trreValues.indexOf(item.name) == -1) {
          trreValues.push(item.name)
          this.checkedNodes.push(item)
          getValueIds.push(item.id)
        }
      })
      this.selectValues = trreValues
      this.$emit('getValue', {names: this.selectValues , values: getValueIds})
    },

    removeTag(tag) {
      // 移除选中的节点
      const index = this.checkedNodes.findIndex(v => v.name === tag)
      this.checkedNodes.splice(index, 1)
      // 获取当前还选中的节点
      let nowCheckedId = []
      this.checkedNodes.forEach((item, index)=>{
        nowCheckedId.push(item.id)
      })
      // 重新设置选中的节点
      this.$refs.MultiSelectTree.setCheckedKeys(nowCheckedId)
      this.$emit('getValue', {names: this.selectValues, values:nowCheckedId})

    },

    // 清除选中
    clearHandle(){
      this.valueTitle = ''
      this.defaultExpandedKey = []
      this.checkedNodes = []
      this.selectValues = []
      this.$refs.MultiSelectTree.setCheckedKeys([])
      this.$emit('getValue', {names: [], values:[]})
    },

    // 清空选中样式
    clearSelected(){
      let allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach((element)=>element.classList.remove('is-current'))
    }

  },

  watch: {
    value(){
      this.valueId = this.value
      this.initHandle()
    }
  },
}
</script>

<style scoped>
  .el-scrollbar .el-scrollbar__view .el-select-dropdown__item{
    height: auto;
    max-height: 274px;
    padding: 0;
    overflow: hidden;
    overflow-y: auto;
  }

  ::-webkit-scrollbar {
          width:5px;
          background-color: #f3f3f3;
          }

          /* 滚动槽 */
          ::-webkit-scrollbar-track {
          border-radius:10px;
          }

          /* 滚动条滑块 */
          ::-webkit-scrollbar-thumb {
          border-radius:10px;
          background:#1AA094;
          }

  .el-select-dropdown__item.selected{
    font-weight: normal;
  }
  ul li >>>.el-tree .el-tree-node__content{
    height:auto;
    padding: 0 20px;
  }
  .el-tree-node__label{
    font-weight: normal;
  }
  /* .el-tree >>>.is-current .el-tree-node__label{
    color: #409EFF;
    font-weight: 700;
  } */
  .el-tree >>>.is-current .el-tree-node__children .el-tree-node__label{
    color:#606266;
    font-weight: normal;
  }

  .Bg{
    background: #1aa094;
    color: white;
  }
</style>
