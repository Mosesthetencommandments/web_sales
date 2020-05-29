<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <div class="filter-row">
        <el-radio-group v-model="listQuery.is_month"
                        @change="handleQueryTypeChange"
                        class="filter-item"
                        size="small">
          <el-radio-button :label="1">月数据</el-radio-button>
          <el-radio-button :label="0">日数据</el-radio-button>
        </el-radio-group>
        <div class="filter-item" v-show="listQuery.is_month">
          <div class="filter-label">月份</div>
          <el-date-picker
            format="yyyy-MM"
            size="small"
            value-format="yyyy-MM"
            v-model="listQuery.month"
            align="bottom"
            type="month"
            placeholder="选择月份"
            @change='handleFilter'>
          </el-date-picker>
        </div>
        <div class="filter-item" v-show="!listQuery.is_month">
          <div class="filter-label">日期</div>
          <el-date-picker
            v-model="listQuery.date_range"
            type="daterange"
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
        <div class="filter-float">
          <el-button type="primary" size="small" class="filter-item" icon="el-icon-download" @click="exportExcel" v-waves>导出Excel</el-button>
        </div>
      </div>

      <div class="filter-item">
        <div class="filter-label">推广组</div>
        <el-cascader
          size="small"
          clearable
          style="width: 200px"
          :options="userGroupTree"
          change-on-select
          placeholder="请选择"
          :props="defaultPropsGroup"
          v-model="userGroupOptions"
          @change="handleFilterGrounp">
        </el-cascader>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服部门</div>
        <el-cascader
          size="small"
          clearable
          style="width: 200px"
          :options="userGroupTree2"
          change-on-select
          placeholder="请选择"
          :props="defaultPropsGroup"
          v-model="userGroupOptions2"
          @change="handleFilterGrounp2">
        </el-cascader>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服</div>
        <el-select
          style="width: 350px"
          @focus="getSupportUserAccountList(' ')"
          @change='handleFilter'
          multiple
          size="small"
          v-model="listQuery.support_user_account_ids"
          clearable
          filterable
          remote
          placeholder="选择"
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
      <div class="filter-item">
        <div class="filter-label">商品</div>
        <el-select
          size="small"
          @change='handleFilter'
          style="width: 300px"
          v-model="listQuery.product_ids"
          multiple
          filterable
          remote
          placeholder="请选择"
          :remote-method="getProductList"
          :loading="productLoading">
          <el-option
            v-for="item in productOptions"
            :key="item.id"
            :label="item.product_name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">渠道</div>
        <el-select
          size="small"
          @change='handleFilter'
          style="width: 300px"
          v-model="listQuery.channel_ids"
          multiple
          filterable
          remote
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
    </div>

    <el-table :key='tableKey'  id="cost" :stripe="true" show-summary :summary-method="getPromotionChannelSummaries" :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%;" >
      <el-table-column :key="Math.random()" align="center" label="客服" min-width="100">
        <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.support_user_account.nickname}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="代收销售额" min-width="100">
        <template slot-scope="scope">
              <span >
                ¥ {{Math.round(scope.row.collection_cost * 100) / 100}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="转账销售额" min-width="100">
        <template slot-scope="scope">
              <span >
                ¥ {{Math.round(scope.row.agent_cost * 100) / 100}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="订单数" min-width="100">
        <template slot-scope="scope">
              <span >
                {{scope.row.order_count}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="产品成本" min-width="100">
        <template slot-scope="scope">
              <span >
                ¥ {{Math.round(scope.row.product_cost * 100 ) / 100}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="加粉成本" min-width="100">
        <template slot-scope="scope">
              <span >
                ¥ {{Math.round(scope.row.fans_cost * 100) / 100}}
              </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { getPromotionGroupList } from '@/api/promotion_member'
  import { getSupportGroupList, getSupportMemberList } from '@/api/support_member'
  import { getPromotionChannelList } from '@/api/promotion_channel'
  import { getProductList } from '@/api/product'
  import { getSupportCostStatisticsData } from '@/api/support_statistics'
  import { parseTime } from '@/utils/index'
  import waves from '@/directive/waves' // 水波纹指令
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {
    name: 'costStatistics',
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
          support_user_account_group_id: undefined,
          promotion_user_account_group_id: undefined,
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
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        userGroupOptions:[],
        userGroupOptions2:[],
        userGroupTree: [],
        userGroupTree2: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
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
      this.getUserGroupTree()
      this.getUserGroupTree2()
      this.handleFilter()
      this.getProductList(' ')
      this.getUserChannelList(' ')
    },
    computed: {
      getPromotionChannelSumData: function() {
        const sums = []
        const innerTempData = {
          agent_cost: 0,
          collection_cost: 0,
          fans_cost: 0,
          order_count: 0,
          product_cost: 0
        }
        for (const v of this.list) {
          innerTempData.agent_cost += parseFloat(v.agent_cost)
          innerTempData.collection_cost += parseFloat(v.collection_cost)
          innerTempData.fans_cost += parseFloat(v.fans_cost)
          innerTempData.order_count += parseFloat(v.order_count)
          innerTempData.product_cost += parseFloat(v.product_cost)
        }
        // let later_second_month_fans_saler = 0
        // let three_month_fans_saler = 0
        // let range_Rate = 0
        // if (innerTempData.this_month_new_fans_orders_count > 0 || innerTempData.this_month_repurchase_fans_orders_count > 0) {
        //   thisMonthFansConsumer_consumerPrice = Math.round((innerTempData.this_month_new_fans_orders_sales + innerTempData.this_month_new_fans_orders_sales) / (innerTempData.this_month_new_fans_orders_count + innerTempData.this_month_repurchase_fans_orders_count) * 100) / 100
        // }
        // if (innerTempData.total_orders_count > 0) {
        //   uncertainRate = Math.round(innerTempData.deliver_orders_count / innerTempData.total_orders_count * 10000) / 100.00
        //   receiveRate = Math.round((innerTempData.orders_count - innerTempData.deliver_orders_count) / innerTempData.total_orders_count * 10000) / 100.00
        //   rejectRate = Math.round(innerTempData.reject_orders_count / innerTempData.total_orders_count * 10000) / 100.00
        //   consumerPrice = Math.round(innerTempData.orders_sales / innerTempData.total_orders_count * 100) / 100
        // }
        // if (innerTempData.orders_count > 0) {
        //   newConsumer = Math.round(innerTempData.new_fans_orders_count / innerTempData.orders_count * 100)
        //   repurchaseConsumer = Math.round(innerTempData.repurchase_fans_orders_count / innerTempData.orders_count * 100)
        // }
        sums[0] = '合计'
        sums[1] = '￥' + Math.round(innerTempData.collection_cost) // 代收
        sums[2] = '￥' + Math.round(innerTempData.agent_cost) // 转账
        sums[3] = innerTempData.order_count // 订单
        sums[4] = '￥' + innerTempData.product_cost.toFixed(2) // 代收
        sums[5] = '￥' + innerTempData.fans_cost.toFixed(2) // 代收
        return sums
      }
    },
    methods: {
      getUserGroupTree() {
        getPromotionGroupList().then(response => {
          this.userGroupTree = this.formatUserGroupTree(response.data)
        })
      },
      getUserGroupTree2() {
        getSupportGroupList().then(response => {
          this.userGroupTree2 = this.formatUserGroupTree(response.data)
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
        this.listQuery.promotion_user_account_group_id = val[val.length - 1]
        this.handleFilter()
      },
      handleFilterGrounp2(val) {
        this.listQuery.support_user_account_group_id = val[val.length - 1]
        this.handleFilter()
      },
      exportExcel() {
        var wb = XLSX.utils.table_to_book(document.querySelector('#cost'))
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
            if (item.nickname === this.list[index - 1].nickname) {
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
      getSupportUserAccountList(query) {
        if (query !== '') {
          this.supportUserAccountLoading = true
          getSupportMemberList({ nickname: query, status: 1 }).then(response => {
            this.supportUserAccountOptions = response.data.data
            this.supportUserAccountLoading = false
          })
        }
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
      getProductList(query) {
        if (query !== '') {
          this.productLoading = true
          getProductList({ product_name: query, is_promote: 1 }).then(response => {
            this.productOptions = response.data.data
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
      getList() {
        this.listLoading = true
        getSupportCostStatisticsData(this.listQuery).then(res => {
          this.list = []
          for (const v in res.data) {
            this.list.push(res.data[v])
          }
          // this.getspanMethodArray()
          // this.getspanMethodArray2()
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
  .el-table{
    font-size: 14px;
  }
</style>
