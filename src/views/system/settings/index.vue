<template>
  <div class="app-container">
    <el-form :model="usbform" class="usbCss" label-width="100px">
      <el-form-item label="远程桌面设置" prop="desktop">
        <!-- <el-switch
          v-model="usbform.desktop"
          active-text="开启"
          inactive-color="#BFBFBF"
          inactive-text="关闭"
          :active-value="1"
          :inactive-value="0"
          class="switch"
          @change="set"
        /> -->
        <toggleSwitch :desktop="usbform.desktop" :active="1" :inactive="0" activetitle="开启" inactivetitle="关闭" @sendUsbform="receive" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { set_remote_desktop, get_system_settings } from '@/api/dashboard'
import toggleSwitch from '@/components/toggleSwitch'
export default {
  components: { toggleSwitch },
  data() {
    return {
      usbform: {
        desktop: 0
      }
    }
  },
  mounted() {
    this.get()
  },
  methods: {
    receive(el) {
      // console.log(el)
      this.usbform.desktop = el
      this.set()
    },
    get() {
      get_system_settings({}).then(res => {
        if (res.code === 0) {
          this.usbform.desktop = res.data.desktop
        }
      })
    },
    set(data) {
      const query = Object.assign({}, this.usbform)
      set_remote_desktop(query).then(res => {
        this.get()
      })
    }
  }
}
</script>
<style lang="scss">
.usbCss {
  padding: 2rem;
  .switch {
    position: relative;
    left:-25px;
    .el-switch__core {
      width: 55px!important;
    }
    .el-switch__label--left{
      position: relative;
      left: 58px;
      color: #fff;
      z-index: -1111;
    }
    .el-switch__label * {
      font-size: 12px;
    }
    .el-switch__label--right{
      position: relative;
      right: 58px;
      color: #fff;
      z-index: -1111;
    }
    .el-switch__label.is-active{
      z-index: 1111;
      color: #fff;
    }

  }
}
</style>
