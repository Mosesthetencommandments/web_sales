import request from '@/utils/request'

export function getPromotionChannelStatisticsData(param) {
  return request({
    url: '/api/promotion/getPromotionChannelStatisticsData',
    method: 'post',
    data: param
  })
}

export function getPromotionMemberStatistics(param) {
  return request({
    url: '/api/promotion/getPromotionMemberStatistics',
    method: 'post',
    data: param
  })
}

export function getProductStatistics(param) {
  return request({
    url: '/api/promotion/getProductStatistics',
    method: 'post',
    data: param
  })
}

export function getSupportUnfilledList(param) {
  return request({
    url: '/api/data/getSupportUnfilledList',
    method: 'post',
    data: param
  })
}

export function queryDateAddFansList(param) {
  return request({
    url: '/api/data/queryDateAddFansList',
    method: 'post',
    data: param
  })
}

export function getPromotionCopyList(param) {
  return request({
    url: '/api/promotion/getPromotionCopyList',
    method: 'post',
    data: param
  })
}

export function createPromotionChannelAccountTransfer(param) {
  return request({
    url: '/api/promotion/createPromotionChannelAccountTransfer',
    method: 'post',
    data: param
  })
}
export function checkPromotionChannelAccountTransfer(param) {
  return request({
    url: '/api/promotion/checkPromotionChannelAccountTransfer',
    method: 'post',
    data: param
  })
}
export function checkPromotionChannelAccountRecharge(param) {
  return request({
    url: '/api/promotion/checkPromotionChannelAccountRecharge',
    method: 'post',
    data: param
  })
}
export function checkPromotionChannelAccountRefund(param) {
  return request({
    url: '/api/promotion/checkPromotionChannelAccountRefund',
    method: 'post',
    data: param
  })
}

