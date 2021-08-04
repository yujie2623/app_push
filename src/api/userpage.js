import request from '@/utils/request'

// 获取所有用户组信息
export function get_user_group() {
  return request({
    url: '/user/get_group_list',
    method: 'post'
  })
}

// 获取所有用户信息
export function getUserList(query) {
  return request({
    url: '/user/get_user_list',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 创建用户组
export function add_user_group(query) {
  return request({
    url: '/user/add_group',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 编辑用户组
export function change_user_group_name(query) {
  return request({
    url: '/user/edit_group',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 删除用户组
export function del_user_group(query) {
  return request({
    url: '/user/delete_group',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 添加用户
export function add_user(query) {
  return request({
    url: '/user/add_user',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 编辑用户
export function change_user_info(query) {
  return request({
    url: '/user/edit_user',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 删除用户
export function del_user(query) {
  return request({
    url: '/user/delete_user',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 批量添加用户
export function add_user_from_list(query) {
  return request({
    url: '/user/add_user_list',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 批量重置密码
export function resetpwd(query) {
  return request({
    url: '/user/reset_pwd',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 批量编辑应用
export function bind_app_to_user(data) {
  return request({
    url: '/user/edit_user_list',
    method: 'post',
    data
  })
}

// 查看当前绑定的应用
export function get_user_app(data) {
  return request({
    url: '/user/get_user_app',
    method: 'post',
    data
  })
}

export function batch_set_usb(data) {
  return request({
    url: '/user/batch_set_usb',
    method: 'post',
    data
  })
}

// 用户登记
export function get_login_info(data) {
  return request({
    url: '/user/get_login_info',
    method: 'post',
    data
  })
}
