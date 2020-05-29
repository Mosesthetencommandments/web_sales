<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-select @change='handleFilter' style="width: 160px" class="filter-item" v-model="listQuery.sort" placeholder="排序">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-date-picker
        class="filter-item"
        v-model="listQuery.date_range"
        type="year"
        format="yyyy"
        value-format="yyyy"
        align="right"
        placeholder="请选择年"
        :picker-options="pickerOptions2">
      </el-date-picker>
      <el-select
        class="filter-item"
        style="width:200px;"
        @change='handleFilter'
        v-model="listQuery.product_weixin_id"
        filterable
        clearable
        remote
        placeholder="微信号"
        :remote-method="getProductWxList"
        :loading="productWxLoading">
        <el-option
          v-for="item in productWxOptions"
          :key="item.id"
          :label="item.weixin_account"
          :value="item.id">
          <span style="float: left">{{ item.weixin_account }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.weixin_nickname }}</span>
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>

    <el-table
      stripe
      @selection-change="handleSelectionChange"
      :key='tableKey'
      :data="list"
      v-loading="listLoading"
      element-loading-text="给我一点时间"
      border fit highlight-current-row
      style="width: 100%">
      <el-table-column
        type="selection"
        width="40">
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="微信号">
        <template slot-scope="scope">
          <!--<p v-if="scope.row.product_weixin.support_member.user_account_group !== null">-->
            <!--<span class="link-type">{{scope.row.product_weixin.support_member.nickname}}</span>-->
            <p v-if="scope.row.product_weixin !== null">
              {{ scope.row.product_weixin.info + '(' + scope.row.product_weixin.weixin_account + ')' }}
            </p>
            <p v-else>
              已失效微信号ID: {{scope.row.product_weixin_id}}
            </p>
          <!--</p>-->
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="所属客服信息">
        <template slot-scope="scope">
          <p v-if="scope.row.product_weixin !== null && scope.row.product_weixin.support_member !== null">
            {{ scope.row.product_weixin.support_member.nickname + '(' + scope.row.product_weixin.support_member.user_account_group.group_name + ')' }}
          </p>
          <p v-else>
            已失效微信号ID: {{scope.row.product_weixin_id}}
          </p>
          <!--</p>-->
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="已提现总额">
        <template slot-scope="scope">
          <span>￥{{scope.row.total_money}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="余额">
        <template slot-scope="scope">
          <span>￥{{scope.row.balance}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[20,50,100,200]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { updateOrdersPaymentItemMassively } from '@/api/orders'
import { getSupportMemberList } from '@/api/support_member'
import { getProductWeixinList, getProductWeixinBalanceList } from '@/api/product_weixin'
import waves from '@/directive/waves' // 水波纹指令
export default {
  name: 'wxFinancialManagement',
  components: {},
  directives: {
    waves
  },
  data() {
    return {
      scrollTop: 0,
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        page_size: 100,
        status: undefined,
        support_member_nickname: '',
        support_user_account_id: undefined,
        product_weixin_id: undefined,
        weixin_account: '',
        sort: '-balance',
        pay_type_code: 'weixin_pay',
        date_range: ''
      },
      supportUserAccountLoading: false,
      supportUserAccountOptions: [],
      productWxLoading: false,
      productWxOptions: [],
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: '按余额降序', key: '-balance' }, { label: '按提现总额降序', key: '-total_money' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showAuditor: false,
      temp: {
        id: undefined,
        domain_id: undefined,
        domain: { id: undefined, domain_name: undefined },
        domain_prefix: '',
        info: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        domain_prefix: [{ required: true, message: '请正确填写域名名称', trigger: 'change' }]
      },
      paymentItemStatusOptions: [
        { key: 0, display_name: '未确认' },
        { key: 1, display_name: '已确认' },
        { key: 2, display_name: '已删除' },
        { key: 3, display_name: '已提现' }
      ],
      pickerOptions2: {},
      multipleSelection: []
    }
  },
  computed: {
    totalMoney: function() {
      let total_money = 0.00
      for (const v of this.multipleSelection) {
        total_money += Math.round(parseFloat(v.paid_money) * 100) / 100
      }
      return total_money
    }
  },
  filters: {
    paymentItemStatusFilter(status) {
      const statusMap = {
        0: 'info',
        1: 'success',
        2: 'danger',
        3: ''
      }
      return statusMap[status]
    },
    paymentItemStatusTranslator(status) {
      const statusMap = {
        0: '未确认',
        1: '已确认',
        2: '已删除',
        3: '已提现'
      }
      return statusMap[status]
    }
  },
  created() {
    this.getList()
    this.getProductWxList(' ')
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getList() {
      this.listLoading = true
      getProductWeixinBalanceList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getProductWxList(query) {
      if (query) {
        this.productWxLoading = true
        getProductWeixinList({ weixin_account: query }).then(response => {
          if (!response.data.data) return
          this.productWxOptions = response.data.data.map(v => ({
            id: v.id,
            weixin_account: v.weixin_account,
            weixin_nickname: v.weixin_nickname
          }))
          this.productWxLoading = false
        })
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.page_size = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        domain_id: undefined,
        domain: { id: undefined, domain_name: undefined },
        domain_prefix: '',
        info: ''
      }
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updatePaymentItemStatus() {
      this.$confirm('确认提现？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.multipleSelection.length < 1) {
          this.$message({
            type: 'info',
            message: '请先选择要提现的条目'
          })
          return
        }
        const ttempData = {}
        const paymentItemIds = []
        for (const v of this.multipleSelection) {
          paymentItemIds.push(v.id)
        }
        ttempData.orders_payment_item_ids = paymentItemIds
        ttempData.status = 3
        updateOrdersPaymentItemMassively(ttempData).then(response => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '提现成功',
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
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
