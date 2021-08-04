<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />
    <div class="right-menu">
      <div style="padding-left:50px">
        <span @click="editpwd">账户设置</span>
        <span @click="logout">退出登录</span>
      </div>
    </div>
    <el-dialog
      width="500"
      title="账户设置"
      append-to-body
      :close-on-click-modal="false"
      custom-class="resetPasswordDialog dialogCss"
      :visible.sync="resetPasswordDialogShow"
    >
      <el-form ref="accountRef" :model="accountForm" :rules="accountRef" label-width="100px" class="accountPage">
        <el-form-item :label="$t('accountPage.username')" prop="name">
          <el-input v-model="accountForm.name" disabled />
        </el-form-item>
        <el-form-item :label="$t('accountPage.oldpass')" prop="oldpass">
          <el-input v-model="accountForm.oldpass" type="password" placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item :label=" $t('accountPage.newpass')" prop="new_pwd">
          <el-input v-model="accountForm.new_pwd" type="password" placeholder="密码长度6~20位字符" />
        </el-form-item>
        <el-form-item :label=" $t('accountPage.surepass')" prop="checkpass">
          <el-input v-model="accountForm.checkpass" type="password" placeholder="请再次输入密码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click.native="sureEditPwd">{{ $t('sure') }}</el-button>
        <el-button @click.native="resetPasswordDialogShow = false">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { editPwd } from '@/api/user'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { getID, getToken, getPass } from '@/utils/auth'
import { validatpass } from '@/utils/validate'
export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    // 验证旧密码
    const oldchkPass = (rule, value, callback) => {
      if (!value || value === '') {
        callback(new Error('原密码不能为空'))
      } else {
        if (!validatpass(value) || value !== getPass()) {
          callback(new Error('请输入正确的原密码'))
        }
        callback()
      }
    }
    // 验证新密码
    const newPas = (rule, value, callback) => {
      // var reg = /^([a-z0-9\.\@\!\#\$\%\^\&\*\(\)]){6,20}$/i
      var reg = /\s/
      if (!value || value === '') {
        callback(new Error('新密码不能为空'))
      } else {
        if (value.length < 6 || value.length > 20) {
          callback(new Error('新密码支持6~20位字符'))
        } else if (reg.test(value)) {
          callback(new Error('新密码不能带有空格'))
        }
        callback()
      }
    }
    // 再次验证新密码
    const newchkPas = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('确认密码不能为空'))
      } else {
        if (value !== this.accountForm.new_pwd) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      }
    }
    return {
      // 任务中心
      MessageList: [],
      tasklistData: [],
      // taskNum: 0,
      resetPasswordDialogShow: false,
      accountForm: {
        name: getToken(),
        id: parseInt(getID()),
        oldpass: '',
        new_pwd: '',
        checkpass: ''
      },
      accountRef: {
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        oldpass: [
          { required: true, validator: oldchkPass, trigger: 'blur' }
        ],
        new_pwd: [
          { required: true, validator: newPas, trigger: 'blur' }
        ],
        checkpass: [
          { required: true, validator: newchkPas, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    // 任务中心
    // 修改密码
    editpwd() {
      if (this.$refs.accountRef !== undefined) {
        this.$refs.accountRef.resetFields()
      }
      this.resetPasswordDialogShow = true
    },
    sureEditPwd() {
      this.$refs.accountRef.validate((valid) => {
        if (valid) {
          var q = Object.assign({}, this.accountForm)
          editPwd(q).then(res => {
            if (res.code === 0) {
              this.$message.success('修改密码成功')
              this.resetPasswordDialogShow = false
              this.logout()
            } else {
              this.$message.error(res.msg)
              this.resetPasswordDialogShow = false
            }
          })
        }
      })
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>
<style lang="scss">
.right-menu {
  .el-badge .is-fixed{
    top:10px
  }
}
</style>
<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    padding-right: 20px;
    cursor: pointer;
    display: flex;
    span {
      cursor: pointer;
      color: #97a8be;
      padding-right: 20px;
    }
  }
}
</style>
