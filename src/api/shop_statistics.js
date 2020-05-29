import request from '@/utils/request'

export function getSalesShopCustomerProfitList(param) {
  return request({
    url: '/api/sales/getSalesShopCustomerProfitList',
    method: 'post',
    data: param
  })
}
export function getSalesShopCustomerProfitStatistics(param) {
  return request({
    url: '/api/sales/getSalesShopCustomerProfitStatistics',
    method: 'post',
    data: param
  })
}
