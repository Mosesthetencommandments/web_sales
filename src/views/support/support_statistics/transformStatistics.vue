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
                      :picker-options="pickerOptions"
                      placeholder="选择月份"
                      @change='handleFilter'>
      </el-date-picker>
      <el-checkbox-group v-model="checkedArray" style="display: inline-block">
        <el-checkbox label="percent_conversion">转化率</el-checkbox>
        <el-checkbox label="cost_performance">性价比</el-checkbox>
        <el-checkbox label="fan_value">单粉价值</el-checkbox>
        <el-checkbox label="sales_money">销售额</el-checkbox>
      </el-checkbox-group>
      <!--<el-button type="primary" style="float: right" class="filter-item" icon="el-icon-download" @click="exportExcel">导出报表</el-button>-->
    </div>
    <el-table stripe :data="list" v-loading="listLoading"
              element-loading-text="给我一点时间"
              id="transform"
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
            <el-table-column :key="Math.random()" fixed align="center" label="加粉成本" min-width="100">
              <template slot-scope="scope">
                <span>¥ {{Math.round(scope.row.fans_cost * 100) / 100}}</span>
              </template>
            </el-table-column>
            <el-table-column :key="Math.random()" fixed align="center" label="-" min-width="100">
              <template slot-scope="scope">
                <span v-if="checkedArray.indexOf('percent_conversion') + 1 ">转化率<br/></span>
                <span v-if="checkedArray.indexOf('cost_performance') + 1 ">性价比<br/></span>
                <span v-if="checkedArray.indexOf('fan_value') + 1 ">单粉价值<br/></span>
                <span v-if="checkedArray.indexOf('sales_money') + 1 ">销售额<br/></span>
              </template>
            </el-table-column>
            <el-table-column v-for="item in month_range" :key="Math.random()" min-width="150px" align="center" :label="item" >
              <template slot-scope="scope">
                <span v-if="checkedArray.indexOf('percent_conversion') + 1 && scope.row[item].fans_count !== 0">{{Math.round(scope.row[item].order_count / scope.row[item].fans_count * 10000 ) / 100}}%<br/></span>
                <span v-if="checkedArray.indexOf('percent_conversion') + 1 && scope.row[item].fans_count == 0"> 0 %<br/></span>
                <span v-if="checkedArray.indexOf('cost_performance') + 1 && scope.row[item].fans_cost !== 0"> {{Math.round(scope.row[item].sales_money / scope.row[item].fans_cost * 100 ) / 100}}<br/></span>
                <span v-if="checkedArray.indexOf('cost_performance') + 1 && scope.row[item].fans_cost == 0"> - <br/></span>
                <span v-if="checkedArray.indexOf('fan_value') + 1 && scope.row[item].fans_count !== 0">¥ {{Math.round(scope.row[item].sales_money / scope.row[item].fans_count * 100 ) / 100}}<br/></span>
                <span v-if="checkedArray.indexOf('fan_value') + 1 && scope.row[item].fans_count == 0"> - <br/></span>
                <span v-if="checkedArray.indexOf('sales_money') + 1"> ¥ {{scope.row[item].sales_money}}<br/></span>
              </template>
            </el-table-column>
            <el-table-column :key="Math.random()" align="center" label="总计" min-width="150">
              <template slot-scope="scope">
                <span v-if="scope.row.total && checkedArray.indexOf('percent_conversion') + 1">转化率: {{Math.round(scope.row.total.percent_conversion * 100 ) / 100}}% <br/></span>
                <span v-if="scope.row.total && checkedArray.indexOf('cost_performance') + 1">性价比: {{Math.round(scope.row.total.cost_performance * 100 ) / 100}} <br/></span>
                <span v-if="scope.row.total && checkedArray.indexOf('fan_value') + 1 ">单粉价值: ¥ {{Math.round(scope.row.total.fan_value * 100 ) / 100}}<br/></span>
                <span v-if="scope.row.total && checkedArray.indexOf('sales_money') + 1">销售额:¥ {{scope.row.total.sales_money}}<br/></span>
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
  import { getFansTransformList } from '@/api/support_statistics'
  import waves from '@/directive/waves' // 水波纹指令
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {
    name: 'transformStatistics',
    directives: {
      waves
    },
    data() {
      return {
        time_avg: undefined,
        echartsText: '每月复购图',
        repurchase_avg: undefined,
        getDataType: 0,
        repurchaseEcharts: null,
        pickerOptions: {
          // disabledDate(time) {
          //   return time.getTime() < new Date('2018-03-01')
          // }
        },
        checkedArray: ['percent_conversion', 'cost_performance', 'sales_money', 'fan_value'],
        scrollTop: 0,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: false,
        listQuery: {
          month: '2018-04'
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
      spanMethodProduct() {
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
      },
      spanMethodChannle() {
        const temparray = []
        let contactDot = 0
        this.list.forEach((item, index) => {
          if (index === 0) {
            temparray.push(1)
          } else {
            if (item.channle_name === this.list[index - 1].channle_name && item.product_name === this.list[index - 1].product_name) {
              temparray[contactDot] += 1
              temparray.push(0)
            } else {
              temparray.push(1)
              contactDot = index
            }
          }
        })
        return temparray
      },
      repurchaseEchartsLegend() {
        let obj = {
          data: []
        }
        if (this.data !== {}) {
          if (this.getDataType) {
            for (const i in this.data) {
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
        if (this.data !== {}) {
          if (this.getDataType) {
            for (const i in this.data) {
              const data = []
              for (const j in this.data[i].repurchase_value) {
                data.push(this.data[i].repurchase_value[j])
              }
              arr.push({
                name: i,
                barGap: '0%',
                type: 'line',
                data: data,
                legendHoverLink: true
              })
            }
          } else {
            arr = [
              {
                name: '订单数',
                barGap: '0%',
                type: 'line',
                data: this.data.order_count.count_value,
                legendHoverLink: true
              },
              {
                name: '粉丝数',
                barGap: '0%',
                type: 'line',
                data: this.data.custom_count.count_value,
                legendHoverLink: true
              },
              {
                name: '复购额',
                barGap: '0%',
                type: 'line',
                data: this.data.sale_money.count_value,
                legendHoverLink: true
              }
            ]
          }
        }
        return arr
      }
    },
    created() {
      this.getList()
    },
    methods: {
      handleFilter() {
        this.getList()
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
        getFansTransformList(this.listQuery).then(res => {
          this.list = this.computedList(res.data)
          this.listLoading = false
        })
      },
      computedList(data) {
        const list = []
        for (const i of data) {
          const temp = {}
          temp.product_name = i.product_name
          temp.data = []
          for (const j in i) {
            // fans_cost 带入到每个对象
            if (typeof i[j] === 'object') {
              for (const v in i[j]) {
                if (typeof i[j][v] === 'object') {
                  i[j][v].fans_cost = i[j].fans_cost
                }
              }
            }
            // 给总计添加total
            if (typeof i[j] === 'object' && j === '总计') {
              let fans_cost = 0
              let fans_count = 0
              let order_count = 0
              let sales_money = 0
              for (const o in i[j]) {
                if (typeof i[j][o] === 'object') {
                  fans_cost += i[j][o].fans_cost
                  fans_count += i[j][o].fans_count
                  order_count += i[j][o].order_count
                  sales_money += i[j][o].sales_money
                }
              }
              i[j]['total'] = { fans_cost, fans_count, order_count, sales_money }
            }
            // 计算 总计列显示需要的数据
            if (typeof i[j] === 'object') {
              let percent_conversion = 0
              let cost_performance = 0
              let fan_value = 0
              let sales_money = 0
              for (const o in i[j]) {
                if (typeof i[j][o] === 'object' && o !== 'total') {
                  percent_conversion += i[j][o].fans_count === 0 ? 0 : Math.round(i[j][o].order_count / i[j][o].fans_count * 10000) / 100
                  cost_performance += i[j][o].fans_cost === 0 ? 0 : Math.round(i[j][o].sales_money / i[j][o].fans_cost * 100) / 100
                  fan_value += i[j][o].fans_count === 0 ? 0 : Math.round(i[j][o].sales_money / i[j][o].fans_count * 100) / 100
                  sales_money += i[j][o].sales_money
                }
              }
              i[j]['total'] = { percent_conversion, cost_performance, fan_value, sales_money }
            }
            if (i[j].channel_name) {
              temp.data.push(i[j])
            }
          }
          list.push(temp)
        }
        console.log(list)
        return list
      },
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0 && this.spanMethodProduct[rowIndex] !== undefined) {
          const _row = this.spanMethodProduct[rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col
          }
        }
        if (columnIndex === 1 && this.spanMethodChannle[rowIndex] !== undefined) {
          const _row = this.spanMethodChannle[rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col
          }
        }
      },
      createRepurchaseEcharts() {
        this.repurchaseEcharts = this.$echarts.init(document.getElementById('repurchase'))
        const a = this.repurchaseEcharts
        window.addEventListener('resize', function() {
          setTimeout(() => {
            a.resize()
          }, 500)
        })
      },
      updateRepurchaseEcharts() {
        this.repurchaseEcharts = this.$echarts.init(document.getElementById('repurchase'))
        this.repurchaseEcharts.hideLoading()
        this.repurchaseEcharts.setOption({
          title: {
            text: this.echartsText,
            textStyle: {
              color: '#00c1de'
            }
          },
          tooltip: {
            trigger: 'item',
            axisPointer: {
              type: 'cross'
            }
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
        const a = this.repurchaseEcharts
        window.addEventListener('resize', function() {
          setTimeout(() => {
            a.resize()
          }, 500)
        })
      }
      // exportExcel() {
      //   const a = document.getElementById('transform').cloneNode(true)
      //   // a.removeChild(a.querySelector('.el-table__fixed'))
      //   var wb = XLSX.utils.table_to_book(a, { raw: true })
      //   var wbout = XLSX.write(wb, { bookType: 'xlsm', bookSST: true, type: 'array' })
      //   try {
      //     FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '渠道复购报表.xlsx')
      //   } catch (e) {
      //     if (typeof console !== 'undefined') console.log(e, wbout)
      //   }
      //   return wbout
      // }
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
</style>

