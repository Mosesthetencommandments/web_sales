import request from '@/utils/request'

export function getPromotionProductList(param) {
  return request({
    url: '/api/promotion/getPromotionProductList',
    method: 'post',
    data: param
  })
}

export function getPromotionProductInfo(param) {
  return request({
    url: '/api/promotion/getPromotionProductInfo',
    method: 'post',
    data: param
  })
}

export function createPromotionProduct(param) {
  return request({
    url: '/api/promotion/createPromotionProduct',
    method: 'post',
    data: param
  })
}

export function updatePromotionProduct(param) {
  return request({
    url: '/api/promotion/updatePromotionProduct',
    method: 'post',
    data: param
  })
}

export function getPromotionProductWeixinList(param) {
  return request({
    url: '/api/promotion/getPromotionProductWeixinList',
    method: 'post',
    data: param
  })
}

export function releasePromotionProduct(param) {
  return request({
    url: '/api/promotion/releasePromotionProduct',
    method: 'post',
    data: param
  })
}

export function previewPromotionProduct(param) {
  return request({
    url: '/api/promotion/previewPromotionProduct',
    method: 'post',
    data: param
  })
}

export function deletePromotionProduct(param) {
  return request({
    url: '/api/promotion/deletePromotionProduct',
    method: 'post',
    data: param
  })
}

