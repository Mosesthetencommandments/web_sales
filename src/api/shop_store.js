import request from '@/utils/request'

export function getShopStoreList(param) {
  return request({
    url: '/api/shop/getShopStoreList',
    method: 'post',
    data: param
  })
}
