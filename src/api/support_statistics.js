import request from '@/utils/request'

export function getSupportMemberStatisticsDataDay(param) {
  return request({
    url: '/api/sales/getSupportMemberStatisticsDataDay',
    method: 'post',
    data: param
  })
}

export function getSupportMemberStatisticsDataMonth(param) {
  return request({
    url: '/api/sales/getSupportMemberStatisticsDataMonth',
    method: 'post',
    data: param
  })
}

export function getSupportProductStatisticsDataDay(param) {
  return request({
    url: '/api/sales/getSupportProductStatisticsDataDay',
    method: 'post',
    data: param
  })
}

export function getSupportProductStatisticsDataMonth(param) {
  return request({
    url: '/api/sales/getSupportProductStatisticsDataMonth',
    method: 'post',
    data: param
  })
}
export function getSupportFansCostList(param) {
  return request({
    url: '/api/support/getSupportFansCostList',
    method: 'post',
    data: param
  })
}
export function createSupportFansCost(param) {
  return request({
    url: '/api/support/createSupportFansCost',
    method: 'post',
    data: param
  })
}
export function getSupportCostStatisticsData(param) {
  return request({
    url: '/api/sales/getSupportCostStatisticsData',
    method: 'post',
    data: param
  })
}
export function getSupportFansCostStatisticsData(param) {
  return request({
    url: '/api/support/getSupportFansCostStatisticsData',
    method: 'post',
    data: param
  })
}
export function getSupportProductCostStatisticsData(param) {
  return request({
    url: '/api/support/getSupportProductCostStatisticsData',
    method: 'post',
    data: param
  })
}
export function getSupportChannelStatisticsDataDay(param) {
  return request({
    url: '/api/sales/getSupportChannelStatisticsDataDay',
    method: 'post',
    data: param
  })
}
export function getSupportChannelStatisticsDataMonth(param) {
  return request({
    url: '/api/sales/getSupportChannelStatisticsDataMonth',
    method: 'post',
    data: param
  })
}

export function getFansTransformList(param) {
  return request({
    url: '/api/sales/getFansTransformList',
    method: 'post',
    data: param
  })
}

export function getCustomRepeatPurchase(param) {
  return request({
    url: '/api/sales/getCustomRepeatPurchase',
    method: 'post',
    data: param
  })
}

export function getCustomRepeatPurchaseChartData(param) {
  return request({
    url: '/api/support/getCustomRepeatPurchaseChartData',
    method: 'post',
    data: param
  })
}

export function getFrontSupportMemberStatistics(param) {
  return request({
    url: '/api/support/getFrontSupportMemberStatistics',
    method: 'post',
    data: param
  })
}

export function getBackSupportMemberStatistics(param) {
  return request({
    url: '/api/support/getBackSupportMemberStatistics',
    method: 'post',
    data: param
  })
}
