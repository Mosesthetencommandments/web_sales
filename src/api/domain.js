import request from '@/utils/request'

export function getDomainList(param) {
  return request({
    url: '/api/domain/getDomainList',
    method: 'post',
    data: param
  })
}

export function createDomain(param) {
  return request({
    url: '/api/domain/createDomain',
    method: 'post',
    data: param
  })
}

export function updateDomain(param) {
  return request({
    url: '/api/domain/updateDomain',
    method: 'post',
    data: param
  })
}

export function deleteDomain(param) {
  return request({
    url: '/api/domain/deleteDomain',
    method: 'post',
    data: param
  })
}

export function getDomainExtraCodeList(param) {
  return request({
    url: '/api/domain/getDomainExtraCodeList',
    method: 'post',
    data: param
  })
}

export function createDomainExtraCode(param) {
  return request({
    url: '/api/domain/createDomainExtraCode',
    method: 'post',
    data: param
  })
}

export function updateDomainExtraCode(param) {
  return request({
    url: '/api/domain/updateDomainExtraCode',
    method: 'post',
    data: param
  })
}

export function deleteDomainExtraCode(param) {
  return request({
    url: '/api/domain/deleteDomainExtraCode',
    method: 'post',
    data: param
  })
}
