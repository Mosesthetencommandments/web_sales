import request from '@/utils/request'

export function updatas(param) {
  return request({
    url: '/api/shop/getShopReplacePurchaseInfo',
    method: 'post',
    data: param
  })
}
export function deletedata(param) {
  return request({
    url: '/api/shop/deleteShopReplacePurchase',
    method: 'post',
    data: param
  })
}
export function fatalist(param) {
  return request({
    url: '/api/shop/getShopReplacePurchaseList',
    method: 'post',
    data: param
  })
}
export function creates(param) {
  return request({
    url: '/api/shop/createShopReplacePurchase',
    method: 'post',
    data: param
  })
}
export function updateShopReplacePurchase(param) {
  return request({
    url: '/api/shop/updateShopReplacePurchase',
    method: 'post',
    data: param
  })
}
export function getOrdersList(param) {
  return request({
    url: '/api/orders/getOrdersList',
    method: 'post',
    data: param
  })
}

export function getOrdersListWithShopOrders(param) {
  return request({
    url: '/api/orders/getOrdersListWithShopOrders',
    method: 'post',
    data: param
  })
}

export function createOrders(param) {
  return request({
    url: '/api/orders/createOrders',
    method: 'post',
    data: param
  })
}

export function updateOrders(param) {
  return request({
    url: '/api/orders/updateOrders',
    method: 'post',
    data: param
  })
}

export function createOrdersItem(param) {
  return request({
    url: '/api/orders/createOrdersItem',
    method: 'post',
    data: param
  })
}

export function updateOrdersItem(param) {
  return request({
    url: '/api/orders/updateOrdersItem',
    method: 'post',
    data: param
  })
}

export function deleteOrdersItem(param) {
  return request({
    url: '/api/orders/deleteOrdersItem',
    method: 'post',
    data: param
  })
}

export function createOrdersRemark(param) {
  return request({
    url: '/api/orders/createOrdersRemark',
    method: 'post',
    data: param
  })
}

export function deleteOrdersRemark(param) {
  return request({
    url: '/api/orders/deleteOrdersRemark',
    method: 'post',
    data: param
  })
}

export function updateOrdersLogistics(param) {
  return request({
    url: '/api/orders/updateOrdersLogistics',
    method: 'post',
    data: param
  })
}

export function getOrdersLogisticsTypeList(param) {
  return request({
    url: '/api/orders/getOrdersLogisticsTypeList',
    method: 'post',
    data: param
  })
}

export function createOrdersPaymentItem(param) {
  return request({
    url: '/api/orders/createOrdersPaymentItem',
    method: 'post',
    data: param
  })
}

export function updateOrdersPaymentItem(param) {
  return request({
    url: '/api/orders/updateOrdersPaymentItem',
    method: 'post',
    data: param
  })
}

export function updateOrdersPaymentItemMassively(param) {
  return request({
    url: '/api/orders/updateOrdersPaymentItemMassively',
    method: 'post',
    data: param
  })
}

export function deleteOrdersPaymentItem(param) {
  return request({
    url: '/api/orders/deleteOrdersPaymentItem',
    method: 'post',
    data: param
  })
}

export function getOrdersPayTypeList(param) {
  return request({
    url: '/api/orders/getOrdersPayTypeList',
    method: 'post',
    data: param
  })
}

export function getOrdersPayProofList(param) {
  return request({
    url: '/api/orders/getOrdersPayProofList',
    method: 'post',
    data: param
  })
}

export function getOrdersSFLogisticsNumber(param) {
  return request({
    url: '/api/orders/getOrdersSFLogisticsNumber',
    method: 'post',
    data: param
  })
}
export function getOrdersCountInfo(param) {
  return request({
    url: '/api/orders/getOrdersCountInfo',
    method: 'post',
    data: param
  })
}

export function getOrdersLogsList(param) {
  return request({
    url: '/api/orders/getOrdersLogsList',
    method: 'post',
    data: param
  })
}
export function getOrdersYTOLogisticsNumber(param) {
  return request({
    url: '/api/orders/getOrdersYTOLogisticsNumber',
    method: 'post',
    data: param
  })
}

export function downloadNeedCheckOrder(param) {
  return request({
    url: '/api/orders/downloadNeedCheckOrder',
    method: 'post',
    data: param
  })
}

