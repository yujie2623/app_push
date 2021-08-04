<template>
  <div class="dashboard-container">
    <div class="page-server">
      <div class="page-server-fl">
        <el-input v-model="listQuery.key" :placeholder="$t('serverPage.enterIp')" prefix-icon="el-icon-search" />
        <el-button type="primary" size="small" @click.native="getAllList({ 'key': listQuery.key })">{{ $t('search') }}</el-button>
      </div>
      <div class="page-server-fr">
        <el-button type="primary" size="small" @click.native="addEdit({}, 'add')">{{ $t('add') }}</el-button>
        <el-dropdown>
          <el-button type="primary" size="small">
            {{ $t('more') }}<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="shutdown({}, 1)">{{ $t('shutdown') }}</el-dropdown-item>
            <el-dropdown-item @click.native="restart({}, 1)">{{ $t('restart') }}</el-dropdown-item>
            <!-- <el-dropdown-item>{{ $t('upgrade') }}</el-dropdown-item> -->
            <el-dropdown-item @click.native="del({}, 1)">{{ $t('del') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <el-row class="server-list serverlist">
      <!-- 分组 -->
      <el-col :span="4" class="server-list-add">
        <h5><strong>{{ $t('home.serverGroup') }}</strong><span @click="addServerGroup">{{ $t('add') }}</span></h5>
        <el-divider />
        <!-- 服务组 -->
        <el-timeline id="serverTree">
          <el-timeline-item v-for="(activity, index) in serverList" :key="activity.id">
            <div class="title">
              <span v-if="activity.isEdit === false" class="servertit" @click="getAllList({ 'gid': activity.id })">{{ activity.name }}</span>
              <el-input v-else v-model="serverList[index].name" placeholder="请输入分组名称" clearable size="mini" @blur="save(activity, index)" />
            </div>
            <div class="iconCss">
              <i class="el-icon-edit" style="color:#409EFF" @click="editServerGroup(activity, index)" />
              <i class="el-icon-delete" style="color:#409EFF" @click="delServerGroup(activity, index)" />
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-col>
      <el-col :span="20" class="server-list-data">
        <el-table
          ref="serverListRef"
          border
          :data="slice"
          style="width: 100%"
          max-height="500"
          @selection-change="handleSelectionChange"
          @cell-click="cellClick"
        >
          <el-table-column type="selection" align="center" width="55" />
          <el-table-column prop="name" :label="$t('home.serverName')" align="center" min-width="130" show-overflow-tooltip />
          <el-table-column prop="gname" :label="$t('home.serverGroup')" align="center" min-width="130" show-overflow-tooltip />
          <el-table-column prop="os_version" :label="$t('home.os')" align="center" min-width="130" show-overflow-tooltip />
          <el-table-column prop="ip_addr" :label="$t('home.serverIp')" align="center" min-width="130" show-overflow-tooltip />
          <el-table-column prop="cpu_info" :label="$t('serverPage.config')" align="center" min-width="130" show-overflow-tooltip />
          <el-table-column prop="cpu_load" :label="$t('home.cpuUsage')" align="center" min-width="130" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ Math.floor((scope.row.cpu_load * 100) * 100) / 100 }}%
            </template>
          </el-table-column>
          <el-table-column prop="mem_load" :label="$t('home.memoryUsage')" align="center" min-width="130" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ Math.floor((scope.row.mem_load * 100) * 100) / 100 }}%
            </template>
          </el-table-column>
          <el-table-column prop="disk_load" :label="$t('serverPage.diskUsage')" align="center" min-width="130" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ Math.floor((scope.row.disk_load * 100) * 100) / 100 }}%
            </template>
          </el-table-column>
          <el-table-column prop="disk_load" :label="$t('serverPage.io') + '(MB/s)'" align="center" min-width="130" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ Math.floor(scope.row.io_read_speed * 100) / 100 }}/{{ Math.floor(scope.row.io_write_speed * 100) / 100 }}
            </template>
          </el-table-column>
          <el-table-column prop="run_state" :label="$t('home.runStatus')" align="center" min-width="130" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="scope.row.run_state === false">关机</span>
              <span v-else>开机</span>
            </template>
          </el-table-column>
          <el-table-column prop="join_time" :label="$t('serverPage.jointime')" align="center" min-width="130" show-overflow-tooltip />
          <el-table-column prop="remarks" :label="$t('desc')" align="center" min-width="130" show-overflow-tooltip />
          <el-table-column fixed="right" :label="$t('operation')" align="center" min-width="150">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click.native="addEdit(scope.row, 'edit')">{{ $t('edit') }}</el-button>
              <el-dropdown>
                <el-button type="text" size="small">
                  {{ $t('more') }}<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="shutdown(scope.row, 0)">{{ $t('shutdown') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="restart(scope.row, 0)">{{ $t('restart') }}</el-dropdown-item>
                  <!-- <el-dropdown-item>{{ $t('upgrade') }}</el-dropdown-item> -->
                  <el-dropdown-item @click.native="del(scope.row, 0)">{{ $t('del') }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
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
      </el-col>
    </el-row>
    <!-- 添加编辑服务器 -->
    <el-dialog :title="addEditServerTitle" :visible.sync="addEditServerDialog" :close-on-click-modal="false" custom-class="dialogCss" width="800px">
      <el-form ref="addEditRef" :model="addEditServerForm" :rules="addEditRules" label-width="100px">
        <el-form-item label="服务器名称" prop="name">
          <el-input v-model="addEditServerForm.name" auto-complete="off" />
        </el-form-item>
        <el-form-item v-if="addEditServerTitle === '添加服务器'" label="所属组别" prop="gid">
          <el-select v-model="addEditServerForm.gid" placeholder="请选择所属组别" style="width:100%">
            <el-option v-for="item in serverList" :key="item.id" :label="item.id !== '' ? item.name : item.id" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务器IP" prop="ip_addr">
          <el-input v-model="addEditServerForm.ip_addr" auto-complete="off" />
        </el-form-item>
        <el-form-item label="盘符设置" prop="hide_disk">
          <el-switch
            v-model="addEditServerForm.hide_disk"
            active-text="显示"
            inactive-color="#BFBFBF"
            inactive-text="隐藏"
            :active-value="1"
            :inactive-value="0"
            class="switch"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="addEditServerForm.remarks" type="textarea" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addEditServerDialog = false">取 消</el-button>
        <el-button type="primary" @click="sureAddEdit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as server from '@/api/server'
import { isIP } from '@/utils/validate'
export default {
  data() {
    const isTrueIP = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入IP地址'))
      } else {
        if (!isIP(value)) {
          callback(new Error('请输入正确的IP地址'))
        }
        callback()
      }
      callback()
    }
    return {
      // 添加服务器分组
      serverList: [],
      activeId: '',
      // 编辑服务组
      isEdit: false,
      // 分页
      slice: [],
      items: [],
      listQuery: {
        pageNo: 1,
        pageSize: 10
      },
      multipleSelection: [],
      // 添加编辑服务器弹框
      addEditServerDialog: false,
      addEditServerTitle: '添加服务器',
      addEditServerForm: {
        ip_addr: '',
        gid: '',
        name: '',
        remarks: '',
        hide_disk: null // 0 隐藏 1 开启
      },
      addEditRules: {
        name: [
          { required: true, message: '请输入服务器名称', trigger: 'blur' }
        ],
        gid: [
          { required: true, message: '请输入组', trigger: 'change' }
        ],
        ip_addr: [
          { required: true, validator: isTrueIP, trigger: 'blur' }
        ],
        remarks: [
          { message: '请输入备注', trigger: 'blur' },
          { min: 0, max: 255, message: '备注不超过255个字符', trigger: 'blur' }
        ]
      },
      // 关机
      serverid: {
        id_list: []
      }
    }
  },
  mounted() {
    this.getServerData()
    this.getAllList()
  },
  methods: {
    // 表格全选及点击行选中
    handleSelectionChange(row, selected) {
      this.multipleSelection = row
    },
    cellClick(row, column, cell, event) {
      if (column.label === this.$t('operation') || column.type === 'selection') return
      this.$refs.serverListRef.toggleRowSelection(row)
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
    // 获取服务器分组数据
    getServerData() {
      server.get_machine_group().then(res => {
        if (res.code === 0) {
          this.serverList = res.list.map(element => {
            element.isEdit = false
            return element
          })
        }
      })
    },
    // 添加服务器分组
    addServerGroup() {
      // 只能出现一个input
      var content = document.getElementById('serverTree')
      var items = content.getElementsByTagName('input')
      if (items.length > 0) {
        return
      }
      // end
      this.serverList.push({ name: '', isEdit: true, id: '' })
      this.isEdit = false
    },
    // 保存添加编辑的分组
    save(data, index) {
      if (!this.serverList[index].name || this.serverList[index].name === '' || this.serverList[index].name === undefined) {
        this.$message.error('请输入分组名称')
        return
      }
      let api
      if (this.isEdit === false) {
        api = server.add_machine_group
      } else {
        api = server.change_machine_group_name
      }
      this.serverList[index].id = this.activeId
      api(this.serverList[index]).then(res => {
        if (res.code === 0) {
          this.getServerData()
          this.getAllList()
          if (this.isEdit === false) {
            this.$message.success('添加服务器分组成功')
          } else {
            this.$message.success('编辑服务器分组成功')
          }
        } else {
          this.getServerData()
          this.$message.error(res.msg)
        }
      })
    },
    // 删除服务器分组
    delServerGroup(data, index) {
      if (!this.serverList[index].id) {
        this.getServerData()
        return
      }
      this.serverList[index].id = data.id
      this.$confirm('点击确定按钮时，将删除您选择的服务器组别及该组别下的所有节点服务器', '删除服务器组别', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        server.del_machine_group(this.serverList[index]).then(res => {
          if (res.code === 0) {
            this.$message.success('删除服务器分组成功')
            this.getServerData()
            this.getAllList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    // 编辑服务器分组
    editServerGroup(data, index) {
      // 只能出现一个input
      var content = document.getElementById('serverTree')
      var items = content.getElementsByTagName('input')
      if (items.length > 0) {
        return
      }
      // end
      this.isEdit = true
      this.serverList[index].name = data.name
      this.activeId = data.id
      if (data.id && data.name) {
        for (const i of this.serverList) {
          if (i.id === data.id) {
            i.isEdit = true
          }
        }
      }
    },
    // 添加编辑服务器
    addEdit(data, obj) {
      this.getServerData()
      if (this.$refs.addEditRef !== undefined) {
        this.$refs.addEditRef.resetFields()
      }
      this.addEditServerDialog = true
      if (obj === 'edit') {
        this.addEditServerTitle = '编辑服务器'
        this.addEditServerForm.ip_addr = data.ip_addr
        this.addEditServerForm.gid = data.gid
        this.addEditServerForm.name = data.name
        this.addEditServerForm.remarks = data.remarks
        this.addEditServerForm.id = data.id
        this.addEditServerForm.hide_disk = data.hide_disk
      } else {
        this.addEditServerTitle = '添加服务器'
        Object.keys(this.addEditServerForm).forEach(element => { this.addEditServerForm[element] = '' })
        this.addEditServerForm.hide_disk = 0
      }
    },
    sureAddEdit() {
      let api
      if (this.addEditServerTitle === '添加服务器') {
        api = server.add_machine
      } else {
        api = server.edit_machine
      }
      this.$refs.addEditRef.validate((valid) => {
        if (valid) {
          api(this.addEditServerForm).then(res => {
            if (res.code === 0) {
              if (this.addEditServerTitle === '添加服务器') {
                this.$message.success('添加服务器成功')
              } else {
                this.$message.success('编辑服务器成功')
              }
              this.addEditServerDialog = false
              this.getAllList()
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    // // 单个多个关机
    shutdown(data, obj) {
      if (obj === 0) {
        this.serverid.id_list = [data.id]
      } else {
        this.serverid.id_list = []
        if (this.multipleSelection.length <= 0) {
          this.$message.error('请选择要关机的服务器')
          return
        }
        for (const i of this.multipleSelection) {
          this.serverid.id_list.push(i.id)
        }
      }
      this.$confirm('点击确定按钮时，将关闭您选择的服务器主机', '是否关机', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        server.poweroff_by_id(this.serverid).then(res => {
          if (res.code === 0) {
            this.$message.success('关机成功')
            this.getAllList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    // 单个多个开机
    restart(data, obj) {
      if (obj === 0) {
        this.serverid.id_list = [data.id]
      } else {
        this.serverid.id_list = []
        if (this.multipleSelection.length <= 0) {
          this.$message.error('请选择要重启的服务器')
          return
        }
        for (const i of this.multipleSelection) {
          this.serverid.id_list.push(i.id)
        }
      }
      this.$confirm('点击确定按钮时，将重启您选择的服务器主机', '是否重启', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        server.restart_by_id(this.serverid).then(res => {
          if (res.code === 0) {
            this.$message.success('重启成功')
            this.getAllList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    // 删除
    del(data, obj) {
      if (obj === 0) {
        this.serverid.id_list = [data.id]
      } else {
        this.serverid.id_list = []
        if (this.multipleSelection.length <= 0) {
          this.$message.error('请选择要删除的服务器')
          return
        }
        for (const i of this.multipleSelection) {
          this.serverid.id_list.push(i.id)
        }
      }
      this.$confirm('点击确定按钮时，将删除您选择的服务器节点', '是否删除服务器', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        server.del_machine(this.serverid).then(res => {
          if (res.code === 0) {
            this.$message.success('删除成功')
            this.getAllList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    // 获取所有的服务器
    getAllList(obj) {
      const query = Object.assign({}, obj, this.listQuery)
      server.get_all_machine_list(query).then(res => {
        if (res.code === 0) {
          this.items = res.list
          this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
        }
      })
    }
  }
}
</script>
<style lang="scss">
.switch {
  position: absolute;
  top:10px;
  left:-35px;
  .el-switch__core {
    width: 55px!important;
  }
  .el-switch__label--left{
    position: relative;
    left: 58px;
    color: #fff;
    z-index: -1111;
    top: -1px;
  }
  .el-switch__label * {
    font-size: 12px;
  }
  .el-switch__label--right{
    position: relative;
    right: 58px;
    color: #fff;
    z-index: -1111;
    top: -1px;
  }
  .el-switch__label.is-active{
    z-index: 1111;
    color: #fff;
  }
}

span.servertit {
  width: 50px;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow:ellipsis;
}
@media screen and (max-width: 1360px) {  /*当屏幕尺寸小于600px时，应用下面的CSS样式*/
  .serverlist {
    span.servertit{
      width: 50px;
    }
  }
  .serverlist .title .el-input--mini .el-input__inner {
    width: 50px!important;
  }
}
@media screen and (min-width:1361px) and (max-width:1680px){
  .serverlist {
    span.servertit{
      width: 80px;
    }
  }
  .serverlist .title .el-input--mini .el-input__inner {
    width: 80px!important;
  }
}
@media screen and (min-width: 1920px) {
  .serverlist {
    span.servertit{
      width: 150px;
    }
  }
  .serverlist .title .el-input--mini .el-input__inner {
    width: 150px!important;
  }
}
.describeCss {
  .describeInput{
    .el-input--medium .el-input__inner {
      height: 26px;
      line-height: 26px;
    }
  }
}
.server-list-add {
  .el-timeline {
    .el-timeline-item {
      padding-bottom: 10px;
    }
  }
  .el-timeline-item__content{
    display: flex;
    align-items: center;
    justify-content: space-between;
    div.title, div.iconCss {
      // flex-grow: 3;
      display: flex;
      cursor: pointer;
    }
    div.iconCss{
      text-align: right;
    }
  }
}
</style>
<style lang="scss" scoped>
  .el-timeline {
    padding: 0;
    .el-icon-edit, .el-icon-delete, .el-icon-circle-plus-outline {
      font-size: 16px;
      padding-left: 10px;
      cursor: pointer;
    }
  }
  .server-list {
    width: 100%;
    padding: 20px;
    &-add {
      max-height: calc(100vh - 300px);
      min-height: 200px;
      border: 1px solid #dadada;
      padding: 0 20px;
      h5 {
        color: #666;
        display: flex;
        justify-content: space-between;
        span {
          // padding-left: 3rem;
          color: #409EFF;
          cursor: pointer;
        }
      }
    }
    &-data {
      padding-left: 30px!important;
    }
  }
</style>
