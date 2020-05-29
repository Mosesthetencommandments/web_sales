<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-date-picker format="yyyy-MM"
                      value-format="yyyy-MM"
                      v-model="listQuery.month"
                      class="filter-item"
                      align="bottom"
                      type="month"
                      :clearable='false'
                      placeholder="选择月份"
                      @change='handleFilter'>
      </el-date-picker>
      <!--<el-button type="primary" style="float: right" class="filter-item" icon="el-icon-download" @click="exportExcel">导出报表</el-button>-->
      <!--<el-button type="primary" class="filter-item" @click="openEcharts">折线图</el-button>-->
      <span v-show="echarts_show">复购平均时长: {{time_avg}} 月</span>
      <span v-show="echarts_show">复购平均次数: {{repurchase_avg}} 次</span>
    </div>
    <div v-show="echarts_show" id="repurchase" :style="{width: '100%', height: '450px'}"></div>
    <el-table stripe :data="list" v-loading="listLoading"
              :span-method="objectSpanMethod"
              id="newFansRepurchase"
              element-loading-text="给我一点时间"
              border fit highlight-current-row
              :key="tableKey"
              style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table stripe
                    :data="scope.row.data"
                    element-loading-text="给我一点时间"
                    border
                    fit
                    highlight-current-row
                    style="width: 100%">
            <el-table-column :key="Math.random()" fixed align="center" label="渠道" min-width="100">
              <template slot-scope="scope">
                <span>{{scope.row.channel_name}}</span>
              </template>
            </el-table-column>
            <el-table-column v-for="(item, index) in month_range" :key="Math.random()" min-width="150px" align="center" :label="item" >
              <template slot-scope="scope">
                <span v-if="scope.row[item] && index == 0">销售额:¥ {{Math.round(scope.row[item].sales_money * 100) / 100}}<br/></span>
                <span v-else-if="scope.row[item]">复购额:¥ {{Math.round(scope.row[item].repurchase_money * 100) / 100}}<br/></span>
                <span v-else>复购额:¥ 0<br/></span>
                <span v-if="scope.row[item] && index == 0">当月单数:{{scope.row[item].new_order_count}}<br/></span>
                <span v-else-if="scope.row[item]">复购单数:{{scope.row[item].repurchase_count}}<br/></span>
                <span v-else>复购单数: 0<br/></span>
                <span v-if="scope.row[item] && index !== 0 && scope.row[month_range[0]].new_order_count > 0">复购率: {{Math.round(scope.row[item].repurchase_count / scope.row[month_range[0]].new_order_count * 10000) / 100}} %</span>
                <span v-else-if="index !== 0"> - </span>
              </template>
            </el-table-column>
            <el-table-column :key="Math.random()" align="center" label="总计" min-width="150">
              <template slot-scope="scope">
                <span>复购额:¥ {{Math.round(scope.row.total.repurchase_money * 100 ) / 100}} <br/></span>
                <span>复购单数: {{scope.row.total.repurchase_count}} <br/></span>
                <span v-if="scope.row[month_range[0]].new_order_count > 0">复购率: {{Math.round(scope.row.total.repurchase_count / scope.row[month_range[0]].new_order_count * 10000) / 100}} %<br/></span>
                <span v-else> - </span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="产品" min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.product_name}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { getCustomRepeatPurchase, getCustomRepeatPurchaseChartData } from '@/api/support_statistics'
  import waves from '@/directive/waves' // 水波纹指令
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {
    name: 'newFansRepurchaseStatistics',
    components: {},
    directives: {
      waves
    },
    data() {
      return {
        time_avg: undefined,
        echartData: undefined,
        echartsText: '每月复购图',
        repurchase_avg: undefined,
        getDataType: 0,
        repurchaseEcharts: undefined,
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() < new Date('2018-03-01')
          }
        },
        echarts_show: false,
        scrollTop: 0,
        tableKey: 0,
        data: {},
        total: undefined,
        listLoading: false,
        listQuery: {
          month: '2018-03'
        },
        temp: {
          id: undefined
        }
      }
    },
    computed: {
      month_range() {
        let arr = []
        arr = this.getformat(this.listQuery.month)
        return arr
      },
      repurchaseEchartsX() {
        let arr = []
        if (this.echartData !== undefined) {
          arr = this.echartData.custom_count.month
        }
        return arr
      },
      list() {
        const list = []
        for (const i in this.data) {
          const data = []
          for (const j in this.data[i]) {
            // 添加总计的总计
            if (j === '总计') {
              const total = {
                repurchase_money: 0,
                repurchase_count: 0
              }
              for (const v in this.data[i][j]) {
                if (typeof this.data[i][j][v] === 'object' && this.data[i][j][v].repurchase_money) {
                  total.repurchase_money += this.data[i][j][v].repurchase_money
                  total.repurchase_count += this.data[i][j][v].repurchase_count
                }
              }
              this.data[i][j]['total'] = total
            }
            if (typeof this.data[i][j] === 'object') {
              data.push(this.data[i][j])
            }
          }
          list.push({
            data: data,
            product_name: this.data[i].product_name
          })
        }
        console.log('list', list)
        return list
      },
      repurchaseEchartsLegend() {
        let obj = {
          data: []
        }
        if (this.echartData !== undefined) {
          if (this.getDataType) {
            for (const i in this.echartData) {
              obj.data.push(i)
            }
          } else {
            obj = {
              data: ['复购额', '订单数', '粉丝数'],
              selected: {
                '复购额': true,
                '订单数': false,
                '粉丝数': false
              }
            }
          }
        }
        return obj
      },
      repurchaseEchartsSeries() {
        let arr = []
        if (this.echartData !== undefined) {
          arr = [
            {
              name: '订单数',
              type: 'line',
              data: this.echartData.order_count.count_value
            },
            {
              name: '粉丝数',
              type: 'line',
              data: this.echartData.custom_count.count_value
            },
            {
              name: '复购额',
              type: 'line',
              data: this.echartData.sale_money.count_value
            }
          ]
        }
        return arr
      },
      spanMethodArray() {
        const temparray = []
        let contactDot = 0
        this.list.forEach((item, index) => {
          if (index === 0) {
            temparray.push(1)
          } else {
            if (item.product_name === this.list[index - 1].product_name) {
              temparray[contactDot] += 1
              temparray.push(0)
            } else {
              temparray.push(1)
              contactDot = index
            }
          }
        })
        return temparray
      }
    },
    mounted() {
      this.createRepurchaseEcharts()
      this.getList()
    },
    methods: {
      openEcharts() {
        this.echarts_show = !this.echarts_show
        this.$nextTick(() => {
          if (this.echartData === undefined) {
            this.updateRepurchaseEcharts()
          }
        })
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
      getformat(now) {
        const d = new Date(now.replace(/[^\d]/g, '/') + '/1')
        const result = [now]
        for (let i = 0; i < 12; i++) {
          d.setMonth(d.getMonth() + 1)
          let m = d.getMonth() + 1
          m = m < 10 ? '0' + m : m
          result.push(d.getFullYear() + '-' + m)
        }
        return result
      },
      getList() {
        this.listLoading = true
        getCustomRepeatPurchase(this.listQuery).then(res => {
          this.data = res.data
          this.listLoading = false
        })
      },
      handleFilter() {
        this.getList()
      },
      exportExcel() {
        const a = document.getElementById('newFansRepurchase').cloneNode(true)
        console.log(a)
        a.removeChild(a.querySelector('.el-table__fixed'))
        var wb = XLSX.utils.table_to_book(a, { raw: true })
        var wbout = XLSX.write(wb, { bookType: 'xlsm', bookSST: true, type: 'array' })
        try {
          FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '渠道复购报表.xlsx')
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, wbout)
        }
        return wbout
      },
      createRepurchaseEcharts() {
        this.repurchaseEcharts = this.$echarts.init(document.getElementById('repurchase'))
        this.setOptionsRepurchaseEcharts()
        const a = this.repurchaseEcharts
        window.addEventListener('resize', function() {
          setTimeout(() => {
            a.resize()
          }, 500)
        })
      },
      updateRepurchaseEcharts() {
        this.repurchaseEcharts.resize()
        this.repurchaseEcharts.showLoading()
        getCustomRepeatPurchaseChartData().then(res => {
          this.echartData = res.data
          this.time_avg = res.data.time_avg
          this.repurchase_avg = res.data.repurchase_avg
          this.setOptionsRepurchaseEcharts()
          this.repurchaseEcharts.hideLoading()
          this.repurchaseEcharts.resize()
        })
      },
      setOptionsRepurchaseEcharts() {
        this.repurchaseEcharts.setOption({
          title: {
            text: '总体复购',
            textStyle: {
              color: 'red'
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          toolbox: {
            feature: {
              restore: { show: true },
              saveAsImage: { name: '复购数据' },
              dataView: { show: true, readOnly: false },
              magicType: {
                show: true,
                type: ['line', 'bar']
              }
            }
          },
          legend: this.repurchaseEchartsLegend,
          xAxis: [
            {
              type: 'category',
              name: '月份',
              data: this.repurchaseEchartsX
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: this.repurchaseEchartsSeries
        }, true)
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
    padding: 8px 0;
  }
</style>
