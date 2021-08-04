<template>
  <div class="dashboard-container">
    <div class="dashboard">
      <el-row :gutter="20" :class="{ 'loading': loading }">
        <el-col :span="6">
          <router-link to="/server/server">
            <div class="grid-content bg-purple dashboard-server">
              <div class="serverImage">
                <svg-icon icon-class="serverSvg" />
              </div>
              <div class="serverData">
                <p>{{ $t('home.childServerNum') }}</p>
                <p>{{ indexData.termConnect }}</p>
              </div>
            </div>
          </router-link>
        </el-col>
        <el-col :span="6">
          <router-link to="/application/application">
            <div class="grid-content bg-purple dashboard-server">
              <div class="serverImage">
                <svg-icon icon-class="appSvg" />
              </div>
              <div class="serverData">
                <p>{{ $t('home.appNum') }}</p>
                <p>{{ indexData.appnum }}</p>
              </div>
            </div>
          </router-link>
        </el-col>
        <el-col :span="6">
          <router-link to="/user/user">
            <div class="grid-content bg-purple dashboard-server">
              <div class="serverImage">
                <svg-icon icon-class="userSvg" />
              </div>
              <div class="serverData">
                <p>{{ $t('home.userCreated') }}</p>
                <p>{{ indexData.usernum }}</p>
              </div>
            </div>
          </router-link>
        </el-col>
        <el-col :span="6">
          <router-link to="/user/user?status=1">
            <div class="grid-content bg-purple dashboard-server">
              <div class="serverImage">
                <svg-icon icon-class="termSvg" />
              </div>
              <div class="serverData">
                <p>{{ $t('home.linkTerm') }}</p>
                <p>{{ indexData.servernum }}</p>
              </div>
            </div>
          </router-link>
        </el-col>
      </el-row>
      <div class="server-process">
        <h5 class="termdata-title">{{ $t('home.mainServer') }}</h5>
        <div class="dashboard-mainServer" :class="{ 'loading': loading }">
          <div class="mainServer-left">
            <p>{{ $t('home.serverIpAdrr', { 'n': serverlist.ip_addr }) }}</p>
            <p>服务器备用IP地址: <span v-if="!isShowIp" @click="showInput">{{ serverlist.public_ip }}  <i class="el-icon-edit" /></span>
              <el-input v-if="isShowIp" v-model="public_ip" size="mini" style="width:150px" @blur="editIp" />
            </p>
            <p>{{ $t('home.serverConfig', { 'n': ipconf }) }}</p>
            <p>{{ $t('home.disk_IO') }}：{{ retain(serverlist.io_read_speed) }}MB/S  |  {{ retain(serverlist.io_write_speed) }}MB/S</p>
            <p>{{ $t('home.serverRunStatus', { 'n': $t('inOperation') }) }}
              <el-button size="mini" @click.native="start">{{ $t('restart') }}</el-button>
              <el-button size="mini" @click.native="shutdown">{{ $t('shutdown') }}</el-button>
            </p>
          </div>
          <div class="mainServer-right">
            <div>
              <span>CPU</span>
              <div><el-progress type="circle" :percentage="cpuscale" /></div>
              <span>{{ $t('home.used') }}{{ cpuscale }}%</span>
            </div>
            <div>
              <span>{{ $t('home.memory') }}</span>
              <div><el-progress type="circle" :percentage="memscale" /></div>
              <span>{{ $t('home.used1') }}{{ serverlist.mem_used }}G/{{ $t('home.total') }}{{ serverlist.mem_total }}G</span>
            </div>
            <div>
              <span>{{ $t('home.storage') }}</span>
              <div><el-progress type="circle" :percentage="diskscale" /></div>
              <span>{{ $t('home.used1') }}{{ serverlist.disk_used }}G/{{ $t('home.total') }}{{ serverlist.disk_total }}G</span>
            </div>
          </div>
        </div>
      </div>
      <el-row :gutter="20" class="dashboard-termdata">
        <el-col :span="8">
          <h5 class="termdata-title">{{ $t('home.termAuthorize') }}</h5>
          <div class="termdata-chart" :class="{ 'loading': loading }">
            <div v-if="authdata && authdata.length > 0" class="termdata-left">
              <p>{{ $t('home.authorized') }}：{{ authdata[0].value }}</p>
              <p>{{ $t('home.surplus') }}：{{ authdata[1].value }}</p>
            </div>
            <line-chart :chart-data="authdata" />
          </div>
        </el-col>
        <el-col :span="16">
          <h5 class="termdata-title">{{ $t('home.childServer') }}</h5>
          <el-table :data="subserver" height="300" border style="width: 100%" :class="{ 'loading': loading }">
            <el-table-column prop="name" :label="$t('home.serverName')" align="center" min-width="100" show-overflow-tooltip />
            <el-table-column prop="gname" :label="$t('home.serverGroup')" align="center" min-width="100" show-overflow-tooltip />
            <el-table-column prop="os_version" :label="$t('home.os')" align="center" min-width="100" show-overflow-tooltip />
            <el-table-column prop="ip_addr" :label="$t('home.serverIp')" align="center" min-width="100" show-overflow-tooltip />
            <el-table-column prop="cpu_load" :label="$t('home.cpuUsage')" align="center" min-width="100">
              <template slot-scope="scope">
                <span>{{ percentage(scope.row.cpu_load) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="mem_load" :label="$t('home.memoryUsage')" align="center" min-width="100">
              <template slot-scope="scope">
                <span>{{ percentage(scope.row.mem_load) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="disk_load" :label="$t('serverPage.diskUsage')" align="center" min-width="100" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ percentage(scope.row.disk_load) }}%
              </template>
            </el-table-column>
            <el-table-column prop="disk_load" :label="$t('serverPage.io') + '(MB/s)'" align="center" min-width="120" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ retain(scope.row.io_read_speed) }}/{{ retain(scope.row.io_write_speed) }}
              </template>
            </el-table-column>
            <el-table-column prop="run_state" :label="$t('home.runStatus')" align="center" min-width="100" show-overflow-tooltip>
              <template slot-scope="scope">
                <span v-if="scope.row.run_state === false">{{ $t('home.Shutdown') }}</span>
                <span v-else>{{ $t('home.inOperation') }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="dashboard-termdata">
        <el-col :span="24">
          <h5 class="termdata-title">用户使用率</h5>
          <div class="termdata-chart" :class="{ 'loading': loading }">
            <div class="usetime">
              <span>查询时间：</span>
              <el-date-picker
                v-model="usetime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                :picker-options="pickerOptions1"
              />
              <span style="padding-left:30px">
                <el-button type="primary" plain @click.native="UseTimeFormat(0)">查询</el-button>
                <el-button type="primary" plain @click.native="exportUseTime">导出</el-button>
              </span>
            </div>
            <BrokenLine :chart-data="usedata" />
          </div>
        </el-col>
      </el-row>
    </div>

  </div>
</template>

<script>
var time = null
import { mapGetters } from 'vuex'
import LineChart from './componet/LineChart'
import BrokenLine from './componet/BrokenLineChart'
import * as dashboard from '@/api/dashboard'
import { get_all_machine_list } from '@/api/server'
import { parseTime } from '@/utils/index.js'

export default {
  name: 'Dashboard',
  components: { LineChart, BrokenLine },
  data() {
    return {
      public_ip: '',
      isShowIp: false,
      loading: true,
      // 进度条百分比
      cpuscale: 0,
      memscale: 0,
      diskscale: 0,
      ipconf: '',
      serverlist: {},
      subserver: [],
      authdata: [],
      usedata: [],
      usetime: [],
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      // 首页值
      indexData: {
        appnum: '',
        termConnect: '',
        usernum: '',
        servernum: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted() {
    time = setInterval(() => {
      this.get_index_info()
    }, 5000)
    this.get_index_info()
    this.getParentServer()
    this.UseTimeFormat()
  },
  destroyed() {
    clearInterval(time)
  },
  methods: {
    // 导出使用时间
    exportUseTime() {
      const url = process.env.VUE_APP_BASE_API + `/index/export_user_usage_rate?start_time=${this.usetime[0]}&end_time=${this.usetime[1]}`
      window.open(url)
    },
    // 用户使用率 显示一周7天的时间
    UseTimeFormat(v) {
      if (v !== 0) {
        const currentTime = parseTime(new Date().getTime(), '{y}-{m}-{d}')
        const currentTimeAddSeven = parseTime(new Date().getTime() - 3600 * 1000 * 24 * 7, '{y}-{m}-{d}')
        this.usetime = [currentTimeAddSeven, currentTime]
      }
      const query = Object.assign({}, { start_time: this.usetime[0], end_time: this.usetime[1] })
      dashboard.getUserUsageRate(query).then(res => {
        if (res.code === 0) {
          this.usedata = res.data_list
        }
      })
    },
    showInput() {
      this.isShowIp = true
      this.public_ip = this.serverlist.public_ip
    },
    editIp() {
      dashboard.setip({ public_ip: this.public_ip }).then(res => {
        if (res.code === 0) {
          this.get_index_info()
          this.isShowIp = false
        }
      })
    },
    // 首页部分数据
    get_index_info() {
      dashboard.get_index_info().then(res => {
        if (res.code === 0) {
          // 获取应用数量
          this.indexData.appnum = res.app_count
          // 获取已连接终端数量
          this.indexData.termConnect = res.machine_count
          // 获取用户数量
          this.indexData.usernum = res.user_count
          // 获取节点数量
          this.indexData.servernum = res.online_term_count
          // 获取授权chart
          this.authdata = [
            { value: res.term_license.used_num, name: this.$t('home.authorized') },
            { value: res.term_license.free, name: this.$t('home.surplus') }
          ]
          // 获取所有的服务器
          this.serverlist = res.server_dict
          this.cpuscale = this.percentage(res.server_dict.cpu_load)
          this.memscale = this.percentage(res.server_dict.mem_load)
          this.diskscale = this.percentage(res.server_dict.disk_load)
          this.ipconf = this.serverlist.cpu_info + '/' + this.serverlist.mem_total + 'G/' + this.serverlist.disk_used + 'G|' + this.serverlist.disk_total + 'G'
          this.loading = false
        }
      })
    },
    getParentServer() {
      get_all_machine_list().then(res => {
        if (res.code === 0) {
          this.subserver = res.list
        }
      })
    },
    // 转百分比
    percentage(percentage) {
      return Math.floor((percentage * 100) * 100) / 100
    },
    // 保留2位小数
    retain(retain) {
      return Math.floor(retain * 100) / 100
    },
    // 关机
    shutdown() {
      this.$confirm(this.$t('home.isShutdownTit'), this.$t('home.isShutdown'), {
        confirmButtonText: this.$t('sure'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        dashboard.poweroff().then(res => {
          if (res.code === 0) {
            this.$message.success('服务器即将关机')
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    // 重启
    start() {
      this.$confirm(this.$t('home.isRestartTit'), this.$t('home.isRestart'), {
        confirmButtonText: this.$t('sure'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        dashboard.restart().then(res => {
          if (res.code === 0) {
            this.$message.success('服务器即将重启')
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
.server-process, .dashboard-termdata {
  margin-top: 30px;
}
.termdata-title {
  height: 40px;
  margin: 0;
  background: #eaeaea;
  color: #303133;
  font-weight: normal;
  line-height: 40px;
  padding-left: 20px;
}
.dashboard {
  &-container {
    margin: 30px;
  }
  &-server {
    display: flex;
    align-items: center;
    border: 1px solid #dadada;
    padding: 20px;
    .serverImage {
      flex-grow: 0;
      svg {
        font-size: 48px;
      }
    }
    .serverData {
      padding-left: 20px;
      flex-grow: 1;
      p {
        line-height: 30px;
        margin: 0;
        white-space: nowrap;
        width: 80%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      p:first-child {
        color:#999;
      }
      p:last-child {
        font-size: 24px;
      }
    }
  }
  .server-process {
    border: 1px solid #eaeaea;
  }
  &-mainServer {
    display: flex;
    padding: 20px;
    .mainServer {
      &-left {
        width: 40%;
      }
      &-right {
        width: 60%;
        display: flex;
        >div {
          display: flex;
          flex-direction: column;
          text-align: center;
          flex-grow: 1;
          span {
            padding: 10px 0;
          }
        }
      }
    }
  }
  .dashboard-termdata {
    .termdata {
      &-title {
        height: 40px;
        margin: 0;
        background: #eaeaea;
        color: #303133;
        font-weight: normal;
        line-height: 40px;
        padding-left: 20px;
      }
      &-chart {
        position: relative;
        border: 1px solid #EBEEF5;
        // height: 300px;
        .usetime {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 30px;
        }
      }
      &-left {
        position: absolute;
        left: 30px;
        top: 10%;
      }
    }
  }
}
</style>