export function getOrdersAreaList(param) {
  return request({
    url: '/api/orders/getOrdersAreaList',
    method: 'post',
    data: param
  })
}

export function parseAddress(param) {
  return request({
    url: '/api/orders/parseAddress',
    method: 'post',
    data: param
  })
}

export function getOrdersSensitiveList(param) {
  return request({
    url: '/api/logistics/getOrdersSensitiveList',
    method: 'post',
    data: param
  })
}
export function createOrdersSensitive(param) {
  return request({
    url: '/api/logistics/createOrdersSensitive',
    method: 'post',
    data: param
  })
}
export function updateOrdersSensitive(param) {
  return request({
    url: '/api/logistics/updateOrdersSensitive',
    method: 'post',
    data: param
  })
}
export function deleteOrdersSensitive(param) {
  return request({
    url: '/api/logistics/deleteOrdersSensitive',
    method: 'post',
    data: param
  })
}
export function checkOrders(param) {
  return request({
    url: '/api/orders/checkOrders',
    method: 'post',
    data: param
  })
}
export function uncheckOrders(param) {
  return request({
    url: '/api/orders/uncheckOrders',
    method: 'post',
    data: param
  })
}
export function createUnidentifyReceiverInfo(param) {
  return request({
    url: '/api/orders/createUnidentifyReceiverInfo',
    method: 'post',
    data: param
  })
}
export function deliverOrders(param) {
  return request({
    url: '/api/orders/deliverOrders',
    method: 'post',
    data: param
  })
}
export function handleOrders(param) {
  return request({
    url: '/api/orders/handleOrders',
    method: 'post',
    data: param
  })
}
export function resultOrders(param) {
  return request({
    url: '/api/orders/resultOrders',
    method: 'post',
    data: param
  })
}
export function destroyOrders(param) {
  return request({
    url: '/api/orders/destroyOrders',
    method: 'post',
    data: param
  })
}
export function findOrdersList(param) {
  return request({
    url: '/api/orders/findOrdersList',
    method: 'post',
    data: param
  })
}
export function getWarehouseList(param) {
  return request({
    url: '/api/orders/getWarehouseList',
    method: 'post',
    data: param
  })
}
export function getOrdersItemList(param) {
  return request({
    url: '/api/orders/getOrdersItemList',
    method: 'post',
    data: param
  })
}
export function getDirectPromotionRefundInfo(param) {
  return request({
    url: '/api/orders/getDirectPromotionRefundInfo',
    method: 'post',
    data: param
  })
}
export function createDirectPromotionRefund(param) {
  return request({
    url: '/api/orders/createDirectPromotionRefund',
    method: 'post',
    data: param
  })
}
export function updateDirectPromotionRefund(param) {
  return request({
    url: '/api/orders/updateDirectPromotionRefund',
    method: 'post',
    data: param
  })
}
export function updateOrdersRefundItems(param) {
  return request({
    url: '/api/orders/updateOrdersRefundItems',
    method: 'post',
    data: param
  })
}
export function updateOrdersActualPay(param) {
  return request({
    url: '/api/orders/updateOrdersActualPay',
    method: 'post',
    data: param
  })
}
export function getOrdersChangePriceLogList(param) {
  return request({
    url: '/api/orders/getOrdersChangePriceLogList',
    method: 'post',
    data: param
  })
}
export function updateOrdersChangePriceLog(param) {
  return request({
    url: '/api/orders/updateOrdersChangePriceLog',
    method: 'post',
    data: param
  })
}
export function getOrdersInfo(param) {
  return request({
    url: '/api/orders/getOrdersInfo',
    method: 'post',
    data: param
  })
}
export function getGoodsFreight(param) {
  return request({
    url: '/api/orders/getGoodsFreight',
    method: 'post',
    data: param
  })
}
export function getOrdersChangePriceApplyList(param) {
  return request({
    url: '/api/orders/getOrdersChangePriceApplyList',
    method: 'post',
    data: param
  })
}
export function updateOrdersChangePriceApply(param) {
  return request({
    url: '/api/orders/updateOrdersChangePriceApply',
    method: 'post',
    data: param
  })
}
