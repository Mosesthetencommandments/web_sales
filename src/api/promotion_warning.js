import request from '@/utils/request'

export function getPromotionWarningList(param) {
  return request({
    url: '/api/promotion/getPromotionWarningList',
    method: 'post',
    data: param
  })
}
