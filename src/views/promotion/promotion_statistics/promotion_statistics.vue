<template xmlns="http://www.w3.org/1999/html">
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-date-picker
        v-show="listQuery.query_type_date"
        class="filter-item"
        v-model="listQuery.date_range"
        style="width: 250px"
        type="daterange"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        align="right"
        unlink-panels
        range-separator="~"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions2"
        @change='handleFilter'>
      </el-date-picker>
      <el-date-picker
        v-show="!listQuery.query_type_date"
        format="yyyy-MM"
        style="width: 150px"
        value-format="yyyy-MM"
        v-model="listQuery.month"
        class="filter-item"
        align="bottom"
        type="month"
        placeholder="选择月份"
        @change='handleFilter'>
      </el-date-picker>
      <el-select
        class="filter-item"
        v-show="activeName === 'promotionMember'"
        style="width:150px;"
        @change='handleFilter2'
        v-model="listQuery.promotion_user_account_group_id"
        filterable
        clearable
        remote
        placeholder="请选择推广部门"
        :remote-method="getGroupList"
        >
        <el-option
          v-for="item in userGroupOptions"
          :key="item.id"
          :label="item.group_name"
          :value="item.id">
        </el-option>
      </el-select>
      <el-select
        class="filter-item"
        v-show="activeName === 'promotionMember'"
        style="width:120px;"
        @change='handleFilter'
        v-model="listQuery.promotion_user_account_id"
        filterable
        clearable
        remote
        placeholder="选择推广人"
        :remote-method="getPromotionUserAccountList"
        :loading="promotionUserAccountLoading">
        <el-option
          v-for="item in promotionUserAccountOptions"
          :key="item.id"
          :label="item.nickname"
          :value="item.id">
        </el-option>
      </el-select>
      <el-select
        class="filter-item"
        v-show="activeName === 'promotionMember'"
        @change='handleFilter'
        v-model="listQuery.channel_ids"
        multiple
        filterable
        style="width: 120px"
        remote
        placeholder="请选择渠道"
        :remote-method="getUserChannelList"
        :loading="userPromotionChannelLoading">
        <el-option
          v-for="item in userChannelOptions"
          :key="item.id"
          :label="item.channel_name"
          :value="item.id">
        </el-option>
      </el-select>
      <el-select class="filter-item"
                 @change='handleFilter'
                 v-show="activeName === 'promotionMember'"
                 v-model="listQuery.product_ids"
                 multiple
                 @focus="getProductList(' ')"
                 style="width: 120px"
                 filterable
                 remote
                 placeholder="请选择商品"
                 :remote-method="getProductList"
                 :loading="productLoading">
        <el-option v-for="item in productOptions"
                   :key="item.id"
                   :label="item.product_name"
                   :value="item.id">
        </el-option>
      </el-select>
      <!--<el-select-->
        <!--class="filter-item"-->
        <!--style="width:120px;"-->
        <!--@change='handleFilter'-->
        <!--v-model="listQuery.product_id"-->
        <!--filterable-->
        <!--clearable-->
        <!--remote-->
        <!--placeholder="请选择产品"-->
        <!--:remote-method="getProductList"-->
        <!--:loading="productSelectLoading">-->
        <!--<el-option-->
          <!--v-for="item in productSelectOptions"-->
          <!--:key="item.id"-->
          <!--:label="item.product_name"-->
          <!--:value="item.id">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <!--<el-select-->
        <!--class="filter-item"-->
        <!--style="width:150px;"-->
        <!--v-show="activeName === 'promotionMember'"-->
        <!--@change='handleFilter'-->
        <!--@focus="getPromotionChannel(' ')"-->
        <!--v-model="listQuery.channel_id"-->
        <!--filterable-->
        <!--clearable-->
        <!--remote-->
        <!--placeholder="请选择渠道"-->
        <!--:remote-method="getPromotionChannel"-->
        <!--:loading="promotionChannelLoading">-->
        <!--<el-option-->
          <!--v-for="item in promotionChannelOptions"-->
          <!--:key="item.id"-->
          <!--:label="item.channel_name"-->
          <!--:value="item.id">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <el-button  class="filter-item" type="primary" v-if="list.length > 0" icon="el-icon-download" @click="exportExcel">导出Excel</el-button>
      <div style="float: right">
        <el-switch
          @change="handleQueryTypeChange"
          style="display: block;margin-bottom: 4px"
          v-model="listQuery.query_type_date"
          active-color="#409EFF"
          inactive-color="#409EFF"
          active-text="日数据"
          inactive-text="月数据">
        </el-switch>
        <el-switch
          @change="handleQueryTypeChange"
          style="display: block;"
          v-model="listQuery.filter_type"
          active-color="#409EFF"
          inactive-color="#409EFF"
          active-text="筛除空数据"
          inactive-text="全部数据">
        </el-switch>
      </div>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClickTab" type="border-card">
      <el-tab-pane label="渠道报表" name="promotionChannel">
        <el-table id="promotionChannel" show-summary :summary-method="getPromotionChannelSummaries" :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
                  style="width: 100%">
          <el-table-column align="center" label="渠道" min-width="100">
            <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.promotion_channel.channel_name}}
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'咨询率\n(咨询数/新加好友数)'" min-width="145">
            <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">
                {{Math.round(scope.row.new_fans_consult/scope.row.new_fans*100)}}%
              </span>
              <span v-else>0%</span>
              <br/>
              <span>
                ({{scope.row.new_fans_consult + '/' +scope.row.new_fans}})
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="加粉成本" min-width="80">
            <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">￥{{Math.round(scope.row.channel_consumption_total / scope.row.new_fans *100)/100}}</span>
              <span v-else>￥0</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="消费" min-width="100">
            <template slot-scope="scope">
              <span>￥{{Math.round(scope.row.channel_consumption_total*100) / 100}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="订单数" min-width="65">
            <template slot-scope="scope">
              <span>{{scope.row.orders_count}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'新粉\n订单数'" min-width="85">
            <template slot-scope="scope">
              <span>{{scope.row.new_fans_orders_count}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'新粉\n订单金额'" min-width="85">
            <template slot-scope="scope">
              <span>￥{{scope.row.new_fans_orders_sales}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'新客户\n订单金额\n(占比)'" min-width="95">
            <template slot-scope="scope">
              <span v-if="scope.row.orders_count > 0">
                ￥{{scope.row.new_fans_orders_sales}}
                <br/>
                ({{Math.round(scope.row.new_fans_orders_sales / scope.row.orders_sales * 100)}}%)
              </span>
              <span v-else>￥0<br/>(0%)</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'复购客户\n订单金额\n(占比)'" min-width="95">
            <template slot-scope="scope">
              <span v-if="scope.row.orders_count > 0">
                ￥{{scope.row.repurchase_fans_orders_sales}}
                <br/>
                ({{Math.round(scope.row.repurchase_fans_orders_sales / scope.row.orders_sales * 100)}}%)
              </span>
              <span v-else>￥0<br/>(0%)</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="客单价" min-width="90">
            <template slot-scope="scope">
              <span v-if="scope.row.orders_count > 0">￥{{Math.round(scope.row.orders_sales / scope.row.orders_count * 100)/100}}</span>
              <span v-else>￥0.00</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="订单总额" min-width="90">
            <template slot-scope="scope">
              <span>￥{{scope.row.orders_sales}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'当日\n成单金额\n(性价比)'" min-width="100">
            <template slot-scope="scope">
              <span>￥{{scope.row.same_day_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{ Math.round(scope.row.same_day_fans_orders_sales/scope.row.channel_consumption_total*100)/100 }})
              </span>
              <span v-else>(0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'当月\n成单金额\n(性价比)'" min-width="100">
            <template slot-scope="scope">
              <span>￥{{scope.row.this_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round(scope.row.this_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100 }})
              </span>
              <span v-else>(0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'后第一个月\n成单金额\n(性价比)'" min-width="110">
            <template slot-scope="scope">
              <span>￥{{scope.row.later_first_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{ Math.round(scope.row.later_first_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100 }})
              </span>
              <span v-else>(0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'后第二个月\n成单金额\n(性价比)'" min-width="110">
            <template slot-scope="scope">
              <span>￥{{scope.row.later_second_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{ Math.round(scope.row.later_second_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>(0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'后第三个月\n成单金额\n(性价比)'" min-width="110">
            <template slot-scope="scope">
              <span>￥{{scope.row.later_third_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{ Math.round(scope.row.later_third_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>(0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'四个月内\n成单金额\n(性价比)'" min-width="110">
            <template slot-scope="scope">
              <span>￥{{scope.row.ninety_days_fans_orders_sales + scope.row.this_month_fans_orders_sales }}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{ Math.round((scope.row.ninety_days_fans_orders_sales + scope.row.this_month_fans_orders_sales) /scope.row.channel_consumption_total*100)/100}})</span>
              <span v-else>(0)</span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="产品报表" name="product">
        <el-table
          id="product"
          stripe
          :span-method="objectSpanProductMethod"
          :key='tableKey'
          :data="productStatisticsDataList"
          v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
          style="width: 100%">
          <el-table-column align="center" label="产品" min-width="65">
            <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.product_name}}
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="渠道" min-width="65">
            <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.channel_name}}
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'咨询率\n咨询数/新加好友数'" min-width="135">
            <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">{{Math.round(scope.row.new_fans_consult/scope.row.new_fans*100)}}%</span>
              <span v-else>0%</span>
              <br/>
              <span>({{scope.row.new_fans_consult}} / {{scope.row.new_fans}})</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="加粉成本" min-width="85">
            <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">￥{{Math.round(scope.row.channel_consumption_total / scope.row.new_fans *100)/100}}</span>
              <span v-else>￥0</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="消费" min-width="100">
            <template slot-scope="scope">
              <span>￥{{Math.round(scope.row.channel_consumption_total*100) / 100}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="订单数" min-width="65">
            <template slot-scope="scope">
              <span>{{scope.row.orders_count}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'新粉\n订单数'" min-width="75">
            <template slot-scope="scope">
              <span>{{scope.row.new_fans_orders_count}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'新粉\n订单金额'" min-width="75">
            <template slot-scope="scope">
              <span>{{scope.row.new_fans_orders_sales}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'新客户\n订单金额\n(占比)'" min-width="85">
            <template slot-scope="scope">
              <span v-if="scope.row.orders_count > 0">
                ￥{{scope.row.new_fans_orders_sales}}<br/>
                ({{Math.round(scope.row.new_fans_orders_sales / scope.row.orders_sales * 100)}}%)
              </span>
              <span v-else>
                ￥0<br/>(0%)
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'复购客户\n订单金额\n(占比)'" min-width="85">
            <template slot-scope="scope">
              <span v-if="scope.row.orders_count > 0">
                ￥{{scope.row.repurchase_fans_orders_sales}}<br/>
                ({{Math.round(scope.row.repurchase_fans_orders_sales / scope.row.orders_sales * 100)}}%)
              </span>
              <span v-else>
                ￥0<br/>(0%)
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="客单价" min-width="90">
            <template slot-scope="scope">
              <span v-if="scope.row.orders_count > 0">￥{{Math.round(scope.row.orders_sales / scope.row.orders_count * 100)/100}}</span>
              <span v-else>￥0.00</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="订单总额" min-width="120">
            <template slot-scope="scope">
              <span>￥{{scope.row.orders_sales.toFixed(2)}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'当日成单金额\n(性价比)'" min-width="85">
            <template slot-scope="scope">
              <span>￥{{scope.row.same_day_fans_orders_sales}}</span><br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round(scope.row.same_day_fans_orders_sales / scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>
                (0)
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'当月成单金额\n(性价比)\n(转化率)'" min-width="100">
            <template slot-scope="scope">
              <span>￥{{scope.row.this_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round(scope.row.this_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>
                (0)
              </span>
              <br/>
              <span v-if="scope.row.new_fans > 0">
                ({{Math.round(scope.row.this_month_fans_orders_count / scope.row.new_fans * 10000)/100.00}}%)
              </span>
              <span v-else>
                (0%)
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'后第一个月\n成单金额\n(性价比)\n(转化率)'" min-width="100">
            <template slot-scope="scope">
              <span>￥{{scope.row.later_first_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round(scope.row.later_first_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>
                (0)
              </span>
              <br/>
              <span v-if="scope.row.new_fans > 0">
                ({{Math.round(scope.row.later_first_month_fans_orders_count / scope.row.new_fans*10000)/100.00}}%)
              </span>
              <span v-else>
                (0%)
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'后第二个月\n成单金额\n(性价比)\n(转化率)'" min-width="100">
            <template slot-scope="scope">
              <span>￥{{scope.row.later_second_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round(scope.row.later_second_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>
                (0)
              </span>
              <br/>
              <span v-if="scope.row.new_fans > 0">
                ({{Math.round(scope.row.later_second_month_fans_orders_count / scope.row.new_fans*10000)/100.00}}%)
              </span>
              <span v-else>
                (0%)
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'后第三个月\n成单金额\n(性价比)\n(转化率)'" min-width="100">
            <template slot-scope="scope">
              <span>￥{{scope.row.later_third_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round(scope.row.later_third_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>
                (0)
              </span>
              <br/>
              <span v-if="scope.row.new_fans > 0">
                ({{Math.round(scope.row.later_third_month_fans_orders_count/scope.row.new_fans*10000)/100.00}}%)
              </span>
              <span v-else>
                (0%)
              </span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'四个月内\n成单金额\n(性价比)\n(转化率)'" min-width="100">
            <template slot-scope="scope">
              <span>￥{{scope.row.ninety_days_fans_orders_sales + scope.row.this_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round((scope.row.ninety_days_fans_orders_sales + scope.row.this_month_fans_orders_sales)/scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>
                (0)
              </span>
              <br/>
              <span v-if="scope.row.new_fans > 0">
                ({{Math.round((scope.row.ninety_days_fans_orders_count + scope.row.this_month_fans_orders_count) /scope.row.new_fans*10000)/100.00}}%)
              </span>
              <span v-else>
                (0%)
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="人员报表" name="promotionMember">
        <el-table stripe
                  id="promotionMember"
                  :span-method="objectSpanPromotionMemberMethod"
                  :key='tableKey'
                  show-summary
                  :summary-method="getPromotionChannelSummaries3"
                  :data="promotionMemberStatisticsDataList"
                  v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
                  style="width: 100%">
          <el-table-column align="center" label="推广人" min-width="100">
            <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.nickname}}
              </span>
              <br/>
              <span>
                ({{scope.row.group_name}})
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="渠道" min-width="65">
            <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.channel_name}}
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="产品" min-width="65">
            <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.product_name}}
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'咨询率\n(咨询数/新加好友数)'" min-width="150">
            <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">{{Math.round(scope.row.new_fans_consult/scope.row.new_fans*100)}}%</span>
              <span v-else>0%</span>
              <br/>
              <span>
                ({{scope.row.new_fans_consult}} / {{scope.row.new_fans}})
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="加粉成本" min-width="80">
            <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">￥{{Math.round(scope.row.channel_consumption_total / scope.row.new_fans *100)/100}}</span>
              <span v-else>￥0</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="消费" min-width="110">
            <template slot-scope="scope">
              <span>￥{{Math.round(scope.row.channel_consumption_total*100) / 100}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="订单数" min-width="65">
            <template slot-scope="scope">
              <span>{{scope.row.orders_count}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="新粉订单数" min-width="65">
            <template slot-scope="scope">
              <span>{{scope.row.new_fans_orders_count}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="新粉订单金额" min-width="80">
            <template slot-scope="scope">
              <span>¥{{scope.row.new_fans_orders_sales}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'新客户订单金额\n(占比)'" min-width="130">
            <template slot-scope="scope">
              <span v-if="scope.row.orders_count > 0">
                ￥{{scope.row.new_fans_orders_sales}}
                <br/>
                ({{Math.round(scope.row.new_fans_orders_sales / scope.row.orders_sales * 100)}}%)</span>
              <span v-else>￥0<br/>(0%)</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'复购客户订单金额\n(占比)'" min-width="130">
            <template slot-scope="scope">
              <span v-if="scope.row.orders_count > 0">
                ￥{{scope.row.repurchase_fans_orders_sales}}
                <br/>
                ({{Math.round(scope.row.repurchase_fans_orders_sales / scope.row.orders_sales * 100)}}%)</span>
              <span v-else>￥0<br/>(0%)</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="客单价" min-width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.orders_count > 0">￥{{Math.round(scope.row.orders_sales / scope.row.orders_count * 100)/100}}</span>
              <span v-else>￥0.00</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="订单总额" min-width="85">
            <template slot-scope="scope">
              <span>￥{{scope.row.orders_sales}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="'当日成单金额\n(性价比)'" min-width="85">
            <template slot-scope="scope">
              <span>￥{{scope.row.same_day_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round(scope.row.same_day_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>(0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'当月成单金额\n(性价比)'" min-width="85">
            <template slot-scope="scope">
              <span>￥{{scope.row.this_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                  ({{Math.round(scope.row.this_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>(0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'后第一个月\n成单金额\n(性价比)'" min-width="95">
            <template slot-scope="scope">
              <span>￥{{scope.row.later_first_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">({{Math.round(scope.row.later_first_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})</span>
              <span v-else>(0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'后第二个月\n成单金额\n(性价比)'" min-width="95">
            <template slot-scope="scope">
              <span>￥{{scope.row.later_second_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round(scope.row.later_second_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})</span>
              <span v-else>
                (0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'后第三个月\n成单金额\n(性价比)'" min-width="95">
            <template slot-scope="scope">
              <span>￥{{scope.row.later_third_month_fans_orders_sales}}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round(scope.row.later_third_month_fans_orders_sales/scope.row.channel_consumption_total*100)/100}})</span>
              <span v-else>
                (0)</span>
            </template>
          </el-table-column>
          <el-table-column v-if="listQuery.query_type_date === false" align="center" :label="'四个月内\n成单金额\n(性价比)'" min-width="95">
            <template slot-scope="scope">
              <span>￥{{scope.row.ninety_days_fans_orders_sales + scope.row.this_month_fans_orders_sales }}</span>
              <br/>
              <span v-if="scope.row.channel_consumption_total > 0">
                ({{Math.round((scope.row.ninety_days_fans_orders_sales + scope.row.this_month_fans_orders_sales) /scope.row.channel_consumption_total*100)/100}})
              </span>
              <span v-else>
                (0)
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import { getPromotionChannelStatisticsData, getPromotionMemberStatistics, getProductStatistics } from '@/api/promotion_statistics'
  import { getUserAccountGroupList } from '@/api/user_group'
  import { getUserAccountGroupTeamList } from '@/api/user_group_team'
  import { getUserAccountList } from '@/api/user'
  import { getProductList } from '@/api/product'
  import { getPromotionChannelList } from '@/api/product_weixin'
  import { parseTime } from '@/utils'
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'promotionReports',
    components: { },
    directives: {
      waves
    },
    data() {
      return {
        scrollTop: 0,
        tableKey: 0,
        list: [],
        channelStatisticsDataList: [],
        promotionMemberStatisticsDataList: [],
        productStatisticsDataList: [],
        userChannelOptions: [],
        productOptions: [],
        productLoading: false,
        userPromotionChannelLoading: false,
        total: null,
        listLoading: true,
        PromotionUserSelect: false,
        listQuery: {
          query_type_date: true,
          filter_type: true,
          channel_ids: [],
          product_ids: [],
          promotion_user_account_group_id: undefined,
          promotion_user_account_id: undefined,
          month: parseTime(new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 30)), '{y}-{m}'),
          date_range: [
            parseTime(new Date(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000)), '{y}-{m}-{d}'),
            parseTime(new Date(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000)), '{y}-{m}-{d}')
          ]
        },
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: [{ label: '冻结', key: 0 }, { label: '开启', key: 1 }, { label: '告警', key: 2 }],
        showAuditor: false,
        temp: {
          id: undefined
        },
        sliceDateArray: [],
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        userGroupOptions: [],
        promotionUserAccountOptions: [],
        userGroupTeamOptions: [],
        userAccountOptions: [],
        userAccountLoading: false,
        promotionUserAccountLoading: false,
        activeName: 'promotionChannel',
        productTabSelected: false,
        pickerOptions2: {
          activityDate: time => {
            const tempactivity = time.getFullYear() + '-' + this.prefixInteger(time.getMonth() + 1, 2) + '-' + this.prefixInteger(time.getDate(), 2)
            return this.$store.state.activity.activityDate.indexOf(tempactivity) > -1
          },
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }]
        },
        countProductNumber: [],
        countProductIndex: [],
        countPromotionMemberNumber: [],
        countPromotionMemberIndex: [],
        productSelectOptions: [],
        productSelectLoading: false,
        promotionChannelLoading: false,
        promotionChannelOptions: []
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: 'gray',
          1: 'success',
          2: 'danger'
        }
        return statusMap[status]
      },
      statusTranslator(status) {
        const statusTransMap = {
          0: '冻结',
          1: '开启',
          2: '告警'
        }
        return statusTransMap[status]
      }
    },
    created() {
      this.getList()
      this.getGroupList()
      this.getPromotionUserAccountList(' ')
      this.getUserChannelList(' ')
    },
    computed: {
      getPromotionChannelSumData: function() {
        const sums = []
        const innerTempData = {
          orders_sales: 0,
          channel_consumption_total: 0,
          new_fans: 0,
          new_fans_consult: 0,
          orders_count: 0,
          orders_reject_count: 0,
          repurchase_fans_orders_sales: 0,
          same_day_fans_orders_sales: 0,
          this_month_fans_orders_sales: 0,
          later_first_month_fans_orders_sales: 0,
          later_second_month_fans_orders_sales:	0,
          later_third_month_fans_orders_sales: 0,
          ninety_days_fans_orders_sales:	0,
          new_fans_orders_count: 0,
          new_fans_orders_sales: 0
        }
        for (const v of this.list) {
          innerTempData.orders_sales += parseFloat(v.orders_sales)
          innerTempData.channel_consumption_total += parseFloat(v.channel_consumption_total)
          innerTempData.new_fans += parseInt(v.new_fans)
          innerTempData.new_fans_consult += parseInt(v.new_fans_consult)
          innerTempData.orders_count += parseInt(v.orders_count)
          innerTempData.orders_reject_count += parseInt(v.orders_reject_count)
          innerTempData.new_fans_orders_sales += parseFloat(v.new_fans_orders_sales)
          innerTempData.repurchase_fans_orders_sales += parseFloat(v.repurchase_fans_orders_sales)
          innerTempData.same_day_fans_orders_sales += parseFloat(v.same_day_fans_orders_sales)
          innerTempData.this_month_fans_orders_sales += parseFloat(v.this_month_fans_orders_sales)
          innerTempData.later_first_month_fans_orders_sales += parseFloat(v.later_first_month_fans_orders_sales)
          innerTempData.later_second_month_fans_orders_sales += parseFloat(v.later_second_month_fans_orders_sales)
          innerTempData.later_third_month_fans_orders_sales += parseFloat(v.later_third_month_fans_orders_sales)
          innerTempData.ninety_days_fans_orders_sales += parseFloat(v.ninety_days_fans_orders_sales + v.orders_sales)
          innerTempData.new_fans_orders_count += parseFloat(v.new_fans_orders_count)
        }
        sums[0] = '合计'
        let consultRate = 0
        let costPerFans = 0.00
        let newConsumptionOrdersPercentage = 0
        let repurchaseConsumptionOrdersPercentage = 0
        let perConsumerOrderPrice = 0
        let sameDayPerformance = 0
        let sameMonthPerformance = 0
        let laterFirstMonthPerformance = 0
        let laterSecondMonthPerformance = 0
        let laterThirdMonthPerformance = 0
        let laterFourMonthPerformance = 0
        let later_four_fans_orders_sales = 0
        later_four_fans_orders_sales = innerTempData.ninety_days_fans_orders_sales + innerTempData.this_month_fans_orders_sales
        if (innerTempData.new_fans > 0) {
          consultRate = Math.round(innerTempData.new_fans_consult / innerTempData.new_fans * 100)
        }
        if (innerTempData.orders_sales > 0) {
          newConsumptionOrdersPercentage = Math.round(innerTempData.new_fans_orders_sales / innerTempData.orders_sales * 100)
          repurchaseConsumptionOrdersPercentage = Math.round(innerTempData.repurchase_fans_orders_sales / innerTempData.orders_sales * 100)
        }
        if (innerTempData.orders_count > 0) {
          perConsumerOrderPrice = Math.round(innerTempData.orders_sales / innerTempData.orders_count * 100) / 100
          costPerFans = Math.round(innerTempData.channel_consumption_total / innerTempData.new_fans * 100) / 100
        }
        if (innerTempData.channel_consumption_total > 0) {
          sameDayPerformance = Math.round(innerTempData.same_day_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          sameMonthPerformance = Math.round(innerTempData.this_month_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          laterFirstMonthPerformance = Math.round(innerTempData.later_first_month_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          laterSecondMonthPerformance = Math.round(innerTempData.later_second_month_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          laterThirdMonthPerformance = Math.round(innerTempData.later_third_month_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          laterFourMonthPerformance = Math.round(later_four_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
        }
        sums[1] = consultRate + '%' + '(' + innerTempData.new_fans_consult + ' / ' + innerTempData.new_fans + ' ) '
        sums[2] = '￥' + costPerFans
        sums[3] = '￥' + Math.round(innerTempData.channel_consumption_total * 100) / 100
        sums[4] = innerTempData.orders_count
        sums[5] = innerTempData.new_fans_orders_count
        sums[6] = '￥' + innerTempData.new_fans_orders_sales
        sums[7] = '￥' + innerTempData.new_fans_orders_sales + '(' + newConsumptionOrdersPercentage + '%)'
        sums[8] = '￥' + innerTempData.repurchase_fans_orders_sales + '(' + repurchaseConsumptionOrdersPercentage + '%)'
        sums[9] = '￥' + perConsumerOrderPrice
        sums[10] = '￥' + innerTempData.orders_sales
        sums[11] = '￥' + innerTempData.same_day_fans_orders_sales + '(' + sameDayPerformance + ')'
        sums[12] = '￥' + innerTempData.this_month_fans_orders_sales + '(' + sameMonthPerformance + ')'
        sums[13] = '￥' + innerTempData.later_first_month_fans_orders_sales + '(' + laterFirstMonthPerformance + ')'
        sums[14] = '￥' + innerTempData.later_second_month_fans_orders_sales + '(' + laterSecondMonthPerformance + ')'
        sums[15] = '￥' + innerTempData.later_third_month_fans_orders_sales + '(' + laterThirdMonthPerformance + ')'
        sums[16] = '￥' + later_four_fans_orders_sales + '(' + laterFourMonthPerformance + ')'
        return sums
      },
      getPromotionChannelSumData3: function() {
        const sums = []
        const innerTempData = {
          orders_sales: 0,
          channel_consumption_total: 0,
          new_fans: 0,
          new_fans_consult: 0,
          orders_count: 0,
          orders_reject_count: 0,
          repurchase_fans_orders_sales: 0,
          same_day_fans_orders_sales: 0,
          this_month_fans_orders_sales: 0,
          later_first_month_fans_orders_sales: 0,
          later_second_month_fans_orders_sales:	0,
          later_third_month_fans_orders_sales: 0,
          ninety_days_fans_orders_sales:	0,
          new_fans_orders_count: 0,
          new_fans_orders_sales: 0
        }
        for (const v of this.promotionMemberStatisticsDataList) {
          innerTempData.orders_sales += parseFloat(v.orders_sales / 2)
          innerTempData.channel_consumption_total += parseFloat(v.channel_consumption_total / 2)
          innerTempData.new_fans += parseFloat(v.new_fans / 2)
          innerTempData.new_fans_consult += parseFloat(v.new_fans_consult / 2)
          innerTempData.orders_count += parseFloat(v.orders_count / 2)
          innerTempData.orders_reject_count += parseFloat(v.orders_reject_count / 2)
          innerTempData.new_fans_orders_sales += parseFloat(v.new_fans_orders_sales / 2)
          innerTempData.repurchase_fans_orders_sales += parseFloat(v.repurchase_fans_orders_sales / 2)
          innerTempData.same_day_fans_orders_sales += parseFloat(v.same_day_fans_orders_sales / 2)
          innerTempData.this_month_fans_orders_sales += parseFloat(v.this_month_fans_orders_sales / 2)
          innerTempData.later_first_month_fans_orders_sales += parseFloat(v.later_first_month_fans_orders_sales / 2)
          innerTempData.later_second_month_fans_orders_sales += parseFloat(v.later_second_month_fans_orders_sales / 2)
          innerTempData.later_third_month_fans_orders_sales += parseFloat(v.later_third_month_fans_orders_sales / 2)
          innerTempData.ninety_days_fans_orders_sales += parseFloat(v.ninety_days_fans_orders_sales / 2 + v.orders_sales / 2)
          innerTempData.new_fans_orders_count += parseFloat(v.new_fans_orders_count / 2)
        }
        sums[0] = '合计'
        let consultRate = 0
        let costPerFans = 0.00
        let newConsumptionOrdersPercentage = 0
        let repurchaseConsumptionOrdersPercentage = 0
        let perConsumerOrderPrice = 0
        let sameDayPerformance = 0
        let sameMonthPerformance = 0
        let laterFirstMonthPerformance = 0
        let laterSecondMonthPerformance = 0
        let laterThirdMonthPerformance = 0
        let laterFourMonthPerformance = 0
        let later_four_fans_orders_sales = 0
        later_four_fans_orders_sales = (innerTempData.ninety_days_fans_orders_sales + innerTempData.this_month_fans_orders_sales) / 2
        if (innerTempData.new_fans > 0) {
          consultRate = Math.round(innerTempData.new_fans_consult / innerTempData.new_fans * 100)
        }
        if (innerTempData.orders_sales > 0) {
          newConsumptionOrdersPercentage = Math.round(innerTempData.new_fans_orders_sales / innerTempData.orders_sales * 100)
          repurchaseConsumptionOrdersPercentage = Math.round(innerTempData.repurchase_fans_orders_sales / innerTempData.orders_sales * 100)
        }
        if (innerTempData.orders_count > 0) {
          perConsumerOrderPrice = Math.round(innerTempData.orders_sales / innerTempData.orders_count * 100) / 100
          costPerFans = Math.round(innerTempData.channel_consumption_total / innerTempData.new_fans * 100) / 100
        }
        if (innerTempData.channel_consumption_total > 0) {
          sameDayPerformance = Math.round(innerTempData.same_day_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          sameMonthPerformance = Math.round(innerTempData.this_month_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          laterFirstMonthPerformance = Math.round(innerTempData.later_first_month_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          laterSecondMonthPerformance = Math.round(innerTempData.later_second_month_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          laterThirdMonthPerformance = Math.round(innerTempData.later_third_month_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
          laterFourMonthPerformance = Math.round(later_four_fans_orders_sales / innerTempData.channel_consumption_total * 100) / 100
        }
        sums[1] = consultRate + '%' + '(' + innerTempData.new_fans_consult + ' / ' + innerTempData.new_fans + ' ) '
        sums[2] = '￥' + costPerFans
        sums[3] = '￥' + Math.round(innerTempData.channel_consumption_total * 100) / 100
        sums[4] = innerTempData.orders_count
        sums[5] = innerTempData.new_fans_orders_count
        sums[6] = '￥' + innerTempData.new_fans_orders_sales
        sums[7] = '￥' + innerTempData.new_fans_orders_sales + '(' + newConsumptionOrdersPercentage + '%)'
        sums[8] = '￥' + innerTempData.repurchase_fans_orders_sales + '(' + repurchaseConsumptionOrdersPercentage + '%)'
        sums[9] = '￥' + perConsumerOrderPrice
        sums[10] = '￥' + innerTempData.orders_sales
        sums[11] = '￥' + innerTempData.same_day_fans_orders_sales + '(' + sameDayPerformance + ')'
        sums[12] = '￥' + innerTempData.this_month_fans_orders_sales + '(' + sameMonthPerformance + ')'
        sums[13] = '￥' + innerTempData.later_first_month_fans_orders_sales + '(' + laterFirstMonthPerformance + ')'
        sums[14] = '￥' + innerTempData.later_second_month_fans_orders_sales + '(' + laterSecondMonthPerformance + ')'
        sums[15] = '￥' + innerTempData.later_third_month_fans_orders_sales + '(' + laterThirdMonthPerformance + ')'
        sums[16] = '￥' + later_four_fans_orders_sales + '(' + laterFourMonthPerformance + ')'
        sums.splice(1, 0, '-', '-')
        return sums
      }
    },
    methods: {
      getPromotionUserAccountList(query) {
        if (query !== '') {
          this.promotionUserAccountLoading = true
          getUserAccountList({ nickname: query, user_account_type_code: 'promote', status: 1, user_account_group_id: this.listQuery.promotion_user_account_group_id }).then(response => {
            this.promotionUserAccountOptions = response.data.data
            this.promotionUserAccountLoading = false
          })
        }
      },
      prefixInteger(num, n) {
        return (Array(n).join(0) + num).slice(-n)
      },
      exportExcel() {
        /* generate workbook object from table */
        var wb = XLSX.utils.table_to_book(document.querySelector('#' + this.activeName))
        // const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {}}
        // wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(this.list)
        /* get binary string as output */
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'array' })
        try {
          FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '报表.xlsx')
        } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
        return wbout
      },
      handleClickTab(tab, event) {
        if (tab.name === 'product') {
          this.productTabSelected = true
        } else {
          this.productTabSelected = false
        }
        this.handleFilter()
      },
      handleFilter() {
        if (this.activeName === 'promotionChannel') {
          this.PromotionUserSelect = false
          this.getList()
        } else if (this.activeName === 'product') {
          this.PromotionUserSelect = false
          this.getProductStatisticsDataList()
        } else if (this.activeName === 'promotionMember') {
          this.PromotionUserSelect = true
          this.getPromotionMemberStatisticsDataList()
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
      handleFilter2() {
        this.PromotionUserSelect = true
        this.listQuery.promotion_user_account_id = undefined
        this.promotionUserAccountOptions = []
        this.getPromotionMemberStatisticsDataList()
      },
      handleGroupFilter() {
        this.userGroupTeamOptions = []
        this.listQuery.user_account_group_team_id = []
        this.listQuery.user_account_ids = []
        this.handleFilter()
      },
      handleGroupTeamFilter() {
        this.listQuery.user_account_ids = []
        this.handleFilter()
      },
      handleUserAccountFilter() {
        this.listQuery.user_account_group_team_id = undefined
        this.handleFilter()
      },
      handleQueryTypeChange(type) {
        this.handleFilter()
      },
      getUserAccountList(query) {
        if (query !== '') {
          this.userAccountLoading = true
          getUserAccountList({ nickname: query, user_account_type_code: 'support', user_account_group_id: this.listQuery.user_account_group_id }).then(response => {
            this.userAccountOptions = response.data.data
            this.userAccountLoading = false
          })
        } else {
          this.userAccountOptions = []
        }
      },
      getGroupList() {
        getUserAccountGroupList({ type_code: 'promote' }).then(response => {
          if (response.data.data) {
            this.userGroupOptions = response.data.data
          }
        })
      },
      getGroupTeamList() {
        const params = {}
        params.user_account_group_id = this.listQuery.user_account_group_id
        if (!params.user_account_group_id) {
          return
        }
        getUserAccountGroupTeamList(params).then(response => {
          if (response.data.data) {
            this.userGroupTeamOptions = response.data.data
          }
        })
      },
      objectSpanPromotionMemberMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
          const spannum = this.countPromotionMemberNumber[this.countPromotionMemberIndex[rowIndex]]
          if (spannum) {
            return {
              rowspan: spannum,
              colspan: 1
            }
          } else {
            return {
              rowspan: 0,
              colspan: 0
            }
          }
        }
      },
      countPromotionMemberRowSpan() {
        var i = 0
        this.countPromotionMemberNumber = []
        const countHas = []
        this.countPromotionMemberIndex = []
        for (const v of this.promotionMemberStatisticsDataList) {
          if (countHas.indexOf(v.id) < 0) {
            countHas.push(v.id)
            this.countPromotionMemberIndex[i] = v.id
            this.countPromotionMemberNumber[v.id] = 1
          } else {
            this.countPromotionMemberNumber[v.id] += 1
          }
          i++
        }
      },
      objectSpanProductMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
          const spannum = this.countProductNumber[this.countProductIndex[rowIndex]]
          if (spannum) {
            return {
              rowspan: spannum,
              colspan: 1
            }
          } else {
            return {
              rowspan: 0,
              colspan: 0
            }
          }
        }
      },
      countProductRowSpan() {
        var i = 0
        this.countProductNumber = []
        const countHas = []
        this.countProductIndex = []
        for (const v of this.productStatisticsDataList) {
          if (countHas.indexOf(v.id) < 0) {
            countHas.push(v.id)
            this.countProductIndex[i] = v.id
            this.countProductNumber[v.id] = 1
          } else {
            this.countProductNumber[v.id] += 1
          }
          i++
        }
      },
      getList() {
        this.listLoading = true
        getPromotionChannelStatisticsData(this.listQuery).then(response => {
          this.list = response.data
          this.listLoading = false
        })
      },
      getPromotionChannel(query) {
        if (query !== '') {
          this.promotionChannelLoading = true
          getPromotionChannelList({ channel_name: query }).then(response => {
            this.promotionChannelOptions = response.data.data
            this.promotionChannelLoading = false
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
      },
      getProductStatisticsDataList() {
        this.listLoading = true
        getProductStatistics(this.listQuery).then(response => {
          this.productStatisticsDataList = []
          const tempData = response.data
          for (const v of tempData) {
            const cellData = v
            cellData.id = v.product_id
            this.productStatisticsDataList.push(cellData)
          }
          this.countProductRowSpan()
          this.listLoading = false
        })
      },
      getPromotionMemberStatisticsDataList() {
        this.listLoading = true
        getPromotionMemberStatistics(this.listQuery).then(response => {
          this.promotionMemberStatisticsDataList = []
          const tempData = response.data
          for (const v of tempData) {
            const cellData = v
            cellData.id = v.promotion_user_account_id
            this.promotionMemberStatisticsDataList.push(cellData)
          }
          this.countPromotionMemberRowSpan()
          this.listLoading = false
        })
      },
      getPromotionChannelSummaries(param) {
        return this.getPromotionChannelSumData
      },
      getPromotionChannelSummaries3(param) {
        return this.getPromotionChannelSumData3
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
  .el-table >>> thead {
    font-size: 13px;
  }
  .el-table >>> td {
    padding: 6px 0;
  }
</style>
