<template>
  <div class="tab-container">
    <div style="margin-bottom:20px; color:#909399;">Consul基础配置：</div>
    <el-tag style="margin:0px 10px;">数据中心 ：【{{ config.datacenter }}】</el-tag>
    <el-tag style="margin-right:10px;">主数据中心 ：【{{ config.primaryDatacenter }}】</el-tag>
    <el-tag style="margin-right:10px;">节点 ：【{{ config.nodeName }}】</el-tag>
    <el-tag style="margin-right:10px;">版本 ：【{{ config.version }}】</el-tag>
    <el-tabs v-model="activeName" style="margin-top:15px;" type="border-card">
      <el-tab-pane v-for="item in tabMapOptions" :key="item.key" :label="item.label" :name="item.key">
        <keep-alive>
          <tab-pane v-if="activeName==item.key" :activeName="activeName" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import TabPane from './components/TabPane'
import { consulServices, consulSelf } from '@/api/system/consul'

export default {
  name: 'ConsulTable',
  components: { TabPane },
  data() {
    return {
      tabMapOptions: [ ],
      config: {
        datacenter: '',
        primaryDatacenter: '',
        nodeName: '',
        version: ''
      },
      activeName: '',
      createdTimes: 0
    }
  },
  watch: {
    activeName(val) {
      this.$router.push(`${this.$route.path}?tab=${val}`)
    }
  },
  created() {
    this.getConsulSelf()
    this.getList()
  },
  methods: {
    // 获取services列表
    getList() {
      this.listLoading = true
      consulServices().then(response => {
        this.activeName = response.data[0]
        response.data.forEach((item, index) => {
          let servicesName = ''
          if(item == 'AdminApi') {
            servicesName = '后台服务' 
          }
          if(item == 'ApiGateway') {
            servicesName = '网关服务' 
          }
          if(item == 'IdentityServer4') {
            servicesName = '授权服务' 
          }
          this.tabMapOptions.push({label: servicesName, key: item})
        })
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    // 获取Consul基础配置
    getConsulSelf() {
      consulSelf().then(response => {
        this.config = response.data.config
      })
    }
  }
}
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }
</style>
