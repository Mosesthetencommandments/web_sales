import request from '@/utils/request'

export function getCustomerShopList(param) {
  return request({
    url: '/api/customer/getCustomerShopList',
    method: 'post',
    data: param
  })
}

export function createCustomerShop(param) {
  return request({
    url: '/api/customer/createCustomerShop',
    method: 'post',
    data: param
  })
}

export function updateCustomerShop(param) {
  return request({
    url: '/api/customer/updateCustomerShop',
    method: 'post',
    data: param
  })
}

export function getCustomerProductWeixinList(param) {
  return request({
    url: '/api/customer/getCustomerProductWeixinList',
    method: 'post',
    data: param
  })
}

export function createCustomerProductWeixin(param) {
  return request({
    url: '/api/customer/createCustomerProductWeixin',
    method: 'post',
    data: param
  })
}

export function updateCustomerProductWeixin(param) {
  return request({
    url: '/api/customer/updateCustomerProductWeixin',
    method: 'post',
    data: param
  })
}

export function createCustomerShopSupport(param) {
  return request({
    url: '/api/customer/createCustomerShopSupport',
    method: 'post',
    data: param
  })
}

export function getCustomerAddressList(param) {
  return request({
    url: '/api/customer/getCustomerAddressList',
    method: 'post',
    data: param
  })
}

export function createCustomerAddress(param) {
  return request({
    url: '/api/customer/createCustomerAddress',
    method: 'post',
    data: param
  })
}

export function deleteCustomerAddress(param) {
  return request({
    url: '/api/customer/deleteCustomerAddress',
    method: 'post',
    data: param
  })
}

export function getCustomerShopSupportList(param) {
  return request({
    url: '/api/customer/getCustomerShopSupportList',
    method: 'post',
    data: param
  })
}

