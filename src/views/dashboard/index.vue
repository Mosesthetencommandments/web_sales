<template>
  <div class="dashboard-editor-container" v-if="false">
    <el-row ref="rowBox" class="panel-group" :gutter="20">
      <el-col :xs="12" :sm="12" :lg="screen" class="card-panel-col" v-if="this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'warehouse'">
        <div class='card-panel'>
          <div class="card-panel-icon-wrapper icon-people">
            <!--<i class="icon iconfont icon-daifahuo1"></i>-->
            <svg-icon icon-class="pending_delivery" class="svg_icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">待发货</div>
            <div class="card-panel-text">{{need_delivery_orders_count}}</div>
            <!--<count-to class="card-panel-num" :startVal="0" :endVal="102400" :duration="2600"></count-to>-->
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="screen" class="card-panel-col" v-if="this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'warehouse'">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="already_shipped" class="svg_icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text" v-if="">当日已发货</div>
            <div class="card-panel-text">{{today_delivered_orders_count}}</div>
            <!--<count-to class="card-panel-num" :startVal="0" :endVal="81212" :duration="3000"></count-to>-->
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="screen" class="card-panel-col" v-if="this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'promotionGroup' || this.$store.state.user.roles === 'promotionManager' || this.$store.state.user.roles === 'promotion' || this.$store.state.user.roles === 'promotionDirector'">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="add_fans" class="svg_icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text" v-if="">昨日加粉</div>
            <div class="card-panel-text">{{yestday_add_count_total}} <span style="font-weight: bold;">/</span> {{yestday_consult_count_total}}</div>
            <!--<count-to class="card-panel-num" :startVal="0" :endVal="81212" :duration="3000"></count-to>-->
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="screen" class="card-panel-col" v-if="this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'promotionGroup' || this.$store.state.user.roles === 'promotionManager' || this.$store.state.user.roles === 'promotion' || this.$store.state.user.roles === 'promotionDirector'" >
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shoppingCard">
            <svg-icon icon-class="now_fans" class="svg_icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text" v-if="">今日加粉</div>
            <div class="card-panel-text">{{today_add_count_total}} <span style="font-weight: bolder">/</span>  {{today_consult_count_total}}</div>
            <!--<count-to class="card-panel-num" :startVal="0" :endVal="81212" :duration="3000"></count-to>-->
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row v-show="false">
      <el-col :xs="12" :sm="12" :lg="12" class="card-panel-col" >
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <i class="icon iconfont icon-daifahuo1"></i>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">待发货</div>
            <div class="card-panel-text">11</div>
            <!--<count-to class="card-panel-num" :startVal="0" :endVal="9280" :duration="3200"></count-to>-->
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="12" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-shoppingCard">
            <svg-icon icon-class="unfinished" class="svg_icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text" v-if="">未完成</div>
            <div class="card-panel-text">10</div>
            <!--<count-to class="card-panel-num" :startVal="0" :endVal="81212" :duration="3000"></count-to>-->
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row v-show="false">
      <el-col :xs="12" :sm="12" :lg="12" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="addFans" class="svg_icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text" v-if="">昨日加分数据</div>
            <div class="card-panel-text">10</div>
            <!--<count-to class="card-panel-num" :startVal="0" :endVal="81212" :duration="3000"></count-to>-->
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="12" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-score">
            <svg-icon icon-class="integral" class="svg_icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text" v-if="">目前积分</div>
            <div class="card-panel-text">10</div>
            <!--<count-to class="card-panel-num" :startVal="0" :endVal="81212" :duration="3000"></count-to>-->
          </div>
        </div>
      </el-col>
    </el-row>


    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;" v-show="false">
      <el-col :span="24">
        <div id="myPromotionChart" :style="{height:height,width:width}"></div>
      </el-col>
    </el-row>
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;" v-show="this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'warehouse'">
      <el-date-picker
        v-model="warehouseMothQuery"
        style="margin-bottom: 20px;"
        type="month"
        format="yyyy-MM"
        value-format="yyyy-MM"
        :clearable="false"
        @change="initWarehouseLineData"
        placeholder="选择月">
      </el-date-picker>
      <el-col :span="24">
        <div id="myWarehouseChart" :style="{width: '100%', height: '500px'}"></div>
      </el-col>
    </el-row>
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;"  v-show="false">
      <el-col :span="24">
        <div id="mySupportChart" :style="{width: '100%', height: '500px'}"></div>
      </el-col>
    </el-row>
    <!--<el-row class="panel-group" :gutter="40" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;" v-if="this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'promotionGroup' || this.$store.state.user.roles === 'promotionManager'">-->
      <!--<el-col :span="12" class="card-panel-col" v-if="this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'promotionGroup' || this.$store.state.user.roles === 'promotionManager'">-->
        <!---->

      <!--</el-col>-->
      <!--<el-col :span="12"></el-col>-->
    <!--</el-row>-->

    <el-row ref="rowBox" class="panel-group" :gutter="40" v-if="this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'promotionGroup' || this.$store.state.user.roles === 'promotionManager' || this.$store.state.user.roles === 'promotion' || this.$store.state.user.roles === 'promotionDirector'" style="margin-left: 0px">
      <el-col :span="24" style="background-color: #ffffff;padding-top: 10px;">
        <div>
          <el-date-picker
            style="margin-bottom: 20px;display: inline-block"
            class="filter-item"
            v-model="listQuery.date_time"
            align="right"
            type="date"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            :picker-options="pickerOptions1"
            @change="handleFilter">
          </el-date-picker>
          <el-tag style="display: inline-block;float:right; font-size: 16px;">未录粉丝列表</el-tag>
        </div>

        <div id="table">
          <el-table :stripe="true" :key='tableKey' border :data="list" v-loading="listLoading" element-loading-text="给我一点时间"
                    style="width: 100%;margin-bottom: 20px;font-size: 16px;" height="250">
            <el-table-column align="center" label="客服" min-width="200" style="font-size: 10px">
              <template slot-scope="scope">
                <span style="">{{scope.row.support_member.nickname}}</span>
                <el-tag type="success">{{scope.row.support_member.user_account_group.group_name}}</el-tag>
                <el-tag :type="scope.row.online_type | timeIntervalFilter">{{scope.row.online_type | timeIntervalTranslator}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="微信号" min-width="160px">
              <template slot-scope="scope">
                <span>{{scope.row.weixin_account}}</span>
                <el-tag >{{scope.row.info}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="推广员" min-width="80px">
              <template slot-scope="scope">
                <span>{{scope.row.promotion_member.nickname}}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="推广渠道" min-width="80px">
              <template slot-scope="scope">
                <span>{{scope.row.promotion_channel.channel_name}}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="12" class="card-panel-col">
      </el-col>
    </el-row>
  </div>

</template>

<script>
import { parseTime } from '@/utils/index'
import { mapGetters } from 'vuex'
import { getWarehouseStatisticsData, getWarehouseMonthlyData, getWeixinFansRecordData, getWeixinRecordUnfilledList } from '@/api/overview'

export default {
  name: 'dashboard',
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        date_time: parseTime(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000), '{y}-{m}-{d}')
      },
      screen: 6,
      chart: null,
      today_delivered_orders_count: 0,
      need_delivery_orders_count: 0,
      yestday_add_count_total: 0,
      yestday_consult_count_total: 0,
      today_add_count_total: 0,
      today_consult_count_total: 0,
      delivered_date: undefined,
      warehouseMothQuery: '',
      warehouseMothLine: [],
      warehouseMothData: [],
      pickerOptions1: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  filters: {
    timeIntervalFilter(status) {
      const statusTransMap = {
        '0': 'info',
        '1': 'warning',
        '2': 'primary'
      }
      return statusTransMap[status]
    },
    timeIntervalTranslator(status) {
      const translatorMap = {
        '0': '休班',
        '1': '白班',
        '2': '晚班'
      }
      return translatorMap[status]
    }
  },
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  },
  mounted() {
    // this.myPromotionLine()
    // this.myWarehouseLine()
    // this.mySupportLine()
  },
  created() {
    // this.ifShowNum()
    // this.initMothParam()
    // this.getCount()
    // this.getYestdayAddFanTotal()
    // this.getTodayAddFanTotal()
    // this.initWarehouseLineData()
    // this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      if (this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'promotionGroup' || this.$store.state.user.roles === 'promotionManager' || this.$store.state.user.roles === 'promotion') {
        getWeixinRecordUnfilledList(this.listQuery).then(response => {
          this.list = response.data
          this.listLoading = false
        })
      }
    },
    handleFilter() {
      this.getList()
    },
    ifShowNum() {
      if (this.$store.state.user.roles !== 'administrator') {
        this.screen = 12
      }
    },
    initMothParam() {
      const temp_date = new Date()
      this.warehouseMothQuery = temp_date.getFullYear() + '-' + (temp_date.getMonth() + 1)
    },
    getCount() {
      if (this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'warehouse') {
        getWarehouseStatisticsData({}).then(response => {
          this.today_delivered_orders_count = response.data.today_delivered_orders_count
          this.need_delivery_orders_count = response.data.need_delivery_orders_count
        })
      }
    },
    getYestdayAddFanTotal() {
      const tempDate = new Date()
      tempDate.setTime(tempDate.getTime() - 24 * 60 * 60 * 1000)
      const fromDate = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate()
      getWeixinFansRecordData({ date_time: fromDate }).then(response => {
        this.yestday_add_count_total = response.data.add_count_total
        this.yestday_consult_count_total = response.data.consult_count_total
      })
    },
    getTodayAddFanTotal() {
      const tempDate = new Date()
      const fromDate = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate()
        getWeixinFansRecordData({ date_time: fromDate }).then(response => {
          this.today_add_count_total = response.data.add_count_total
          this.today_consult_count_total = response.data.consult_count_total
        })
    },
    initWarehouseLineData() {
      // this.warehouseMothQuery = new Date().getMonth() + 1
      // alert(this.warehouseMothQuery)
      const tempDate = this.warehouseMothQuery.split('-')
      const year = parseInt(tempDate[0])
      const month = parseInt(tempDate[1])
      const full_date = new Date(year, month, 0)
      const tempMonthData = new Array(full_date.getDate())
      for (let i = 0; i < full_date.getDate();) {
        tempMonthData[i] = ++i + '日'
        this.warehouseMothData[i] = 0
      }
      this.warehouseMothLine = tempMonthData
      this.getWarehouseLine()
    },
    getWarehouseLine() {
      if (this.$store.state.user.roles === 'administrator' || this.$store.state.user.roles === 'warehouse') {
        getWarehouseMonthlyData({ month: this.warehouseMothQuery }).then(response => {
          this.warehouseMothData = []
          for (const v of response.data) {
            const date = v.delivered_date.split('-')
            const day = date[2]
            const day_index = parseInt(day) - 1
            this.warehouseMothData[day_index] = parseInt(v.count)
          }
          this.myWarehouseLine()
        })
      }
    },
    myPromotionLine() {
      const myPromotionChart = this.$echarts.init(document.getElementById('myPromotionChart'))
      myPromotionChart.showLoading()
      myPromotionChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        legend: {
          data: ['加粉成本', '加粉数']
        },
        xAxis: [
          {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '加粉成本',
            min: 0,
            max: 250,
            interval: 50,
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '加粉数量',
            min: 0,
            max: 50,
            interval: 5,
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '加粉成本',
            type: 'bar',
            data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
          },
          {
            name: '加粉数',
            type: 'line',
            yAxisIndex: 1,
            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
          }
        ]
      })
      myPromotionChart.hideLoading()
      window.addEventListener('resize', function() {
        setTimeout(function() {
          myPromotionChart.resize()
        }, 500)
      })
    },
    myWarehouseLine() {
      const myWarehouseChart = this.$echarts.init(document.getElementById('myWarehouseChart'))
      myWarehouseChart.setOption({
        title: {
          text: '每日发货数',
          textStyle: {
            color: '#c23531'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['发货数']
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            data: this.warehouseMothLine
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '发货数',
            type: 'bar',
            data: this.warehouseMothData,
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            }
          }
        ]
      })
      window.addEventListener('resize', function() {
        setTimeout(function() {
          myWarehouseChart.resize()
        }, 500)
      })
    },
    mySupportLine() {
      const mySupportChart = this.$echarts.init(document.getElementById('mySupportChart'))
      mySupportChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        legend: {
          data: ['成单金额', '平均成交金额']
        },
        xAxis: [
          {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '成单金额',
            min: 0,
            max: 15000,
            interval: 1000,
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '平均成交金额',
            min: 0,
            max: 15000,
            interval: 1000,
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '成单金额',
            type: 'line',
            yAxisIndex: 1,
            data: [1000, 5200, 900, 4500, 6000, 10000, 5622, 1833, 7000, 4622, 9422, 1520]
          },
          {
            name: '平均成交金额',
            type: 'line',
            yAxisIndex: 1,
            data: [5000, 8623, 10029, 7852, 6325, 2566, 9855, 1233, 7000, 4622, 9422, 1520]
          }
        ]
      })
      window.addEventListener('resize', function() {
        setTimeout(function() {
          mySupportChart.resize()
        }, 500)
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" >
  /*.el-table thead{color:#878d99 !important;font-weight:500 !important;}*/
  .dashboard-editor-container {
    padding: 20px;
    background-color: rgb(240, 242, 245);
    .panel-group {
      .card-panel-col{
        margin-bottom: 20px;
      }
      .card-panel {
        height: 110px;
        cursor: pointer;
        font-size: 12px;
        position: relative;
        overflow: hidden;
        color: #666;
        background: #fff;
        box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
        border-color: rgba(0, 0, 0, .05);
        &:hover {
          .card-panel-icon-wrapper {
            color: #fff;
          }
          .icon-score {
            background: #ffe600;
          }
          .icon-people {
            background: #40c9c6;
          }
          .icon-message {
            background: #36a3f7;
          }
          .icon-money {
            background: #f4516c;
          }
          .icon-shoppingCard {
            background: #34bfa3
          }
        }
        .icon-people {
          color: #40c9c6;
        }
        .icon-score {
          color: #ffe600;
        }
        .icon-message {
          color: #36a3f7;
        }
        .icon-money {
          color: #f4516c;
        }
        .icon-shoppingCard {
          color: #34bfa3
        }
        .card-panel-icon-wrapper {
          float: left;
          margin: 14px 0 0 14px;
          padding: 16px;
          transition: all 0.38s ease-out;
          border-radius: 6px;
          .svg_icon {
            font-size: 55px;
          }
        }
        .card-panel-icon {
          float: left;
          font-size: 48px;
        }
        .card-panel-description {
          float: right;
          width: 50%;
          font-weight: bold;
          margin: 26px 0 26px 0;
          .card-panel-text {
            line-height: 18px;
            color: rgba(0, 0, 0, 0.45);
            font-size: 16px;
            margin-bottom: 12px;
          }
          .card-panel-num {
            font-size: 20px;
          }
        }
      }
    }
    #table {
      .el-table thead{
        color:#878d99;
        font-weight:500;
        font-size: 14px;
      }
      .el-table .cell {
        box-sizing: border-box;
        white-space: normal;
        word-break: break-all;
        line-height: 23px;
      }
      .el-table th {
        white-space: nowrap;
        overflow: hidden;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        text-align: left;
      }
      .el-table td.is-center, .el-table th.is-center {
        text-align: center;
      }
      medium th {
        padding: 10px 0;
      }
      .el-table {
        color: #686060;
        font-size: 12px !important;
      }
    }
  }
  .icon-tianjiahaoyou:before {
    content: "\e7aa";
    font-size: 45px;
  }
</style>
