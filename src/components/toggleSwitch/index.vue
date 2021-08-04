<template>
  <div class="toggle-button-cover">
    <div class="button-cover">
      <div id="button-18" class="button b2">
        <input v-model="value" type="checkbox" class="checkbox" @change="sendUsb">
        <div class="knobs">
          <span v-if="value">{{ activetitle }}</span>
          <span v-else>{{ inactivetitle }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    active: {
      type: Number,
      default: undefined
    },
    inactive: {
      type: Number,
      default: undefined
    },
    activetitle: {
      type: String,
      default: 'ON'
    },
    inactivetitle: {
      type: String,
      default: 'OFF'
    },
    desktop: {
      type: Number,
      default: undefined
    }
  },
  data() {
    return {
      value: 0
    }
  },
  watch: {
    desktop: {
      handler(val) {
        // console.log(val)
        this.value = val
      },
      deep: true
    }
  },
  methods: {
    sendUsb() {
      if (typeof this.active !== 'undefined' && this.value === true) {
        this.value = this.active
      } else if (typeof this.inactive !== 'undefined' && this.value === false) {
        this.value = this.inactive
      }
      this.$emit('sendUsbform', this.value)
    }
  }
}
</script>

<style lang="scss">
.toggle-button-cover {
  position: absolute;
  z-index: 9999;
}
.button
{
  position: relative;
  top: 50%;
  width: 88px;
  height: 36px;
  border: 1px solid #dadada;
}

.checkbox
{
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 3;
}

#button-18 .knobs:before, #button-18 .knobs span
{
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  text-align: center;
  line-height: 1;
  background-color: #F44336;
  border-radius: 2px;
}

#button-18 .knobs:before
{
  top: 50%;
  left: 8px;
  width: 20px;
  height: 10px;
  margin-top: -5px;
  background-color: transparent;
  z-index: 2;
}

#button-18 .knobs span
{
  width: 40px;
  height: 26px;
  line-height: 26px;
  transition: 0.3s ease all, left 0.3s cubic-bezier(0.18, 0.89, 0.35, 1.15);
  z-index: 1;
}

#button-18 .checkbox:active + .knobs span
{
  width: 58px;
}

#button-18 .checkbox:checked:active + .knobs span
{
  margin-left: -38px;
}

#button-18 .checkbox:checked + .knobs span
{
  left: 42px;
  background-color: #03A9F4;
}

</style>
