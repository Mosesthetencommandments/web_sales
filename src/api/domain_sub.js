import request from '@/utils/request'

export function getDomainSubList(param) {
  return request({
    url: '/api/domain/getDomainSubList',
    method: 'post',
    data: param
  })
}

export function createDomainSub(param) {
  return request({
    url: '/api/domain/createDomainSub',
    method: 'post',
    data: param
  })
}

export function updateDomainSub(param) {
  return request({
    url: '/api/domain/updateDomainSub',
    method: 'post',
    data: param
  })
}

export function deleteDomainSub(param) {
  return request({
    url: '/api/domain/deleteDomainSub',
    method: 'post',
    data: param
  })
}

export function getDomainSubExtraCodeList(param) {
  return request({
    url: '/api/domain/getDomainSubExtraCodeList',
    method: 'post',
    data: param
  })
}

export function createDomainSubExtraCode(param) {
  return request({
    url: '/api/domain/createDomainSubExtraCode',
    method: 'post',
    data: param
  })
}

export function updateDomainSubExtraCode(param) {
  return request({
    url: '/api/domain/updateDomainSubExtraCode',
    method: 'post',
    data: param
  })
}

export function deleteDomainSubExtraCode(param) {
  return request({
    url: '/api/domain/deleteDomainSubExtraCode',
    method: 'post',
    data: param
  })
}
