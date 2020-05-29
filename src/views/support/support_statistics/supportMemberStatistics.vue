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
        <el-cascader size="small"
                     style="width: 300px"
                     clearable
                     :options="userGroupTree"
                     change-on-select
                     placeholder="请选择"
                     :props="defaultPropsGroup"
                     v-model="userGroupOptions"
                     @change="handleFilterGrounp">
        </el-cascader>
      </div>
      <div class="filter-float">
        <el-button type="primary" class="filter-item" size="small" @click="exportExcel" icon="el-icon-download" v-waves
                   v-if="$store.state.user.roles === 'administrator'">导出Excel
        </el-button>

      </div>
      <div class="filter-item" style="width: 100%">
        <div class="filter-label">客服</div>
        <el-select size="small"
                   style="width: 80%"
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
        <el-date-picker v-model="listQuery.date_range"
                        type="daterange"
                        size="small"
                        style="width: 260px"
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
                        placeholder="选择"
                        @change='handleFilter'>
        </el-date-picker>
        <el-button v-show="!listQuery.query_type_date"
                   type="primary"
                   size="small"
                   v-waves icon="el-icon-circle-plus-outline"
                   @click="addContrast">新增对比
        </el-button>
      </div>

       <template v-for="(item, index) in contrastArray">
         <div class="filter-item" v-show="!listQuery.query_type_date">
           <div class="filter-label">对比</div>
           <el-date-picker format="yyyy-MM"
                           value-format="yyyy-MM"
                           v-model="item.month"
                           :clearable="false"
                           size="small"
                           align="bottom"
                           type="month"
                           :picker-options="pickerOptions1"
                           placeholder="选择"
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

    <el-table :span-method="objectSpanMethod" id="supportMember" show-summary
              :summary-method="getPromotionChannelSummaries" :stripe="true" :data="list" v-loading="listLoading"
              element-loading-text="给我一点时间" border fit highlight-current-row
              ref="table"
              style="width: 100%">
      <el-table-column :key="Math.random()" fixed align="center" label="客服" min-width="150">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.user_account.nickname}}</span><br/>
          <el-tag type="success" v-if="scope.row.user_account.status === 1">在</el-tag>
          <el-tag type="danger" v-if="scope.row.user_account.status === 0">离</el-tag>
          <span v-if="scope.row.user_account.created_at">{{scope.row.user_account.created_at.slice(0,10)}}入职</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="产品" min-width="100">
        <template slot-scope="scope">
          <el-tag :key="item.product_name" type="info" v-for="item in scope.row.user_account.support_product">{{item.product_name}} </el-tag>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" fixed v-if="this.contrastArray.length > 0" align="center" label="月份" min-width="75">
        <template slot-scope="scope">
          <span>{{scope.row.month}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="当月咨询数/当月加粉数/上月加粉数" min-width="140" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.new_fans_consult}}</span> /
          <span>{{scope.row.new_fans}}</span> /
          <span>{{scope.row.last_month_fans}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="咨询数 / 新加好友数" min-width="150" v-if="listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.new_fans_consult}} / {{scope.row.new_fans}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'确认订单数\n 当月新粉 / 非当月新粉 \n 当月复购 / 非当月复购'" width="170" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span> {{scope.row.orders_count}} / {{scope.row.this_month_new_fans_orders_count}} / {{scope.row.other_month_new_fans_orders_count}} / {{scope.row.this_month_repurchase_fans_orders_count}} / {{scope.row.other_month_repurchase_fans_orders_count}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="订单数" min-width="65" v-if="listQuery.query_type_date">
        <template slot-scope="scope">
          <span>{{scope.row.total_orders_count}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="未确定率/ 签收率/ 拒收率" min-width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.total_orders_count > 0">
            {{Math.round(scope.row.deliver_orders_count / scope.row.total_orders_count * 10000) / 100.00}}% /
            {{Math.round((scope.row.orders_count - scope.row.deliver_orders_count) / scope.row.total_orders_count * 10000) / 100.00}}% /
            {{Math.round(scope.row.reject_orders_count / scope.row.total_orders_count * 10000) / 100.00}}%
          </span>
          <span v-else>0% / 0% / 0%</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="转化率" min-width="90">
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">
            {{ (scope.row.total_orders_count / scope.row.new_fans * 100).toFixed(2) }}%
          </span>
          <span v-else>0%</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="新客户(占比)" min-width="110">
        <template slot-scope="scope">
          <span v-if="scope.row.orders_count > 0">{{scope.row.new_fans_orders_count}}</span><br>
          <span v-if="scope.row.orders_count > 0">({{Math.round(scope.row.new_fans_orders_count / scope.row.orders_count * 100)}}%)</span>
          <span v-else>0<br/>(0%)</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="复购客户(占比)" min-width="110">
        <template slot-scope="scope">
          <span v-if="scope.row.orders_count > 0">{{scope.row.repurchase_fans_orders_count}}</span><br>
          <span v-if="scope.row.orders_count > 0">({{Math.round(scope.row.repurchase_fans_orders_count / scope.row.orders_count * 100)}}%)</span>
          <span v-else>0<br/>(0%)</span>
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
      <el-table-column :key="Math.random()" align="center" :label="'单粉价值/\n当月单粉价值'" min-width="150" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">￥{{Math.round(scope.row.orders_sales / scope.row.new_fans)}}/</span>
          <span v-else>￥0/</span>
          <span v-if="scope.row.new_fans > 0">￥{{Math.round((scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales) / scope.row.new_fans)}}</span>
          <span v-else>￥0 </span>
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
      <el-table-column :key="Math.random()" align="center" label="客单价/非当月新粉客单价/复购客单价/当月粉丝客单价" min-width="350" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span v-if="scope.row.orders_count > 0">￥{{Math.round(scope.row.orders_sales / scope.row.total_orders_count * 100)/100}} /</span>
          <span v-else>￥0.00 /</span>
          <span v-if="scope.row.other_month_new_fans_orders_count > 0">￥{{Math.round(scope.row.other_month_new_fans_orders_sales / scope.row.other_month_new_fans_orders_count * 100)/100}} /</span>
          <span v-else>￥0.00 /</span>
          <span v-if="scope.row.repurchase_fans_orders_count > 0">￥{{Math.round(scope.row.repurchase_fans_orders_sales / scope.row.repurchase_fans_orders_count * 100)/100}} /</span>
          <span v-else>￥0.00 /</span>
          <span v-if="scope.row.this_month_new_fans_orders_count > 0 || scope.row.this_month_repurchase_fans_orders_count > 0">￥{{Math.round((scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales) / (scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count) * 100)/100}} </span>
          <span v-else>￥0.00</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="总销售额" min-width="120" prop="total_sales">
        <template slot-scope="scope">
          <span>￥{{Math.round(scope.row.orders_sales * 100) / 100}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'新粉销售额\n当月 / 非当月'" min-width="180" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span style="font-weight: bold">￥{{Math.round(scope.row.new_fans_orders_sales * 100) / 100}}</span>
          <br>
          <span>(￥{{Math.round(scope.row.this_month_new_fans_orders_sales * 100) / 100}} /</span>
          <span>￥{{Math.round(scope.row.other_month_new_fans_orders_sales * 100) / 100}} )</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'复购销售额\n当月 / 非当月'" min-width="180" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span style="font-weight: bold">￥{{Math.round(scope.row.repurchase_fans_orders_sales * 100) / 100}}</span>
          <br>
          <span>(￥{{Math.round(scope.row.this_month_repurchase_fans_orders_sales * 100) / 100}} /</span>
          <span>￥{{Math.round(scope.row.other_month_repurchase_fans_orders_sales * 100) / 100}} )</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="当日转化率" min-width="95">
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">
            {{Math.round(scope.row.same_day_new_fans_orders_count/ scope.row.new_fans * 10000) / 100}}%
          </span>
          <span v-else>0%</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="当月新粉转化率" min-width="120" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">
            {{ Math.round(scope.row.this_month_new_fans_orders_count / scope.row.new_fans * 10000) / 100 }}%
          </span>
          <span v-else>0%</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'后1月粉丝销售额'" min-width="120" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>¥ {{scope.row.later_first_month_fans_orders_sales}}</span>
          <!--<br>-->
          <!--<span v-if="scope.row.new_fans > 0">-->
            <!--( {{ Math.round(scope.row.later_first_month_fans_orders_count / scope.row.new_fans * 10000) / 100}} %)-->
          <!--</span>-->
          <!--<span v-else>(0%)</span>-->
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'后2月粉丝销售额'" min-width="120" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>¥ {{scope.row.later_second_month_fans_orders_sales}}</span>
          <!--<br>-->
          <!--<span v-if="scope.row.new_fans > 0">-->
            <!--( {{ Math.round(scope.row.later_second_month_fans_orders_count/ scope.row.new_fans * 10000) / 100}} % )-->
          <!--</span>-->
          <!--<span v-else>(0%)</span>-->
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" :label="'3月合计销售额'" min-width="120" v-if="!listQuery.query_type_date">
        <template slot-scope="scope">
          <span>¥ {{scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales + scope.row.later_first_month_fans_orders_sales + scope.row.later_second_month_fans_orders_sales}}</span>
          <!--<br>-->
          <!--<span v-if="scope.row.new_fans > 0">-->
            <!--( {{ Math.round((scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count + scope.row.later_first_month_fans_orders_count + scope.row.later_second_month_fans_orders_count) / scope.row.new_fans * 10000) / 100 }} %)-->
          <!--</span>-->
          <!--<span v-else>(0%)</span>-->
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="时段转化率" min-width="90" v-if="listQuery.query_type_date">
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">
            {{Math.round(scope.row.range_new_fans_orders_count / scope.row.new_fans* 10000) / 100}} %
          </span>
          <span v-else>0.00%</span>
        </template>
      </el-table-column>
    </el-table>
    <br><br>

  </div>
</template>

<script>
  import { getSupportMemberStatisticsDataDay, getSupportMemberStatisticsDataMonth } from '@/api/support_statistics'
  import { getSupportGroupList } from '@/api/support_member'
  import { getSupportMemberList } from '@/api/support_member'
  import { getUserAccountGroupTeamList } from '@/api/user_group_team'
  import { parseTime } from '@/utils/index'
  import waves from '@/directive/waves' // 水波纹指令
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {
    name: 'SupportMemberStatistics',
    components: {},
    directives: {
      waves
    },
    data() {
      return {
        arry: [],
        scrollTop: 0,
        supportMember2table: false,
        // tableKey: 0,
        list: [],
        list2: [],
        channelStatisticsDataList: [],
        total: null,
        listLoading: true,
        listQuery: {
          // listQuery.query_type_date: false 月数据  true 日数据
          query_type_date: false,
          month: parseTime(new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 30)), '{y}-{m}'),
          support_user_account_ids: [],
          promotion_user_account_group_id: undefined,
          support_user_account_group_id: undefined,
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
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        temptotal: {},
        userGroupOptions:[],
        userGroupTree: [],
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        exportExcelLoading: true,
        userGroupOptions2: [],
        userGroupTeamOptions: [],
        userAccountOptions: [],
        userAccountLoading: false,
        productTabSelected: false,
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        pickerOptions1: {
          disabledDate: time => {
            const temp = []
            const tempdisabled = time.getFullYear() + '-' + this.prefixInteger(time.getMonth() + 1, 2)
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
          other_month_repurchase_fans_orders_count: 0,
          other_month_repurchase_fans_orders_sales: 0,
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
          innerTempData.other_month_repurchase_fans_orders_count += parseFloat(v.other_month_repurchase_fans_orders_count)
          innerTempData.other_month_repurchase_fans_orders_sales += parseFloat(v.other_month_repurchase_fans_orders_sales)
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
        let ordersCount = 0
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
        let new_fans_salers = 0
        let repurchase_fans_salers = 0
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
        ordersCount = innerTempData.orders_count + ' / ' + innerTempData.this_month_new_fans_orders_count + ' / ' + innerTempData.other_month_new_fans_orders_count + ' / ' + innerTempData.this_month_repurchase_fans_orders_count + ' / ' + innerTempData.other_month_repurchase_fans_orders_count
        saleroom = innerTempData.orders_sales
        new_fans_salers = innerTempData.new_fans_orders_sales + '(' + innerTempData.this_month_new_fans_orders_sales + '/' + innerTempData.other_month_new_fans_orders_sales + ')'
        repurchase_fans_salers = innerTempData.repurchase_fans_orders_sales + '(' + innerTempData.this_month_repurchase_fans_orders_sales + '/' + innerTempData.other_month_repurchase_fans_orders_sales + ')'
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
        sums[3] = uncertainRate + '% / ' + receiveRate + '% / ' + rejectRate + '%'
        sums[4] = transformRate + '%'
        sums[5] = innerTempData.new_fans_orders_count + '(' + newConsumer + '%)'
        sums[6] = innerTempData.repurchase_fans_orders_count + '(' + repurchaseConsumer + '%)'
        sums[7] = '￥' + fansPrice
        sums[8] = '￥' + consumerPrice
        sums[9] = '￥' + saleroom
        sums[10] = ordersRate + '%'
        // 月数据
        if (!this.listQuery.query_type_date) {
          sums[1] = innerTempData.new_fans_consult + ' / ' + innerTempData.new_fans + ' / ' + innerTempData.last_month_fans
          sums[2] = ordersCount
          sums[7] = '￥' + fansPrice + '/' + '￥' + this_month_fansPrice
          sums[8] = '￥' + consumerPrice + ' / ￥' + other_month_fans_consumerPrice + ' / ￥' + repurchaseConsumer_consumerPrice + ' / ￥' + thisMonthFansConsumer_consumerPrice
          sums.splice(10, 0, new_fans_salers, repurchase_fans_salers)
          // 月粉丝销售额和转化率
          // sums.push(this_month_fans_saler + '(' + this_month_fans_rate + '%)')
          // sums.push(later_first_month_fans_saler + '(' + later_first_month_fans_rate + '%)')
          // sums.push(later_second_month_fans_saler + '(' + later_second_month_fans_rate + '%)')
          // sums.push(three_month_fans_saler + '(' + three_month_fans_rate + '%)')
          sums.push(this_month_fans_rate + '%')
          sums.push(later_first_month_fans_saler)
          sums.push(later_second_month_fans_saler)
          sums.push(three_month_fans_saler)
        } else {
          // 日数据
          sums.push(range_Rate)
        }
        if (this.contrastArray.length > 0) {
          sums.splice(1, 0, '-')
        }
        sums.splice(1, 0, '-') // 产品
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
        const a = document.getElementById('supportMember').cloneNode(true)
        a.removeChild(a.querySelector('.el-table__fixed'))
        var wb = XLSX.utils.table_to_book(a, { raw: true })
        var wbout = XLSX.write(wb, { bookType: 'xlsm', bookSST: true, type: 'array' })
        try {
          FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '客服人员报表.xlsx')
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
            if (item.user_account.id === this.list[index - 1].user_account.id) {
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
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0 && this.spanMethodArray[rowIndex] !== undefined) {
          const _row = this.spanMethodArray[rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col
          }
        }
      },
      prefixInteger(num, n) {
        return (Array(n).join(0) + num).slice(-n)
      },
      handleFilter() {
        // query_type_date: false 月数据  true 日数据
        if (this.listQuery.query_type_date) {
          this.getList_day()
        } else {
          this.getList_month()
        }
      },
      addContrast() {
        this.contrastArray.push({
          month: ''
        })
      },
      contrastSort(response) {
        if (response.data.length > 0) {
          this.list = this.list.filter(item => {
            return item.index !== response.data[0].index
          })
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
        }
      },
      handleContrastDelete(index) {
        this.contrastArray.splice(index, 1)
        this.list = this.list.filter(item => {
          return item.index !== index
        })
        this.list.forEach((item2, index2, arr) => {
          if (item2.index > index) {
            arr[index2].index -= 1
          }
        })
        this.getspanMethodArray()
      },
      handleContrast(item, index) {
        this.listLoading = true
        const tempQuery = Object.assign({}, this.listQuery)
        tempQuery.month = item.month
        getSupportMemberStatisticsDataMonth(tempQuery).then(response => {
          for (const i of response.data) {
            i.index = index
            i.month = item.month
          }
          this.contrastSort(response)
          this.getspanMethodArray()
          this.listLoading = false
        })
      },
      handleGroupFilter() {
        this.userGroupTeamOptions = []
        this.listQuery.support_user_account_ids = []
        this.handleFilter()
      },
      handleGroupTeamFilter() {
        this.listQuery.support_user_account_ids = []
        this.handleFilter()
      },
      handleUserAccountFilter() {
        this.handleFilter()
      },
      handleQueryTypeChange(type) {
        this.list = []
        this.contrastArray = []
        this.handleFilter()
      },
      getGroupTeamList() {
        const params = {}
        params.user_account_group_id = this.listQuery.user_account_group_id
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
      getList_month() {
        this.listLoading = true
        getSupportMemberStatisticsDataMonth(this.listQuery).then(response => {
          for (const i of response.data) {
            i.index = -1
            i.month = this.listQuery.month
          }
          this.contrastSort(response)
          this.getspanMethodArray()
          this.listLoading = false
        })
        if (this.contrastArray.length > 0) {
          for (const v in this.contrastArray) {
            if (this.contrastArray[v].month) {
              const tempQuery = Object.assign({}, this.listQuery)
              tempQuery.month = this.contrastArray[v].month
              getSupportMemberStatisticsDataMonth(tempQuery).then(response => {
                for (const i of response.data) {
                  i.index = parseInt(v)
                  i.month = this.contrastArray[v].month
                }
                this.listLoading = true
                this.contrastSort(response)
                this.getspanMethodArray()
                this.listLoading = false
              })
            }
          }
        }
      },
      getList_day() {
        this.listLoading = true
        getSupportMemberStatisticsDataDay(this.listQuery).then(res => {
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
  .el-table >>> thead {
    font-size: 13px;
  }
  .el-table {
    font-size: 14px;
  }
  .el-table >>> td{
    padding: 4px 0;
  }
  .el-tag {
    padding: 0 4px;
    font-size: 14px;
    line-height: 26px;
    height: 26px;
  }
</style>
