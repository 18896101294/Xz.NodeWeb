import { mapActions, mapState } from 'vuex'
import { PAGE_LIST } from './iframes-config'

export default {
  data() {
    return { MISSING_ID: false }
  },
  computed: {
    ...mapState({
      iframes: state => state.iframes
    })
  },
  // 页面创建时新建对应 iframe
  created() {
    const pageList = PAGE_LIST()
    if (this.PAGE_ID == null || pageList[this.PAGE_ID] == null) {
      this.MISSING_ID = false
      console.error('缺少 PAGE_ID 参数')
      return
    }
    const obj = { id: this.PAGE_ID }
    if (this.PARAMS) obj.params = this.PARAMS
    this.createdPage(obj)
  },
  // 切换进入页面时显示对应 iframe
  activated() {
    if (this.MISSING_ID) return
    const params = this.iframes[this.PAGE_ID].params
    if (params != null && this.PARAMS != null && params !== this.PARAMS) {
      this.changeParams({ id: this.PAGE_ID, params: this.PARAMS })
    }
    this.activatedPage(this.PAGE_ID)
  },
  // 切换离开页面时隐藏对应 iframe
  deactivated() {
    if (this.MISSING_ID) return
    this.deactivatedPage(this.PAGE_ID)
  },
  // 切换离开页面时销毁对应 iframe
  beforeDestroy() {
    if (this.MISSING_ID) return
    this.beforeDestroyPage(this.PAGE_ID)
  },
  methods: {
    ...mapActions({
      createdPage: 'iframes/createdPage',
      activatedPage: 'iframes/activatedPage',
      deactivatedPage: 'iframes/deactivatedPage',
      beforeDestroyPage: 'iframes/beforeDestroyPage',
      changeParams: 'iframes/changeParams'
    })
  }
}
