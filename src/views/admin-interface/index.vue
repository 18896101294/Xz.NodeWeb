<template>
  <div>&nbsp;</div>
</template>

<script>
import iframeMixin from '@/utils/iframes/iframes-mixin'
// 接口文档
export default {
  name: 'AdminInterface',
  // 1. 混入指定操作文件
  mixins: [iframeMixin],
  data() {
    // 2. 指定当前页面对应的 iframes id
    return { PAGE_ID: 'admin_interface' }
  }
}
</script>

