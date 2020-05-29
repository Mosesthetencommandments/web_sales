import request from '@/utils/request'

export function getProductWeixinList(param) {
  return request({
    url: '/api/sales/getProductWeixinList',
    method: 'post',
    data: param
  })
}

export function createProductWeixin(param) {
  return request({
    url: '/api/sales/createProductWeixin',
    method: 'post',
    data: param
  })
}

export function updateProductWeixin(param) {
  return request({
    url: '/api/sales/updateProductWeixin',
    method: 'post',
    data: param
  })
}

export function getProductWeixinFansList(param) {
  return request({
    url: '/api/sales/getProductWeixinFansList',
    method: 'post',
    data: param
  })
}

export function updateProductWeixinFans(param) {
  return request({
    url: '/api/sales/updateProductWeixinFans',
    method: 'post',
    data: param
  })
}

export function getPromotionChannelList(param) {
  return request({
    url: '/api/promotion/getPromotionChannelList',
    method: 'post',
    data: param
  })
}

export function getProductWeixinLogsList(param) {
  return request({
    url: '/api/sales/getProductWeixinLogsList',
    method: 'post',
    data: param
  })
}

export function getProductWeixinBalanceList(param) {
  return request({
    url: '/api/finance/getProductWeixinBalanceList',
    method: 'post',
    data: param
  })
}
