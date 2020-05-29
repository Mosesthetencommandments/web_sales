<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="20">
          <div>
            <el-select clearable
                       @change='handleGroupFilter'
                       style="width: 120px"
                       class="filter-item"
                       v-model="listQuery.user_account_group_id"
                       placeholder="客服部门">
              <el-option v-for="item in userGroupOptions" :key="item.group_name" :label="item.group_name" :value="item.id">
              </el-option>
            </el-select>
            <el-select
              class="filter-item"
              @change='handleFilter'
              v-model="listQuery.support_user_account_ids"
              multiple
              filterable
              remote
              placeholder="请选择客服"
              :remote-method="getUserAccountList"
              :loading="userAccountLoading">
              <el-option
                v-for="item in userAccountOptions"
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
              filterable
              remote
              placeholder="请选择商品"
              :remote-method="getProductList"
              :loading="productLoading">
              <el-option
                v-for="item in productOptions"
                :key="item.id"
                :label="item.goods_name"
                :value="item.id">
              </el-option>
            </el-select>
            <!--<el-select-->
              <!--class="filter-item"-->
              <!--@change='handleFilter'-->
              <!--v-model="listQuery.channel_ids"-->
              <!--multiple-->
              <!--filterable-->
              <!--remote-->
              <!--placeholder="请选择渠道"-->
              <!--:remote-method="getUserChannelList"-->
              <!--:loading="userPromotionChannelLoading">-->
              <!--<el-option-->
                <!--v-for="item in userChannelOptions"-->
                <!--:key="item.id"-->
                <!--:label="item.channel_name"-->
                <!--:value="item.id">-->
              <!--</el-option>-->
            <!--</el-select>-->
            <el-date-picker
              v-show="!listQuery.is_month"
              class="filter-item"
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
            <el-date-picker
              format="yyyy-MM"
              v-show="listQuery.is_month"
              value-format="yyyy-MM"
              v-model="listQuery.month"
              class="filter-item"
              align="bottom"
              type="month"
              placeholder="选择月份"
              @change='handleFilter'>
            </el-date-picker>
            <el-button type="primary" class="filter-item" icon="el-icon-download" @click="exportExcel" v-waves v-if="$store.state.user.roles === 'administrator'">导出Excel</el-button>
          </div>
        </el-col>
        <el-col :span="4">
          <el-switch
            @change="handleQueryTypeChange"
            style="float:right;padding-right:10px;padding-top:10px;"
            v-model="listQuery.is_month"
            active-color="#409EFF"
            inactive-color="#409EFF"
            :active-value="1"
            :inactive-value="0"
            active-text="月数据"
            inactive-text="日数据">
          </el-switch>
        </el-col>
      </el-row>
    </div>
    <el-table :key='tableKey' :span-method="objectSpanMethod" id="cost" :stripe="true" show-summary :summary-method="getPromotionChannelSummaries" :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%;" >
      <el-table-column :key="Math.random()" align="center" label="客服" min-width="100">
        <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.support_user_account.nickname}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="商品" min-width="100">
        <template slot-scope="scope">
              <span >
                {{scope.row.product_good.goods_name}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="数量" min-width="100">
        <template slot-scope="scope">
              <span >
                {{Math.round(scope.row.product_count)}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="产品成本" min-width="100">
        <template slot-scope="scope">
              <span >
                ¥ {{scope.row.product_cost}}
              </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { getUserAccountGroupList } from '@/api/user_group'
  import { getUserAccountList } from '@/api/user'
  import { getPromotionChannelList } from '@/api/promotion_channel'
  import { getProductGoodsList } from '@/api/product_goods'
  import { getSupportProductCostStatisticsData } from '@/api/support_statistics'
  import { parseTime } from '@/utils/index'
  import waves from '@/directive/waves' // 水波纹指令
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {
    name: 'costStatisticsGoods',
    directives: {
      waves
    },
    data() {
      return {
        arry: [],
        scrollTop: 0,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: true,
        listQuery: {
          is_month: 1,
          date_range: [
            parseTime(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000), '{y}-{m}-{d}'),
            parseTime(new Date().setTime(new Date().getTime() - 24 * 60 * 60 * 1000), '{y}-{m}-{d}')
          ],
          month: parseTime(new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 30)), '{y}-{m}'),
          user_account_group_id: undefined,
          support_user_account_ids: [],
          product_ids: [],
          channel_ids: []
        },
        contrast: false,
        spanMethodArray: [],
        spanMethodArray2: [],
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
        userGroupOptions: [],
        userAccountOptions: [],
        productOptions: [],
        userChannelOptions: [],
        userPromotionChannelLoading: false,
        productLoading: false,
        userAccountLoading: false,
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
      this.getGroupList()
      this.handleFilter()
      this.getUserAccountList(' ')
      this.getProductList(' ')
      this.getUserChannelList(' ')
    },
    computed: {
      getPromotionChannelSumData: function() {
        const sums = []
        const innerTempData = {
          product_cost: 0,
          product_count: 0
        }
        for (const v of this.list) {
          innerTempData.product_cost += parseFloat(v.product_cost)
          innerTempData.product_count += parseFloat(v.product_count)
        }
        sums[0] = '合计'
        sums[1] = '-'
        sums[2] = innerTempData.product_count // 代收
        sums[3] = '￥' + innerTempData.product_cost // 代收
        return sums
      }
    },
    methods: {
      exportExcel() {
        /* generate workbook object from table */
        var wb = XLSX.utils.table_to_book(document.querySelector('#cost'))
        // wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(this.list)
        /* get binary string as output */
        var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
        try {
          FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '客服成本.xlsx')
        } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
        return wbout
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
        console.log('temparray', temparray)
        this.spanMethodArray = temparray
      },
      getspanMethodArray2() {
        const temparray = []
        let contactDot = 0
        this.list.forEach((item, index) => {
          if (index !== 0) {
            if (item.product_name === this.list[index - 1].product_name) {
              temparray[contactDot] += 1
              temparray.push(0)
            } else {
              temparray.push(1)
              contactDot = index
            }
          }
        })
        console.log('temparray', temparray)
        this.spanMethodArray2 = temparray
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
        if ((columnIndex === 1) && this.spanMethodArray2[rowIndex] !== undefined) {
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
        this.getList()
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
      handleGroupFilter() {
        this.listQuery.support_user_account_ids = []
        this.getList()
      },
      handleQueryTypeChange(type) {
        this.getList()
      },
      getUserAccountList(query) {
        if (query !== '') {
          this.userAccountLoading = true
          getUserAccountList({ nickname: query, user_account_type_code: 'support', user_account_group_id: this.listQuery.user_account_group_id, status: 1 }).then(response => {
            this.userAccountOptions = response.data.data
            this.userAccountLoading = false
          })
        }
      },
      getProductList(query) {
        if (query !== '') {
          this.productLoading = true
          getProductGoodsList({ goods_name: query, status: 1, page_size: 0 }).then(response => {
            this.productOptions = response.data
            this.productLoading = false
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
      getGroupList() {
        getUserAccountGroupList({ user_account_type_id: 2 }).then(response => {
          if (response.data.data) {
            this.userGroupOptions = response.data.data
          }
        })
      },
      getList() {
        this.listLoading = true
        getSupportProductCostStatisticsData(this.listQuery).then(res => {
          this.list = []
          for (const v in res.data) {
            for (const i in res.data[v]) {
              this.list.push({
                product_cost: res.data[v][i].product_cost,
                product_count: res.data[v][i].product_count,
                product_good: res.data[v][i].product_good,
                support_user_account: res.data[v][i].support_user_account
              })
            }
          }
          this.getspanMethodArray()
          // this.getspanMethodArray2()
          this.listLoading = false
          console.log(this.list)
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
    font-size: 14px;
  }
  .el-table >>> td{
    padding: 4px 0;
  }
  .el-table >>> th{
    padding: 8px 0;
  }
  .el-table{
    font-size: 14px;
  }
</style>
