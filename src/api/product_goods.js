import request from '@/utils/request'

export function getProductGoodsStorageList(param) {
  return request({
    url: '/api/product/getProductGoodsStorageList',
    method: 'post',
    data: param
  })
}

export function createProductGoods(param) {
  return request({
    url: '/api/product/createProductGoods',
    method: 'post',
    data: param
  })
}

export function updateProductGoods(param) {
  return request({
    url: '/api/product/updateProductGoods',
    method: 'post',
    data: param
  })
}

export function deleteProductGoods(param) {
  return request({
    url: '/api/product/deleteProductGoods',
    method: 'post',
    data: param
  })
}
export function createProductGoodCost(param) {
  return request({
    url: '/api/product/createProductGoodCost',
    method: 'post',
    data: param
  })
}
export function getProductGoodCostList(param) {
  return request({
    url: '/api/product/getProductGoodCostList',
    method: 'post',
    data: param
  })
}
export function getProductGoodsList(param) {
  return request({
    url: '/api/product/getProductGoodsList',
    method: 'post',
    data: param
  })
}
export function getProductGoodsInfo(param) {
  return request({
    url: '/api/product/getProductGoodsInfo',
    method: 'post',
    data: param
  })
}
export function getBrandList(param) {
  return request({
    url: '/api/product/getBrandList',
    method: 'post',
    data: param
  })
}
export function changeProductGoodsStatus(param) {
  return request({
    url: '/api/product/changeProductGoodsStatus',
    method: 'post',
    data: param
  })
}
export function updateProductRProductGoods(param) {
  return request({
    url: '/api/product/updateProductRProductGoods',
    method: 'post',
    data: param
  })
}
export function getProductStorageByDay(param) {
  return request({
    url: '/api/product/getProductStorageByDay',
    method: 'post',
    data: param
  })
}

