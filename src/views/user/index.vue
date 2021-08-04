<template>
  <div class="dashboard-container">
    <div class="page-server">
      <div class="page-server-fl">
        <el-input v-model="listQuery.key" :placeholder="$t('userPage.enterUser')" prefix-icon="el-icon-search" />
        <el-button type="primary" size="small" @click="getUserList">{{ $t('search') }}</el-button>
      </div>
      <div class="page-server-fr">
        <el-button type="primary" size="small" @click.native="addUser({}, 'add')">{{ $t('userPage.add') }}</el-button>
        <el-button type="primary" size="small" @click.native="exportFile">{{ $t('userPage.export') }}</el-button>
        <el-button type="primary" size="small" @click.native="exportUser">导出用户</el-button>
        <el-dropdown>
          <el-button type="primary" size="small">
            {{ $t('more') }}<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown" align="center">
            <el-dropdown-item @click.native="batchSetUsb">批量设置usb参数</el-dropdown-item>
            <el-dropdown-item @click.native="seeApp({}, 1)">{{ $t('userPage.pushApp') }}</el-dropdown-item>
            <el-dropdown-item @click.native="reset({}, 1)">{{ $t('userPage.resetpass') }}</el-dropdown-item>
            <el-dropdown-item @click.native="del({}, 1)">{{ $t('del') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <el-row class="server-list">
      <el-col :span="5" class="server-list-add server-list-userGroup">
        <h5><strong>{{ $t('userPage.userGroup') }}</strong><span @click="add_new_question">{{ $t('add') }}</span></h5>
        <el-divider />
        <el-tree
          id="content"
          ref="tree"
          :key="tree_key"
          class="eltree"
          :data="userGroupData"
          node-key="id"
          :render-content="renderContent"
          default-expand-all
          :expand-on-click-node="false"
          :default-expanded-keys="defaultExpand"
        />
      </el-col>
      <el-col :span="19" class="server-list-data">
        <el-table ref="userList" :data="slice" border style="width: 100%" max-height="600" :default-sort="{prop: 'is_online', order: 'descending'}" @selection-change="handleSelectionChange" @cell-click="cellClick">
          <el-table-column type="selection" align="center" width="55" />
          <el-table-column prop="uid" :label="$t('accountPage.username')" align="center" min-width="100" show-overflow-tooltip />
          <el-table-column prop="name" :label="$t('userPage.fullname')" align="center" min-width="100" show-overflow-tooltip />
          <el-table-column prop="gname" :label="$t('userPage.userGroup')" align="center" min-width="100" show-overflow-tooltip />
          <el-table-column prop="create_time" :label="$t('userPage.time')" align="center" min-width="100" show-overflow-tooltip />
          <el-table-column prop="is_online" sortable :label="$t('userPage.status')" align="center" min-width="100" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-html="scope.row.is_online === 0 ? '未登录' : '已登录'" />
            </template>
          </el-table-column>
          <el-table-column prop="login_time" label="最近登录时间" align="center" min-width="100" show-overflow-tooltip />
          <el-table-column fixed="right" :label="$t('operation')" align="center" width="200">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click.native="addUser(scope.row, 'edit')">{{ $t('edit') }}</el-button>
              <el-dropdown>
                <el-button type="text" size="small">
                  {{ $t('more') }}<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="seeApp(scope.row, 0)">{{ $t('userPage.View') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="reset(scope.row, 0)">{{ $t('userPage.resetpass') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="getLoginInfo(scope.row, 0)">登录统计</el-dropdown-item>
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
            :total="sizenum"
            :page-sizes="[10,20,50,100]"
            :page-size="listQuery.pageSize"
            :page-count="pagenum"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-col>
    </el-row>
    <!-- 添加用户 -->
    <el-dialog :title="addEditUserTitle" :visible.sync="addMember" :close-on-click-modal="false" custom-class="seeAppDialog dialogCss" width="800px" top="5vh">
      <el-form ref="addEditUserRef" :model="addUserForm" :rules="addEditUserRules" label-width="120px">
        <el-form-item :label="$t('accountPage.username')" prop="uid">
          <el-input v-model="addUserForm.uid" :disabled="addEditUserTitle === '编辑用户'" autocomplete="off" />
        </el-form-item>
        <el-form-item :label="$t('userPage.username')" prop="name">
          <el-input v-model="addUserForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item :label="$t('userPage.userGroup')" prop="userid">
          <el-cascader v-model="addUserForm.userid" :options="editUserArr" :show-all-levels="false" :props="{ checkStrictly: true }" style="width:100%" />
        </el-form-item>
        <el-form-item label="应用详情" style="width:100%">
          <div id="group">
            <div class="wrap" style="width: 250px;">
              <div class="title">
                <span style="padding-right:10px">应用组别</span>
                <el-checkbox v-model="groupCheckAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
              </div>
              <el-divider />
              <div class="content" style="padding-left:10px">
                <el-checkbox-group v-model="childcheckList" @change="handleCheckedCitiesChange">
                  <el-checkbox v-for="item in appGroupList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div class="wrap" style="border-left:none;width: 390px;">
              <div class="title">
                <span style="padding-right:10px">应用名称</span>
                <el-checkbox v-model="namegroupCheckAll" :indeterminate="isIndeterminateapp" @change="handleCheckAllChangename">全选</el-checkbox>
              </div>
              <el-divider />
              <div class="content childcontent" style="padding-left:10px">
                <el-checkbox-group v-model="namechildcheckList" @change="handleCheckedCitiesChangename">
                  <el-checkbox v-for="item in list" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="USB参数设置" prop="usb">
          <el-checkbox v-model="addUserForm.usb" label="允许USB映射" :true-label="1" :false-label="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addMember = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="saveAddUser">{{ $t('sure') }}</el-button>
      </div>
    </el-dialog>
    <!-- 批量导入用户 -->
    <el-dialog title="批量导入用户" :visible.sync="exportDialog" :close-on-click-modal="false" custom-class="dialogCss exportDialog" width="800px">
      <p><span>选择导入的Excel文件</span><a :href="url" style="padding-left:20px;color:#409EFF">点击下载模板</a></p>
      <el-upload
        class="upload-demo"
        :action="fileurl"
        :on-remove="handleRemove"
        :on-success="handSuccess"
        :before-upload="beforeAvatarUpload"
        multiple
        :limit="1"
        :file-list="fileList"
      >
        <el-button size="mini" type="primary">点击导入</el-button>
        <div slot="tip" class="el-upload__tip">注：请按模板字段规范导入</div>
      </el-upload>
      <el-table v-if="fileuserList.length > 0" :data="fileuserList" border height="250" style="width: 100%">
        <el-table-column prop="uid" :label="$t('accountPage.username')" align="center" min-width="100" show-overflow-tooltip />
        <el-table-column prop="name" :label="$t('userPage.fullname')" align="center" min-width="100" show-overflow-tooltip />
        <el-table-column prop="group_name" :label="$t('userPage.userGroup')" align="center" min-width="100" show-overflow-tooltip />
        <el-table-column prop="pwd" :label="$t('userPage.pwd')" align="center" min-width="100" show-overflow-tooltip />
        <el-table-column v-if="isError" label="错误说明" align="center" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.UidErr !== 'success'">{{ scope.row.UidErr }}</span>
            <span v-if="scope.row.NameErr !== 'success'">{{ scope.row.NameErr }}</span>
            <span v-if="scope.row.GroupErr !== 'success'">{{ scope.row.GroupErr }}</span>
            <span v-if="scope.row.StateErr !== 'success'">{{ scope.row.StateErr }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="exportDialog = false">{{ $t('cancel') }}</el-button>
        <el-button v-loading.fullscreen.lock="fullscreenLoading" :disabled="isFileError === true || isError === true" type="primary" @click.native="sure_export_user">{{ $t('sure') }}</el-button>
      </div>
    </el-dialog>
    <!-- 查看应用 -->
    <el-dialog :title="seeapptitle" :visible.sync="seeAppDialog" :close-on-click-modal="false" custom-class="dialogCss seeAppDialog" width="800px">
      <div id="group" :class="[seeapptitle === '应用推送' ? '' : 'disabled']">
        <el-form :model="seeappform" label-width="100px" class="demo-ruleForm" style="width:100%">
          <el-form-item label="应用详情" style="width:100%">
            <div class="wrap" style="width: 250px;">
              <div class="title">
                <span style="padding-right:10px">应用组别</span>
                <el-checkbox v-model="groupCheckAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
              </div>
              <el-divider />
              <div class="content" style="padding-left:10px">
                <el-checkbox-group v-model="childcheckList" @change="handleCheckedCitiesChange">
                  <el-checkbox v-for="item in appGroupList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div class="wrap" style="border-left:none;width: 390px;">
              <div class="title">
                <span style="padding-right:10px">应用名称</span>
                <el-checkbox v-show="seeapptitle === '应用推送'" v-model="namegroupCheckAll" :indeterminate="isIndeterminateapp" @change="handleCheckAllChangename">全选</el-checkbox>
              </div>
              <el-divider />
              <div class="content childcontent" style="padding-left:10px">
                <el-checkbox-group v-model="namechildcheckList" @change="handleCheckedCitiesChangename">
                  <el-checkbox v-for="item in list" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span v-if="seeapptitle === '应用推送'" slot="footer" class="dialog-footer">
        <el-button @click="seeAppDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveSeeApp">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 设置usb -->
    <el-dialog title="批量设置usb参数" :visible.sync="usbDialog" :close-on-click-modal="false" custom-class="dialogCss usbpDialog" width="600px">
      <el-form :model="seeappform" label-width="100px" class="demo-ruleForm" style="width:100%">
        <el-form-item label="USB参数设置" style="width:100%">
          <el-checkbox v-model="usbform.usb" label="允许USB映射" :true-label="1" :false-label="0" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="usbDialog = false">取 消</el-button>
        <el-button type="primary" @click="setUsb">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 登录统计 -->
    <el-dialog title="登录时长统计" :visible.sync="loginTimeStatistics" :close-on-click-modal="false" custom-class="dialogCss loginTimeStatistics" width="800px">
      <el-row>
        <el-col :span="19">
          <span>统计日期：</span>
          <el-date-picker
            v-model="loginStatisticsTimeQuery"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width:500px"
            :picker-options="pickerOptions1"
          />
        </el-col>
        <el-col :span="5" style="text-align:right">
          <el-button type="primary" @click.native="getLoginInfo(currentId, 1)">查询</el-button>
        </el-col>
      </el-row>
      <br>
      <el-table :data="loginStatisticsList" style="width: 100%" border height="400px">
        <el-table-column prop="date" label="日期" min-width="180" align="center" />
        <el-table-column prop="login_count" label="登录次数" min-width="180" align="center" />
        <el-table-column prop="login_session" label="登录总时长（小时）" min-width="180" align="center">
          <template slot-scope="scope">
            {{ Math.floor((scope.row.login_session / 3600) * 100) / 100 }}
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div v-if="loginStatisticsListItems.length" class="pagination-container fr">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageTotal"
          :page-sizes="[10,20,50,100]"
          :page-size="pagesizes"
          :current-page.sync="currentPage"
          @size-change="loginHandleSizeChange"
          @current-change="loginHandleCurrentChange"
        />
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as userpage from '@/api/userpage'
import { get_all_app_list, getAppList } from '@/api/app'
import { parseTime } from '@/utils/index.js'
export default {
  data() {
    return {
      // 登录统计
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      currentPage1: 0,
      currentId: '',
      pagesizes: 10,
      currentPage: 1,
      pageTotal: 0,
      loginTimeStatistics: false,
      loginStatisticsTimeQuery: [],
      loginStatisticsListItems: [],
      loginStatisticsList: [],
      // 设置usb
      usbDialog: false,
      usbform: {
        id_list: [],
        usb: 0
      },
      // 全局加载等待
      fullscreenLoading: false,
      // 列表
      userlist: [],
      // 组
      grouplist: [],
      // 错误日志
      isError: false,
      filearr: [],
      isFileError: false,
      // 下载用户文件
      url: 'http://' + window.location.hostname + ':' + window.location.port + '/media/user/user_template.xlsx', // window.location.hostname
      // 查看应用
      isIndeterminate: false,
      isIndeterminateapp: false,
      seeAppDialog: false,
      appGroupList: [],
      childcheckList: [],
      groupCheckAll: false,
      namechildcheckList: [],
      namegroupCheckAll: false,
      list: [],
      seeappform: {
        id_list: []
      },
      seeapptitle: '查看应用',
      // 批量导入用户
      exportDialog: false,
      fileurl: process.env.VUE_APP_BASE_API + '/user/upload_excl', // process.env.VUE_APP_BASE_API
      fileList: [],
      // 可用的用户
      fileuserList: [],
      // 分页
      slice: [],
      items: [],
      sizenum: 0,
      pagenum: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        key: ''
      },
      multipleSelection: [],
      // 添加用户弹框
      addEditUserTitle: '添加用户',
      addMember: false,
      addUserForm: {
        uid: '',
        gid: '',
        userid: [],
        name: '',
        app_list: [],
        pwd: '123456',
        usb: '' //  0 0ff 1 on
      },
      addEditUserRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        uid: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        userid: [
          { required: true, message: '请选择用户组', trigger: 'change' }
        ]
      },
      // 添加用户组所用数据
      tree_key: 0,
      defaultExpand: [],
      isEditOrAdd: false,
      // 添加
      userGroupData: [],
      addUserGroupForm: {
        name: '',
        pid: 0
      },
      appitems: [],
      // 倒序使用
      tasklistData: [],
      editUserArr: []
    }
  },
  mounted() {
    this.getusergrouplist()
    this.applist()
    if (this.$route.query.status) {
      this.getUserList(this.$route.query.status)
    } else {
      this.getUserList()
    }
  },
  methods: {
    // 导出用户
    exportUser() {
      const url = process.env.VUE_APP_BASE_API + '/user/export_user_info/'
      window.open(url)
    },
    // 登录统计
    // 分页
    loginHandleCurrentChange(v) {
      this.currentPage = v
      this.loginStatisticsList = this.loginStatisticsListItems.slice((this.currentPage - 1) * this.pagesizes, this.currentPage * this.pagesizes)
    },
    loginHandleSizeChange(v) {
      this.pagesizes = v
      this.loginStatisticsList = this.loginStatisticsListItems.slice((this.currentPage - 1) * this.pagesizes, this.currentPage * this.pagesizes)
    },
    getLoginInfo(data, v) {
      this.currentPage = 1
      this.pagesizes = 10
      this.currentId = data
      if (v === 0) {
        const currentTime = parseTime(new Date().getTime(), '{y}-{m}-{d}')
        const currentTimeAddSeven = parseTime(new Date().getTime() - 3600 * 1000 * 24 * 7, '{y}-{m}-{d}')
        this.loginStatisticsTimeQuery = [currentTimeAddSeven, currentTime]
      }
      const query = Object.assign({}, { 'user_id': data.id, 'start_time': this.loginStatisticsTimeQuery[0], 'end_time': this.loginStatisticsTimeQuery[1] })
      userpage.get_login_info(query).then(res => {
        if (res.code === 0) {
          this.loginStatisticsListItems = res.data_list
          this.pageTotal = this.loginStatisticsListItems.length
          this.loginStatisticsList = this.loginStatisticsListItems.slice((this.currentPage - 1) * this.pagesizes, this.currentPage * this.pagesizes)
        } else {
          this.$message.error(res.msg)
        }
      })
      this.loginTimeStatistics = true
    },
    // 批量设置usb参数
    batchSetUsb() {
      this.usbform.id_list = []
      if (this.multipleSelection.length > 0) {
        this.multipleSelection.forEach(item => this.usbform.id_list.push(item.id))
      } else {
        this.$message.error('请选择用户')
        return
      }
      this.usbDialog = true
    },
    setUsb() {
      const query = Object.assign({}, this.usbform)
      userpage.batch_set_usb(query).then(res => {
        if (res.code === 0) {
          this.$message.success('设置成功')
          this.usbDialog = false
          this.usbform.usb = 0
          this.getUserList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 组全选
    handleCheckAllChange(val) {
      // 组全选，名称不全选状态
      this.isIndeterminateapp = false
      this.namegroupCheckAll = false
      // 操作勾选状态list
      this.childcheckList = []
      if (val === true) {
        // 全选获取所有的app应用
        const arr = []
        for (const i of this.appitems) {
          for (const j of this.grouplist) {
            if (i.app_gid === j.id) {
              arr.push(i)
            }
          }
        }
        this.list = arr
        this.appGroupList.forEach(item => {
          this.childcheckList.push(item.id)
        })
        if (this.namechildcheckList.length === this.appitems.length) {
          this.namegroupCheckAll = true
          this.isIndeterminateapp = false
        } else {
          if (this.namechildcheckList.length > 0 && this.namechildcheckList.length !== this.list.length) {
            this.namegroupCheckAll = false
            this.isIndeterminateapp = true
          } else {
            this.namegroupCheckAll = false
            this.isIndeterminateapp = false
          }
        }
      } else {
        // 应用清空
        this.list = []
        this.namechildcheckList = []
      }
      this.isIndeterminate = false
    },
    // 组单选
    handleCheckedCitiesChange(value) {
      // this.namechildcheckList = []
      // 获取相应的app
      const arr = []
      for (const i of this.appitems) {
        for (const j of value) {
          if (i.app_gid === j) {
            arr.push(i)
          }
        }
      }
      this.list = arr
      // 被勾选的
      if (value.length === 0) {
        this.namegroupCheckAll = false
        this.isIndeterminateapp = false
        this.namechildcheckList = []
      } else {
        if (this.list.length === 0) {
          this.namegroupCheckAll = false
          this.isIndeterminateapp = false
        } else {
          const smallAppGroup = []
          for (const i of this.list) {
            for (const j of this.namechildcheckList) {
              if (i.id === j) {
                smallAppGroup.push(i.id)
              }
            }
          }
          if (smallAppGroup.length === this.list.length) {
            this.namegroupCheckAll = true
            this.isIndeterminateapp = false
          } else if (smallAppGroup.length > 0 && smallAppGroup.length !== this.list.length) {
            this.namegroupCheckAll = false
            this.isIndeterminateapp = true
          } else {
            this.namegroupCheckAll = false
            this.isIndeterminateapp = false
          }
        }
      }
      // 勾选状态
      const checkedCount = value.length
      this.groupCheckAll = checkedCount === this.appGroupList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.appGroupList.length
    },
    // 名称全选
    handleCheckAllChangename(val) {
      this.namechildcheckList = []
      if (val === true) {
        this.list.forEach(item => {
          this.namechildcheckList.push(item.id)
        })
        this.isIndeterminateapp = false
        // 对应的组也选中
        if (this.list.length > 0 && this.list.length !== this.appitems.length) {
          // 名称全选，组也全选状态
          this.isIndeterminate = true
          this.groupCheckAll = false
        } else if (this.list.length === this.appitems.length) {
          if (this.childcheckList.length === this.appGroupList.length) {
            this.isIndeterminate = false
            this.groupCheckAll = true
          } else {
            this.isIndeterminate = true
            this.groupCheckAll = false
          }
        } else {
          this.childcheckList = []
        }
      }
    },
    // 名称取消全选
    handleCheckedCitiesChangename(value) {
      const checkedCount = value.length
      this.namegroupCheckAll = checkedCount === this.list.length
      this.isIndeterminateapp = checkedCount > 0 && checkedCount < this.list.length
      const smallAppGroup = []
      for (const i of this.list) {
        for (const j of this.namechildcheckList) {
          if (i.id === j) {
            smallAppGroup.push(i.id)
          }
        }
      }
      if (smallAppGroup.length === this.list.length) {
        this.namegroupCheckAll = true
        this.isIndeterminateapp = false
      } else if (smallAppGroup.length > 0 && smallAppGroup.length !== this.list.length) {
        this.namegroupCheckAll = false
        this.isIndeterminateapp = true
      } else {
        this.namegroupCheckAll = false
        this.isIndeterminateapp = false
      }
    },
    // 获取应用组
    getAppData() {
      return new Promise((resolve, reject) => {
        getAppList().then(res => {
          if (res.code === 0) {
            this.appGroupList = res.list
            this.grouplist = res.list
            resolve()
          }
        })
      })
    },
    // 获取应用
    applist() {
      get_all_app_list().then(res => {
        if (res.code === 0) {
          this.appitems = res.list
        }
      })
    },
    // 获取所有的app
    getAllList() {
      return new Promise((resolve, reject) => {
        get_all_app_list().then(res => {
          if (res.code === 0) {
            // this.appitems = res.list
            this.list = res.list
            resolve()
          }
        })
      })
    },
    // 查看及推送应用
    async seeApp(data, obj) {
      this.list = []
      await this.getAppData()
      // this.getAllList()
      this.namechildcheckList = []
      this.namegroupCheckAll = false
      this.childcheckList = []
      this.groupCheckAll = false
      this.seeappform.id_list = []
      this.isIndeterminateapp = false
      this.isIndeterminate = false
      if (obj === 0) {
        this.seeapptitle = '查看应用'
        this.seeappform.id_list = [data.id]
        this.seeAppDialog = true
        await this.get_user_app(data.id) // 回显
      } else {
        this.seeapptitle = '应用推送'
        if (this.multipleSelection.length <= 0) {
          this.$message.error('请选择需要推送的用户')
          return
        }
        this.seeAppDialog = true
        for (const i of this.multipleSelection) {
          this.seeappform.id_list.push(i.id)
        }
      }
    },
    saveSeeApp() {
      this.seeAppDialog = false
      userpage.bind_app_to_user({ 'id_list': this.seeappform.id_list, 'app_list': this.namechildcheckList }).then(res => {
        if (res.code === 0) {
          this.$message.success('推送应用成功')
          this.seeAppDialog = false
          this.getUserList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 上传所用的方法
    handSuccess(file) {
      if (file.code === 0) {
        this.fileuserList = file.list
        this.filearr = file.list
        this.isFileError = false
      } else {
        this.isFileError = true
        this.$message.error(file.msg)
      }
    },
    handleRemove(file, fileList) {
      this.fileuserList = []
      this.fileList = []
      this.isError = false // 移除文件时 将错误信息也隐藏
      this.isFileError = false // 如果移除错误的文件时 按钮可点击
    },
    // 上传格式判断
    beforeAvatarUpload(file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const extension = testmsg === 'xlsx'
      if (!extension) {
        this.$message({
          message: '导入的文件仅支持xls格式',
          type: 'warning'
        })
      }
      return extension
    },
    // 批量导入
    exportFile() {
      this.fileList = []
      this.fileuserList = []
      this.exportDialog = true
      this.isError = false
      this.isFileError = false
    },
    // 批量导入用户
    sure_export_user() {
      if (this.fileuserList.length === 0) {
        this.$message.error('导入用户不能为空')
        return
      }
      this.fullscreenLoading = true
      userpage.add_user_from_list({ 'user_list': this.filearr }).then(res => {
        if (res.code === 0) {
          this.isError = false
          this.getUserList()
          this.$message.success('批量导入用户成功')
          this.exportDialog = false
          this.fullscreenLoading = false
        } else {
          this.isError = true
          this.fileuserList = []
          this.$message.error(res.msg)
          this.fileuserList = res.list
          this.getUserList()
          this.fullscreenLoading = false
        }
      })
    },
    // 表格全选及点击行选中
    handleSelectionChange(row, selected) {
      this.multipleSelection = row
    },
    cellClick(row, column, cell, event) {
      if (column.label === this.$t('operation') || column.type === 'selection') return
      this.$refs.userList.toggleRowSelection(row)
    },
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
    // 获取所有用户信息
    getUserList(v) {
      let status = null
      if (v === '1') {
        status = 1
      } else {
        status = null
      }
      const query = Object.assign({}, this.listQuery, { status })
      userpage.getUserList(query).then(res => {
        if (res.code === 0) {
          this.jsonSort(res.list)
          this.items = this.tasklistData
          this.userlist = this.tasklistData
          this.slice = this.items
          this.pagenum = res.pagination
          this.sizenum = res.total_count
        }
      })
    },
    // 分组搜索
    childsearch(data) {
      const pagev = {
        pageNo: 1,
        pageSize: 10,
        groupId: data.id
      }
      const query = Object.assign({}, pagev, { key: this.listQuery.key })
      userpage.getUserList(query).then(res => {
        if (res.code === 0) {
          this.jsonSort(res.list)
          this.items = this.tasklistData
          this.userlist = this.tasklistData
          this.slice = this.items
          this.pagenum = res.pagination
          this.sizenum = res.total_count
        }
      })
    },
    // 分页操作
    handleSizeChange(v) {
      this.listQuery.pageSize = v
      this.getUserList()
    },
    handleCurrentChange(v) {
      this.listQuery.pageNo = v
      this.getUserList()
    },
    // 编辑的时候的多选项回显
    get_user_app(data) {
      return new Promise((resolve, reject) => {
        this.childcheckList = []
        this.groupCheckAll = false
        this.namechildcheckList = []
        this.namegroupCheckAll = false
        this.isIndeterminate = false
        this.isIndeterminateapp = false
        userpage.get_user_app({ 'id': data }).then(res => {
          if (res.code === 0) {
            const parsent = []
            const child = []
            const app = []
            res.list.forEach(item => {
              if (item.list.length > 0) { // 只勾选应用不勾选应用组 应用组不显示
                parsent.push(item.app_gid) // 应用组
              }
              for (const i of item.list) { // 应用名称
                child.push(i.id)
                app.push(i)
              }
            })
            // 组下面所有的app
            const group_app = []
            for (const i of this.appitems) {
              for (const j of parsent) {
                if (j === i.app_gid) {
                  group_app.push(i)
                }
              }
            }
            // 被勾选的组
            this.childcheckList = parsent
            // 被勾选的app
            this.namechildcheckList = child
            // 组下面所有的app赋值显示
            this.list = group_app
            // 所有应用的全选状态设置
            if (child.length === 0) {
              this.namegroupCheckAll = false
              this.isIndeterminateapp = false
            } else if (child.length === this.list.length) {
              this.isIndeterminateapp = false
              this.namegroupCheckAll = true
            } else {
              this.isIndeterminateapp = true
              this.namegroupCheckAll = false
            }
            // 所有应用组的全选状态设置
            if (parsent.length === 0) {
              this.groupCheckAll = false
              this.isIndeterminate = false
            } else if (parsent.length === this.appGroupList.length) {
              this.groupCheckAll = true
              this.isIndeterminate = false
            } else {
              this.groupCheckAll = false
              this.isIndeterminate = true
            }
          }
        })
      })
    },
    // 获取所有用户组信息
    getusergrouplist() {
      userpage.get_user_group().then(res => {
        if (res.code === 0) {
          if (res.node && JSON.stringify(res.node) !== '{}') {
            this.userGroupData = this.ass(res.node.group) // 用户组所用的数据
            this.editUserArr = this.ass(res.node.group, 'add_edit_user') // 添加编辑所用的数据
          } else {
            this.userGroupData = []
            this.editUserArr = []
          }
        }
      })
    },
    // 用户组遍历树修改属性名
    ass(data, v) {
      if (data.length > 0) {
        const item = []
        data.map((list, i) => {
          const newData = {}
          newData.label = list.gname
          newData.id = list.gid
          newData.value = list.gid
          newData.isEdit = false
          if (v === 'add_edit_user') {
            newData.children = list.node && list.node.group ? this.ass(list.node.group, 'add_edit_user') : undefined // 添加编辑回显的时候需要默认为undefined
          } else {
            newData.children = list.node && list.node.group ? this.ass(list.node.group) : [] // 用户分组需要在没有children的情况下默认为[]
          }
          item.push(newData)
        })
        return item
      }
    },
    // 添加编辑用户组tree的所有操作
    // 添加新大题
    add_new_question() {
      // 只能出现一个input
      var content = document.getElementById('content')
      var items = content.getElementsByTagName('input')
      if (items.length > 0) {
        return
      }
      // end
      this.addUserGroupForm.id = ''
      this.isEditOrAdd = false
      const nodeapp = { label: '', parsent: true, children: [] }
      this.userGroupData.push(nodeapp)
    },
    // 下级增加
    append(store, node, data) {
      // 只能出现一个input
      var content = document.getElementById('content')
      var items = content.getElementsByTagName('input')
      if (items.length > 0) {
        return
      }
      // end
      this.isEditOrAdd = false
      this.addUserGroupForm.id = data.id
      // 新增数据
      const nodeapp = { label: '', isEdit: true, children: [] }
      data.children.push(nodeapp)
      if (!node.expanded) {
        node.expanded = true
      }
      // 遍历所有的input  重新赋值当前input获得焦点的id
      this.$nextTick(() => {
        var content = document.getElementById('content')
        var items = content.getElementsByTagName('input')
        for (let i = 0; i < items.length; i++) {
          items[i].addEventListener('focus', (e) => {
            this.addUserGroupForm.id = parseInt(e.target.getAttribute('id'))
          })
        }
      })
    },
    // 修改
    nodeEdit(ev, store, data) {
      var content = document.getElementById('content')
      var items = content.getElementsByTagName('input')
      if (items.length > 0) {
        return
      }
      this.addUserGroupForm.id = data.id
      this.isEditOrAdd = true
      data.isEdit = true
    },
    edit_sure(ev, data) {
      const $input = ev.target.parentNode.parentNode.querySelector('input') || ev.target.parentElement.parentElement.querySelector('input')
      if (!$input) {
        return false
      } else {
        if ($input.value === '') {
          this.$message.error('请输入用户组名称')
          // this.getusergrouplist()
          return
        } else if (isNaN(this.addUserGroupForm.id)) {
          this.$message.error('请先编辑上级节点')
          return
        }
        data.label = $input.value
        const dataobj = {
          name: data.label
        }
        let api
        if (this.isEditOrAdd === false) {
          api = userpage.add_user_group
          dataobj.pid = this.addUserGroupForm.id
        } else {
          api = userpage.change_user_group_name
          dataobj.pid = this.addUserGroupForm.id
          dataobj.id = data.id
        }
        api(dataobj).then(res => {
          if (res.code === 0) {
            if (this.isEditOrAdd === false) {
              this.$message.success('添加用户组成功')
            } else {
              this.$message.success('编辑用户组成功')
            }
            this.getusergrouplist()
            this.getUserList()
            data.isEdit = false
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    edit_sure_parsent(ev, data) {
      const $input = ev.target.parentNode.parentNode.querySelector('input') || ev.target.parentElement.parentElement.querySelector('input')
      if (!$input) {
        return false
      } else {
        if ($input.value === '') {
          this.$message.error('请输入用户组名称')
          return
        }
        data.label = $input.value
        const dataobj = {
          name: data.label,
          pid: 0
        }
        userpage.add_user_group(dataobj).then(res => {
          if (res.code === 0) {
            this.$message.success('添加用户组成功')
            this.getusergrouplist()
            this.getUserList()
            data.isEdit = false
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    // 节点删除
    nodeDelete(node, data) {
      if (data && !data.id) {
        // this.$message.error('请先编辑')
        this.getusergrouplist()
        return
      }
      this.$confirm('点击确定按钮时，将删除您选择的用户组别及该组别下的所有用户', '删除用户组别？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userpage.del_user_group({ 'id': data.id }).then(res => {
          if (res.code === 0) {
            this.$message.success('删除用户组成功')
            this.getusergrouplist()
            this.getUserList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    showOrEdit(data) {
      if (data.isEdit) {
        return <el-input type='text' id={ this.addUserGroupForm.id } size='mini' placeholder='请输入用户分组名称' v-model={data.label} on-blur={ev => this.edit_sure(ev, data)} />
      } else if (data.parsent) {
        return <el-input type='text' size='mini' placeholder='请输入用户分组名称' v-model={data.label} on-blur={ev => this.edit_sure_parsent(ev, data)} />
      } else {
        return <span class='node_labe' className='node_labe' on-click={(ev) => this.childsearch(data)}>{data.label}</span>
      }
    },
    // 结构树操作group node,
    renderContent(h, { node, data, store }) {
      return (
        <span class='treecss'>
          <span class='nodespan'>{ this.showOrEdit(data) }</span>
          <div class='tree_node_op'>
            <i class='el-icon-edit' on-click={(ev) => this.nodeEdit(ev, store, data)}></i>
            <i class='el-icon-delete' on-click={() => this.nodeDelete(node, data)}></i>
            <i class='el-icon-plus' on-click={() => this.append(store, node, data)}></i>
          </div>
        </span>)
    },
    // 编辑的时候 用户组数据回显
    walk_for(group_id, arr, opt) {
      arr.push(opt.value)
      if (group_id === opt.value) {
        return -1
      }
      if (opt.children == null) {
        arr.pop()
        return 0
      } else {
        for (var i in opt.children) {
          if (this.walk_for(group_id, arr, opt.children[i]) === -1) {
            return -1
          }
        }
        arr.pop()
      }
      return 0
    },
    // 添加编辑用户
    async addUser(data, obj) {
      this.list = []
      await this.getAppData()
      // this.getAllList()
      // 重置多选框及表单数据
      this.childcheckList = []
      this.groupCheckAll = false
      this.namechildcheckList = []
      this.namegroupCheckAll = false
      this.isIndeterminate = false
      this.isIndeterminateapp = false
      if (this.$refs.addEditUserRef !== undefined) {
        this.$refs.addEditUserRef.resetFields()
      }
      this.addMember = true
      if (obj === 'edit') {
        this.addEditUserTitle = '编辑用户'
        this.addUserForm.name = data.name
        this.addUserForm.uid = data.uid
        this.addUserForm.id = data.id
        this.addUserForm.app_list = data.app_list
        this.addUserForm.usb = data.usb
        // 分组的数据回显
        var group_array = []
        const cities = {
          label: '未命名',
          id: -1,
          value: -1,
          children: this.editUserArr
        }
        this.walk_for(data.gid, group_array, cities)
        this.addUserForm.userid = group_array.slice(1)
        await this.get_user_app(data.id)
      } else {
        this.addEditUserTitle = '添加用户'
        Object.keys(this.addUserForm).forEach(ele => { this.addUserForm[ele] = '' })
        this.addUserForm.userid = []
        this.addUserForm.usb = 0
        this.addUserForm.app_list = []
      }
    },
    saveAddUser() {
      let api
      if (this.addEditUserTitle === '添加用户') {
        api = userpage.add_user
      } else {
        api = userpage.change_user_info
        this.addUserForm.applist = this.namechildcheckList
      }
      // 添加编辑回显
      this.addUserForm.app_list = this.namechildcheckList
      this.addUserForm.gid = this.addUserForm.userid[this.addUserForm.userid.length - 1]
      var query = Object.assign({}, this.addUserForm)
      this.$refs.addEditUserRef.validate((valid) => {
        if (valid) {
          api(query).then(res => {
            if (res.code === 0) {
              if (this.addEditUserTitle === '添加用户') {
                this.$message.success('添加用户成功')
              } else {
                this.$message.success('编辑用户成功')
              }
              this.addMember = false
              this.getUserList()
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    // 删除用户
    del(data, obj) {
      let id_list = []
      if (obj === 0) {
        if (data.is_online === true) {
          this.$message.error('用户已登录不可执行删除命令')
          return
        }
        id_list = [data.id]
      } else {
        id_list = []
        if (this.multipleSelection.length <= 0) {
          this.$message.error('请选择要删除的用户')
          return
        }
        for (const i of this.multipleSelection) {
          if (i.is_online === true) {
            this.$message.error('用户已登录不可执行删除命令')
            return
          }
          id_list.push(i.id)
        }
      }
      this.$confirm('点击确定按钮时，将删除您选择的用户', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userpage.del_user({ 'id_list': id_list }).then(res => {
          if (res.code === 0) {
            this.$message.success('删除用户成功')
            this.getUserList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    // 重置密码
    reset(data, obj) {
      let id_list = []
      if (obj === 0) {
        id_list = [data.id]
      } else {
        id_list = []
        if (this.multipleSelection.length <= 0) {
          this.$message.error('请选择要重置的用户')
          return
        }
        for (const i of this.multipleSelection) {
          id_list.push(i.id)
        }
      }
      this.$confirm('点击确定按钮时，用户登录密码将重置为初始密码：123456', '重置密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userpage.resetpwd({ 'id_list': id_list }).then(res => {
          if (res.code === 0) {
            this.$message.success('重置密码成功')
            this.getUserList()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    }
  }
}
</script>
<style lang="scss">
.exportDialog .el-table .el-table__body-wrapper {
  height: 205px!important;
}
@media screen and (max-width: 1360px) {  /*当屏幕尺寸小于600px时，应用下面的CSS样式*/
  .treecss {
    span.nodespan{
      width: 70px!important;
    }
  }

}
@media screen and (min-width:1361px) and (max-width:1680px){
  .treecss {
    span.nodespan{
      width: 100px!important;
    }
  }
}
@media screen and (min-width: 1920px) {
  .treecss {
    span.nodespan{
      width: 160px!important;
    }
  }
}
.treecss {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span.nodespan {
    flex-grow: 3;
    width: 70px;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 10px;
    span.node_labe {
      width: 100%;
      display: inline-block;
    }
  }
}
.tree_node_op {
  i {
    font-size: 16px;
    color: rgb(64, 158, 255);
  }
  i.el-icon-delete {
    padding: 0 10px;
  }
}
.eltree {
  min-height: 150px;
  max-height: 500px;
  overflow: auto;
  .el-tree-node__content {
    margin: 5px 0;
  }
  .el-tree-node>.el-tree-node__children {
    overflow: visible!important;
  }
}
// 查看应用不可点击
.disabled label{
  pointer-events: none;
}
// 应用推送
.seeAppDialog {
  .el-dialog__body {
    #group {
      display:flex;
      .wrap {
        border: 1px solid #dadada;
        padding: 0 10px;
        height: 255px;
        float: left;
        .el-divider--horizontal {
          margin: 5px 0;
        }
        .content {
          height: 200px;
          overflow-y: auto
        }
        .childcontent {
          .el-checkbox {
            padding-bottom: 10px;
          }
        }
      }
      .wrap:before {
        clear: both;
      }
    }
  }
}
.exportDialog .el-upload__tip {
  margin-top: 10px;
}
.describeCss {
  span {
    width: 50px;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow:ellipsis;
  }
  .describeInput{
    .el-input--medium .el-input__inner {
      height: 26px;
      line-height: 26px;
      width: 150px;
    }
  }
}
.server-list-add {
  .el-timeline {
    .el-timeline-item {
      padding-bottom: 10px;
    }
  }
}
</style>
<style lang="scss" scoped>
  .server-list {
    width: 100%;
    padding: 20px;
    &-add {
      max-height: calc(100vh - 300px);
      min-height: 200px;
      border: 1px solid #dadada;
      padding: 0 20px 20px;
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
      .sucess-process{
        display: flex;
        align-items: center;
        justify-content: space-between;
        .describeCss,.iconCss {
          display: flex;
        }
      }
    }
    &-userGroup {
      .custom-tree-node {
        display: flex;
        justify-content: space-between;
        width: 100%;
        align-items: center;
      }
    }
    &-data {
      padding-left: 30px!important;
    }
  }
</style>
