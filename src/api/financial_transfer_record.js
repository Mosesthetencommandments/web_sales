import request from '@/utils/request'

export function getFinanceTransferRecordList(param) {
  return request({
    url: '/api/finance/getFinanceTransferRecordList',
    method: 'post',
    data: param
  })
}

export function getFinanceTransferRecordCommentList(param) {
  return request({
    url: '/api/finance/getFinanceTransferRecordCommentList',
    method: 'post',
    data: param
  })
}

export function createFinanceTransferRecordComment(param) {
  return request({
    url: '/api/finance/createFinanceTransferRecordComment',
    method: 'post',
    data: param
  })
}

export function createWeixinFinanceTransferRecord(param) {
  return request({
    url: '/api/finance/createWeixinFinanceTransferRecord',
    method: 'post',
    data: param
  })
}

export function verifyFinanceTransferRecord(param) {
  return request({
    url: '/api/finance/verifyFinanceTransferRecord',
    method: 'post',
    data: param
  })
}

export function verifyFinanceTransferRecordMassively(param) {
  return request({
    url: '/api/finance/verifyFinanceTransferRecordMassively',
    method: 'post',
    data: param
  })
}
