import request from '@/utils/request'

export function getProductWeixinFansProtraitItemList(param) {
  return request({
    url: 'api/product/getProductWeixinFansProtraitItemList',
    method: 'post',
    data: param
  })
}

export function updateProductWeixinFansProtraitItem(param) {
  return request({
    url: 'api/product/updateProductWeixinFansProtraitItem',
    method: 'post',
    data: param
  })
}
export function createProductWeixinFansProtraitItem(param) {
  return request({
    url: 'api/product/createProductWeixinFansProtraitItem',
    method: 'post',
    data: param
  })
}
export function getProductWeixinFansStaticsColumn(param) {
  return request({
    url: 'api/product/getProductWeixinFansStaticsColumn',
    method: 'post',
    data: param
  })
}
export function updateProductWeixinFansProtraitItemSection(param) {
  return request({
    url: 'api/product/updateProductWeixinFansProtraitItemSection',
    method: 'post',
    data: param
  })
}
export function createProductWeixinFansProtraitItemSection(param) {
  return request({
    url: 'api/product/createProductWeixinFansProtraitItemSection',
    method: 'post',
    data: param
  })
}
export function editFansPortrait(param) {
  return request({
    url: 'api/product/editFansPortrait',
    method: 'post',
    data: param
  })
}

export function getProductWenxinFansStatics(param) {
  return request({
    url: 'api/product/getProductWenxinFansStatics',
    method: 'post',
    data: param
  })
}

