<template>
  <div class="guidePage">
    <el-dialog
      :title="title[step-1]"
      :visible.sync="dialogVisible"
      custom-class="guide"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="800px"
    >
      <el-form v-loading="loading" :model="serverForm" label-width="100px">
        <!-- 第一步 -->
        <div v-if="step===1" class="step">
          <el-form-item label="服务器名称">
            <el-input v-model="serverForm.server_name" />
          </el-form-item>
          <el-form-item label="服务器IP">
            <el-input v-model="serverForm.server_ip" />
          </el-form-item>
        </div>
        <!-- 第二步 -->
        <div v-if="step===2" class="step">
          <el-form-item label="选择应用">
            <el-checkbox-group v-model="application" @change="getAppPath">
              <el-checkbox v-for="item in applist" :key="item.app_name" :label="item.app_name">{{ item.app_name }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
        <div v-if="step===3" class="step">
          <!-- 第三步 -->
          <el-form-item label="用户数量">
            <el-input v-model.number="serverForm.usernum" type="number" />
          </el-form-item>
        </div>
        <!-- 第四步 -->
        <div v-if="step===4" class="step">
          <el-form-item label="发布应用">
            <!-- {{ serverForm.app_list }} -->
            <!-- <el-checkbox-group v-model="application">
              <el-checkbox v-for="item in applist" :key="item.app_name" :label="item.app_name" :disabled="true" />
            </el-checkbox-group> -->
            <span v-for="item in application" :key="item" class="paddingright20">{{ item }}</span>
          </el-form-item>
          <el-form-item label="创建用户">
            <div>成功创建<b>{{ serverForm.usernum }}</b>个用户</div>
            <div class="createuser">
              <span v-for="item in serverForm.user_list" :key="item" class="paddingright20">{{ item }}</span>
            </div>
          </el-form-item>
          <el-alert show-icon :closable="false" title="用户默认密码为123456" type="info" />
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button v-if="step !== 1" @click="back">上一步</el-button>
        <el-button v-if="step !== 4" type="primary" @click="next()">下一步</el-button>
        <el-button v-else type="primary" @click="setGuide()">完成</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as guide from '@/api/guide'
import { setLogined } from '@/utils/auth'
import { isIP, isInteger } from '@/utils/validate'
export default {
  data() {
    return {
      serverForm: {
        server_name: '',
        server_ip: '',
        app_list: [],
        usernum: '', // 显示是数字
        user_list: [] // 传给后台是数组
      },
      // 选择的应用
      application: [],
      selectApp: [],
      applist: [], // 需要展示的应用
      dialogVisible: true,
      step: 1,
      title: [
        '欢迎使用异构云应用推送，请添加服务器',
        '请选择应用',
        '请输入用户数量',
        '发布'
      ],
      loading: false
    }
  },
  mounted() {
    // window.location.hostname
    // 默认值
    this.serverForm.server_name = window.location.hostname
    this.serverForm.server_ip = window.location.hostname
    this.serverForm.usernum = 5
    for (let i = 0; i < this.serverForm.usernum; i++) {
      this.serverForm.user_list.push('user' + (i + 1))
    }
  },
  methods: {
    // 获取appPath
    getAppPath(data) {
      this.selectApp = this.applist.filter(item => data.includes(item.app_name))
    },
    get_app() {
      return new Promise((resolve) => {
        this.loading = true
        const query = { server_ip: this.serverForm.server_ip }
        guide.getApp(query).then(res => {
          if (res.code === 0) {
            this.loading = false
            this.applist = res.data
          } else {
            this.loading = false
            this.applist = []
            this.$message.error(res.msg)
            return
          }
          resolve()
        })
      })
    },
    back() {
      this.serverForm.user_list = []
      this.step--
    },
    // 配置
    async next() {
      if (this.step === 1) {
        if (this.serverForm.server_name === '') {
          return this.$message.error('服务器名称不能为空')
        }
        if (this.serverForm.server_ip === '') {
          return this.$message.error('服务器IP不能为空')
        } else if (!isIP(this.serverForm.server_ip)) {
          return this.$message.error('服务器IP地址不正确')
        }
        await this.get_app()
        // 因为应用要绑定2个值 所以重新赋值  默认值
        const arr = []
        for (const i of this.applist) {
          arr.push(i.app_name)
        }
        this.application = arr
        // 默认值结束
      } else if (this.step === 2) {
        if (this.application.length <= 0) {
          return this.$message.error('请选择应用')
        }
      } else if (this.step === 3) {
        if (this.serverForm.usernum === '') {
          return this.$message.error('请输入用户数量')
        } else if (!isInteger(this.serverForm.usernum)) {
          return this.$message.error('请输入正确的用户数量')
        } else if (this.serverForm.usernum > 5) {
          return this.$message.error('用户数量不能大于5个')
        }
      }
      this.step += 1
      if (this.step === 4) {
        this.serverForm.user_list = [] // 先清空之前默认的
        for (let i = 0; i < this.serverForm.usernum; i++) {
          this.serverForm.user_list.push('user' + (i + 1))
        }
      }
    },
    // 配置完成
    setGuide() {
      if (this.application.length > 0) {
        this.selectApp = this.applist.filter(item => this.application.includes(item.app_name))
      }
      this.serverForm.app_list = this.selectApp
      const query = Object.assign({}, this.serverForm)
      this.loading = true
      guide.configSucc(query).then(res => {
        if (res.code === 0) {
          this.dialogVisible = false
          this.loading = false
          setLogined('true') // 手动为true 更新路由
          this.$store.dispatch('user/changeRoles', ['true']).then(() => {
            this.$router.push({ path: '/' })
          })
        } else {
          this.loading = false
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.guidePage {
  .el-dialog__wrapper {
    background: #eaeaea;
  }
  .guide {
    display: flex;
    flex-direction: column;
    margin:0 !important;
    position:absolute;
    top:40%;
    left:50%;
    transform:translate(-50%,-50%);
    .el-dialog__body{
      flex:1;
      overflow: auto;
      .el-form {
        .step {
          padding: 50px 100px 50px 80px;
        }
        .createuser {
          width: 100%;
          height: 80px;
          border: 1px solid #dadada;
          text-indent: 10px;
        }
      }
    }
    .el-dialog__header {
      background: #e0e0e0;
      .el-dialog__title {
        font-size: 16px;
        font-weight: bold;
      }
    }
    .paddingright20 {
      padding-right: 20px;
      font-size: 16px;
    }
  }
}

</style>
