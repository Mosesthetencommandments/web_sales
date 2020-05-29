import request from '@/utils/request'

export function getOrdersSensitiveList(param) {
  return request({
    url: '/api/logistics/getOrdersSensitiveList',
    method: 'post',
    data: param
  })
}
export function createOrdersSensitive(param) {
  return request({
    url: '/api/logistics/createOrdersSensitive',
    method: 'post',
    data: param
  })
}
export function updateOrdersSensitive(param) {
  return request({
    url: '/api/logistics/updateOrdersSensitive',
    method: 'post',
    data: param
  })
}
export function deleteOrdersSensitive(param) {
  return request({
    url: '/api/logistics/deleteOrdersSensitive',
    method: 'post',
    data: param
  })
}
