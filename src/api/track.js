import request from '@/utils/request'

export function createTrackTimeRange(param) {
  return request({
    url: '/api/track/createTrackTimeRange',
    method: 'post',
    data: param
  })
}

export function deleteTrackTimeRange(param) {
  return request({
    url: '/api/track/deleteTrackTimeRange',
    method: 'post',
    data: param
  })
}

export function switchTrackPlanStatus(param) {
  return request({
    url: '/api/track/switchTrackPlanStatus',
    method: 'post',
    data: param
  })
}

export function updateTrackTimeRange(param) {
  return request({
    url: '/api/track/updateTrackTimeRange',
    method: 'post',
    data: param
  })
}

export function editTrackTimeRangeTag(param) {
  return request({
    url: '/api/track/editTrackTimeRangeTag',
    method: 'post',
    data: param
  })
}

export function getTrackTimeRangeList(param) {
  return request({
    url: '/api/track/getTrackTimeRangeList',
    method: 'post',
    data: param
  })
}

export function getTrackPlanList(param) {
  return request({
    url: '/api/track/getTrackPlanList',
    method: 'post',
    data: param
  })
}

export function deleteTrackPlanStatus(param) {
  return request({
    url: '/api/track/deleteTrackPlanStatus',
    method: 'post',
    data: param
  })
}
