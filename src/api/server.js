import request from '@/utils/request'

// 获取服务器分组list
export function get_machine_group() {
  return request({
    url: '/server/get_group_list',
    method: 'post'
  })
}

// 获取硬盘分区信息 应用页面用到
export function get_disk_by_gid(query) {
  return request({
    url: '/server/get_disk_by_gid',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 获取子目录位置 应用页面用到
export function get_file_by_gid(query) {
  return request({
    url: '/server/get_file_by_gid',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 添加服务器分组
export function add_machine_group(query) {
  return request({
    url: '/server/add_group',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 删除服务器分组
export function del_machine_group(query) {
  return request({
    url: '/server/delete_group',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 编辑服务器分组名称
export function change_machine_group_name(query) {
  return request({
    url: '/server/edit_group',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 获取所有服务器列表
export function get_all_machine_list(query) {
  return request({
    url: '/server/get_server_list',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 添加服务器
export function add_machine(query) {
  return request({
    url: '/server/add_server',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 编辑服务器
export function edit_machine(query) {
  return request({
    url: '/server/edit_server',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 关机
export function poweroff_by_id(query) {
  return request({
    url: 'server/shutdown',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 重启
export function restart_by_id(query) {
  return request({
    url: '/server/reboot',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 删除
export function del_machine(query) {
  return request({
    url: '/server/delete_server',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 获取本地服务 首页用的
export function get_local_machine(query) {
  return request({
    url: '/get_local_machine/',
    method: 'post',
    data: Object.assign({}, query)
  })
}
