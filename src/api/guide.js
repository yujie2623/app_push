import request from '@/utils/request'

// 配置完成
export function configSucc(query) {
  return request({
    url: '/index/init_lead_config',
    method: 'post',
    data: Object.assign({}, query)
  })
}

// 获取app
export function getApp(query) {
  return request({
    url: '/server/get_file_by_ip',
    method: 'post',
    data: Object.assign({}, query)
  })
}
