import Vue from 'vue'
import Router from 'vue-router'
const _import = require('./_import_' + process.env.NODE_ENV)
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading
Vue.use(Router)
/* Layout */
import Layout from '../views/layout/Layout'

/**
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
 * hidden: true                   if `hidden:true` will not show in the sidebar and tagsView(default is false)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  { path: '/login',
    component: _import('login/index'),
    meta:{ hidden: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Dashboard',
    meta:{ hidden: true },
    children: [{
      path: 'dashboard',
      component: _import('dashboard/index')
    }]
  },
  {
    path: '/select_account',
    component: _import('user/select_account'),
    name: 'selectAccount',
    meta: {hidden: true}
  },
  {
    path: '/404',
    component: _import('404'),
    name: '404',
    meta: { title: '404', icon: 'form', hidden: true }
  }
]
export const asyncRouterMap = [
  {
    path: '/support',
    component: Layout,
    name: 'customerManagement',
    redirect: 'noredirect',
    meta: { title: '客服管理', icon: 'customerManagement' },
    children: [
      // {
      //   path: 'support_track',
      //   name: 'support_track',
      //   nullResult: _import('support/support_track'),
      //   meta: { title: '追访任务', icon: 'form', role: ['administrator', 'support', 'supportManager', 'supportDirector'] }
      // },
      {
        path: 'support/support_weixin_setting',
        name: 'addFanSetting',
        component: _import('support/support_weixin/support_weixin_setting'),
        meta: { title: '加粉设置', icon: 'addFanSetting'}
      },
      // {
      //   path: 'support_portrayal',
      //   name: 'supportPortrayal',
      //   component: _import('support/support_portrayal'),
      //   meta: { title: '粉丝画像', icon: 'supportPortrayal', role: ['administrator', 'support', 'supportManager', 'supportDirector'] }
      // },
      {
        path: 'support/product_weixin',
        name: 'wxAccountManagement',
        component: _import('system/weixin/product_weixin'),
        meta: { title: '微信号管理', icon: 'wxAccountManagement'}
      },
      {
        path: 'support/support_setting',
        name: 'PassengerServiceScheduling',
        component: _import('support/support_setting/support_schedule'),
        meta: { title: '客服排班', icon: 'PassengerServiceScheduling'}
      },
      {
        path: '/support/support_rating',
        name: 'SalesRank',
        redirect: 'noredirect',
        component: _import('support/support_rating/index'),
        meta: { title: '销售排名', icon: 'dot'},
        children: [
          {
            path: 'monthly_rating',
            name: 'monthlySalesRank',
            component: _import('support/support_rating/monthly_rating'),
            meta: { title: '每月销售排名'}
          },
          {
            path: 'daily_rating',
            name: 'dailySalesRank',
            component: _import('support/support_rating/daily_rating'),
            meta: { title: '每日销售排名'}
          },
          {
            path: 'achievement_rating',
            name: 'achievementRank',
            component: _import('support/support_rating/achievement_rating'),
            meta: { title: '实时业绩排名'}
          }
        ]
      },
      {
        path: '/support/support_statistics',
        name: 'SupportStatisticsMain',
        redirect: 'noredirect',
        component: _import('support/support_statistics/index'),
        meta: { title: '客服数据统计', icon: 'dot'},
        children: [
          {
            path: 'supportMemberStatistics',
            name: 'SupportMemberStatistics',
            component: _import('support/support_statistics/supportMemberStatistics'),
            meta: { title: '人员报表'}
          },
          {
            path: 'productStatistics',
            name: 'ProductStatistics',
            component: _import('support/support_statistics/productStatistics'),
            meta: { title: '产品报表'}
          },
          {
            path: 'channelStatistics',
            name: 'channelStatistics',
            component: _import('support/support_statistics/channelStatistics'),
            meta: { title: '渠道报表'}
          },
          {
            path: 'transformStatistics',
            name: 'transformStatistics',
            component: _import('support/support_statistics/transformStatistics'),
            meta: { title: '转化报表'}
          },
          {
            path: 'newFansRepurchaseStatistics',
            name: 'newFansRepurchaseStatistics',
            component: _import('support/support_statistics/newFansRepurchaseStatistics'),
            meta: { title: '复购报表'}
          },
          {
            path: 'frontSupportMemberStatistics',
            name: 'frontSupportMemberStatistics',
            component: _import('support/support_statistics/frontSupportMemberStatistics'),
            meta: { title: '前端报表'}
          },
          {
            path: 'backSupportMemberStatistics',
            name: 'backSupportMemberStatistics',
            component: _import('support/support_statistics/backSupportMemberStatistics'),
            meta: { title: '后端报表'}
          }
        ]
      },
      {
        path: 'support_member',
        name: 'customerPersonnelManagement',
        component: _import('support/support_member/support_member'),
        meta: { title: '人员管理'}
      },
      {
        path: 'mediaBankItemsList',
        name: 'mediaBankItemsList',
        component: _import('copywriters/media_bank_items'),
        meta: { title: '素材库' }
      }
    ]
  },
  // {
  //   path: '/copywriteManagement',
  //   component: Layout,
  //   name: 'copywriteManagement',
  //   redirect: 'noredirect',
  //   meta: { title: '文案管理', icon: 'knowledge'},
  //   children: [
  //     {
  //       path: 'friendCircle',
  //       name: 'friendCircle',
  //       component: _import('copywriters/friendCircle'),
  //       meta: { title: '朋友圈'}
  //     }]
  // },
  {
    path: '/data',
    component: Layout,
    name: 'dataQuery',
    redirect: 'noredirect',
    meta: { title: '数据查询', icon: 'data' },
    children: [
      {
        path: 'support_member_unfilled',
        name: 'addFansData',
        component: _import('data/support_member_unfilled'),
        meta: { title: '客服加粉数据' }
      },
      {
        path: 'add_fans_data_query',
        name: 'addFansDataQuery',
        component: _import('data/add_fans_data_query'),
        meta: { title: '加粉数据查询'}
      },
      {
        path: 'promotionChannelData',
        name: 'promotionChannelData',
        component: _import('data/promotionChannelData'),
        meta: { title: '推广渠道数据' }
      },
      {
        path: 'profit_query',
        name: 'profitQuery',
        component: _import('data/profitQuery'),
        meta: { title: '商城佣金明细查询' }
      },
      {
        path: 'profit_statistics',
        name: 'profitStatistics',
        component: _import('data/profitStatistics'),
        meta: { title: '商城佣金报表' }
      },
      // {
      //   path: 'fans_portrayal_statistics',
      //   name: 'fansPortrayalStatistics',
      //   component: _import('data/fans_portrayal_statistics'),
      //   meta: { title: '粉丝画像报表', icon: 'data', role: [] }
      // },
      {
        path: '/data/supportCostStatistics',
        name: 'supportFansCostStatistics',
        redirect: 'noredirect',
        component: _import('data/supportFansCost/index'),
        meta: { title: '客服成本', icon: 'dot'},
        children: [
          {
            path: 'costStatistics',
            name: 'costStatistics',
            component: _import('data/supportFansCost/costStatistics'),
            meta: { title: '成本报表'}
          }
          // {
          //   path: 'costStatisticsFans',
          //   name: 'costStatisticsFans',
          //   component: _import('data/supportFansCost/costStatisticsFans'),
          //   meta: { title: '加粉成本详细', role: ['administrator', 'promotionManager', 'promotionDirector'] }
          // },
          // {
          //   path: 'costStatisticsGoods',
          //   name: 'costStatisticsGoods',
          //   component: _import('data/supportFansCost/costStatisticsGoods'),
          //   meta: { title: '商品成本详细', role: ['administrator', 'promotionManager', 'promotionDirector'] }
          // }
        ]
      }
    ]
  },
  {
    path: '/orders',
    component: Layout,
    name: 'ordersManagement',
    redirect: 'noredirect',
    meta: { title: '订单管理', icon: 'ordersManagement' },
    children: [
      {
        path: 'orders',
        name: 'ordersManage',
        component: _import('orders/orders'),
        meta: { title: '直营订单'}
      },
      {
        path: 'ordersDetail',
        name: 'ordersManage',
        component: _import('orders/ordersDetail'),
        meta: { title: '直营订单详情', hidden: true }
      },
      {
        path: 'secondaryShopOrders',
        name: 'secondaryShopOrders',
        component: _import('orders/secondaryShopOrders'),
        meta: { title: '二类电商订单' }
      },
      {
        path: 'ordersQuery',
        name: 'ordersQuery',
        component: _import('orders/ordersQuery'),
        meta: { title: '直营订单查询' }
      },
      {
        path: 'ordersChangePriceLog',
        name: 'ordersChangePriceLog',
        component: _import('orders/ordersChangePriceLog'),
        meta: { title: '订单改价管理' }
      }
    ]
  },
  {
    path: '/shop',
    component: Layout,
    name: 'shopManagement',
    redirect: 'noredirect',
    meta: { title: '商城管理', icon: 'ordersManagement' },
    children: [

      {
        path: 'orders_shop',
        name: 'ordersShopManage',
        component: _import('orders_shop/orders'),
        meta: { title: '商城订单' }
      },
      {
        path: 'ordersShopDetail',
        name: 'ordersShopDetailManage',
        component: _import('orders_shop/ordersDetail'),
        meta: { title: '商城订单详情', hidden: true }
      },
      {
        path: 'ordersChangePriceApply',
        name: 'ordersChangePriceApply',
        component: _import('orders_shop/ordersChangePriceApply'),
        meta: { title: '商城改价审批' }
      },
      {
        path: 'customer_shop',
        name: 'customerManage',
        component: _import('customer_shop/customer'),
        meta: { title: '直属客户管理' }
      },
      {
        path: 'customer_product_weixin',
        name: 'customerProductWeixinManage',
        component: _import('customer_shop/customer_product_weixin'),
        meta: { title: '微信号设置' }
      },
      {
        path: 'bindCustomer',
        name: 'bindCustomer',
        component: _import('customer_shop/bindCustomer'),
        meta: { title: '绑定商城账号', hidden: true }
      },
      {
        path: 'customerSupport',
        name: 'customerSupport',
        component: _import('customer_shop/customer_support'),
        meta: { title: '绑定客服商城账号' }
      },
      // {
      //   path: 'oerderslist',
      //   name: 'oerderslist',
      //   component: _import('customer_shop/oerderslist'),
      //   meta: { title: '直属客户管理SSS' }
      // }
      {
        path: 'replacePurchase',
        name: 'customerSupport',
        component: _import('customer_shop/replace_purchase'),
        meta: { title: '代购单管理' }
      }
    ]
  },
  {
    path: '/financial',
    component: Layout,
    name: 'financialManagement',
    redirect: 'noredirect',
    meta: { title: '财务管理', icon: 'financialManagement'},
    children: [
      {
        path: 'balance_weixin',
        name: 'wxBalanceManagement',
        component: _import('financial/balance_weixin'),
        meta: { title: '微信余额查询', icon: 'financialTransfer', role: ['administrator'] }
      },
      {
        path: 'financial_weixin',
        name: 'wxFinancialManagement',
        component: _import('financial/financial_weixin'),
        meta: { title: '微信流水管理'}
      },
      {
        path: 'financial_cash',
        name: 'financialCashManagement',
        component: _import('financial/financial_cash'),
        meta: { title: '提现管理'}
      }
    ]
  },
  {
    path: '/productManagement',
    component: Layout,
    name: 'productManagement',
    redirect: 'noredirect',
    meta: { title: '产品管理', icon: 'productGoodsManagement'},
    children: [
      {
        path: 'product_management',
        name: 'productManagement',
        component: _import('product/product_management'),
        meta: { title: '产品管理'}
      },
      {
        path: 'goods_management',
        name: 'goodsManagement',
        component: _import('product/goods_management'),
        meta: { title: '商品管理'}
      },
      {
        path: 'product_cost',
        name: 'productCost',
        component: _import('product/product_cost'),
        meta: { title: '商品成本'}
      },
      {
        path: 'expend',
        name: 'expend',
        component: _import('product/expend'),
        meta: { title: '日消耗查询'}
      },
      {
        path: 'address_management',
        name: 'addressManagement',
        component: _import('product/address_management'),
        meta: { title: '敏感地址管理'}
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    name: 'userManagement',
    redirect: 'noredirect',
    meta: { title: '用户管理', icon: 'MemberManagement', role: ['administrator'] },
    children: [
      // {
      //   path: 'user_department',
      //   name: 'userDepartment',
      //   component: _import('user/user_department'),
      //   meta: { title: '部门管理', icon: 'userDepartment', role: ['administrator'] }
      // },
      {
        path: 'user_group',
        name: 'userGroupManagement',
        component: _import('user/user_group'),
        meta: { title: '小组管理'}
      },
      {
        path: 'user',
        name: 'userManage',
        component: _import('user/user'),
        meta: { title: '用户管理'}
      },
      {
        path: 'role',
        name: 'rolesManagement',
        component: _import('user/user_role'),
        meta: { title: '权限管理'}
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    name: 'systemManagement',
    redirect: 'noredirect',
    meta: { title: '系统管理', icon: 'systemManagement' },
    children: [
      {
        path: '/system/setting',
        name: 'systemSetting',
        redirect: 'noredirect',
        component: _import('system/setting/index'),
        meta: { title: '系统设置', icon: 'dot'},
        children: [
          // {
          //   path: 'global_setting',
          //   name: 'globalSetting',
          //   component: _import('system/setting/global_setting'),
          //   meta: { title: '全局变量设置', role: ['administrator'] }
          // },
          // {
          //   path: 'deliver_address_setting',
          //   name: 'deliverAddressSetting',
          //   component: _import('system/setting/deliver_address_setting'),
          //   meta: { title: '发货仓库设置'}
          // },
          // {
          //   path: 'deliver_address_extre',
          //   name: 'deliverAddressExtre',
          //   component: _import('system/setting/deliver_address_extre'),
          //   meta: { title: '发货额外信息' }
          // },
          {
            path: 'redis_setting',
            name: 'RedisSetting',
            component: _import('system/setting/redis_setting'),
            meta: { title: 'Redis设置', role: ['administrator'] }
          },
          {
            path: 'support_model_time_setting',
            name: 'supportModelTimeSetting',
            component: _import('system/setting/support_model_time_setting'),
            meta: { title: '转号日期设置', role: ['administrator'] }
          },
          {
            path: 'activity_setting',
            name: 'activitySetting',
            component: _import('system/setting/activity_setting'),
            meta: { title: '活动日期设置', role: ['administrator'] }
          },
          {
            path: 'authMenu_setting',
            name: 'AuthMenuSetting',
            component: _import('system/setting/authMenu_setting'),
            meta: { title: '菜单设置', role: ['administrator'] }
          },
          {
            path: 'auth_setting',
            name: 'AuthSetting',
            component: _import('system/setting/auth_setting'),
            meta: { title: '权限设置', role: ['administrator'] }
          },
          {
            path: 'port_setting',
            name: 'PortSetting',
            component: _import('system/setting/port_setting'),
            meta: { title: 'API设置', role: ['administrator'] }
          }
        ]
      },
      // {
      //   path: '/system/tag',
      //   component: _import('system/setting/index'),
      //   name: 'tagManagement',
      //   redirect: 'noredirect',
      //   meta: { title: '标签管理', icon: 'dot', role: ['administrator'] },
      //   children: [
          // {
          //   path: 'tract_tag',
          //   name: 'tractTag',
          //   component: _import('tag/tract_tag/tract_tag'),
          //   meta: { title: '追访标签管理', role: ['administrator'] }
          // },
      //     {
      //       path: 'system_tag',
      //       name: 'systemTag',
      //       component: _import('tag/system_tag/system_tag'),
      //       meta: { title: '标签管理', role: ['administrator'] }
      //     },
      //     {
      //       path: 'tag_type',
      //       name: 'tagType',
      //       component: _import('tag/tag_type/tag_type'),
      //       meta: { title: '标签类型管理', role: ['administrator'] }
      //     }
      //   ]
      // },
      // {
      //   path: 'system/track_setting',
      //   name: 'track_setting',
      //   component: _import('system/tract/track_setting'),
      //   meta: { title: '追访计划', icon: 'form', role: ['administrator'] }
      // },
      // {
      //   path: 'system/protraitSetting',
      //   name: 'protraitSetting',
      //   component: _import('system/protrait/protraitSetting'),
      //   meta: { title: '粉丝画像管理', icon: 'supportPortrayal', role: ['administrator'] }
      // },
      {
        path: 'system/salesLevelManage',
        name: 'salesLevelManage',
        component: _import('system/protrait/salesLevelManage'),
        meta: { title: '销售等级管理', icon: 'supportPortrayal'}
      },{
        path: 'system/CommissionManage',
        name: 'CommissionManage',
        component: _import('system/protrait/CommissionManage'),
        meta: { title: '提成管理', hidden: true, icon: 'supportPortrayal'}
      }
      // {
      //   path: 'system/log_operation',
      //   name: 'logOperation',
      //   component: _import('system/logs/log_operation'),
      //   meta: { title: '日志查询', icon: 'form', role: ['administrator'] }
      // },

    ]
  },
  {
    path: '/user_center',
    component: Layout,
    name: 'userCenter',
    redirect: 'noredirect',
    meta: { title: '用户中心', icon: 'userCenter' },
    children: [
      {
        path: 'user_center/user_info',
        name: 'infoSetting',
        component: _import('user_center/user_info/user_info'),
        meta: { title: '个人信息设置', icon: 'infoSetting' }
      },
      {
        path: 'user_center/action_history',
        name: 'actionHistory',
        component: _import('user_center/action_history/action_history'),
        meta: { title: '操作记录', icon: 'form' }
      },
      {
        path: 'user_center/message_notification',
        name: 'messageNotification',
        component: _import('user_center/message_notification/message_notification'),
        meta: { title: '消息通知', icon: 'form' }
      },
      {
        path: 'user_center/integral_query',
        name: 'integralQuery',
        component: _import('user_center/integral_query/integral_query'),
        meta: { title: '积分查询', icon: 'integralQuery' }
      }
    ]
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

