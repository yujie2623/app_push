import request from '@/utils/request'

// 获取app组
export function getAppList() {
  return request({
    url: '/app/get_group_list',
    method: 'post'
  })
}

// 获取所有应用
export function get_all_app_list(query) {
  return request({
    url: '/app/get_app_list',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 添加应用分组
export function add_app_group(query) {
  return request({
    url: '/app/add_group',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 编辑应用分组
export function change_app_group_name(query) {
  return request({
    url: '/app/edit_group',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 删除应用分组
export function del_app_group(query) {
  return request({
    url: '/app/delete_group',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 添加app
export function add_remote_app(query) {
  return request({
    url: '/app/add_app',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 编辑app
export function change_app_info(query) {
  return request({
    url: '/app/edit_app',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 删除应用
export function del_remote_app(query) {
  return request({
    url: '/app/delete_app',
    method: 'post',
    data: Object.assign({}, query)
  })
}
