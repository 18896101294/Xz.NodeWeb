<template>
  <el-table :data="list" v-loading="loading" border fit highlight-current-row style="width: 100%">
    <el-table-column align="center" label="服务Id" prop="serviceID" >
    </el-table-column>

    <el-table-column align="center" label="服务名称" prop="serviceName" >
    </el-table-column>

    <el-table-column width="100px" align="center" label="服务端口" prop="servicePort" >
    </el-table-column>
    
    <el-table-column width="180px" align="center" label="节点" prop="node" >
    </el-table-column>

    <el-table-column  align="center" label="服务地址" prop="serviceAddress" >
    </el-table-column>

    <el-table-column align="center" label="地址" prop="address" >
    </el-table-column>
  </el-table>
</template>

<script>
import { consulServiceItem } from '@/api/system/consul'

export default {
  props: {
    activeName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      list: null,
      temp: {
        serviceID: '',
        serviceName: '',
        serviceAddress: '',
        servicePort: 0,
        node: '',
        address: ''
      },
      loading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.$emit('create') // for test
      consulServiceItem(this.activeName).then(response => {
        console.log(response.data)
        this.list = response.data
        setTimeout(() => {
          this.loading = false
        }, 0.5 * 1000)
      })
    }
  }
}
</script>

