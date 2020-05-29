import request from '@/utils/request'

export function getSupportMemberList(param) {
  return request({
    url: '/api/sales/getSupportMemberList',
    method: 'post',
    data: param
  })
}
export function getSupportMemberWithAllList(param) {
  return request({
    url: '/api/sales/getSupportMemberWithAllList',
    method: 'post',
    data: param
  })
}
export function getSupportGroupList(param) {
  return request({
    url: '/api/sales/getSupportGroupList',
    method: 'post',
    data: param
  })
}
export function updateSupportProduct(param) {
  return request({
    url: '/api/sales/updateSupportProduct',
    method: 'post',
    data: param
  })
}

export function editSupportInfo(param) {
  return request({
    url: '/api/sales/editSupportInfo',
    method: 'post',
    data: param
  })
}

export function updateSupportTransModelTime(param) {
  return request({
    url: '/api/sales/updateSupportTransModelTime',
    method: 'post',
    data: param
  })
}
export function getSupportTransModelTimeList(param) {
  return request({
    url: '/api/sales/getSupportTransModelTimeList',
    method: 'post',
    data: param
  })
}
export function createSupportTransModelTime(param) {
  return request({
    url: '/api/sales/createSupportTransModelTime',
    method: 'post',
    data: param
  })
}
export function deleteSupportTransModelTime(param) {
  return request({
    url: '/api/sales/deleteSupportTransModelTime',
    method: 'post',
    data: param
  })
}
