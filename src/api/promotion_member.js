import request from '@/utils/request'

export function getPromotionMemberList(param) {
  return request({
    url: '/api/promotion/getPromotionMemberList',
    method: 'post',
    data: param
  })
}

export function getPromotionMemberPromotionChannelRelation(param) {
  return request({
    url: '/api/promotion/getPromotionMemberPromotionChannelRelation',
    method: 'post',
    data: param
  })
}

export function changePromotionMemberPromotionChannel(param) {
  return request({
    url: '/api/promotion/changePromotionMemberPromotionChannel',
    method: 'post',
    data: param
  })
}

export function deletePromotionChannel(param) {
  return request({
    url: '/api/promotion/deletePromotionChannel',
    method: 'post',
    data: param
  })
}
export function getPromotionMemberInfo(param) {
  return request({
    url: '/api/promotion/getPromotionMemberInfo',
    method: 'post',
    data: param
  })
}
export function getPromotionGroupList(param) {
  return request({
    url: '/api/promotion/getPromotionGroupList',
    method: 'post',
    data: param
  })
}

