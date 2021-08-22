<template>
  <div class="app-container">
    <!-- 筛选栏 -->
    <div ref="filterhight" class="filter-container">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="分类：">
          <el-select v-model="listQuery.typeName" clearable placeholder="请选择">
            <el-option  v-for="item in allCategory" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人：">
          <el-input clearable v-model="listQuery.createName" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item label="请求Ip：">
          <el-input clearable v-model="listQuery.Ip" placeholder="请输入Ip" />
        </el-form-item>
        <el-form-item v-if="filterStatus == 0" label="创建时间：">
          <el-date-picker v-model="listQuery.beginCreateTime" type="datetime" placeholder="开始日期" />
        </el-form-item>
        <el-form-item v-if="filterStatus == 0">-</el-form-item>
        <el-form-item v-if="filterStatus == 0">
          <el-date-picker v-model="listQuery.endCreateTime" type="datetime" placeholder="结束日期" />
        </el-form-item>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button v-waves class="filter-item" type="info" icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button v-waves class="filter-item" type="primary" :icon="filterStatus===0?'el-icon-zoom-out':'el-icon-zoom-in'" @click="handleShow">高级</el-button>
      </el-form>
    </div>

    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :height="tableHeight"
      :data="list"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="内容" prop="content" min-width="200px" align="center">
        <template slot-scope="{row}">
          <el-link type="success">{{ row.content }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="分类" prop="typeName" min-width="80px" align="center">
        <template scope="scope">
          <el-tag effect="plain" type="success" v-if="scope.row.typeName =='登录日志'">{{ scope.row.typeName }}</el-tag>
          <el-tag effect="plain" v-if="scope.row.typeName =='访问日志'">{{ scope.row.typeName }}</el-tag>
          <el-tag effect="plain" type="danger" v-if="scope.row.typeName =='定时任务'">{{ scope.row.typeName }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="请求地址" prop="href" min-width="120px" align="center" />

      <el-table-column label="操作人" prop="createName" min-width="80px" align="center" />

      <el-table-column label="请求Ip" prop="ip" align="center" min-width="80px" />

      <el-table-column label="应用名" prop="application" align="center" min-width="100px" />

      <el-table-column label="操作结果" class-name="status-col" align="center" width="80px">
        <template slot-scope="{row}">
          {{ row.result | statusFilter }}
        </template>
      </el-table-column>
      
      <el-table-column label="时间" prop="createTime" align="center" min-width="100px" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageIndex" :limit.sync="listQuery.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { getPageData } from '@/api/SysLogs/sysLog'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { parseTime } from '@/utils'

export default {
  name: 'SysLog',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '×',
        0: '√'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      allCategory: [
        {
          label: '访问日志',
          value:'访问日志'
        },
        {
          label: '登录日志',
          value:'登录日志'
        },
        {
          label: '定时任务',
          value:'定时任务'
        }
      ],
      listLoading: true,
      listQuery: {
        pageIndex: 1,
        pageSize: 20,
        typeName: '',
        createName: '',
        ip: '',
        beginCreateTime: '',
        endCreateTime: ''
      },
      // 状态开关
      filterStatus: 1
    }
  },
  created() {
    this.getList()
  },
  updated() {
    this.getTableHeight()
  },
  // 挂载window.onresize事件
  mounted() {
    const _this = this
    window.onresize = () => {
      if (_this.resizeFlag) {
        clearTimeout(_this.resizeFlag)
      }
      _this.resizeFlag = setTimeout(() => {
        _this.getTableHeight()
        _this.resizeFlag = null
      }, 100)
    }
  },
  // 注销window.onresize事件
  beforeRouteLeave(to, from, next) {
    // 离开组件的时候触发
    window.onresize = null
    next()
  },
  methods: {
    // 计算高度
    getTableHeight() {
      const baseH = 135 // 基础的一个高度
      let tableH = 280 // 默认的高度
      if (this.$refs.filterhight != null) {
        tableH = baseH + this.$refs.filterhight.offsetHeight + 30 // 动态的高度加上分页组件的高度
      }
      const tableHeightDetil = window.innerHeight - tableH
      if (tableHeightDetil <= 300) {
        this.tableHeight = 300
      } else {
        this.tableHeight = window.innerHeight - tableH
      }
    },
    // 查询
    getList() {
      this.listLoading = true
      // 时间查询条件格式化处理
      if (this.listQuery.beginCreateTime != '') {
        this.listQuery.beginCreateTime = parseTime(this.listQuery.beginCreateTime)
      }
      if (this.listQuery.endCreateTime != '') {
        this.listQuery.endCreateTime = parseTime(this.listQuery.endCreateTime)
      }
      getPageData(this.listQuery).then(response => {
        this.list = response.data.datas
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      this.getTableHeight()
    },
    // 条件筛选
    handleFilter() {
      this.listQuery.pageIndex = 1
      this.getList()
    },
    // 重置筛选
    handleReset() {
      this.listQuery = {
        typeName: '',
        createName: '',
        ip: '',
        beginCreateTime: '',
        endCreateTime: ''
      }
    },
    // 高级
    handleShow() {
      this.filterStatus = this.filterStatus ? 0 : 1
      this.getTableHeight()
    }
  }
}
</script>