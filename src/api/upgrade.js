import request from '@/utils/request'

// 获取list
export function get_all_pack(query) {
  return request({
    url: '/upgrade/get_upgrade_list',
    method: 'post',
    data: query
  })
}

// 获取终端类型
export function get_all_clinet_type() {
  return request({
    url: '/upgrade/get_upgrade_type',
    method: 'post'
  })
}

// 添加升级包
export function addUpgrade(query) {
  return request({
    url: '/upgrade/add_upgrade',
    method: 'post',
    data: query
  })
}

// 编辑编辑升级包
export function editUpgrade(query) {
  return request({
    url: '/upgrade/edit_upgrade',
    method: 'post',
    data: query
  })
}

// 发布/取消发布
export function ispublic(query) {
  return request({
    url: '/upgrade/release_upgrade',
    method: 'post',
    data: query
  })
}

// 删除
export function del(query) {
  return request({
    url: '/upgrade/delete_upgrade',
    method: 'post',
    data: query
  })
}
