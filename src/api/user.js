import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// 修改管理员密码
export function editPwd(data) {
  return request({
    url: '/auth/mod_admin_pwd',
    method: 'post',
    data
  })
}

// 获取错误日志
export function get_error_info() {
  return request({
    url: '/log/get_error_info/',
    method: 'post'
  })
}
