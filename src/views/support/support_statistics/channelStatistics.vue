<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <div class="filter-row">
        <div class="filter-item">
          <el-radio-group v-model="listQuery.is_month"
                          @change="handleQueryTypeChange"
                          size="small">
            <el-radio-button :label="1">月数据</el-radio-button>
            <el-radio-button :label="0">日数据</el-radio-button>
          </el-radio-group>
        </div>
        <div class="filter-item" v-show="listQuery.is_month === 0">
          <div class="filter-label">日期</div>
          <el-date-picker
            v-model="listQuery.date_range"
            type="daterange"
            style="width: 260px"
            size="small"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            align="bottom"
            unlink-panels
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions2"
            @change='handleFilter'>
          </el-date-picker>
        </div>
        <div class="filter-item" v-show="listQuery.is_month === 1">
          <div class="filter-label">月份</div>
          <el-date-picker
            format="yyyy-MM"
            style="width: 260px"
            size="small"
            :clearable="false"
            value-format="yyyy-MM"
            v-model="listQuery.month"
            align="bottom"
            type="month"
            :picker-options="pickerOptions1"
            placeholder="选择月份"
            @change='handleFilter'>
          </el-date-picker>
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-item" style="width: 100%">
          <div class="filter-label">客服</div>
          <el-select style="width: 80%"
                     @focus="getSupportUserAccountList(' ')"
                     @change='handleFilter'
                     v-model="listQuery.support_user_account_ids"
                     multiple
                     size="small"
                     filterable
                     remote
                     placeholder="请选择"
                     :remote-method="getSupportUserAccountList"
                     :loading="supportUserAccountLoading">
            <el-option
              v-for="item in supportUserAccountOptions"
              :key="item.id"
              :label="item.nickname"
              :value="item.id">
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="filter-item">
        <div class="filter-label">渠道</div>
        <el-select @change='handleFilter'
                   v-model="listQuery.channel_ids"
                   multiple
                   filterable
                   style="width: 140px"
                   remote
                   size="small"
                   placeholder="请选择"
                   :remote-method="getUserChannelList"
                   :loading="userPromotionChannelLoading">
          <el-option
            v-for="item in userChannelOptions"
            :key="item.id"
            :label="item.channel_name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">商品</div>
        <el-select @change='handleFilter'
                   v-model="listQuery.product_ids"
                   multiple
                   size="small"
                   style="width: 140px"
                   filterable
                   remote
                   placeholder="请选择"
                   :remote-method="getProductList"
                   :loading="productLoading">
          <el-option v-for="item in productOptions"
                     :key="item.id"
                     :label="item.product_name"
                     :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-float">
        <el-button type="primary"
                   class="filter-item"
                   :disabled="listLoading"
                   @click="exportExcel"
                   size="small"
                   v-waves
                   v-if="$store.state.user.roles === 'administrator'">导出
        </el-button>
        <el-button
                   type="primary"
                   size="small"
                   class="filter-item"
                   :disabled="listLoading"
                   @click="handleFilter"
                   icon="el-icon-search"
                   v-waves>搜索
        </el-button>
      </div>
    </div>

    <el-table :span-method="objectSpanMethod" id="channelTable" :height="tableHeight" show-summary
              :summary-method="getPromotionChannelSummaries" :stripe="true" :data="list" v-loading="listLoading"
              element-loading-text="给我一点时间" border fit highlight-current-row
              ref="table"
              style="width: 100%">
      <el-table-column :key="Math.random()" fixed align="center" label="客服" min-width="130">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.support_user_account.nickname}}</span>
          <el-tag type="success" v-if="scope.row.support_user_account.status === 1">在</el-tag>
          <el-tag type="danger" v-if="scope.row.support_user_account.status === 0">离</el-tag>
          <br/>
          <!--<el-tag :key="item.id" type="primary" v-for="item in scope.row.support_user_account.support_product">{{item.product_name}}</el-tag>-->
          <span>{{scope.row.support_user_account.created_at.slice(0,10)}}入职</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" fixed v-if="this.contrastArray.length > 0" align="center" label="月份" min-width="75">
        <template slot-scope="scope">
          <span>{{scope.row.month}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" fixed align="center" label="渠道" min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.promotion_channel}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" fixed align="center" label="产品" min-width="75">
        <template slot-scope="scope">
          <span>{{scope.row.product}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'当月咨询数/\n当月加粉数'" min-width="120" v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span>{{scope.row.new_fans_consult}} / {{scope.row.new_fans}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="咨询数 / 新加好友数" width="100" v-if="!listQuery.is_month">
        <template slot-scope="scope">
          <span>{{scope.row.new_fans_consult}} / {{scope.row.new_fans}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="单粉价值" min-width="90" v-if="!listQuery.is_month">
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">
            ￥{{Math.round(scope.row.orders_sales / scope.row.new_fans)}}
          </span>
          <span v-else>￥0</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'单粉价值/\n当月单粉价值'" min-width="120" v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">
            ￥{{Math.round(scope.row.orders_sales / scope.row.new_fans)}}
          </span>
          <span v-else>0</span>
          /
          <span v-if="scope.row.new_fans > 0">
            ￥{{Math.round((scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales) / scope.row.new_fans)}}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="单粉成本" min-width="100" >
        <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">
                ￥{{Math.round(scope.row.fans_cost / scope.row.new_fans * 100) / 100}}
              </span>
          <span v-else>￥0.00</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="客单价" min-width="100" v-if="!listQuery.is_month">
        <template slot-scope="scope">
              <span v-if="scope.row.total_orders_count > 0">
                ￥{{Math.round(scope.row.orders_sales / scope.row.total_orders_count * 100) / 100}}
              </span>
          <span v-else>￥0.00</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'客单价 / 非当月新粉客单价 /\n复购客单价 / 当月粉丝客单价'" width="320" v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span v-if="scope.row.orders_count > 0">
            ￥{{Math.round(scope.row.orders_sales / scope.row.total_orders_count * 100)/100}}
          </span>
          <span v-else>￥0.00</span> /
          <span v-if="scope.row.other_month_new_fans_orders_count > 0">
            ￥{{Math.round(scope.row.other_month_new_fans_orders_sales / scope.row.other_month_new_fans_orders_count * 100)/100}}
          </span>
          <span v-else>￥0.00</span> /
          <span v-if="scope.row.repurchase_fans_orders_count > 0">
            ￥{{Math.round(scope.row.repurchase_fans_orders_sales / scope.row.repurchase_fans_orders_count * 100)/100}}
          </span>
          <span v-else>￥0.00</span> /
          <span v-if="scope.row.this_month_new_fans_orders_count > 0 || scope.row.this_month_repurchase_fans_orders_count > 0">
            ￥{{Math.round((scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales) / (scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count) * 100)/100}}
          </span>
          <span v-else>￥0.00</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="订单数 / 新粉订单数" min-width="110" v-if="!listQuery.is_month">
        <template slot-scope="scope">
          <span>{{scope.row.total_orders_count}} / {{scope.row.new_fans_orders_count}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="确认订单数/当月粉丝订单数/非当月新粉订单数/复购订单数" min-width="200" v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span>{{scope.row.orders_count}} / {{scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count}} / {{scope.row.other_month_new_fans_orders_count}} / {{scope.row.repurchase_fans_orders_count}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="新客户(占比)" min-width="110">
        <template slot-scope="scope">
          <span v-if="scope.row.orders_count > 0">
            {{scope.row.new_fans_orders_count}}({{Math.round(scope.row.new_fans_orders_count / scope.row.orders_count * 100)}}%)
          </span>
          <span v-else>0(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="复购客户(占比)" min-width="125">
        <template slot-scope="scope">
          <span v-if="scope.row.orders_count > 0">
            {{scope.row.repurchase_fans_orders_count}}({{Math.round(scope.row.repurchase_fans_orders_count / scope.row.orders_count * 100)}}%)
          </span>
          <span v-else>0(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="未确定订单率/签收率/拒收率" min-width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.total_orders_count > 0">
            {{Math.round(scope.row.deliver_orders_count / scope.row.total_orders_count * 10000) / 100.00}}% /
            {{Math.round((scope.row.orders_count - scope.row.deliver_orders_count) / scope.row.total_orders_count * 10000) / 100.00}}% /
            {{Math.round(scope.row.reject_orders_count / scope.row.total_orders_count * 10000) / 100.00}}%
          </span>
          <span v-else>0% / 0% / 0%</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="转化率" min-width="80">
        <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">
                {{ (scope.row.total_orders_count / scope.row.new_fans * 100).toFixed(2) }}  %
              </span>
          <span v-else>0%</span>
        </template>
      </el-table-column>


      <el-table-column :key="Math.random()" align="center" label="非当月新粉销售额" min-width="150" v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span>￥{{Math.round(scope.row.other_month_new_fans_orders_sales * 100) / 100.00}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="复购销售额" min-width="130"  v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span>￥{{Math.round(scope.row.repurchase_fans_orders_sales * 100) / 100.00}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="销售额" min-width="120">
        <template slot-scope="scope">
          <span>￥{{Math.round(scope.row.orders_sales * 100) / 100.00}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column :key="Math.random()" align="center" label="当日转化率" min-width="95">-->
        <!--<template slot-scope="scope">-->
              <!--<span v-if="scope.row.new_fans > 0">-->
                <!--{{(scope.row.same_day_new_fans_orders_count/ scope.row.new_fans * 100).toFixed(2)}}%-->
              <!--</span>-->
          <!--<span v-else>0%</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column :key="Math.random()" align="center" label="加粉成本" min-width="95">
        <template slot-scope="scope">
          <span v-if="scope.row.fans_cost > 0">
            ￥{{Math.round(scope.row.fans_cost)}}
          </span>
          <span v-else>￥0</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="产品成本" min-width="95">
        <template slot-scope="scope">
          <span v-if="scope.row.product_cost > 0">
            ￥{{Math.round(scope.row.product_cost)}}
          </span>
          <span v-else>￥0</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="当月粉丝销售额(转化率)" min-width="130" v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span>{{scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales}}</span>
          <span v-if="scope.row.new_fans > 0">
            ({{((scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count ) / scope.row.new_fans * 100).toFixed(2) + '%'}} )
          </span>
          <span v-else>(0%)</span>
          <!--<span v-if="scope.row.fans_cost > 0 && scope.row.product_cost > 0">-->
            <!--({{Math.round((scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales ) / (scope.row.fans_cost + scope.row.product_cost) * 100)/100}} )-->
          <!--</span>-->
          <!--<span v-else>(-)</span>-->
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="后1月粉丝销售额(转化率)" min-width="130" v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span>{{scope.row.later_first_month_fans_orders_sales}}</span>
          <span v-if="scope.row.new_fans > 0">
            ({{(scope.row.later_first_month_fans_orders_count / scope.row.new_fans * 100).toFixed(2) + '%'}} )
          </span>
          <span v-else>(0%)</span>
          <!--<span v-if="scope.row.fans_cost > 0 && scope.row.product_cost > 0">-->
            <!--({{Math.round(scope.row.later_first_month_fans_orders_sales / (scope.row.fans_cost + scope.row.product_cost) * 100)/100}} )-->
          <!--</span>-->
          <!--<span v-else>(-)</span>-->
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="后2月粉丝销售额(转化率)" min-width="130" v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span>{{scope.row.later_second_month_fans_orders_sales}}</span>
          <span v-if="scope.row.new_fans > 0">
                ({{(scope.row.later_second_month_fans_orders_count/ scope.row.new_fans * 100).toFixed(2) + '%'}} )
              </span>
          <span v-else>(0%)</span>
          <!--<span v-if="scope.row.fans_cost > 0 && scope.row.product_cost > 0">-->
            <!--({{Math.round(scope.row.later_second_month_fans_orders_sales / (scope.row.fans_cost + scope.row.product_cost) * 100)/100}} )-->
          <!--</span>-->
          <!--<span v-else>(-)</span>-->
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="3月合计销售额(转化率)" min-width="130" v-if="listQuery.is_month">
        <template slot-scope="scope">
          <span>{{scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales + scope.row.later_first_month_fans_orders_sales + scope.row.later_second_month_fans_orders_sales}}</span>
              <span v-if="scope.row.new_fans > 0">
                ({{((scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count + scope.row.later_first_month_fans_orders_count + scope.row.later_second_month_fans_orders_count) / scope.row.new_fans * 100).toFixed(2) + '%'}} )
              </span>
          <span v-else>(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="时段转化率" min-width="90" v-if="!listQuery.is_month">
        <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">
                 {{(scope.row.range_new_fans_orders_count / scope.row.new_fans* 100).toFixed(2) + '%'}}
              </span>
          <span v-else>0.00%</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { getSupportChannelStatisticsDataDay, getSupportChannelStatisticsDataMonth } from '@/api/support_statistics'
  import { getUserAccountGroupList } from '@/api/user_group'
  import { getProductList } from '@/api/product'
  import { getUserAccountGroupTeamList } from '@/api/user_group_team'
  import { getSupportGroupList } from '@/api/support_member'
  import { getSupportMemberList } from '@/api/support_member'
  import { getPromotionChannelList } from '@/api/promotion_channel'
  import { parseTime } from '@/utils/index'
  import waves from '@/directive/waves' // 水波纹指令
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {
    name: 'channelStatistics',
    components: {},
    directives: {
      waves
    },
    data() {
      return {
        arry: [],
        scrollTop: 0,
        tableHeight: undefined,
        supportMember2table: false,
        // tableKey: 0,
        list: [],
        list2: [],
        channelStatisticsDataList: [],
        total: null,
        listLoading: false,
        listQuery: {
          is_month: 1,
          month: parseTime(new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 30)), '{y}-{m}'),
          support_user_account_group_id: undefined,
          support_user_account_ids: [],
          product_ids: [],
          channel_ids: [],
          date_range: [
            parseTime(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000), '{y}-{m}-{d}'),
            parseTime(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000), '{y}-{m}-{d}')
          ]
        },
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        contrast: false,
        userGroupOptions:[],
        userGroupTree: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        spanMethodArray: [],
        spanMethodArray2: [],
        userChannelOptions: [],
        userPromotionChannelLoading: false,
        contrastArray: [],
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: [{ label: '冻结', key: 0 }, { label: '开启', key: 1 }, { label: '告警', key: 2 }],
        productOptions: [],
        productLoading: false,
        showAuditor: false,
        temp: {
          id: undefined
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        temptotal: {},
        exportExcelLoading: true,
        userGroupTeamOptions: [],
        userAccountOptions: [],
        userAccountLoading: false,
        // activeName: 'supportMember',
        productTabSelected: false,
        pickerOptions1: {
          disabledDate: time => {
            const temp = []
            const tempdisabled = time.getFullYear() + '-' + this.PrefixInteger(time.getMonth() + 1, 2)
            for (const v in this.contrastArray) {
              temp.push(this.contrastArray[v].month)
            }
            if (this.listQuery.month !== null) {
              temp.push(this.listQuery.month)
            }
            if (temp.indexOf(tempdisabled) > -1) {
              return true
            } else {
              return false
            }
          }
        },
        pickerOptions2: {
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
        }
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
      this.getUserGroupTree()
      this.tableHeight = window.innerHeight - 180 + 'px'
      this.getList()
      this.getProductList(' ')
      this.getUserChannelList(' ')
      window.addEventListener('resize', () => {
        setTimeout(() => {
          this.tableHeight = window.innerHeight - 180 + 'px'
        }, 500)
      })
    },
    computed: {
      getExcelData: function() {
        const ExcelData = []
        this.list.forEach(item => {
          const data = {
            nickname: item.support_user_account.nickname,
            promotion_channel: item.promotion_channel,
            product: item.product,
            add_fans: item.new_fans_consult + '/' + item.new_fans,
            fansPrice_day: 0, // 单粉价值
            fansPrice_month: '0/0', // 单粉价值
            consumerPrice_day: 0, // 客单价
            consumerPrice_month: undefined,
            consumerPrice_month_1: 0, // 客单价
            consumerPrice_month_2: 0, // 非当月新粉客单价
            consumerPrice_month_3: 0, // 复购客单价
            consumerPrice_month_4: 0, // 当月粉丝客单价
            orders_count_day: '0/0', // 订单数 / 新粉订单数
            orders_count_month: undefined, // 确认订单数/当月粉丝订单数/非当月新粉订单数/复购订单数
            new_fans_percent: '0 (0%)', // 新粉百分比
            repurchase_fans_percent: '0 (0%)', // 复购百分比
            rate: undefined, // 未确定订单率/签收率/拒收率
            deliver_rate: '0%', // 未确定订单率
            finish_rate: '0%', // 签收率
            reject_rate: '0%', // 拒收率
            transformRate: '0%', // 转化率
            day_transformRate: '0%', // 当日转化率
            repurchase_sales: 0, // 复购销售额
            other_month_new_fans_sales: 0, // 非当月新粉销售额
            orders_sales: Math.round(item.orders_sales * 100) / 100, // 销售额
            fans_cost: item.fans_cost, // 加粉成本
            product_cost: item.product_cost, // 产品成本
            this_month_sales_rate: undefined, // 当月粉丝销售额(转化率)
            this_month_sales: 0, // 当月粉丝销售额
            this_month_rate: 0.00, // 当月(转化率)
            later_first_month_sales_rate: undefined,
            later_first_month_sales: 0,
            later_first_month_rate: 0.00,
            later_second_month_sales_rate: undefined,
            later_second_month_sales: 0,
            later_second_month_rate: 0.00,
            three_month_sales_rate: undefined,
            three_month_sales: 0,
            three_month_rate: 0.00,
            range_rate: 0,
            add_fans_cost: 0
          }
          if (item.orders_count > 0) {
            data.new_fans_percent = item.new_fans_orders_count + '(' + Math.round(item.new_fans_orders_count / item.orders_count * 100) + '%)'
            data.repurchase_fans_percent = item.repurchase_fans_orders_count + '(' + Math.round(item.repurchase_fans_orders_count / item.orders_count * 100) + '%)'
          }
          if (item.total_orders_count > 0) {
            data.deliver_rate = Math.round(item.deliver_orders_count / item.total_orders_count * 10000) / 100.00 + '%'
            data.finish_rate = Math.round((item.orders_count - item.deliver_orders_count) / item.total_orders_count * 10000) / 100.00 + '%'
            data.reject_rate = Math.round(item.reject_orders_count / item.total_orders_count * 10000) / 100.00 + '%'
          }
          if (item.new_fans > 0) {
            data.transformRate = Math.round(item.total_orders_count / item.new_fans * 10000) / 100 + '%'
            data.day_transformRate = Math.round(item.same_day_new_fans_orders_count / item.new_fans * 10000) / 100 + '%'
            data.add_fans_cost = Math.round(item.fans_cost / item.new_fans * 100) / 100
          }
          if (this.listQuery.is_month) { // 月数据
            data.this_month_sales = item.this_month_new_fans_orders_sales + item.this_month_repurchase_fans_orders_sales
            data.later_first_month_sales = Math.round(item.later_first_month_fans_orders_sales * 100) / 100
            data.later_second_month_sales = Math.round(item.later_second_month_fans_orders_sales * 100) / 100
            data.three_month_sales = item.this_month_new_fans_orders_sales + item.this_month_repurchase_fans_orders_sales + item.later_first_month_fans_orders_sales + item.later_second_month_fans_orders_sales
            data.repurchase_sales = Math.round(item.repurchase_fans_orders_sales * 100) / 100 // 复购销售额
            data.other_month_new_fans_sales = Math.round(item.other_month_new_fans_orders_sales * 100) / 100 // 非当月新粉销售额
            data.orders_count_month = item.orders_count + '/' + (item.this_month_new_fans_orders_count + item.this_month_repurchase_fans_orders_count) + '/' + item.other_month_new_fans_orders_count + '/' + item.repurchase_fans_orders_count // 确认订单数/当月粉丝订单数/非当月新粉订单数/复购订单数
            if (item.new_fans > 0) {
              data.fansPrice_month = Math.round(item.orders_sales / item.new_fans) + '/' + Math.round((item.this_month_new_fans_orders_sales + item.this_month_repurchase_fans_orders_sales) / item.new_fans)
              data.this_month_rate = Math.round((item.this_month_new_fans_orders_count + item.this_month_repurchase_fans_orders_count) / item.new_fans * 10000) / 100
              data.later_first_month_rate = Math.round(item.later_first_month_fans_orders_count / item.new_fans * 10000) / 100
              data.later_second_month_rate = Math.round(item.later_second_month_fans_orders_count / item.new_fans * 10000) / 100
              data.three_month_rate = Math.round((item.this_month_new_fans_orders_count + item.this_month_repurchase_fans_orders_count + item.later_first_month_fans_orders_count + item.later_second_month_fans_orders_count) / item.new_fans * 10000) / 100
            }
            if (item.orders_count > 0) {
              data.consumerPrice_month_1 = Math.round(item.orders_sales / item.total_orders_count * 100) / 100
            }
            if (item.other_month_new_fans_orders_count > 0) {
              data.consumerPrice_month_2 = Math.round(item.other_month_new_fans_orders_sales / item.other_month_new_fans_orders_count * 100) / 100
            }
            if (item.repurchase_fans_orders_count > 0) {
              data.consumerPrice_month_3 = Math.round(item.repurchase_fans_orders_sales / item.repurchase_fans_orders_count * 100) / 100
            }
            if (item.this_month_new_fans_orders_count > 0 || item.this_month_repurchase_fans_orders_count > 0) {
              data.consumerPrice_month_4 = Math.round((item.this_month_new_fans_orders_sales + item.this_month_repurchase_fans_orders_sales) / (item.this_month_new_fans_orders_count + item.this_month_repurchase_fans_orders_count) * 100) / 100
            }
          } else { // 日数据
            data.orders_count_day = item.total_orders_count + '/' + item.new_fans_orders_count // 订单数 / 新粉订单数
            if (item.new_fans > 0) {
              data.fansPrice_day = Math.round(item.orders_sales / item.new_fans)
              data.range_rate = Math.round(item.range_new_fans_orders_count / item.new_fans * 10000) / 100 + '%'
            }
            if (item.total_orders_count > 0) {
              data.consumerPrice_day = Math.round(item.orders_sales / item.total_orders_count * 100) / 100
            }
          }
          data.this_month_sales_rate = data.this_month_sales + '(' + data.this_month_rate + '%)' // 当月粉丝销售额(转化率)
          data.later_first_month_sales_rate = data.later_first_month_sales + '(' + data.later_first_month_rate + '%)' // 当月粉丝销售额(转化率)
          data.later_second_month_sales_rate = data.later_second_month_sales + '(' + data.later_second_month_rate + '%)' // 当月粉丝销售额(转化率)
          data.three_month_sales_rate = data.three_month_sales + '(' + data.three_month_rate + '%)' // 当月粉丝销售额(转化率)
          data.consumerPrice_month = data.consumerPrice_month_1 + '/' + data.consumerPrice_month_2 + '/' + data.consumerPrice_month_3 + '/' + data.consumerPrice_month_4
          data.rate = data.deliver_rate + '/' + data.finish_rate + '/' + data.reject_rate
          ExcelData.push(data)
        })
        return ExcelData
      },
      getPromotionChannelSumData: function() {
        const sums = []
        const innerTempData = {
          deliver_orders_count: 0,
          last_month_fans: 0,
          later_first_month_fans_orders_count: 0,
          later_first_month_fans_orders_sales: 0,
          later_second_month_fans_orders_count: 0,
          later_second_month_fans_orders_sales: 0,
          new_fans: 0,
          new_fans_consult: 0,
          new_fans_orders_count: 0,
          new_fans_orders_sales: 0,
          new_fans_reject_orders_count: 0,
          fans_cost: 0,
          product_cost: 0,
          orders_count: 0,
          orders_sales: 0,
          other_month_new_fans_orders_count: 0,
          other_month_new_fans_orders_sales: 0,
          reject_orders_count: 0,
          repurchase_fans_orders_count: 0,
          repurchase_fans_orders_sales: 0,
          repurchase_fans_reject_orders_count: 0,
          same_day_new_fans_orders_count: 0,
          this_month_new_fans_orders_count: 0,
          this_month_new_fans_orders_sales: 0,
          this_month_repurchase_fans_orders_count: 0,
          this_month_repurchase_fans_orders_sales: 0,
          total_orders_count: 0,
          total_orders_sales: 0,
          range_new_fans_orders_count: 0,
          add_fans_cost: 0
        }
        for (const v of this.list) {
          if (v.promotion_channel === '总计') {
            continue
          }
          innerTempData.deliver_orders_count += parseFloat(v.deliver_orders_count)
          innerTempData.last_month_fans += parseFloat(v.last_month_fans)
          innerTempData.later_first_month_fans_orders_count += parseFloat(v.later_first_month_fans_orders_count)
          innerTempData.later_first_month_fans_orders_sales += parseFloat(v.later_first_month_fans_orders_sales)
          innerTempData.later_second_month_fans_orders_count += parseFloat(v.later_second_month_fans_orders_count)
          innerTempData.later_second_month_fans_orders_sales += parseFloat(v.later_second_month_fans_orders_sales)
          innerTempData.new_fans += parseFloat(v.new_fans)
          innerTempData.new_fans_consult += parseFloat(v.new_fans_consult)
          innerTempData.new_fans_orders_count += parseFloat(v.new_fans_orders_count)
          innerTempData.new_fans_orders_sales += parseFloat(v.new_fans_orders_sales)
          innerTempData.new_fans_reject_orders_count += parseFloat(v.new_fans_reject_orders_count)
          innerTempData.orders_count += parseFloat(v.orders_count)
          innerTempData.orders_sales += parseFloat(v.orders_sales)
          innerTempData.other_month_new_fans_orders_count += parseFloat(v.other_month_new_fans_orders_count)
          innerTempData.other_month_new_fans_orders_sales += parseFloat(v.other_month_new_fans_orders_sales)
          innerTempData.reject_orders_count += parseFloat(v.reject_orders_count)
          innerTempData.repurchase_fans_orders_count += parseFloat(v.repurchase_fans_orders_count)
          innerTempData.repurchase_fans_orders_sales += parseFloat(v.repurchase_fans_orders_sales)
          innerTempData.repurchase_fans_reject_orders_count += parseFloat(v.repurchase_fans_reject_orders_count)
          innerTempData.same_day_new_fans_orders_count += parseFloat(v.same_day_new_fans_orders_count)
          innerTempData.this_month_new_fans_orders_count += parseFloat(v.this_month_new_fans_orders_count)
          innerTempData.this_month_new_fans_orders_sales += parseFloat(v.this_month_new_fans_orders_sales)
          innerTempData.this_month_repurchase_fans_orders_count += parseFloat(v.this_month_repurchase_fans_orders_count)
          innerTempData.this_month_repurchase_fans_orders_sales += parseFloat(v.this_month_repurchase_fans_orders_sales)
          innerTempData.total_orders_count += parseFloat(v.total_orders_count)
          innerTempData.total_orders_sales += parseFloat(v.total_orders_sales)
          innerTempData.range_new_fans_orders_count += parseFloat(v.range_new_fans_orders_count)
          innerTempData.fans_cost += Math.round(parseFloat(v.fans_cost))
          innerTempData.product_cost += Math.round(parseFloat(v.product_cost))
        }
        let consultCount = 0 + ' / ' + 0
        let ordersCount = 0.00
        let uncertainRate = 0
        let rejectRate = 0
        let receiveRate = 0
        let transformRate = 0
        let newConsumer = 0
        let repurchaseConsumer = 0
        let fansPrice = 0
        let this_month_fansPrice = 0
        let consumerPrice = 0
        let other_month_fans_consumerPrice = 0
        let repurchaseConsumer_consumerPrice = 0
        let thisMonthFansConsumer_consumerPrice = 0
        let saleroom = 0
        let newOtherMonthSaleroom = 0
        let repurchaseSaleroom = 0
        // let ordersRate = 0
        let this_month_fans_rate = 0
        let later_first_month_fans_rate = 0
        let later_second_month_fans_rate = 0
        let three_month_fans_rate = 0
        let this_month_fans_saler = 0
        let later_first_month_fans_saler = 0
        let later_second_month_fans_saler = 0
        let three_month_fans_saler = 0
        let range_Rate = 0
        let add_fans_cost = 0
        this_month_fans_saler = innerTempData.this_month_new_fans_orders_sales + innerTempData.this_month_repurchase_fans_orders_sales
        later_first_month_fans_saler = innerTempData.later_first_month_fans_orders_sales
        later_second_month_fans_saler = innerTempData.later_second_month_fans_orders_sales
        three_month_fans_saler = innerTempData.this_month_new_fans_orders_sales + innerTempData.this_month_repurchase_fans_orders_sales + innerTempData.later_first_month_fans_orders_sales + innerTempData.later_second_month_fans_orders_sales
        consultCount = innerTempData.new_fans_consult + ' / ' + innerTempData.new_fans
        ordersCount = innerTempData.orders_count + ' / ' + (innerTempData.this_month_new_fans_orders_count + innerTempData.this_month_repurchase_fans_orders_count) + ' / ' + innerTempData.other_month_new_fans_orders_count + ' / ' + innerTempData.repurchase_fans_orders_count
        saleroom = innerTempData.orders_sales
        newOtherMonthSaleroom = innerTempData.other_month_new_fans_orders_sales
        repurchaseSaleroom = innerTempData.repurchase_fans_orders_sales
        if (innerTempData.this_month_new_fans_orders_count > 0 || innerTempData.this_month_repurchase_fans_orders_count > 0) {
          thisMonthFansConsumer_consumerPrice = Math.round((innerTempData.this_month_new_fans_orders_sales + innerTempData.this_month_repurchase_fans_orders_sales) / (innerTempData.this_month_new_fans_orders_count + innerTempData.this_month_repurchase_fans_orders_count) * 100) / 100
        }
        if (innerTempData.total_orders_count > 0) {
          uncertainRate = Math.round(innerTempData.deliver_orders_count / innerTempData.total_orders_count * 10000) / 100.00
          receiveRate = Math.round((innerTempData.orders_count - innerTempData.deliver_orders_count) / innerTempData.total_orders_count * 10000) / 100.00
          rejectRate = Math.round(innerTempData.reject_orders_count / innerTempData.total_orders_count * 10000) / 100.00
          consumerPrice = Math.round(innerTempData.orders_sales / innerTempData.total_orders_count * 100) / 100
        }
        if (innerTempData.orders_count > 0) {
          newConsumer = Math.round(innerTempData.new_fans_orders_count / innerTempData.orders_count * 100)
          repurchaseConsumer = Math.round(innerTempData.repurchase_fans_orders_count / innerTempData.orders_count * 100)
        }
        if (innerTempData.new_fans > 0) {
          fansPrice = Math.round((innerTempData.orders_sales / innerTempData.new_fans))
          this_month_fansPrice = Math.round(((innerTempData.this_month_new_fans_orders_sales + innerTempData.this_month_repurchase_fans_orders_sales) / innerTempData.new_fans))
          transformRate = (innerTempData.total_orders_count / innerTempData.new_fans * 100).toFixed(2)
          range_Rate = (innerTempData.range_new_fans_orders_count / innerTempData.new_fans * 100).toFixed(2) + '%'
        }
        if (innerTempData.other_month_new_fans_orders_count > 0) {
          other_month_fans_consumerPrice = Math.round(innerTempData.other_month_new_fans_orders_sales / innerTempData.other_month_new_fans_orders_count * 100) / 100
        }
        if (innerTempData.repurchase_fans_orders_count > 0) {
          repurchaseConsumer_consumerPrice = Math.round(innerTempData.repurchase_fans_orders_sales / innerTempData.repurchase_fans_orders_count * 100) / 100
        }
        if (innerTempData.new_fans > 0) {
          // ordersRate = (innerTempData.same_day_new_fans_orders_count / innerTempData.new_fans * 100).toFixed(2)
          // 粉丝(转化率)
          this_month_fans_rate = ((innerTempData.this_month_new_fans_orders_count + innerTempData.this_month_repurchase_fans_orders_count) / innerTempData.new_fans * 100).toFixed(2)
          later_first_month_fans_rate = (innerTempData.later_first_month_fans_orders_count / innerTempData.new_fans * 100).toFixed(2)
          later_second_month_fans_rate = (innerTempData.later_second_month_fans_orders_count / innerTempData.new_fans * 100).toFixed(2)
          three_month_fans_rate = ((innerTempData.this_month_new_fans_orders_count + innerTempData.this_month_repurchase_fans_orders_count + innerTempData.later_first_month_fans_orders_count + innerTempData.later_second_month_fans_orders_count) / innerTempData.new_fans * 100).toFixed(2)
          add_fans_cost = (innerTempData.fans_cost / innerTempData.new_fans).toFixed(2)
        }
        // 日数据
        sums[0] = '合计'
        sums[1] = consultCount // 咨询数 / 新加好友数
        sums[2] = '￥' + fansPrice // 单粉价值
        sums[3] = '￥' + add_fans_cost // 单粉成本
        sums[4] = '￥' + consumerPrice // 客单价
        sums[5] = innerTempData.total_orders_count + '/' + innerTempData.new_fans_orders_count// 订单数
        sums[6] = innerTempData.new_fans_orders_count + '(' + newConsumer + '%)' // 新客户（占比）
        sums[7] = innerTempData.repurchase_fans_orders_count + '(' + repurchaseConsumer + '%)' // 复购客服（占比）
        sums[8] = uncertainRate + '% / ' + receiveRate + '% / ' + rejectRate + '%'
        sums[9] = transformRate + '%' // 转化率
        sums[10] = '￥' + saleroom // 销售额
        sums[11] = '￥' + innerTempData.fans_cost // 粉丝花费
        sums[12] = '￥' + innerTempData.product_cost // 产品花费
        // sums[10] = ordersRate + '%' // 当日转化率隐藏
        if (this.listQuery.is_month) {
          // 月数据
          sums[1] = innerTempData.new_fans_consult + ' / ' + innerTempData.new_fans // 当月咨询数/当月加粉数
          sums[2] = '￥' + fansPrice + '/' + '￥' + this_month_fansPrice
          sums[4] = '￥' + consumerPrice + ' / ￥' + other_month_fans_consumerPrice + ' / ￥' + repurchaseConsumer_consumerPrice + ' / ￥' + thisMonthFansConsumer_consumerPrice
          sums[5] = ordersCount // 确认订单数/当月粉丝订单数/非当月新粉订单数/复购订单数
          sums.splice(10, 0, '￥' + newOtherMonthSaleroom, '￥' + repurchaseSaleroom) // 复购非当月
          sums.push(this_month_fans_saler + '(' + this_month_fans_rate + '%)')
          sums.push(later_first_month_fans_saler + '(' + later_first_month_fans_rate + '%)')
          sums.push(later_second_month_fans_saler + '(' + later_second_month_fans_rate + '%)')
          sums.push(three_month_fans_saler + '(' + three_month_fans_rate + '%)')
        } else {
          // 日数据
          sums.push(range_Rate) //
        }
        if (this.contrastArray.length > 0) {
          sums.splice(1, 0, '-')
        }
        sums.splice(1, 0, '-', '-')
        return sums
      }
    },
    methods: {
      getUserGroupTree() {
        getSupportGroupList().then(response => {
          this.userGroupTree = this.formatUserGroupTree(response.data)
        })
      },
      formatUserGroupTree(tree) {
        const Group = tree.map(item => {
          if (item.child.length > 0) {
            item.child = this.formatUserGroupTree(item.child)
            return item
          } else {
            delete item.child
            return item
          }
        })
        return Group
      },
      handleFilterGrounp(val) {
        this.listQuery.support_user_account_group_id = val[val.length - 1]
        this.handleFilter()
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
      exportExcel() {
        const a = document.getElementById('channelTable').cloneNode(true)
        a.removeChild(a.querySelector('.el-table__fixed'))
        var wb = XLSX.utils.table_to_book(a, { raw: true })
        var wbout = XLSX.write(wb, { bookType: 'xlsm', bookSST: true, type: 'array' })
        try {
          FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '客服渠道报表.xlsx')
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, wbout)
        }
        return wbout
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      getspanMethodArray() {
        const temparray = []
        let contactDot = 0
        this.list.forEach((item, index) => {
          if (index === 0) {
            temparray.push(1)
          } else {
            if (item.support_user_account.id === this.list[index - 1].support_user_account.id) {
              temparray[contactDot] += 1
              temparray.push(0)
            } else {
              temparray.push(1)
              contactDot = index
            }
          }
        })
        this.spanMethodArray = temparray
      },
      getspanMethodArray2() {
        const temparray = []
        let contactDot = 0
        this.list.forEach((item, index) => {
          if (index === 0) {
            temparray.push(1)
          } else {
            if (item.promotion_channel === this.list[index - 1].promotion_channel && item.support_user_account.id === this.list[index - 1].support_user_account.id) {
              temparray[contactDot] += 1
              temparray.push(0)
            } else {
              temparray.push(1)
              contactDot = index
            }
          }
        })
        this.spanMethodArray2 = temparray
      },
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0 && this.spanMethodArray[rowIndex] !== undefined) {
          const _row = this.spanMethodArray[rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col
          }
        }
        if (columnIndex === 1 && this.spanMethodArray2[rowIndex] !== undefined) {
          const _row = this.spanMethodArray2[rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col
          }
        }
      },
      PrefixInteger(num, n) {
        return (Array(n).join(0) + num).slice(-n)
      },
      handleFilter() {
        if (this.listQuery.is_month === 0) {
          this.getList3()
        } else {
          this.getList()
        }
      },
      addContrast() {
        this.contrastArray.push({
          month: ''
        })
      },
      contrastSort(response) {
        for (const i in response.data) {
          let is = false
          for (const v in this.list) {
            if (response.data[i].user_account.id === this.list[v].user_account.id) {
              this.list.splice(v, 0, response.data[i])
              is = true
              break
            }
          }
          if (!is) {
            this.list.push(response.data[i])
          }
        }
        let max
        for (var i = 0; i < this.list.length; i++) {
          for (var j = i; j < this.list.length; j++) {
            if (this.list[i].user_account.id === this.list[j].user_account.id) {
              if (this.list[i].month > this.list[j].month) {
                max = this.list[i]
                this.list[i] = this.list[j]
                this.list[j] = max
              }
            }
          }
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
      },
      handleContrastDelete(item, index) {
        this.contrastArray.splice(index, 1)
        for (let v = 0; v < this.list.length; v++) {
          if (this.list[v].index === index) {
            this.list.splice(v, 1)
            v--
          }
        }
        for (let i = 0; i < this.list.length; i++) {
          if (this.list[i].index > index) {
            this.list[i].index -= 1
          }
        }
        this.getspanMethodArray()
      },
      handleContrast(item, index) {
        if (item.month === null) {
          this.contrastArray.splice(index, 1)
          for (let v = 0; v < this.list.length; v++) {
            if (this.list[v].index === index) {
              this.list.splice(v, 1)
              v--
            }
          }
          for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].index > index) {
              this.list[i].index -= 1
            }
          }
          this.getspanMethodArray()
        } else {
          for (let v = 0; v < this.list.length; v++) {
            if (this.list[v].index === index) {
              this.list.splice(v, 1)
              v--
            }
          }
          this.listLoading = true
          const tempQuery = Object.assign({}, this.listQuery)
          tempQuery.month = item.month
          getSupportChannelStatisticsDataMonth(tempQuery).then(response => {
            for (const i in response.data) {
              response.data[i].index = index
              response.data[i].month = item.month
            }
            this.contrastSort(response)
            this.getspanMethodArray()
            this.listLoading = false
          })
        }
      },
      handleGroupFilter() {
        this.userGroupTeamOptions = []
        this.listQuery.user_account_group_team_id = []
        this.listQuery.support_user_account_ids = []
        this.handleFilter()
      },
      handleGroupTeamFilter() {
        this.listQuery.support_user_account_ids = []
        this.handleFilter()
      },
      handleUserAccountFilter() {
        this.listQuery.user_account_group_team_id = undefined
        if (this.listQuery.is_month === false) {
          this.getList2()
        } else {
          this.handleFilter()
        }
      },
      handleQueryTypeChange(type) {
        this.list = []
        this.contrastArray = []
        this.handleFilter()
      },
      getGroupTeamList() {
        const params = {}
        params.user_account_group_id = this.listQuery.support_user_account_group_id
        if (!params.user_account_group_id) {
          return
        }
        params.user_account_type_id = 2
        getUserAccountGroupTeamList(params).then(response => {
          if (response.data.data) {
            this.userGroupTeamOptions = response.data.data
          }
        })
      },
      getList() {
        this.listLoading = true
        this.list = []
        getSupportChannelStatisticsDataMonth(this.listQuery).then(res => {
          for (const v in res.data) {
            for (const i in res.data[v]) {
              if (i === 'support_user_account') {
                continue
              }
              for (const j in res.data[v][i]) {
                res.data[v][i][j].support_user_account = res.data[v].support_user_account
                this.list.push(res.data[v][i][j])
              }
            }
          }
          // this.contrastSort(this.list)
          // this.contrastSort(response)
          this.getspanMethodArray()
          this.getspanMethodArray2()
          this.listLoading = false
        })
      },
      getList2() {
        this.listLoading = true
        this.list = []
        if (this.listQuery.month !== null) {
          getSupportChannelStatisticsDataMonth(this.listQuery).then(response => {
            for (const i in response.data) {
              response.data[i].index = -1
              response.data[i].month = this.listQuery.month
            }
            this.listLoading = true
            this.contrastSort(response)
            this.getspanMethodArray()
            this.listLoading = false
          })
        }
        if (this.contrastArray.length > 0) {
          for (const v in this.contrastArray) {
            const tempQuery = Object.assign({}, this.listQuery)
            tempQuery.month = this.contrastArray[v].month
            getSupportChannelStatisticsDataMonth(tempQuery).then(response => {
              for (const i in response.data) {
                response.data[i].index = v
                response.data[i].month = this.contrastArray[v].month
              }
              this.listLoading = true
              this.contrastSort(response)
              this.getspanMethodArray()
              this.listLoading = false
            })
          }
        }
      },
      getList3() {
        this.listLoading = true
        this.list = []
        getSupportChannelStatisticsDataDay(this.listQuery).then(res => {
          const data = res
          for (const v in data.data) {
            for (const i in data.data[v]) {
              if (i === 'support_user_account') {
                continue
              }
              for (const j in data.data[v][i]) {
                data.data[v][i][j].support_user_account = data.data[v].support_user_account
                this.list.push(data.data[v][i][j])
              }
            }
          }
          this.getspanMethodArray()
          this.getspanMethodArray2()
          this.listLoading = false
        })
      },
      getPromotionChannelSummaries(param) {
        return this.getPromotionChannelSumData
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
  .el-table >>> td{
    padding: 6px 0;
  }
  .el-table >>> thead{
    font-size: 13px;
  }
  .el-tag {
    padding: 0 4px;
    font-size: 14px;
    line-height: 26px;
    height: 26px;
  }
</style>
