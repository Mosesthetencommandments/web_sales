import request from '@/utils/request'

export function updatePreparedOrders(param) {
  return request({
    url: '/api/orders/updatePreparedOrders',
    method: 'post',
    data: param
  })
}

export function lockOrders(param) {
  return request({
    url: '/api/orders/lockOrders',
    method: 'post',
    data: param
  })
}

export function confirmOrders(param) {
  return request({
    url: '/api/orders/confirmOrders',
    method: 'post',
    data: param
  })
}

export function cancelOrders(param) {
  return request({
    url: '/api/orders/cancelOrders',
    method: 'post',
    data: param
  })
}
export function finishShopReplacePurchase(param) {
  return request({
    url: '/api/shop/finishShopReplacePurchase',
    method: 'post',
    data: param
  })
}
