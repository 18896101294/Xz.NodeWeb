<template>
  <el-table :data="list" v-loading="loading" border stripe fit highlight-current-row style="width: 100%">
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

    <el-table-column label="操作" align="center" width="110" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">删除</el-button>
        </template>
      </el-table-column>
  </el-table>
</template>

<script>
import { consulServiceItem, consulServiceDeleteItem } from '@/api/system/consul'

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
        this.list = response.data
        setTimeout(() => {
          this.loading = false
        }, 0.5 * 1000)
      })
    },
    // 删除
    handleDelete(row, index) {
      if (row != null) {
        this.$confirm('将取消注册此服务，请谨慎操作！ 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const deleteIds = []
          deleteIds.push(row.serviceID)
          consulServiceDeleteItem(deleteIds).then(response => {
            this.$notify({
              message: response.message, type: 'success'
            })
            this.list.splice(index, 1)
          })
        }).catch(() => {
          this.$notify({
            message: '已取消删除', type: 'info'
          })
        })
      }
    }

  }
}
</script>

