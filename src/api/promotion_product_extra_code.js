import request from '@/utils/request'

export function getPromotionProductExtraCodeList(param) {
  return request({
    url: '/api/promotion/getPromotionProductExtraCodeList',
    method: 'post',
    data: param
  })
}

export function getPromotionProductExtraCodeTypeList(param) {
  return request({
    url: '/api/promotion/getPromotionProductExtraCodeTypeList',
    method: 'post',
    data: param
  })
}

export function getPromotionProductExtraCodeInfo(param) {
  return request({
    url: '/api/promotion/getPromotionProductExtraCodeInfo',
    method: 'post',
    data: param
  })
}

export function getPromotionProductExtraCodeTypeInfo(param) {
  return request({
    url: '/api/promotion/getPromotionProductExtraCodeTypeInfo',
    method: 'post',
    data: param
  })
}

export function updatePromotionProductExtraCode(param) {
  return request({
    url: '/api/promotion/updatePromotionProductExtraCode',
    method: 'post',
    data: param
  })
}

export function updatePromotionProductExtraCodeStatus(param) {
  return request({
    url: '/api/promotion/updatePromotionProductExtraCodeStatus',
    method: 'post',
    data: param
  })
}

export function createPromotionProductExtraCode(param) {
  return request({
    url: '/api/promotion/createPromotionProductExtraCode',
    method: 'post',
    data: param
  })
}

export function deletePromotionProductExtraCode(param) {
  return request({
    url: '/api/promotion/deletePromotionProductExtraCode',
    method: 'post',
    data: param
  })
}
