<template>
  <div class="app-container">
    <div class="app-authorize">
      <el-row type="flex" class="row-bg authorize">
        <el-col :span="6"><div class="grid-content bg-purple">系统授权状态</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple-light"><el-button size="mini" type="primary">{{ auth.state === true ? '已授权' : '未授权' }}</el-button></div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple">版本号</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><el-button size="mini" type="primary">{{ auth.version }}</el-button></div></el-col>
      </el-row>
      <el-row type="flex" class="row-bg authorize">
        <el-col :span="6"><div class="grid-content bg-purple">可用天数</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple-light"><el-button size="mini" type="primary">{{ auth.free_time }}</el-button></div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple">到期时间</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><el-button size="mini" type="primary">{{ auth.expire_time }}</el-button></div></el-col>
      </el-row>
      <el-row type="flex" class="row-bg authorize">
        <el-col :span="6"><div class="grid-content bg-purple">授权数量</div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple"><el-button size="mini" type="primary">{{ auth.num }}</el-button></div></el-col>
        <el-col :span="6"><div class="grid-content bg-purple" /></el-col>
        <el-col :span="6"><div class="grid-content bg-purple-light" /></el-col>
      </el-row>
    </div>
    <p style="margin:20px 0;text-align:center"><el-button type="primary" size="small" @click="showauth">更新授权</el-button></p>
    <!-- 设置授权码 -->
    <el-dialog title="更新授权验证码" :visible.sync="authorizeDialog" :close-on-click-modal="false" custom-class="dialogCss authDialog" width="600px">
      <el-form :model="authform" label-width="120px">
        <el-form-item label="授权验证码">
          <el-input v-model="authform.key" autocomplete="off" />
        </el-form-item>
        <el-form-item label="MAC生成码">
          <span>{{ generatingCode }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="authorizeDialog = false">取 消</el-button>
        <el-button type="primary" @click="sureAuth">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as auth from '@/api/auth'
export default {
  data() {
    return {
      authorizeDialog: false,
      authform: {
        key: ''
      },
      generatingCode: '',
      auth: {}
    }
  },
  mounted() {
    this.authList()
  },
  methods: {
    showauth() {
      this.authorizeDialog = true
    },
    // 获取授权信息
    authList() {
      auth.get_auth_info().then(res => {
        if (res.code === 0) {
          this.auth = Object.assign({}, res.info)
          this.generatingCode = res.auth_code
        }
      })
    },
    // 设置授权信息
    sureAuth() {
      if (this.authform.key === '') {
        this.$message.error('请输入授权验证码')
        return
      }
      var query = Object.assign({}, this.authform)
      auth.set_auth_info(query).then(res => {
        if (res.code === 0) {
          this.$message.success('更新授权成功')
          this.authorizeDialog = false
          this.authList()
        } else {
          this.$message.error(res.msg)
          this.authorizeDialog = false
        }
      })
    }
  }
}
</script>
<style lang="scss">
.app-authorize {
  .authorize {
    .grid-content {
      height: 36px;
      line-height: 36px;
      color: #606266;
    }
    .el-col-6 {
      padding: 5px 20px;
      border-right: 1px solid #EBEEF5;
      border-top: 1px solid #EBEEF5;
    }
    .el-col-6:first-child {
      border-left: 1px solid #EBEEF5;
    }
  }
  .authorize:last-child {
    .el-col-6 {
      border-bottom: 1px solid #EBEEF5;
    }
  }
}
</style>
