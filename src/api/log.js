import request from '@/utils/request'

// 获取
export function get_log_info(query) {
  return request({
    url: '/log/get_log_list',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 删除
export function del_log_info(query) {
  return request({
    url: '/log/delete_log',
    method: 'post',
    data: Object.assign({}, query)
  })
}
