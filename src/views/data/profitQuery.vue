<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-date-picker
        class="filter-item"
        v-model="listQuery.date_range"
        type="daterange"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        align="right"
        unlink-panels
        range-separator="~"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleFilter"
      >
      </el-date-picker>
      <el-select
        class="filter-item"
        style="width: 150px"
        @focus="getSupportUserAccountList(' ')"
        @change='handleFilter'
        v-model="listQuery.support_user_account_id"
        clearable
        filterable
        remote
        placeholder="客服"
        :remote-method="getSupportUserAccountList"
        :loading="supportUserAccountLoading">
        <el-option
          v-for="item in supportUserAccountOptions"
          :key="item.id"
          :label="item.nickname"
          :value="item.id">
        </el-option>
      </el-select>
      <div class="filter-item">
        <el-input @keyup.enter.native="handleFilter" placeholder="商城订单号"
                  style="width: 400px;"
                  v-model="listQuery.orders_shop_unique_id">
        </el-input>
      </div>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row style="width: 100%">
      <el-table-column min-width="50px" align="center" label="所属客服">
        <template slot-scope="scope">
          <span v-if="scope.row.customer_shop_support !== null && scope.row.customer_shop_support.support_member !== null">{{scope.row.customer_shop_support.support_member.nickname}}<br>({{scope.row.customer_shop_support.support_member.user_account_group.group_name}})</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="商城订单号">
        <template slot-scope="scope">
          <span class="link-type" v-if="scope.row.orders_shop !== null">{{scope.row.orders_shop.orders_shop_unique_id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="分佣商品">
        <template slot-scope="scope">
          <span>{{scope.row.goods_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="30px" align="center" label="商品数量">
        <template slot-scope="scope">
          <span>{{scope.row.number}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="佣金金额">
        <template slot-scope="scope">
          <span style="color:red;font-size: 16px;">￥{{scope.row.profit}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="生效时间" min-width="100px">
        <template slot-scope="scope">
          <span>{{scope.row.join_time}}</span>
          <el-tag style="font-size:14px;" class="smalltag" :type="scope.row.status | statusFilter">{{scope.row.effective_until}}</el-tag>
        </template>
      </el-table-column>
      <!--<el-table-column min-width="100px" align="center" label="备注名">-->
        <!--<template slot-scope="scope">-->
          <!--<span class="link-type">{{scope.row.product_weixin.info}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column min-width="100px" align="center" label="产品名称">-->
        <!--<template slot-scope="scope">-->
          <!--<span class="link-type">{{scope.row.product.product_name}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column min-width="100px" align="center" label="推广人">-->
        <!--<template slot-scope="scope">-->
          <!--<span class="link-type">{{scope.row.promotion_member.nickname}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column min-width="100px" align="center" label="客服">-->
        <!--<template slot-scope="scope">-->
          <!--<span class="link-type">{{scope.row.support_member.nickname}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column min-width="100px" align="center" label="渠道" v-if="($store.state.user.roles === 'administrator') || ($store.state.user.roles === 'promotionManager') || ($store.state.user.roles === 'promotion')|| ($store.state.user.roles === 'promotionDirector')">-->
        <!--<template slot-scope="scope">-->
          <!--<span class="link-type">{{scope.row.promotion_channel.channel_name}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column width="100px" align="center" label="加粉数">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{scope.row.add_count}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column width="100px" align="center" label="客户微信数">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{scope.row.actual_add_count}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column width="100px" align="center" label="咨询数">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{scope.row.consult_count}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column width="100px" align="center" label="咨询率">-->
        <!--<template slot-scope="scope">-->
          <!--<span v-if="scope.row.add_count > 0">{{Math.round(scope.row.consult_count / scope.row.add_count*100)}}%</span>-->
          <!--<span v-else>0%</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>
<script>
  // import { getProductWeixinList } from '@/api/product_weixin'
  import { getUserAccountList } from '@/api/user'
  import { getPromotionMemberList } from '@/api/promotion_member'
  import { getSupportMemberList } from '@/api/support_member'
  import { getPromotionChannelList } from '@/api/promotion_channel'
  import { getProductList } from '@/api/product'
  import { getSalesShopCustomerProfitList } from '@/api/shop_statistics'
  import waves from '@/directive/waves' // 水波纹指令
  import { parseTime } from '@/utils/index'
  export default {
    name: 'addFansData',
    components: { },
    directives: {
      waves
    },
    data() {
      return {
        scrollTop: 0,
        tableKey: 0,
        list: null,
        total: null,
        listLoading: false,
        listQuery: {
          page: 1,
          page_size: 20,
          promotion_user_account_id: undefined,
          support_user_account_id: undefined,
          promotion_channel_id: undefined,
          product_id: undefined,
          date_range: undefined,
          orders_shop_unique_id: undefined
        },
        addFansTime: {
          page: 1,
          page_size: 20,
          support_user_account_id: undefined,
          join_time: new Date(),
          sort: '-id'
        },
        promotionUserAccountLoading: false,
        promotionUserAccountOptions: [],
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        productLoading: false,
        userAccountLoading: false,
        userPromotionChannelLoading: false,
        addFansCount: false,
        add_count_total: 0,
        actual_add_count_total: 0,
        consult_count_total: 0,
        productOptions: [],
        userAccountOptions: [],
        userChannelOptions: [],
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          '1': 'primary',
          '2': 'success',
          '3': 'info'
        }
        return statusMap[status]
      },
      timeIntervalTranslator(status) {
        const statusTransMap = {
          '0': '休',
          '1': '白',
          '2': '晚'
        }
        return statusTransMap[status]
      }
    },
    created() {
      this.getProductList(' ')
      this.getUserChannelList(' ')
      // this.getAddFansCountInfo()
    },
    methods: {
      getList() {
        this.listLoading = true
        this.addFansCount = true
        getSalesShopCustomerProfitList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
      },
      // getAddFansCountInfo() {
      //   queryDateAddFansList({}).then(response => {
      //     this.add_count_total = response.data.add_count_total
      //     this.consult_count_total = response.data.consult_count_total
      //   })
      // },
      handleSizeChange(val) {
        this.listQuery.page_size = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      getPromotionUserAccountList(query) {
        if (query !== '') {
          this.promotionUserAccountLoading = true
          getPromotionMemberList({ nickname: query, status: 1 }).then(response => {
            this.promotionUserAccountOptions = response.data.data
            this.promotionUserAccountLoading = false
          })
        }
      },
      getSupportUserAccountList(query) {
        if (query !== '') {
          this.supportUserAccountLoading = true
          getSupportMemberList({ nickname: query, status: 1 }).then(response => {
            this.supportUserAccountOptions = response.data.data
            this.supportUserAccountLoading = false
          })
        }
      },
      getUserChannelList(query) {
        if (query !== '') {
          this.userPromotionChannelLoading = true
          getPromotionChannelList({ channel_name: query }).then(response => {
            this.userChannelOptions = response.data.data
            this.userPromotionChannelLoading = false
          })
        }
      },
      getProductList(query) {
        if (query !== '') {
          this.productLoading = true
          getProductList({ product_name: query, is_promote: 1 }).then(response => {
            this.productOptions = response.data.data
            this.productLoading = false
          })
        }
      }
    }
  }
</script>
