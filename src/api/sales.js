import request from '@/utils/request'

// 销售等级列表
export function getSupportLevelList(param) {
  return request({
    url: '/api/sales/getSupportLevelList',
    method: 'post',
    data: param
  })
}
// 创建销售等级
export function createSupportLevel(param) {
  return request({
    url: '/api/sales/createSupportLevel',
    method: 'post',
    data: param
  })
}
// 修改销售等级和状态
export function updateSupportLevel(param) {
  return request({
    url: '/api/sales/updateSupportLevel',
    method: 'post',
    data: param
  })
}
// 销售等级详细
export function getSupportLevelInfo(param) {
  return request({
    url: '/api/sales/getSupportLevelInfo',
    method: 'post',
    data: param
  })
}

// 人员管理
// 人员管理等级管理列表
export function getSupportUserAccountLevelRelationsList(param) {
  return request({
    url: '/api/sales/getSupportUserAccountLevelRelationsList',
    method: 'post',
    data: param
  })
}
// 人员管理等级管理修改
export function updateSupportUserAccountLevelRelations(param) {
  return request({
    url: '/api/sales/updateSupportUserAccountLevelRelations',
    method: 'post',
    data: param
  })
}
// 人员管理等级管理详细信息
export function getSupportUserAccountLevelRelationsInfo(param) {
  return request({
    url: '/api/sales/getSupportUserAccountLevelRelationsInfo',
    method: 'post',
    data: param
  })
}
// 产品指标
// 销售产品与销售业绩配置列表
export function getSupportProductAchievementConfigList(param) {
  return request({
    url: '/api/sales/getSupportProductAchievementConfigList',
    method: 'post',
    data: param
  })
}
//  查询销售产品与销售业绩配置详细
export function getSupportProductAchievementConfigInfo(param) {
  return request({
    url: '/api/sales/getSupportProductAchievementConfigInfo',
    method: 'post',
    data: param
  })
}
// 修改销售产品与销售业绩配置
export function updateSupportProductAchievementConfig(param) {
  return request({
    url: '/api/sales/updateSupportProductAchievementConfig',
    method: 'post',
    data: param
  })
}
// 创建销售产品与销售业绩配置
export function createSupportProductAchievementConfig(param) {
  return request({
    url: '/api/sales/createSupportProductAchievementConfig',
    method: 'post',
    data: param
  })
}
// 提成设置

// 提成设置列表
export function getSupportProductProfitConfigList(param) {
  return request({
    url: '/api/sales/getSupportProductProfitConfigList',
    method: 'post',
    data: param
  })
}
// 详情
export function getSupportProductProfitConfigInfo(param) {
  return request({
    url: '/api/sales/getSupportProductProfitConfigInfo',
    method: 'post',
    data: param
  })
}
// 修改
export function updateSupportProductProfitConfig(param) {
  return request({
    url: '/api/sales/updateSupportProductProfitConfig',
    method: 'post',
    data: param
  })
}
// 创建
export function createSupportProductProfitConfig(param) {
  return request({
    url: '/api/sales/createSupportProductProfitConfig',
    method: 'post',
    data: param
  })
}
// 销售排名获取每月排名列表
export function getMonthlyRanking(param) {
  return request({
    url: '/api/sales/getMonthlyRanking',
    method: 'post',
    data: param
  })
}
