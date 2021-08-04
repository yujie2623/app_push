import request from '@/utils/request'

export function get_index_info() {
  return request({
    url: '/index/get_index_info',
    method: 'post'
  })
}

// 关机
export function poweroff() {
  return request({
    url: '/index/shutdown',
    method: 'post'
  })
}

// 重启
export function restart() {
  return request({
    url: '/index/reboot',
    method: 'post'
  })
}

// set系统远程控制
export function set_remote_desktop(data) {
  return request({
    url: 'index/set_remote_desktop',
    method: 'post',
    data: data
  })
}

// get remote
export function get_system_settings(data) {
  return request({
    url: 'index/get_system_settings',
    method: 'post',
    data: data
  })
}

// 备用ip
export function setip(data) {
  return request({
    url: '/index/set_ip',
    method: 'post',
    data: data
  })
}

// 用户使用率
export function getUserUsageRate(data) {
  return request({
    url: '/index/get_user_usage_rate',
    method: 'post',
    data: data
  })
}
