import request from '@/utils/request'

export function getDailyRanking(param) {
  return request({
    url: '/api/sales/getDailyRanking',
    method: 'post',
    data: param
  })
}

export function getMonthlyRanking(param) {
  return request({
    url: '/api/sales/getMonthlyRanking',
    method: 'post',
    data: param
  })
}

export function getRealTimeRanking(param) {
  return request({
    url: '/api/sales/getRealTimeRanking',
    method: 'post',
    data: param
  })
}

export function getSupportRealTimePerformance(param) {
  return request({
    url: '/api/sales/getSupportRealTimePerformance',
    method: 'post',
    data: param
  })
}
