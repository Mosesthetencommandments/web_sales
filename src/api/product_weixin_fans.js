import request from '@/utils/request'

export function getProductWeixinFansAddressList(param) {
  return request({
    url: '/api/customer/getProductWeixinFansAddressList',
    method: 'post',
    data: param
  })
}

export function createProductWeixinFansAddress(param) {
  return request({
    url: '/api/customer/createProductWeixinFansAddress',
    method: 'post',
    data: param
  })
}

export function updateProductWeixinFansAddress(param) {
  return request({
    url: '/api/customer/updateProductWeixinFansAddress',
    method: 'post',
    data: param
  })
}

export function deleteProductWeixinFansAddress(param) {
  return request({
    url: '/api/customer/deleteProductWeixinFansAddress',
    method: 'post',
    data: param
  })
}

export function createProductWeixinFans(param) {
  return request({
    url: '/api/sales/createProductWeixinFans',
    method: 'post',
    data: param
  })
}

export function getDateAddFansInfo(param) {
  return request({
    url: '/api/sales/getDateAddFansInfo',
    method: 'post',
    data: param
  })
}

export function updateProductWeixinRecord(param) {
  return request({
    url: '/api/sales/updateProductWeixinRecord',
    method: 'post',
    data: param
  })
}

export function getDateUnfilledFansInfo(param) {
  return request({
    url: '/api/sales/getDateUnfilledFansInfo',
    method: 'post',
    data: param
  })
}

export function updateProductWeixinUnfilled(param) {
  return request({
    url: '/api/sales/updateProductWeixinUnfilled',
    method: 'post',
    data: param
  })
}
