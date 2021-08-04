import request from '@/utils/request'

// 获取授权信息
export function get_auth_info() {
  return request({
    url: '/auth/get_auth_info',
    method: 'post'
  })
}

// 更新授权
export function set_auth_info(query) {
  return request({
    url: '/auth/update_auth_info',
    method: 'post',
    data: Object.assign({}, query)
  })
}

