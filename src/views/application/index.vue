<template>
  <div class="dashboard-container">
    <div class="page-server">
      <div class="page-server-fl">
        <el-input v-model="listQuery.key" placeholder="请输入应用名称" prefix-icon="el-icon-search" />
        <el-button type="primary" size="small" @click.native="getAllList({ 'key': listQuery.key })">{{ $t('search') }}</el-button>
      </div>
      <div class="page-server-fr">
        <el-button type="primary" size="small" @click.native="addEdit({}, 'add')">{{ $t('add') }}</el-button>
        <el-button type="primary" size="small" @click.native="delApp({}, 1)">{{ $t('del') }}</el-button>
      </div>
    </div>
    <el-row class="server-list app-list">
      <el-col :span="4" class="server-list-add">
        <h5><strong>{{ $t('appPage.appGroup') }}</strong><span @click="addAppGroup">{{ $t('add') }}</span></h5>
        <el-divider />
        <!-- 应用 -->
        <el-timeline id="tree">
          <el-timeline-item v-for="(activity, index) in appGroupList" :key="activity.id">
            <div class="title">
              <span v-if="activity.isEdit === false" class="spancss" @click="getAllList({ 'gid_list': [activity.id] })">{{ activity.name }}</span>
              <el-input v-else v-model="appGroupList[index].name" class="inputcss" placeholder="请输入应用组名称" clearable size="mini" @blur="save(activity, index)" />
            </div>
            <div class="iconCss">
              <i class="el-icon-edit" style="color:#409EFF" @click="editAppGroup(activity, index)" />
              <i class="el-icon-delete" style="color:#409EFF" @click="delAppGroup(activity, index)" />
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-col>
      <el-col :span="20" class="server-list-data">
        <el-table ref="appListRef" border :data="slice" style="width: 100%" max-height="600" @selection-change="handleSelectionChange" @cell-click="cellClick">
          <el-table-column type="selection" align="center" width="55" />
          <el-table-column prop="name" :label="$t('appPage.appname')" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column prop="app_gname" :label="$t('appPage.appGroup')" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column prop="mac_gname" :label="$t('home.serverGroup')" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column prop="icon_url" :label="$t('appPage.appIcon')" align="center" min-width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              <img style="width:24px;height:24px" :src="iconurl + scope.row.icon_url" alt="">
            </template>
          </el-table-column>
          <el-table-column prop="remarks" :label="$t('desc')" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column fixed="right" :label="$t('operation')" align="center" min-width="120">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click.native="addEdit(scope.row, 'edit')">{{ $t('edit') }}</el-button>
              <el-button type="text" size="small" @click.native="delApp(scope.row, 0)">{{ $t('del') }}</el-button>
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
    <!-- 添加编辑应用 -->
    <el-dialog :title="addEditAppTitle" :visible.sync="addEditAppdialog" :close-on-click-modal="false" custom-class="dialogCss" width="800px" top="5vh">
      <el-form ref="addEditAppRef" :model="addEditAppForm" label-width="120px" :rules="addEditAppRules">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="addEditAppForm.name" auto-complete="off" />
        </el-form-item>
        <el-form-item label="应用组别" prop="app_gid">
          <el-select v-model="addEditAppForm.app_gid" placeholder="请选择应用组别" style="width:100%">
            <el-option v-for="item in appGroupList" :key="item.id" :label="item.id !== '' ? item.name : item.id" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="addEditAppTitle === '添加应用'" label="服务器组别" prop="mac_gid">
          <el-select v-model="addEditAppForm.mac_gid" placeholder="请选择服务器组别" style="width:100%" @change="parent">
            <el-option v-for="item in serverList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择应用" prop="path">
          <el-input v-model="addEditAppForm.path" :placeholder="repeat[repeat.length - 1] ? repeat[repeat.length - 1] : appRoute" :disabled="addEditAppTitle === '编辑应用'">
            <el-button v-if="repeat.length > 0" slot="prepend" icon="el-icon-back" @click="upperlevel" />
            <el-button slot="append" icon="el-icon-search" type="primary" :disabled="addEditAppTitle === '编辑应用'" @click="search_app" />
          </el-input>
          <div v-if="showTree && addEditAppTitle === '添加应用'">
            <ul v-if="options2.length > 0" class="app_table">
              <li v-for="item in options2" :key="item.value">
                <p v-if="/^.*?\.(exe)$/i.test(item.value)">
                  <span><i class="el-icon-document" /> {{ item.label }}</span>
                  <span style="padding-right:10px;cursor: pointer;color: #409EFF;" @click="onactivePathmethod(item.value)">选择</span>
                </p>
                <!-- 验证是否有exe文件 -->
                <p v-else @click="getchild(item.value)">
                  <span><i class="el-icon-folder-opened" /> {{ item.label }}</span>
                </p>
              </li>
            </ul>
            <ul v-else class="app_table"><div style="height: 298px;line-height: 298px;text-align: center;">暂无数据</div></ul>
          </div>
        </el-form-item>
        <el-form-item v-if="addEditAppTitle === '编辑应用'" label="兼容模式" prop="run_mode">
          <el-checkbox v-model="addEditAppForm.run_mode" :true-label="1" :false-label="0">以兼容模式运行</el-checkbox>
        </el-form-item>
        <el-form-item v-if="addEditAppTitle === '编辑应用'" label="允许发送到桌面" prop="approve">
          <el-checkbox v-model="addEditAppForm.approve" :true-label="1" :false-label="0">是</el-checkbox>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="addEditAppForm.remarks" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addEditAppdialog = false">取 消</el-button>
        <el-button type="primary" @click.native="sureAddEdit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as app from '@/api/app'
