import request from '@/utils/request'

export function getSystemGlobalSettingList(param) {
  return request({
    url: '/api/system/getSystemGlobalSettingList',
    method: 'post',
    data: param
  })
}

export function updateSystemGlobalSetting(param) {
  return request({
    url: '/api/system/updateSystemGlobalSetting',
    method: 'post',
    data: param
  })
}

export function getSystemGlobalSettingInfo(param) {
  return request({
    url: '/api/system/getSystemGlobalSettingInfo',
    method: 'post',
    data: param
  })
}
