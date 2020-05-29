<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-radio-group v-model="listQuery.query_type_date"
                      @change="handleQueryTypeChange"
                      class="filter-item"
                      style="margin-left: 10px"
                      size="small">
        <el-radio-button :label="false">月数据</el-radio-button>
        <el-radio-button :label="true">日数据</el-radio-button>
      </el-radio-group>
      <div class="filter-item">
        <div class="filter-label">客服部门</div>
        <el-cascader
          clearable
          size="small"
          style="width: 300px"
          :options="userGroupTree"
          change-on-select
          placeholder="客服组"
          :props="defaultPropsGroup"
          v-model="userGroupOptions"
          @change="handleFilterGrounp">
        </el-cascader>
      </div>
      <div class="filter-float">
        <el-button type="primary"
                   size="small"
                   class="filter-item"
                   @click="exportExcel"
                   icon="el-icon-download"
                   v-waves v-if="$store.state.user.roles === 'administrator'">导出Excel
        </el-button>
      </div>
      <div class="filter-item" style="width: 100%">
        <div class="filter-label">客服</div>
        <el-select style="width: 80%"
                  size="small"
                  @focus="getSupportUserAccountList(' ')"
                  @change='handleFilter'
                  v-model="listQuery.support_user_account_ids"
                  multiple
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
      <div class="filter-item" v-show="listQuery.query_type_date">
        <div class="filter-label">日期</div>
        <el-date-picker size="small"
                        style="width: 260px"
                        :clearable="false"
                        v-model="listQuery.date_range"
                        type="daterange"
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
      <div class="filter-item" v-show="!listQuery.query_type_date">
        <div class="filter-label">月份</div>
        <el-date-picker format="yyyy-MM"
                        size="small"
                        style="width: 160px"
                        :clearable="false"
                        value-format="yyyy-MM"
                        v-model="listQuery.month"
                        align="bottom"
                        type="month"
                        :picker-options="pickerOptions1"
                        placeholder="选择月份"
                        @change='handleFilter'>
        </el-date-picker>
        <el-button v-show="!listQuery.query_type_date"
                   type="primary"
                   size="small"
                   v-waves
                   icon="el-icon-circle-plus-outline"
                   @click="addContrast">新增对比
        </el-button>
      </div>
      <template v-for="(item, index) in contrastArray">
        <div class="filter-item" v-show="!listQuery.query_type_date">
          <div class="filter-label">对比</div>
          <el-date-picker format="yyyy-MM"
                          size="small"
                          value-format="yyyy-MM"
                          v-model="item.month"
                          :clearable="false"
                          align="bottom"
                          type="month"
                          :picker-options="pickerOptions1"
                          placeholder="选择对比月份"
                          @change='handleContrast(item,index)'>
          </el-date-picker>
          <el-button type="danger"
                     size="small"
                     @click="handleContrastDelete(index)"
                     v-waves
                     icon="el-icon-delete">
          </el-button>
        </div>
      </template>
    </div>


    <el-table :span-method="objectSpanMethod" :key='tableKey'  id="productMember"  show-summary :summary-method="getPromotionChannelSummaries" :stripe="true"  :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%;" >
      <el-table-column :key="Math.random()" fixed align="center" label="产品" min-width="100">
        <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.product.product_name}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" fixed v-if="this.contrastArray.length > 0" align="center" label="月份" min-width="75">
        <template slot-scope="scope">
          <span>{{scope.row.month}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="当月咨询数/当月加粉数/上月加粉数" min-width="220" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.new_fans_consult}} / {{scope.row.new_fans}} / {{scope.row.last_month_fans}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="咨询数 / 新加好友数" min-width="150" v-if="listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.new_fans_consult}} / {{scope.row.new_fans}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'确认订单数 / 当月粉丝订单数 /\n非当月新粉订单数 / 复购订单数'" min-width="210" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.orders_count}} / {{scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count}} / {{scope.row.other_month_new_fans_orders_count}} / {{scope.row.repurchase_fans_orders_count}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="订单数" min-width="65" v-if="listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.total_orders_count}}</span>
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
      <el-table-column :key="Math.random()" align="center" label="新客户(占比)" min-width="110">
        <template slot-scope="scope">
          <span v-if="scope.row.orders_count > 0">
            {{scope.row.new_fans_orders_count}}({{Math.round(scope.row.new_fans_orders_count / scope.row.orders_count * 100)}}%)
          </span>
          <span v-else>0(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="复购客户(占比)" min-width="110">
        <template slot-scope="scope">
          <span v-if="scope.row.orders_count > 0">
            {{scope.row.repurchase_fans_orders_count}}({{Math.round(scope.row.repurchase_fans_orders_count / scope.row.orders_count * 100)}}%)
          </span>
          <span v-else>0(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="单粉价值" min-width="90" v-if="listQuery.query_type_date">
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">
            ￥{{Math.round(scope.row.orders_sales / scope.row.new_fans)}}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="单粉价值 / 当月单粉价值" min-width="170" v-if="!listQuery.query_type_date">
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
      <el-table-column :key="Math.random()" align="center" label="客单价" min-width="100" v-if="listQuery.query_type_date">
        <template slot-scope="scope">
              <span v-if="scope.row.total_orders_count > 0">
                ￥{{Math.round(scope.row.orders_sales / scope.row.total_orders_count * 100)/100}}
              </span>
          <span v-else>￥0.00</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="客单价 / 非当月新粉客单价 / 复购客单价 / 当月粉丝客单价" min-width="330" v-if="!listQuery.query_type_date">
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
      <el-table-column :key="Math.random()" align="center" label="销售额" min-width="120">
        <template slot-scope="scope">
          <span>￥{{scope.row.orders_sales.toFixed(2)}}</span>
        </template>
      </el-table-column>

      <el-table-column :key="Math.random()" align="center" label="非当月新粉销售额" min-width="150" prop="total_new_consumer_sales_other_month" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>￥{{scope.row.other_month_new_fans_orders_sales}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="复购销售额" min-width="130"  v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>￥{{scope.row.repurchase_fans_orders_sales}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="当日转化率" min-width="95">
        <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">
                {{(scope.row.same_day_new_fans_orders_count/ scope.row.new_fans * 100).toFixed(2)}}%
              </span>
          <span v-else>0%</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="当月粉丝销售额(转化率)" min-width="120" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales}}</span>
          <br/>
          <span v-if="scope.row.new_fans > 0">
            ({{((scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count ) / scope.row.new_fans * 100).toFixed(2) + '%'}} )
          </span>
          <span v-else>(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="后1月粉丝销售额(转化率)" min-width="120" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.later_first_month_fans_orders_sales}}</span>
          <br/>
          <span v-if="scope.row.new_fans > 0">
            ({{(scope.row.later_first_month_fans_orders_count / scope.row.new_fans * 100).toFixed(2) + '%'}} )
          </span>
          <span v-else>(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="后2月粉丝销售额(转化率)" min-width="120" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.later_second_month_fans_orders_sales}}</span>
          <br/>
          <span v-if="scope.row.new_fans > 0">
            ({{(scope.row.later_second_month_fans_orders_count/ scope.row.new_fans * 100).toFixed(2) + '%'}} )
          </span>
          <span v-else>(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="3月合计销售额(转化率)" min-width="120" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales + scope.row.later_first_month_fans_orders_sales + scope.row.later_second_month_fans_orders_sales}}</span>
          <br>
          <span v-if="scope.row.new_fans > 0">
            ({{((scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count + scope.row.later_first_month_fans_orders_count + scope.row.later_second_month_fans_orders_count) / scope.row.new_fans * 100).toFixed(2) + '%'}} )
          </span>
          <span v-else>(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="时段转化率" min-width="90" v-if="listQuery.query_type_date">
        <template slot-scope="scope">
              <span v-if="scope.row.new_fans > 0">
                 {{(scope.row.range_new_fans_orders_count / scope.row.new_fans * 100).toFixed(2) + '%'}}
              </span>
          <span v-else>0.00%</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { getSupportProductStatisticsDataDay, getSupportProductStatisticsDataMonth } from '@/api/support_statistics'
  import { getSupportGroupList } from '@/api/support_member'
  import { getSupportMemberList } from '@/api/support_member'
  import { getUserAccountGroupTeamList } from '@/api/user_group_team'
  import { getUserAccountList } from '@/api/user'
  import { parseTime } from '@/utils/index'
  import waves from '@/directive/waves' // 水波纹指令
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {
    name: 'ProductStatistics',
    components: { },
    directives: {
      waves
    },
    data() {
      return {
        arry: [],
        scrollTop: 0,
        tableKey: 0,
        list: [],
        channelStatisticsDataList: [],
        total: null,
        userGroupOptions:[],
        userGroupTree: [],
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        listLoading: true,
        listQuery: {
          query_type_date: true,
          month: parseTime(new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 30)), '{y}-{m}'),
          support_user_account_group_id: undefined,
          user_account_group_team_id: undefined,
          support_user_account_ids: [],
          date_range: [
            parseTime(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000), '{y}-{m}-{d}'),
            parseTime(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000), '{y}-{m}-{d}')
          ]
        },
        contrast: false,
        spanMethodArray: [],
        contrastArray: [],
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: [{ label: '冻结', key: 0 }, { label: '开启', key: 1 }, { label: '告警', key: 2 }],
        showAuditor: false,
        temp: {
          id: undefined
        },
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        temptotal: {},
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
      this.handleFilter()
    },
    computed: {
      getPromotionChannelSumData() {
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
          range_new_fans_orders_count: 0
        }
        for (const v of this.list) {
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
        let ordersRate = 0
        let this_month_fans_rate = 0
        let later_first_month_fans_rate = 0
        let later_second_month_fans_rate = 0
        let three_month_fans_rate = 0
        let this_month_fans_saler = 0
        let later_first_month_fans_saler = 0
        let later_second_month_fans_saler = 0
        let three_month_fans_saler = 0
        let range_Rate = 0
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
          range_Rate = (innerTempData.range_new_fans_orders_count / innerTempData.new_fans * 100).toFixed(2)
        }
        if (innerTempData.other_month_new_fans_orders_count > 0) {
          other_month_fans_consumerPrice = Math.round(innerTempData.other_month_new_fans_orders_sales / innerTempData.other_month_new_fans_orders_count * 100) / 100
        }
        if (innerTempData.repurchase_fans_orders_count > 0) {
          repurchaseConsumer_consumerPrice = Math.round(innerTempData.repurchase_fans_orders_sales / innerTempData.repurchase_fans_orders_count * 100) / 100
        }
        if (innerTempData.new_fans > 0) {
          ordersRate = (innerTempData.same_day_new_fans_orders_count / innerTempData.new_fans * 100).toFixed(2)
          // 粉丝(转化率)
          this_month_fans_rate = ((innerTempData.this_month_new_fans_orders_count + innerTempData.this_month_repurchase_fans_orders_count) / innerTempData.new_fans * 100).toFixed(2)
          later_first_month_fans_rate = (innerTempData.later_first_month_fans_orders_count / innerTempData.new_fans * 100).toFixed(2)
          later_second_month_fans_rate = (innerTempData.later_second_month_fans_orders_count / innerTempData.new_fans * 100).toFixed(2)
          three_month_fans_rate = ((innerTempData.this_month_new_fans_orders_count + innerTempData.this_month_repurchase_fans_orders_count + innerTempData.later_first_month_fans_orders_count + innerTempData.later_second_month_fans_orders_count) / innerTempData.new_fans * 100).toFixed(2)
        }
        sums[0] = '合计'
        sums[1] = consultCount // 咨询数 / 新加好友数 日数据
        sums[2] = innerTempData.total_orders_count // 订单数 日数据
        sums[3] = uncertainRate + '% / ' + receiveRate + '% / ' + rejectRate + '%' // 未确定订单率/签收率/拒收率
        sums[4] = transformRate + '%' // 转化率
        sums[5] = innerTempData.new_fans_orders_count + '(' + newConsumer + '%)'
        sums[6] = innerTempData.repurchase_fans_orders_count + '(' + repurchaseConsumer + '%)'
        sums[7] = '￥' + fansPrice // 单粉价值
        sums[8] = '￥' + consumerPrice
        sums[9] = '￥' + saleroom
        sums[10] = ordersRate + '%'
        // 月数据
        if (!this.listQuery.query_type_date) {
          sums[1] = innerTempData.new_fans_consult + ' / ' + innerTempData.new_fans + ' / ' + innerTempData.last_month_fans
          sums[2] = ordersCount
          sums[7] = '￥' + fansPrice + '/' + '￥' + this_month_fansPrice
          sums[8] = '￥' + consumerPrice + ' / ￥' + other_month_fans_consumerPrice + ' / ￥' + repurchaseConsumer_consumerPrice + ' / ￥' + thisMonthFansConsumer_consumerPrice
          sums.splice(10, 0, '￥' + newOtherMonthSaleroom, '￥' + repurchaseSaleroom)
          // 月粉丝销售额和转化率
          sums.push(this_month_fans_saler + '(' + this_month_fans_rate + '%)')
          sums.push(later_first_month_fans_saler + '(' + later_first_month_fans_rate + '%)')
          sums.push(later_second_month_fans_saler + '(' + later_second_month_fans_rate + '%)')
          sums.push(three_month_fans_saler + '(' + three_month_fans_rate + '%)')
        } else {
          // 日数据
          sums.push(range_Rate + '%') // 时段转化率
        }
        if (this.contrastArray.length > 0) {
          sums.splice(1, 0, '-')
        }
        return sums
      }
    },
    methods: {
      getSupportUserAccountList(query) {
        if (query !== '') {
          this.supportUserAccountLoading = true
          getSupportMemberList({ nickname: query, status: 1 }).then(response => {
            this.supportUserAccountOptions = response.data.data
            this.supportUserAccountLoading = false
          })
        }
      },
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
      exportExcel() {
        const a = document.getElementById('productMember').cloneNode(true)
        a.removeChild(a.querySelector('.el-table__fixed'))
        var wb = XLSX.utils.table_to_book(a, { raw: true })
        var wbout = XLSX.write(wb, { bookType: 'xlsm', bookSST: true, type: 'array' })
        try {
          FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '客服产品报表.xlsx')
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, wbout)
        }
        return wbout
      },
      getspanMethodArray() {
        const temparray = []
        let contactDot = 0
        this.list.forEach((item, index) => {
          if (index === 0) {
            temparray.push(1)
          } else {
            if (item.product.id === this.list[index - 1].product.id) {
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
      prefixInteger(num, n) {
        return (Array(n).join(0) + num).slice(-n)
      },
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if ((columnIndex === 0) && this.spanMethodArray[rowIndex] !== undefined) {
          const _row = this.spanMethodArray[rowIndex]
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
        // listQuery.query_type_date: false 月数据  true 日数据
        if (this.listQuery.query_type_date) {
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
            if (response.data[i].product.id === this.list[v].product.id) {
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
            if (this.list[i].product.id === this.list[j].product.id) {
              if (this.list[i].month > this.list[j].month) {
                max = this.list[i]
                this.list[i] = this.list[j]
                this.list[j] = max
              }
            }
          }
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
          getSupportProductStatisticsDataMonth(tempQuery).then(response => {
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
        this.userAccountOptions = []
        this.listQuery.support_user_account_ids = []
        this.handleFilter()
      },
      handleGroupTeamFilter() {
        this.listQuery.user_account_ids = []
        this.handleFilter()
      },
      handleUserAccountFilter() {
        // this.listQuery.user_account_group_team_id = undefined
        if (this.listQuery.query_type_date === false) {
          this.getList2()
        } else {
          this.getList3()
        }
      },
      handleQueryTypeChange(type) {
        this.list = []
        this.contrastArray = []
        this.handleFilter()
      },
      getUserAccountList(query) {
        if (query !== '') {
          this.userAccountLoading = true
          getUserAccountList({ nickname: query, user_account_type_code: 'support', user_account_group_id: this.listQuery.support_user_account_group_id, status: 1 }).then(response => {
            this.userAccountOptions = response.data.data
            this.userAccountLoading = false
          })
        } else {
          this.userAccountOptions = []
        }
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
        for (let v = 0; v < this.list.length; v++) {
          if (this.list[v].index === -1) {
            this.list.splice(v, 1)
            v--
          }
        }
        getSupportProductStatisticsDataMonth(this.listQuery).then(response => {
          for (const i in response.data) {
            response.data[i].index = -1
            response.data[i].month = this.listQuery.month
          }
          // this.list = response.data
          this.contrastSort(response)
          this.getspanMethodArray()
          this.listLoading = false
        })
      },
      getList2() {
        this.listLoading = true
        this.list = []
        if (this.listQuery.month !== null) {
          getSupportProductStatisticsDataMonth(this.listQuery).then(response => {
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
            getSupportProductStatisticsDataMonth(tempQuery).then(response => {
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
        getSupportProductStatisticsDataDay(this.listQuery).then(res => {
          this.list = res.data
          this.getspanMethodArray()
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
  .el-table >>> thead{
    font-size: 13px;
  }
  .el-table >>> td{
    padding: 6px 0;
  }
  .el-table{
    font-size: 14px;
  }
</style>
