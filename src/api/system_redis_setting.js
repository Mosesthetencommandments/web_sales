import request from '@/utils/request'

export function updateDomainRedis(param) {
  return request({
    url: '/api/system/updateDomainRedis',
    method: 'post',
    data: param
  })
}

export function updateProductWeixinRedis(param) {
  return request({
    url: '/api/system/updateProductWeixinRedis',
    method: 'post',
    data: param
  })
}

export function updateProductTemplateRedis(param) {
  return request({
    url: '/api/system/updateProductTemplateRedis',
    method: 'post',
    data: param
  })
}

export function updatePromotionProductRedis(param) {
  return request({
    url: '/api/system/updatePromotionProductRedis',
    method: 'post',
    data: param
  })
}

export function updateSupportScheduleRedis(param) {
  return request({
    url: '/api/system/updateSupportScheduleRedis',
    method: 'post',
    data: param
  })
}

export function updatePromotionProductExtraCodeTypeRedis(param) {
  return request({
    url: '/api/system/updatePromotionProductExtraCodeTypeRedis',
    method: 'post',
    data: param
  })
}
