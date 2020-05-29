import request from '@/utils/request'

export function createCopywriteMediaBankItems(param) {
  return request({
    url: '/api/media/createCopywriteMediaBankItems',
    method: 'post',
    data: param
  })
}

export function createCopywriteMediaBankCategory(param) {
  return request({
    url: '/api/media/createCopywriteMediaBankCategory',
    method: 'post',
    data: param
  })
}

export function createCopywriteMediaBank(param) {
  return request({
    url: '/api/media/createCopywriteMediaBank',
    method: 'post',
    data: param
  })
}

export function updateCopywriteMediaBankCategory(param) {
  return request({
    url: '/api/media/updateCopywriteMediaBankCategory',
    method: 'post',
    data: param
  })
}

export function updateCopywriteMediaBank(param) {
  return request({
    url: '/api/media/updateCopywriteMediaBank',
    method: 'post',
    data: param
  })
}

export function getCopywriteMediaBankCategoryList(param) {
  return request({
    url: '/api/media/getCopywriteMediaBankCategoryList',
    method: 'post',
    data: param
  })
}

export function getCopywriteMediaBankCategoryTree(param) {
  return request({
    url: '/api/media/getCopywriteMediaBankCategoryTree',
    method: 'post',
    data: param
  })
}

export function getCopywriteMediaBankItemsList(param) {
  return request({
    url: '/api/media/getCopywriteMediaBankItemsList',
    method: 'post',
    data: param
  })
}

export function getCopywriteMediaBankList(param) {
  return request({
    url: '/api/media/getCopywriteMediaBankList',
    method: 'post',
    data: param
  })
}

export function deleteCopywriteMediaBankItems(param) {
  return request({
    url: '/api/media/deleteCopywriteMediaBankItems',
    method: 'post',
    data: param
  })
}

export function updateCopywriteMediaBankItems(param) {
  return request({
    url: '/api/media/updateCopywriteMediaBankItems',
    method: 'post',
    data: param
  })
}

export function deleteCopywriteMediaBankItemsBatch(param) {
  return request({
    url: '/api/media/deleteCopywriteMediaBankItemsBatch',
    method: 'post',
    data: param
  })
}

export function getCopywriteMediaBankItemsInfo(param) {
  return request({
    url: '/api/media/getCopywriteMediaBankItemsInfo',
    method: 'post',
    data: param
  })
}

export function getBrandList(param) {
  return request({
    url: '/api/media/getBrandList',
    method: 'post',
    data: param
  })
}

