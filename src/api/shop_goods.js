import request from '@/utils/request'

export function getShopGoodsList(param) {
  return request({
    url: '/api/shop/getShopGoodsList',
    method: 'post',
    data: param
  })
}
