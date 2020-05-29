import request from '@/utils/request'

export function getSpeechList(param) {
  return request({
    url: '/api/copywrite/getSpeechList',
    method: 'post',
    data: param
  })
}
export function editSpeechTag(param) {
  return request({
    url: '/api/copywrite/editSpeechTag',
    method: 'post',
    data: param
  })
}
export function updateSpeech(param) {
  return request({
    url: '/api/copywrite/updateSpeech',
    method: 'post',
    data: param
  })
}
export function createSpeech(param) {
  return request({
    url: '/api/copywrite/createSpeech',
    method: 'post',
    data: param
  })
}
export function switchPerfectSpeech(param) {
  return request({
    url: '/api/copywrite/switchPerfectSpeech',
    method: 'post',
    data: param
  })
}
export function deleteSpeech(param) {
  return request({
    url: '/api/copywrite/deleteSpeech',
    method: 'post',
    data: param
  })
}
export function getSpeechCommentBySpeech(param) {
  return request({
    url: 'api/copywrite/getSpeechCommentBySpeech',
    method: 'post',
    data: param
  })
}
export function createSpeechComment(param) {
  return request({
    url: 'api/copywrite/createSpeechComment',
    method: 'post',
    data: param
  })
}
export function deleteSpeechComment(param) {
  return request({
    url: 'api/copywrite/deleteSpeechComment',
    method: 'post',
    data: param
  })
}

export function createSpeechPrise(param) {
  return request({
    url: 'api/copywrite/createSpeechPrise',
    method: 'post',
    data: param
  })
}

export function deleteSpeechPrise(param) {
  return request({
    url: 'api/copywrite/deleteSpeechPrise',
    method: 'post',
    data: param
  })
}

export function checkSpeech(param) {
  return request({
    url: '/api/copywrite/checkSpeech',
    method: 'post',
    data: param
  })
}

