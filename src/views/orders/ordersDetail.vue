<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-button class="filter-item" type="danger" v-waves @click="handleBack" size="small">返回</el-button>
    </div>
    <div>
      <el-card>
        <div slot="header" class="clearfix">
          <span>订单详情</span>
        </div>
        <h4>基本信息</h4>
        <p class="data-items">
          出单客服: {{ temp.support_member.nickname }}
        </p>
        <p class="data-items">
          出单微信号: {{ temp.product_weixin.info + '(' + temp.product_weixin.weixin_account + ')' }}
        </p>
        <p class="data-items">
          加粉时间: {{ temp.fans_join_time.slice(0,10) }}
        </p>
        <h4>客户信息</h4>
        <p class="data-items">
          姓名: {{ temp.orders_receiver_info.receive_name }}
        </p>
        <p class="data-items">
          电话: {{ temp.orders_receiver_info.phone }}
        </p>
        <p class="data-items">
          收货地址: {{ temp.orders_receiver_info.province_name + temp.orders_receiver_info.city_name + (temp.orders_receiver_info.district_name !== undefined ? temp.orders_receiver_info.district_name : '') + temp.orders_receiver_info.address}}
        </p>
        <h4>商品明细 <span v-if="temp.orders_warehouse">({{temp.orders_warehouse.name}})</span></h4>
        <p v-for="item in temp.orders_items"  class="data-items">
          {{item.product_goods.goods_name}} x {{item.number}}
          <span v-if="item.product_goods.unit !== '0' && item.product_goods.unit !== null">({{item.product_goods.unit}})</span>
        </p>
        <h4>支付明细 (订单总额:{{temp.actual_pay}})</h4>
        <p v-for="item in temp.orders_payment.orders_payment_items" v-if="item.status !== 2"  class="data-items">
          {{item.orders_pay_type.type_name}}: {{item.paid_money}}
        </p>
      </el-card>
    </div>
  </div>
</template>

<script>
  import { getOrdersInfo } from '@/api/orders'
  import waves from '@/directive/waves' // 水波纹指令
  export default {
    name: 'ordersDetail',
    components: {},
    directives: {
      waves
    },
    data() {
      return {
        listQuery: {
          orders_id: undefined
        },
        temp: { }
      }
    },
    computed: {},
    filters: {
      paymentItemStatusFilter(status) {
        const statusMap = {
          0: 'info',
          1: 'success',
          2: 'danger',
          3: ''
        }
        return statusMap[status]
      },
      orderStatusTranslator(status) {
        const statusMap = {
          0: '无效订单',
          1: '未确认',
          2: '待发货',
          3: '发货中',
          4: '断货中',
          5: '已签收',
          6: '已拒收',
          7: '已完成',
          8: '已退回',
          9: '废弃',
          10: '已退款'
        }
        return statusMap[status]
      }
    },
    created() {
      this.listQuery.orders_id = this.$route.query.orders_id
      this.getList()
    },
    methods: {
      getList() {
        getOrdersInfo(this.listQuery).then(response => {
          this.temp = response.data
        })
      },
      handleBack() {
        this.$router.back()
      }
    },
    deactivated() {
      this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    },
    activated() {
      window.scrollTo(0, this.scrollTop)
    }
  }
</script>
<style scoped>
  .grid-content {
    text-align: left;
    background-color:#edf2f9;
    color:#323233;
    padding: 15px 25px;
  }
  .filtered {
    -webkit-filter: url(#f1);
    filter: url(#f1);
  }
  .red-circle {
    width:6px;
    height:6px;
    background-color:red;
    display:inline-block;
    border-radius:100%;
  }
</style>
