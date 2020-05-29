import request from '@/utils/request'

export function getSupportMemberSchedule(param) {
  return request({
    url: '/api/sales/getSupportMemberSchedule',
    method: 'post',
    data: param
  })
}

export function updateSupportMemberSchedule(param) {
  return request({
    url: '/api/sales/updateSupportMemberSchedule',
    method: 'post',
    data: param
  })
}
