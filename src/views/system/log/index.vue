<template>
  <div class="dashboard-container">
    <div class="page-server">
      <div class="page-server-fl">
        <el-date-picker
          v-model="listQuery.start"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          default-time="00:00:00"
          :placeholder="$t('starttime')"
        />
        <span style="padding:10px">{{ $t('to') }}</span>
        <el-date-picker
          v-model="listQuery.end"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          default-time="00:00:00"
          :placeholder="$t('endtime')"
        />
        <el-button type="primary" size="small" @click.native="getlogList">{{ $t('search') }}</el-button>
      </div>
      <div class="page-server-fr">
        <el-button type="primary" size="small" @click.native="del">{{ $t('del') }}</el-button>
      </div>
    </div>
    <div class="loglist">
      <el-table ref="loglist" :data="slice" max-height="500" border style="width: 100%" @selection-change="handleSelectionChange" @cell-click="cellClick">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="user" :label="$t('logPage.operator')" min-width="100" align="center" />
        <el-table-column prop="time" :label="$t('logPage.operationDate')" min-width="100" align="center" />
        <el-table-column prop="ip" :label="$t('logPage.ipaddr')" min-width="100" align="center" />
        <el-table-column prop="remarks" :label="$t('logPage.record')" min-width="100" align="center" />
      </el-table>
    </div>
    <!-- 分页 -->
    <div v-if="items.length" class="pagination-container fr">
      <el-pagination
        :current-page.sync="listQuery.pageNo"
        layout="total, sizes, prev, pager, next, jumper"
        :total="items.length"
        :page-sizes="[10,20,50,100]"
        :page-size="listQuery.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script>
import * as logApi from '@/api/log'
export default {
  data() {
    return {
      // 分页
      slice: [],
      items: [],
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        start: '',
        end: ''
      },
      multipleSelection: [],
      tasklistData: []
    }
  },
  mounted() {
    this.getlogList()
  },
  methods: {
    // 表格全选及点击行选中
    handleSelectionChange(row, selected) {
      this.multipleSelection = row
    },
    cellClick(row, column, cell, event) {
      if (column.label === this.$t('operation') || column.type === 'selection') return
      this.$refs.loglist.toggleRowSelection(row)
    },
    // 分页操作
    handleSizeChange(v) {
      this.listQuery.pageSize = v
      this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
    },
    handleCurrentChange(v) {
      this.listQuery.pageNo = v
      this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
    },
    jsonSort(jsonObj) {
      const arr = []
      for (const i of jsonObj) {
        arr.push(i.id)
      }
      arr.sort((a, b) => {
        return b - a
      })
      this.tasklistData = []
      for (var i in arr) {
        for (const j of jsonObj) {
          if (j.id === arr[i]) {
            this.tasklistData.push(j)
          }
        }
      }
    },
    // 查询
    getlogList() {
      if (this.listQuery.start === '' || this.listQuery.start === null) {
        this.listQuery.start = ''
      }
      if (this.listQuery.end === '' || this.listQuery.end === null) {
        this.listQuery.end = ''
      }
      if (this.listQuery.start !== '' && this.listQuery.end === '') {
        this.$message.error('结束时间不能为空')
        return
      }
      if (this.listQuery.start === '' && this.listQuery.end !== '') {
        this.$message.error('开始时间不能为空')
        return
      }
      const s = new Date(this.listQuery.start).getTime()
      const e = new Date(this.listQuery.end).getTime()
      if (s > e) {
        this.$message({
          type: 'error',
          message: this.$t('timeLimit')
        })
        return
      }
      var query = Object.assign({}, this.listQuery)
      logApi.get_log_info(query).then(res => {
        if (res.code === 0) {
          this.jsonSort(res.list)
          this.items = this.tasklistData
          this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
        }
      })
    },
    // 删除
    del() {
      const id_list = []
      if (this.multipleSelection.length <= 0) {
        this.$message.error('请选择要删除的日志')
        return
      }
      for (const i of this.multipleSelection) {
        id_list.push(i.id)
      }
      this.$confirm('点击确定按钮时，将删除您选择的操作日志', '删除日志', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        logApi.del_log_info({ 'id_list': id_list }).then(res => {
          if (res.code === 0) {
            this.$message.success('删除日志成功')
            this.getlogList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
  .loglist {
    padding: 20px;
  }
  .page {
    text-align: right;
    padding-right: 20px;
  }
</style>
