import request from '@/utils/request'

export function getPromotionChannelList(param) {
  return request({
    url: '/api/promotion/getPromotionChannelList',
    method: 'post',
    data: param
  })
}

export function createPromotionChannel(param) {
  return request({
    url: '/api/promotion/createPromotionChannel',
    method: 'post',
    data: param
  })
}

export function updatePromotionChannel(param) {
  return request({
    url: '/api/promotion/updatePromotionChannel',
    method: 'post',
    data: param
  })
}

export function deletePromotionChannel(param) {
  return request({
    url: '/api/promotion/deletePromotionChannel',
    method: 'post',
    data: param
  })
}

export function getPromotionChannelAccountList(param) {
  return request({
    url: '/api/promotion/getPromotionChannelAccountList',
    method: 'post',
    data: param
  })
}

export function createPromotionChannelAccount(param) {
  return request({
    url: '/api/promotion/createPromotionChannelAccount',
    method: 'post',
    data: param
  })
}

export function updatePromotionChannelAccount(param) {
  return request({
    url: '/api/promotion/updatePromotionChannelAccount',
    method: 'post',
    data: param
  })
}

export function createPromotionChannelAccountConsumption(param) {
  return request({
    url: '/api/promotion/createPromotionChannelAccountConsumption',
    method: 'post',
    data: param
  })
}

export function createPromotionChannelAccountRecharge(param) {
  return request({
    url: '/api/promotion/createPromotionChannelAccountRecharge',
    method: 'post',
    data: param
  })
}

export function deletePromotionChannelAccountConsumption(param) {
  return request({
    url: '/api/promotion/deletePromotionChannelAccountConsumption',
    method: 'post',
    data: param
  })
}

export function deletePromotionChannelAccountRecharge(param) {
  return request({
    url: '/api/promotion/deletePromotionChannelAccountRecharge',
    method: 'post',
    data: param
  })
}

export function getPromotionChannelAccountConsumptionList(param) {
  return request({
    url: '/api/promotion/getPromotionChannelAccountConsumptionList',
    method: 'post',
    data: param
  })
}

export function getPromotionChannelAccountRechargeList(param) {
  return request({
    url: '/api/promotion/getPromotionChannelAccountRechargeList',
    method: 'post',
    data: param
  })
}

export function deletePromotionChannelAccount(param) {
  return request({
    url: '/api/promotion/deletePromotionChannelAccount',
    method: 'post',
    data: param
  })
}

export function getPromotionChannelAccountProductList(param) {
  return request({
    url: '/api/promotion/getPromotionChannelAccountProductList',
    method: 'post',
    data: param
  })
}
export function createPromotionChannelAccountConsumptionMassively(param) {
  return request({
    url: '/api/promotion/createPromotionChannelAccountConsumptionMassively',
    method: 'post',
    data: param
  })
}
export function getPromotionChannelAccountRefundList(param) {
  return request({
    url: '/api/promotion/getPromotionChannelAccountRefundList',
    method: 'post',
    data: param
  })
}

export function deletePromotionChannelAccountRefund(param) {
  return request({
    url: '/api/promotion/deletePromotionChannelAccountRefund',
    method: 'post',
    data: param
  })
}
export function createPromotionChannelAccountRefund(param) {
  return request({
    url: '/api/promotion/createPromotionChannelAccountRefund',
    method: 'post',
    data: param
  })
}
export function getPromotionChannelAccountTotalMoney(param) {
  return request({
    url: 'api/promotion/getPromotionChannelAccountTotalMoney',
    method: 'post',
    data: param
  })
}
export function changePromotionChannelAccountStatus(param) {
  return request({
    url: 'api/promotion/changePromotionChannelAccountStatus',
    method: 'post',
    data: param
  })
}
export function getPromotionChannelAccountTransferList(param) {
  return request({
    url: 'api/promotion/getPromotionChannelAccountTransferList',
    method: 'post',
    data: param
  })
}
export function updatePromotionChannelAccountRechargeProof(param) {
  return request({
    url: '/api/promotion/updatePromotionChannelAccountRechargeProof',
    method: 'post',
    data: param
  })
}
export function updatePromotionChannelAccountRefundProof(param) {
  return request({
    url: '/api/promotion/updatePromotionChannelAccountRefundProof',
    method: 'post',
    data: param
  })
}
