import request from '@/utils/request'

export function getTagTree(param) {
  return request({
    url: '/api/copywrite/getTagTree',
    method: 'post',
    data: param
  })
}
export function getTagTypeList(param) {
  return request({
    url: 'api/copywrite/getTagTypeList',
    method: 'post',
    data: param
  })
}
export function createTag(param) {
  return request({
    url: 'api/copywrite/createTag',
    method: 'post',
    data: param
  })
}
export function updateTag(param) {
  return request({
    url: 'api/copywrite/updateTag',
    method: 'post',
    data: param
  })
}
export function createTagType(param) {
  return request({
    url: 'api/copywrite/createTagType',
    method: 'post',
    data: param
  })
}

export function updateTagType(param) {
  return request({
    url: 'api/copywrite/updateTagType',
    method: 'post',
    data: param
  })
}

export function deleteTag(param) {
  return request({
    url: 'api/copywrite/deleteTag',
    method: 'post',
    data: param
  })
}

