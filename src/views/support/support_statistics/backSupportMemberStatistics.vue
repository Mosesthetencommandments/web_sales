<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-select @change='handleFilter' @focus="getModelTimeList" style="width: 200px" class="filter-item"
                 v-model="listQuery.start_id" placeholder="转号时间点">
        <el-option v-for="item in modelTimeOptions" :key="item.id" :label="item.remark"
                   :value="item.id">
        </el-option>
      </el-select>
      <el-cascader
        class="filter-item"
        clearable
        :options="userGroupTree"
        change-on-select
        placeholder="客服组"
        :props="defaultPropsGroup"
        v-model="userGroupOptions"
        @change="handleFilterGrounp">
      </el-cascader>
      <el-select
        class="filter-item"
        style="width: 150px"
        @focus="getSupportUserAccountList(' ')"
        @change='handleFilter'
        v-model="listQuery.support_user_account_id"
        multiple
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
      <el-select
        class="filter-item"
        @change='handleFilter'
        v-model="listQuery.product_ids"
        multiple
        @focus="getUserAccountList(' ')"
        filterable
        remote
        placeholder="请选择产品"
        :remote-method="getUserAccountList"
        :loading="userAccountLoading">
        <el-option
          v-for="item in userAccountOptions"
          :key="item.nickname"
          :label="item.nickname"
          :value="item.id">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button type="primary" class="filter-item" @click="exportExcel" icon="el-icon-download" v-waves
                 v-if="$store.state.user.roles === 'administrator'">导出Excel
      </el-button>
    </div>

    <el-table :span-method="objectSpanMethod" id="supportMember"
              :stripe="true"
              :data="list"
              v-loading="listLoading"
              element-loading-text="给我一点时间" border fit highlight-current-row
              ref="table"
              style="width: 100%">
      <el-table-column :key="Math.random()" fixed align="center" label="客服" min-width="100">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.support_member.nickname}}</span><br/>
          <!--<el-tag type="success" v-if="scope.row.support_member.status === 1">在</el-tag>-->
          <!--<el-tag type="danger" v-if="scope.row.support_member.status === 0">离</el-tag>-->
          <!--<span>{{scope.row.support_member.created_at.slice(0,10)}}入职</span>-->
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" fixed align="center" label="微信号" min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.product_weixin.info}}</span>
          <!--<span>{{scope.row.product_weixin.weixin_account}}</span>-->
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="状态" min-width="190">
        <template slot-scope="scope">
          <span>{{scope.row.range[0]}}</span> ~
          <span v-if="scope.row.range[1] === null">今</span>
          <span v-else>{{scope.row.range[1]}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="总销售额 / 新粉 / 复购" min-width="200">
        <template slot-scope="scope">
          <span>￥{{Math.round(scope.row.orders_sales * 100) / 100}}</span> /
          <span>￥{{Math.round(scope.row.new_fans_orders_sales * 100) / 100}}</span> /
          <span>￥{{Math.round(scope.row.repurchase_fans_orders_sales * 100) / 100}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="加粉数" min-width="140">
        <template slot-scope="scope">
          <span>{{scope.row.new_fans}}</span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="确认订单数" min-width="140">
        <template slot-scope="scope">
          <span>{{scope.row.orders_count}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column :key="Math.random()" align="center" label="确认订单数/ 当月粉丝订单数/ 非当月新粉订单数/ 复购订单数" width="150" v-if="!listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span>{{scope.row.orders_count}} / {{scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count}} / {{scope.row.other_month_new_fans_orders_count}} / {{scope.row.repurchase_fans_orders_count}}</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column :key="Math.random()" align="center" label="订单数" min-width="65" v-if="listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span>{{scope.row.total_orders_count}}</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column :key="Math.random()" align="center" label="未确定率/ 签收率/ 拒收率" min-width="180">-->
      <!--<template slot-scope="scope">-->
      <!--<span v-if="scope.row.total_orders_count > 0">-->
      <!--{{Math.round(scope.row.deliver_orders_count / scope.row.total_orders_count * 10000) / 100.00}}% /-->
      <!--{{Math.round((scope.row.orders_count - scope.row.deliver_orders_count) / scope.row.total_orders_count * 10000) / 100.00}}% /-->
      <!--{{Math.round(scope.row.reject_orders_count / scope.row.total_orders_count * 10000) / 100.00}}%-->
      <!--</span>-->
      <!--<span v-else>0% / 0% / 0%</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column :key="Math.random()" align="center" label="转化率" min-width="80">
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">{{ (scope.row.total_orders_count / scope.row.new_fans * 100).toFixed(2) }} %</span>
          <span v-else>0%</span>
        </template>
      </el-table-column>
      <!--<el-table-column :key="Math.random()" align="center" label="新客户(占比)" min-width="110">-->
      <!--<template slot-scope="scope">-->
      <!--<span v-if="scope.row.orders_count > 0">{{scope.row.new_fans_orders_count}}</span><br>-->
      <!--<span v-if="scope.row.orders_count > 0">({{Math.round(scope.row.new_fans_orders_count / scope.row.orders_count * 100)}}%)</span>-->
      <!--<span v-else>0<br/>(0%)</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column :key="Math.random()" align="center" label="复购客户(占比)" min-width="110">-->
      <!--<template slot-scope="scope">-->
      <!--<span v-if="scope.row.orders_count > 0">{{scope.row.repurchase_fans_orders_count}}</span><br>-->
      <!--<span v-if="scope.row.orders_count > 0">({{Math.round(scope.row.repurchase_fans_orders_count / scope.row.orders_count * 100)}}%)</span>-->
      <!--<span v-else>0<br/>(0%)</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column :key="Math.random()" align="center" label="单粉价值" min-width="90" >
        <template slot-scope="scope">
          <span v-if="scope.row.new_fans > 0">
            ￥{{Math.round(scope.row.orders_sales / scope.row.new_fans)}}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <!--<el-table-column :key="Math.random()" align="center" :label="'单粉价值/\n当月单粉价值'" min-width="130" v-if="!listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span v-if="scope.row.new_fans > 0">￥{{Math.round(scope.row.orders_sales / scope.row.new_fans)}} /</span>-->
      <!--<span v-else>￥0 /</span>-->
      <!--<span v-if="scope.row.new_fans > 0">￥{{Math.round((scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales) / scope.row.new_fans)}}</span>-->
      <!--<span v-else>￥0 </span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column :key="Math.random()" align="center" label="客单价" min-width="100">
        <template slot-scope="scope">
              <span v-if="scope.row.total_orders_count > 0">
                ￥{{Math.round(scope.row.orders_sales / scope.row.orders_count * 100)/100}}
              </span>
          <span v-else>￥0.00</span>
        </template>
      </el-table-column>
      <!--<el-table-column :key="Math.random()" align="center" label="客单价/非当月新粉客单价/复购客单价/当月粉丝客单价" min-width="350" v-if="!listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span v-if="scope.row.orders_count > 0">￥{{Math.round(scope.row.orders_sales / scope.row.total_orders_count * 100)/100}} /</span>-->
      <!--<span v-else>￥0.00 /</span>-->
      <!--<span v-if="scope.row.other_month_new_fans_orders_count > 0">￥{{Math.round(scope.row.other_month_new_fans_orders_sales / scope.row.other_month_new_fans_orders_count * 100)/100}} /</span>-->
      <!--<span v-else>￥0.00 /</span>-->
      <!--<span v-if="scope.row.repurchase_fans_orders_count > 0">￥{{Math.round(scope.row.repurchase_fans_orders_sales / scope.row.repurchase_fans_orders_count * 100)/100}} /</span>-->
      <!--<span v-else>￥0.00 /</span>-->
      <!--<span v-if="scope.row.this_month_new_fans_orders_count > 0 || scope.row.this_month_repurchase_fans_orders_count > 0">￥{{Math.round((scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales) / (scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count) * 100)/100}} </span>-->
      <!--<span v-else>￥0.00</span>-->
      <!--</template>-->
      <!--</el-table-column>-->

      <!--<el-table-column :key="Math.random()" align="center" :label="'非当月新粉\n销售额'" min-width="120" v-if="!listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span>￥{{scope.row.other_month_new_fans_orders_sales}}</span>-->
      <!--</template>-->
      <!--</el-table-column>-->

      <!--<el-table-column :key="Math.random()" align="center" label="当日转化率" min-width="95">-->
      <!--<template slot-scope="scope">-->
      <!--<span v-if="scope.row.new_fans > 0">-->
      <!--{{(scope.row.same_day_new_fans_orders_count/ scope.row.new_fans * 100).toFixed(2)}}%-->
      <!--</span>-->
      <!--<span v-else>0%</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column :key="Math.random()" align="center" label="当月粉丝销售额(转化率)" min-width="120" v-if="!listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span>{{scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales}}</span>-->
      <!--<span v-if="scope.row.new_fans > 0">-->
      <!--({{((scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count ) / scope.row.new_fans * 100).toFixed(2) + '%'}} )-->
      <!--</span>-->
      <!--<span v-else>(0%)</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column :key="Math.random()" align="center" label="后1月粉丝销售额(转化率)" min-width="120" v-if="!listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span>{{scope.row.later_first_month_fans_orders_sales}}</span>-->
      <!--<span v-if="scope.row.new_fans > 0">-->
      <!--({{(scope.row.later_first_month_fans_orders_count / scope.row.new_fans * 100).toFixed(2)}} %)-->
      <!--</span>-->
      <!--<span v-else>(0%)</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column :key="Math.random()" align="center" label="后2月粉丝销售额(转化率)" min-width="120" v-if="!listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span>{{scope.row.later_second_month_fans_orders_sales}}</span>-->
      <!--<span v-if="scope.row.new_fans > 0">-->
      <!--({{(scope.row.later_second_month_fans_orders_count/ scope.row.new_fans * 100).toFixed(2) + '%'}} )-->
      <!--</span>-->
      <!--<span v-else>(0%)</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column :key="Math.random()" align="center" label="3月合计销售额(转化率)" min-width="120" v-if="!listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span>{{scope.row.this_month_new_fans_orders_sales + scope.row.this_month_repurchase_fans_orders_sales + scope.row.later_first_month_fans_orders_sales + scope.row.later_second_month_fans_orders_sales}}</span>-->
      <!--<span v-if="scope.row.new_fans > 0">-->
      <!--({{((scope.row.this_month_new_fans_orders_count + scope.row.this_month_repurchase_fans_orders_count + scope.row.later_first_month_fans_orders_count + scope.row.later_second_month_fans_orders_count) / scope.row.new_fans * 100).toFixed(2) + '%'}} )-->
      <!--</span>-->
      <!--<span v-else>(0%)</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--<el-table-column :key="Math.random()" align="center" label="时段转化率" min-width="90" v-if="listQuery.query_type_date">-->
      <!--<template slot-scope="scope">-->
      <!--<span v-if="scope.row.new_fans > 0">-->
      <!--{{(scope.row.range_new_fans_orders_count / scope.row.new_fans* 100).toFixed(2) + '%'}}-->
      <!--</span>-->
      <!--<span v-else>0.00%</span>-->
      <!--</template>-->
      <!--</el-table-column>-->
    </el-table>
  </div>
</template>

<script>
  import { getBackSupportMemberStatistics } from '@/api/support_statistics'
  import { getSupportTransModelTimeList } from '@/api/support_member'
  import { getSupportGroupList } from '@/api/support_member'
  import { getSupportMemberList } from '@/api/support_member'
  import { getUserAccountGroupList } from '@/api/user_group'
  import { getUserAccountGroupTeamList } from '@/api/user_group_team'
  import { getUserAccountList } from '@/api/user'
  import waves from '@/directive/waves' // 水波纹指令
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {
    name: 'frontStatistics',
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
        listLoading: false,
        listQuery: {
          user_account_group_id: true,
          promotion_user_account_group_id: undefined,
          support_user_account_group_id: undefined,
          start_id: undefined,
          product_ids: [],
          channel_ids: [],
          support_user_account_ids: []
        },
        contrast: false,
        spanMethodArray: [],
        contrastArray: [],
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        userGroupOptions:[],
        userGroupTree: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
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
        exportExcelLoading: true,
        userGroupOptions: [],
        userGroupOptions2: [],
        modelTimeOptions: [],
        userGroupTeamOptions: [],
        userAccountOptions: [],
        productOptions: [],
        userAccountLoading: false,
        productLoading: false,
        productTabSelected: false,
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
      this.getModelTimeList()
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
          sums.splice(10, 0, '￥' + newOtherMonthSaleroom, '￥' + repurchaseSaleroom)
          // 月粉丝销售额和转化率
          sums.push(this_month_fans_saler + '(' + this_month_fans_rate + '%)')
          sums.push(later_first_month_fans_saler + '(' + later_first_month_fans_rate + '%)')
          sums.push(later_second_month_fans_saler + '(' + later_second_month_fans_rate + '%)')
          sums.push(three_month_fans_saler + '(' + three_month_fans_rate + '%)')
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
            if (item.support_member.id === this.list[index - 1].support_member.id) {
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
        this.listQuery.page = 1
        this.getList()
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
      getUserAccountList(query) {
        if (query !== '') {
          this.userAccountLoading = true
          getUserAccountList({
            nickname: query,
            user_account_type_code: 'support',
            user_account_group_id: this.listQuery.support_user_account_group_id,
            status: 1
          }).then(response => {
            this.userAccountOptions = response.data.data
            this.userAccountLoading = false
          })
        } else {
          this.userAccountOptions = []
        }
      },
      getGroupList() {
        getUserAccountGroupList({ user_account_type_id: 2 }).then(response => {
          if (response.data.data) {
            this.userGroupOptions = response.data.data
          }
        })
      },
      getGroupList2() {
        getUserAccountGroupList({ user_account_type_id: 1 }).then(response => {
          if (response.data.data) {
            this.userGroupOptions2 = response.data.data
          }
        })
      },
      getModelTimeList() {
        getSupportTransModelTimeList({ sort: '-date' }).then(response => {
          if (response.data) {
            this.modelTimeOptions = response.data
          }
        })
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
      getList() {
        if (!this.listQuery.start_id) {
          this.$message.error('选择转号时间点')
          return false
        }
        this.listLoading = true
        getBackSupportMemberStatistics(this.listQuery).then(res => {
          const list = []
          for (const v in res.data) {
            for (const i in res.data[v]) {
              list.push(res.data[v][i])
            }
          }
          this.list = list
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
    font-size: 14px;
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