import { get_machine_group, get_disk_by_gid, get_file_by_gid } from '@/api/server'
let isDisable = true
export default {
  data() {
    return {
      appRoute: '选择或输入路径搜索应用',
      // customized tree
      treeArr: [],
      repeat: [],
      // end
      tasklistData: [], // 排序
      showTree: false,
      // 级联
      options2: [],
      // 分页
      slice: [],
      items: [],
      listQuery: {
        pageNo: 1,
        pageSize: 10
      },
      multipleSelection: [],
      // 添加编辑应用
      addEditAppTitle: '添加应用',
      addEditAppdialog: false,
      addEditAppForm: {
        name: '',
        remarks: '',
        app_gid: '',
        mac_gid: '',
        path: '',
        gid: '',
        run_mode: 0,
        approve: 0
      },
      addEditAppRules: {
        name: [
          { required: true, message: '请输入应用名称', trigger: 'blur' }
        ],
        app_gid: [
          { required: true, message: '请选择应用组', trigger: 'change' }
        ],
        mac_gid: [
          { required: true, message: '请选择服务器组', trigger: 'change' }
        ],
        path: [
          { required: true, message: '请选择应用路径', trigger: 'blur' }
        ],
        remarks: [
          { min: 0, max: 255, message: '备注不超过255个字符', trigger: 'blur' }
        ]
      },
      serverList: [],
      // 添加服务器分组
      appGroupList: [],
      activeId: '',
      // 编辑服务组
      isEdit: false, // false : 添加 ? 编辑,
      // icon url
      iconurl: 'http://',
      props: {
        label: 'label',
        value: 'value',
        children: 'children',
        isLeaf: 'leaf'
      }
    }
  },
  watch: {
    'addEditAppForm.mac_gid': {
      handler(val, oldval) {
        if (val !== oldval) {
          this.showTree = false
          this.repeat = []
          this.treeArr = []
          this.options2 = []
        }
      }
    }
  },
  mounted() {
    this.getAppData()
    this.getAllList()
  },
  methods: {
    // customized tree style
    search_app() {
      if (this.addEditAppForm.mac_gid === '') {
        return this.$message.error('请先选择服务器组')
      }
      if (this.addEditAppForm.path === '') {
        this.parent(this.addEditAppForm.mac_gid)
      } else {
        this.showTree = true
        this.getchild(this.addEditAppForm.path)
      }
    },
    getchild(val) {
      if (isDisable) {
        isDisable = false
        // remove repeat
        this.treeArr.push(val)
        this.repeat.push(val)
        // end
        let cities = []
        let cities1 = []
        get_file_by_gid({ 'gid': this.addEditAppForm.mac_gid, path: val }).then(res => {
          if (res.code === 0) {
            if (res.directory_list && res.directory_list.length > 0) {
              cities = res.directory_list.map((value, i) => ({
                value: value.full_path,
                label: value.directory_name,
                children: []
              }))
            }
            if (res.file_list && res.file_list.length > 0) {
              cities1 = res.file_list.map((value, i) => ({
                value: value.full_path,
                label: value.file_name
              }))
            }
            this.options2 = [...cities1, ...cities]
          } else {
            this.options2 = []
            this.$message.error(res.msg)
          }
        })
        setTimeout(() => {
          isDisable = true
        }, 1000)
      }
    },
    // uppper level
    upperlevel() {
      if (isDisable) {
        isDisable = false
        if (this.addEditAppForm.path !== '') {
          this.addEditAppForm.path = ''
        } else {
          this.repeat.pop()
          this.treeArr = this.treeArr.slice(0, this.treeArr.length--)
        }
        let cities = []
        let cities1 = []
        if (this.treeArr.length > 0) {
          get_file_by_gid({ 'gid': this.addEditAppForm.mac_gid, path: this.treeArr[this.treeArr.length - 1] }).then(res => {
            if (res.code === 0) {
              this.showTree = true
              if (res.directory_list && res.directory_list.length > 0) {
                cities = res.directory_list.map((value, i) => ({
                  value: value.full_path,
                  label: value.directory_name,
                  children: []
                }))
              }
              if (res.file_list && res.file_list.length > 0) {
                cities1 = res.file_list.map((value, i) => ({
                  value: value.full_path,
                  label: value.file_name
                }))
              }
              this.options2 = [...cities1, ...cities]
            }
          })
        } else {
          this.parent(this.addEditAppForm.mac_gid)
        }
        setTimeout(() => {
          isDisable = true
        }, 1000)
      }
    },
    // select path
    onactivePathmethod(val) {
      this.addEditAppForm.path = val
      this.showTree = false
      if (this.addEditAppForm.path !== '') {
        this.$refs.addEditAppRef.validateField('path')
      }
    },
    // end
    // 排序
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
    // 一级目录
    parent(val) {
      this.addEditAppForm.path = ''
      get_disk_by_gid({ 'gid': val }).then(res => {
        if (res.code === 0) {
          const cities = res.disk_info.map((value, i) => ({
            value: value.dir_name,
            label: value.dir_name,
            children: []
          }))
          this.options2 = cities
          this.showTree = true
        } else {
          this.options2 = []
          this.$message.error(res.msg)
        }
      })
    },
    // 获取添加编辑所用到的服务器分组数据
    getServerData() {
      get_machine_group().then(res => {
        if (res.code === 0) {
          this.serverList = res.list
        }
      })
    },
    // 获取app分组数据
    getAppData() {
      app.getAppList().then(res => {
        if (res.code === 0) {
          // this.appGroupList = res.list
          this.appGroupList = res.list.map(element => {
            element.isEdit = false
            return element
          })
        }
      })
    },
    // 获取所有的app
    getAllList(obj) {
      const query = Object.assign({}, obj, this.listQuery)
      app.get_all_app_list(query).then(res => {
        if (res.code === 0) {
          this.jsonSort(res.list)
          this.items = this.tasklistData
          this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
        }
      })
    },
    // 添加app组
    addAppGroup() {
      // 只能出现一个input
      var content = document.getElementById('tree')
      var items = content.getElementsByTagName('input')
      if (items.length > 0) {
        return
      }
      // end
      this.appGroupList.push({ name: '', isEdit: true, id: '' })
      this.isEdit = false
    },
    // 保存添加编辑的分组
    save(data, index) {
      if (!this.appGroupList[index].name || this.appGroupList[index].name === '' || this.appGroupList[index].name === undefined) {
        this.$message.error('请输入分组名称')
        return
      }
      let api
      if (this.isEdit === false) {
        api = app.add_app_group
      } else {
        api = app.change_app_group_name
      }
      this.appGroupList[index].id = this.activeId
      api(this.appGroupList[index]).then(res => {
        if (res.code === 0) {
          this.getAppData()
          this.getAllList()
          // this.$message.success('操作完成')
          if (this.isEdit === false) {
            this.$message.success('添加应用组成功')
          } else {
            this.$message.success('编辑应用组成功')
          }
        } else {
          this.getAppData()
          this.$message.error(res.msg)
        }
      })
    },
    // 编辑app分组
    editAppGroup(data, index) {
      // 只能出现一个input
      var content = document.getElementById('tree')
      var items = content.getElementsByTagName('input')
      if (items.length > 0) {
        return
      }
      // end
      this.isEdit = true
      this.appGroupList[index].name = data.name
      this.activeId = data.id
      if (data.id && data.name) {
        for (const i of this.appGroupList) {
          if (i.id === data.id) {
            i.isEdit = true
          }
        }
      }
    },
    // 删除app分组
    delAppGroup(data, index) {
      if (!this.appGroupList[index].id) {
        this.getAppData()
        return
      }
      this.appGroupList[index].id = data.id
      this.$confirm('点击确定按钮时，将删除您选择的应用组别及该组别下的所有应用', '删除应用组别', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        app.del_app_group(this.appGroupList[index]).then(res => {
          if (res.code === 0) {
            this.$message.success('删除应用组成功')
            this.getAppData()
            this.getAllList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    // 添加编辑app
    addEdit(data, obj) {
      // 清空路径数据
      this.repeat = []
      this.treeArr = []
      // 添加编辑清空已操作的tree的数据
      this.options2 = []
      this.getServerData()
      this.showTree = false // 清空是否显示编辑添加的操作
      if (this.$refs.addEditAppRef !== undefined) {
        this.$refs.addEditAppRef.resetFields()
      }
      this.addEditAppdialog = true
      if (obj === 'edit') {
        this.parent(data.mac_gid)
        this.addEditAppTitle = '编辑应用'
        this.addEditAppForm.path = data.path
        this.addEditAppForm.mac_gid = data.mac_gid
        this.addEditAppForm.app_gid = data.app_gid
        this.addEditAppForm.name = data.name
        this.addEditAppForm.remarks = data.remarks
        this.addEditAppForm.id = data.id
        this.addEditAppForm.run_mode = data.run_mode
        this.addEditAppForm.approve = data.approve
      } else {
        this.addEditAppTitle = '添加应用'
        this.addEditAppForm.path = ''
        this.addEditAppForm.mac_gid = ''
        this.addEditAppForm.app_gid = ''
        this.addEditAppForm.name = ''
        this.addEditAppForm.remarks = ''
        this.addEditAppForm.gid = ''
        this.addEditAppForm.run_mode = 0
        this.addEditAppForm.approve = 0
      }
    },
    sureAddEdit() {
      let api
      if (this.addEditAppTitle === '添加应用') {
        api = app.add_remote_app
      } else {
        api = app.change_app_info
      }
      this.addEditAppForm.gid = this.addEditAppForm.app_gid
      this.$refs.addEditAppRef.validate((valid) => {
        if (valid) {
          api(this.addEditAppForm).then(res => {
            if (res.code === 0) {
              if (this.addEditAppTitle === '添加应用') {
                this.$message.success('添加应用成功')
              } else {
                this.$message.success('编辑应用成功')
              }
              this.getAllList()
              this.addEditAppdialog = false
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    // 删除APP
    delApp(data, obj) {
      let id = []
      if (obj === 0) {
        id = [data.id]
      } else {
        id = []
        if (this.multipleSelection.length <= 0) {
          this.$message.error('请选择要删除的应用')
          return
        }
        for (const i of this.multipleSelection) {
          id.push(i.id)
        }
      }
      this.$confirm('点击确定按钮时，将删除您选择的应用', '删除应用', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        app.del_remote_app({ 'id_list': id }).then(res => {
          if (res.code === 0) {
            this.$message.success('删除应用成功')
            this.getAllList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    // 表格全选及点击行选中
    handleSelectionChange(row, selected) {
      this.multipleSelection = row
    },
    cellClick(row, column, cell, event) {
      if (column.label === this.$t('operation') || column.type === 'selection') return
      this.$refs.appListRef.toggleRowSelection(row)
    },
    // 分页操作
    handleSizeChange(v) {
      this.listQuery.pageSize = v
      this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
    },
    handleCurrentChange(v) {
      this.listQuery.pageNo = v
      this.slice = this.items.slice((this.listQuery.pageNo - 1) * this.listQuery.pageSize, this.listQuery.pageNo * this.listQuery.pageSize)
    }
  }
}
</script>
<style lang="scss">
@media screen and (max-width: 1360px) {  /*当屏幕尺寸小于600px时，应用下面的CSS样式*/
  .app-list {
    .title{
      span.spancss {
        width: 50px!important;
      }
      .inputcss input {
        width: 50px!important;
      }
    }
  }

}
@media screen and (min-width:1361px) and (max-width:1680px){
  .app-list {
    .title{
      span.spancss {
        width: 80px!important;
      }
      .inputcss input {
        width: 80px!important;
      }
    }
  }
}
@media screen and (min-width: 1920px) {
  .app-list {
    .title{
      span.spancss {
        width: 150px!important;
      }
      .inputcss input {
        width: 150px!important;
      }
    }
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
ul.app_table {
  border: 1px solid #dadada;
  border-top: 0;
  list-style-type: none;
  margin: 0;
  padding: 0;
  height: 300px;
  overflow: auto;
  li {
    text-indent: 10px;
  }
  p {
    margin: 0;
    border-bottom: 1px solid #dadada;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
  }
}
span.padingright10{
  padding-right:10px;
}
.app-list {
  .title{
    span.spancss {
      width: 50px;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow:ellipsis;
    }
  }
}
.el-timeline {
  padding: 0;
  .el-icon-edit, .el-icon-delete, .el-icon-circle-plus-outline {
    font-size: 16px;
    padding-left: 10px;
    cursor: pointer;
  }
}
.app-list {
  width: 100%;
  padding: 20px;
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
}
</style>
