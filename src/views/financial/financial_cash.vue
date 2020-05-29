<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <!--<div class="filter-item">-->
        <!--<div class="filter-label">排序</div>-->
        <!--<el-select size="small" @change='handleFilter' style="width: 120px" v-model="listQuery.sort" placeholder="选择">-->
          <!--<el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</div>-->
      <div class="filter-item">
        <div class="filter-label">提现状态</div>
        <el-select clearable size="small" @change='handleFilter' style="width: 120px" v-model="listQuery.status" placeholder="选择">
          <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">日期</div>
        <el-date-picker
          size="small"
          style="width: 240px"
          v-model="listQuery.date_range"
          type="daterange"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          align="right"
          unlink-panels
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions2"
          @change='handleFilter'>
        </el-date-picker>
      </div>

      <div class="filter-item">
        <div class="filter-label">转款类型</div>
        <el-select clearable size="small" @change='handleFilter' style="width: 120px" v-model="listQuery.finance_account_type_id" placeholder="选择">
          <el-option v-for="item in FinanceAccountTypeOptions" :key="item.id" :label="item.type_name" :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">转款人</div>
        <el-select
          style="width: 140px"
          size="small"
          @focus="getSupportUserAccountList(' ')"
          @change='handleFilter'
          v-model="listQuery.support_user_account_id"
          multiple
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
      <div class="filter-float">
        <el-button class="filter-item" type="primary" size="small" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button class="filter-item" type="success" size="small" v-waves icon="el-icon-edit" @click="handleOpenInner1">申请提现</el-button>
      </div>
    </div>

    <el-table :stripe="true"
              @selection-change="handleSelectionChange"
              :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column
        type="selection"
        width="40">
      </el-table-column>
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" align="center" label="微信号">
        <template slot-scope="scope">
          <span class="link-type" v-if="scope.row.product_weixin !== null">{{scope.row.product_weixin.info}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" align="center" label="转款人">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.support_member.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="90px" align="center" label="审核人">
        <template slot-scope="scope">
          <span class="link-type" v-if="scope.row.finance_member !== null">{{scope.row.finance_member.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="120px" align="center" label="申请转账金额">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.transfer_apply_money}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="手续费">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.transfer_fee}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="120px" align="center" label="转账到帐金额">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.transfer_received_money }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="转账账户类型">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.finance_account_type.type_name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="转账账户帐号">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.finance_account_name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="审核时间">
        <template slot-scope="scope">
          <span>{{scope.row.verified_at | parseTimes}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="转帐时间">
        <template slot-scope="scope">
          <span>{{scope.row.created_at | parseTimes}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="220" class-name="small-padding">
        <template slot-scope="scope">
          <el-button type="warning" size="mini" @click="handleOpenInner2(scope.row)">查看明细</el-button>
          <el-button type="primary" size="mini" @click="handleOpenInner3(scope.row)">查看评论</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[100,200,300, 500]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <div v-show="!listLoading" style="margin-top: 20px;text-align: right;margin-right:20px;">
      <span style="font-size: 24px !important; font-weight: 900; text-align: right;display: inline-block;padding-right: 50px;line-height: 60px;height: 60px;vertical-align: -16%;">申请提现金额：￥{{countTotalTransferApplyMoney}}</span>
      <span style="font-size: 24px !important; font-weight: 900; text-align: right;display: inline-block;line-height: 60px;height: 60px;vertical-align: -16%;">实际应到帐金额：￥{{countTotalTransferReceivedMoney}}
      </span>
      <p style="font-size: 14px !important;padding:0 0 10px 0;margin:0;color:red;">手续费：￥{{countTotalTransferFeeMoney}}</p>
      <el-button type="success" @click="verifyFinanceTransferRecordMassively()" :disabled="multipleSelection.length < 1">批量审核</el-button>
      <el-button type="primary" @click="handleOpenInner3()" :disabled="multipleSelection.length < 1">查看评论</el-button>
    </div>

    <el-dialog :title="innerTableTitle1" :visible.sync="innerTableVisible1">
      <el-select :loading="productWeixinLoading" clearable filterable remote @change="handleInnerFilter1" size="small" style="margin-bottom: 20px;width: 100%" v-model="innerListQuery1.product_weixin_id" placeholder="请选择微信号" :remote-method="queryProductWeixinList">
        <el-option v-for="item in productWeixinOptions" :key="item.id" :label="item.weixin_account + '(' + item.info + ')'" :value="item.id">
        </el-option>
      </el-select>
      <el-table
        v-if="innerList1 !== null"
        :stripe="true"
        :key='innerTableKey1'
        :data="innerList1"
        v-loading="innerListLoading1"
        element-loading-text="给我一点时间"
        border fit highlight-current-row
        style="width: 100%">
        <el-table-column align="center" label="付款ID" width="85">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="所属订单号">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.orders_payment.orders.orders_unique_id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="金额">
          <template slot-scope="scope">
            <span>￥{{scope.row.paid_money}}</span>
          </template>
        </el-table-column>
        <el-table-column width="180px" align="center" label="添加时间">
          <template slot-scope="scope">
            <span>{{scope.row.created_at}}</span>
          </template>
        </el-table-column>
        <p style="font-size:30px;font-weight:900;">￥{{totalMoney}}</p>
      </el-table>
      <div slot="footer" class="dialog-footer" v-if="innerList1 !== null">
        <p style="font-size:30px;font-weight:900;">￥{{totalMoney}}</p>
        <el-button :disabled="(innerList1 === null) || (innerList1.length < 1)" type="primary" @click="handleCreate">申请提现</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="25%" style='width:500px;margin-left:50px;'>
        <el-form-item label="账款类型" prop="pay_type_id">
          <el-select v-model="temp.pay_type_id"
                     filterable
                     remote
                     :remote-method="queryOrderPayTypeList"
                     :loading="payTypeLoading"
                     placeholder="请选择账款类型">
            <el-option
              v-for="item in payTypeOptions"
              :key="item.type_name"
              :label="item.type_name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转款类型" prop="finance_transfer_type">
          <el-radio-group v-model="temp.finance_transfer_type">
            <el-radio-button label="1">提现到银行卡</el-radio-button>
            <el-radio-button label="2">转账到微信账户</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="转账账户类型" prop="finance_account_type_id">
          <el-select v-model="temp.finance_account_type_id"
                     placeholder="请选择账款类型">
            <el-option
              v-for="item in FinanceAccountTypeOptions"
              :key="item.type_name"
              :label="item.type_name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转账账户名" prop="finance_account_name">
          <el-input v-model="temp.finance_account_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="createData" :loading="cashLoading">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="innerTableTitle2" :visible.sync="innerTableVisible2">
      <div class="filter-container">

      </div>
      <el-table
        :stripe="true"
        :key='innerTableKey2'
        :data="innerList2"
        v-loading="innerListLoading2"
        element-loading-text="给我一点时间"
        border fit highlight-current-row
        style="width: 100%">
        <el-table-column align="center" label="付款ID" width="85">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="所属订单号">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.orders_payment.orders.orders_unique_id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="金额">
          <template slot-scope="scope">
            <span>￥{{scope.row.paid_money}}</span>
          </template>
        </el-table-column>
        <el-table-column width="180px" align="center" label="添加时间">
          <template slot-scope="scope">
            <span>{{scope.row.created_at}}</span>
          </template>
        </el-table-column>
        <!--<p style="font-size:30px;font-weight:900;">￥{{totalMoney}}</p>-->
      </el-table>
      <!--<div slot="footer" class="dialog-footer" v-if="innerList1 !== null">-->
        <!--<p style="font-size:30px;font-weight:900;">￥{{totalMoney}}</p>-->
        <!--<el-button :disabled="(innerList1 === null) || (innerList1.length < 1)" type="primary" @click="handleCreate">申请提现</el-button>-->
      <!--</div>-->
    </el-dialog>
    <el-dialog :title="innerTableTitle3" :visible.sync="innerTableVisible3">
      <div class="filter-container">
        <el-button class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate3" type="primary" icon="el-icon-edit">新建评论内容</el-button>
      </div>
      <el-table
        :stripe="true"
        :key='innerTableKey3'
        :data="innerList3"
        v-loading="innerListLoading3"
        element-loading-text="给我一点时间"
        border fit highlight-current-row
        style="width: 100%">
        <el-table-column align="center" label="转款记录ID" width="105">
          <template slot-scope="scope">
            <span>{{scope.row.finance_transfer_record_id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="用户">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.user_account_name}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="评论内容">
          <template slot-scope="scope">
            <span>{{scope.row.comment}}</span>
          </template>
        </el-table-column>
        <el-table-column width="180px" align="center" label="添加时间">
          <template slot-scope="scope">
            <span>{{scope.row.created_at}}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible3">
      <el-form :rules="innerRules3" ref="innerDataForm3" :model="innerTemp3" label-position="left" label-width="25%" style='width:500px;margin-left:50px;'>
        <el-form-item label="转账记录评论" prop="comment">
          <el-input v-model="innerTemp3.comment"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible3 = false">取 消</el-button>
        <el-button type="primary" @click="createInnerData3">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { getUserAccountList } from '@/api/user'
import { getSupportMemberList } from '@/api/support_member'
import { getProductWeixinList } from '@/api/product_weixin'
import { getOrdersPayTypeList } from '@/api/orders'
import { getFinanceAccountTypeList, getOrdersPaymentItemList } from '@/api/financial'
import { getFinanceTransferRecordList, getFinanceTransferRecordCommentList, createFinanceTransferRecordComment, createWeixinFinanceTransferRecord, verifyFinanceTransferRecordMassively } from '@/api/financial_transfer_record'
import { parseTime } from '@/utils/index'
import waves from '@/directive/waves' // 水波纹指令
import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'
// 多选框组件css
export default {
  name: 'financialCash',
  components: { Multiselect },
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
        sort: '-id',
        finance_account_type_id: undefined,
        support_user_account_id: undefined,
        finance_user_account_id: undefined,
        date_range: undefined,
        status: undefined
      },
      sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
      temp: {
        id: undefined,
        finance_transfer_type: undefined,
        pay_type_id: undefined,
        product_weixin_id: undefined,
        finance_account_type_id: undefined,
        finance_account_name: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
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
      },
      statusOptions: [{ label: '待审核', key: 0 }, { label: '已审核', key: 1 }],
      FinanceAccountTypeOptions: [],
      supportMemberOptions: [],
      innerList1: null,
      innerTotal1: null,
      innerTableKey1: 1,
      innerTableTitle1: '',
      innerListQuery1: {
        page: 1,
        page_size: 10000,
        product_weixin_id: undefined,
        status: 1,
        pay_type_code: 'weixin_pay',
        sort: '-id'
      },
      innerTemp1: {
        id: undefined,
        domain_id: undefined,
        name: '',
        code: ''
      },
      innerListLoading1: false,
      innerTableVisible1: false,
      innerDialogFormVisible1: false,
      innerRules1: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      domainOptions: [],
      publicImageUrl: '',
      imageDialogVisible: false,
      baseUrl: process.env.BASE_API + '/api/document/uploadImage',
      payTypeLoading: false,
      payTypeOptions: [],
      supportUserAccountLoading: false,
      supportUserAccountOptions: [],
      productWeixinLoading: false,
      productWeixinOptions: [],
      totalMoney: 0.00,
      multipleSelection: [],
      innerList2: null,
      innerTotal2: null,
      innerTableKey2: 2,
      innerTableTitle2: '',
      innerListQuery2: {
        page: 1,
        page_size: 10000,
        finance_transfer_record_id: undefined,
        sort: '-id'
      },
      innerListLoading2: false,
      innerTableVisible2: false,
      innerList3: null,
      innerTotal3: null,
      innerTableKey3: 1,
      innerTableTitle3: '',
      innerListQuery3: {
        page: 1,
        page_size: 10000,
        finance_transfer_record_id: undefined,
        finance_transfer_record_ids: [],
        status: 1,
        sort: '-id'
      },
      innerTemp3: {
        id: undefined,
        finance_transfer_record_id: undefined,
        user_account_name: undefined,
        comment: undefined,
        created_at: undefined
      },
      innerListLoading3: false,
      innerTableVisible3: false,
      innerDialogFormVisible3: false,
      innerRules3: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      cashLoading: false
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'warning',
        1: 'success',
      }
      return statusMap[status]
    },
    statusTranslator(status) {
      const statusTransMap = {
        0: '待审核',
        1: '已审核'
      }
      return statusTransMap[status]
    },
    parseTimes(time) {
      if (time) {
        return parseTime(new Date(time), '{y}-{m}-{d}')
      } else {
        return '-'
      }
    }
  },
  created() {
    this.getList()
    this.getFinanceAccountTypeList()
    this.queryOrderPayTypeList('微信支付')
    this.queryProductWeixinList(' ')
  },
  computed: {
    countTotalTransferApplyMoney: function() {
      let total_money = 0.00
      for (const v of this.multipleSelection) {
        total_money += parseFloat(v.transfer_received_money)
      }
      return total_money
    },
    countTotalTransferReceivedMoney: function() {
      let total_money = 0.00
      for (const v of this.multipleSelection) {
        if (v.transfer_fee <= 0) {
          total_money += parseFloat(v.transfer_received_money / 1.001)
        } else {
          total_money += parseFloat(v.transfer_received_money)
        }
      }
      return Math.round(total_money * 100) / 100
    },
    countTotalTransferFeeMoney: function() {
      let total_money = 0.00
      for (const v of this.multipleSelection) {
        if (v.transfer_fee <= 0) {
          total_money += parseFloat(v.transfer_received_money)
        }
      }
      return (Math.round(total_money * 0.001 * 100) / 100)
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getFinanceAccountTypeList() {
      getFinanceAccountTypeList().then(response => {
        console.log(response.data)
        this.FinanceAccountTypeOptions = response.data
      })
    },
    queryProductWeixinList(query) {
      if (query !== '') {
        this.productWeixinLoading = true
        getProductWeixinList({ weixin_account: query }).then(response => {
          this.productWeixinOptions = response.data.data
          this.productWeixinLoading = false
        })
      } else {
        this.productWeixinOptions = []
      }
    },
    queryOrderPayTypeList(query) {
      if (query !== '') {
        query = '微信支付'
        this.payTypeLoading = true
        getOrdersPayTypeList({ type_name: query }).then(response => {
          this.payTypeOptions = response.data
          this.payTypeLoading = false
        })
      } else {
        this.payTypeOptions = []
      }
    },
    handlePictureSuccess(response, file, fileList) {
      this.temp.image_url = process.env.BASE_API + response.data.url
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePictureCardPreview(file) {
      this.publicImageUrl = file.url
      this.imageDialogVisible = true
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
    handleOpenImage(imageUrl) {
      this.publicImageUrl = imageUrl
      this.imageDialogVisible = true
    },
    verifyFinanceTransferRecordMassively() {
      this.$confirm('确认批量审核？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.multipleSelection.length < 1) {
          this.$message({
            type: 'info',
            message: '请先选择要审核的条目'
          })
          return
        }
        const ttempData = {}
        const financeTransferRecordIds = []
        for (const v of this.multipleSelection) {
          financeTransferRecordIds.push(v.id)
        }
        ttempData.finance_transfer_record_ids = financeTransferRecordIds
        verifyFinanceTransferRecordMassively(ttempData).then(response => {
          for (const v of this.list) {
            for (const financeTransferRecordId of financeTransferRecordIds) {
              if (financeTransferRecordId === v.id) {
                v.status = 1
              }
            }
          }
          this.$notify({
            title: '成功',
            message: '审核成功',
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
    },
    getList() {
      this.listLoading = true
      getFinanceTransferRecordList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.total
        this.listLoading = false
      })
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
        finance_transfer_type: undefined,
        pay_type_id: undefined,
        product_weixin_id: undefined,
        finance_account_type_id: undefined,
        finance_account_name: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.temp.pay_type_id = this.payTypeOptions[0].id
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.cashLoading = true
          this.temp.product_weixin_id = this.innerListQuery1.product_weixin_id
          createWeixinFinanceTransferRecord(this.temp).then(response => {
            this.cashLoading = false
            this.getList()
            this.dialogFormVisible = false
            this.innerTableVisible1 = false
            this.total++
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleOpenInner1(row) {
      this.innerList1 = null
      this.innerListQuery1.product_weixin_id = undefined
      this.innerTableVisible1 = true
      this.innerTableTitle1 = ' 提现'
      this.temp = Object.assign({}, row) // copy obj
    },
    getInnerList1() {
      this.innerListLoading1 = true
      this.totalMoney = 0.00
      getOrdersPaymentItemList(this.innerListQuery1).then(response => {
        this.innerList1 = response.data.data
        for (const v of this.innerList1) {
          this.totalMoney += parseFloat(v.paid_money)
        }
        this.innerTotal1 = response.data.total
        this.innerListLoading1 = false
      })
    },
    handleInnerFilter1() {
      this.innerListQuery1.page = 1
      this.getInnerList1()
    },
    handleInnerSizeChange1(val) {
      this.innerListQuery1.page_size = val
      this.getInnerList1()
    },
    handleInnerCurrentChange1(val) {
      this.innerListQuery1.page = val
      this.getInnerList1()
    },
    handleOpenInner2(row) {
      this.innerList2 = null
      this.innerTableVisible2 = true
      this.innerTableTitle2 = '提现明细'
      this.temp = Object.assign({}, row) // copy obj
      this.getInnerList2()
    },
    getInnerList2() {
      this.innerListLoading2 = true
      this.innerListQuery2.finance_transfer_record_id = this.temp.id
      getOrdersPaymentItemList(this.innerListQuery2).then(response => {
        this.innerList2 = response.data.data
        // for (const v of this.innerList2) {
        //   this.totalMoney += parseFloat(v.paid_money)
        // }
        this.innerTotal2 = response.data.total
        this.innerListLoading2 = false
      })
    },
    handleOpenInner3(row) {
      this.innerList3 = null
      this.innerListQuery3.finance_transfer_record_id = undefined
      this.innerTableTitle3 = '评论列表'
      if (row === null || row === undefined) {
        this.temp = 'undefined'
      } else {
        this.temp = row // copy obj
      }
      if (this.temp !== 'undefined') {
        this.innerListQuery3.finance_transfer_record_id = this.temp.id
      } else {
        this.innerListQuery3.finance_transfer_record_ids = []
        for (const v of this.multipleSelection) {
          this.innerListQuery3.finance_transfer_record_ids.push(v.id)
        }
      }
      this.innerTableVisible3 = true
      this.getInnerList3()
    },
    getInnerList3() {
      this.innerListLoading3 = true
      getFinanceTransferRecordCommentList(this.innerListQuery3).then(response => {
        this.innerList3 = response.data
        this.innerListLoading3 = false
      })
    },
    resetInnerTemp3() {
      this.innerTemp3 = {
        id: undefined,
        finance_transfer_record_id: undefined,
        user_account_name: undefined,
        comment: undefined,
        created_at: undefined
      }
    },
    handleInnerCreate3() {
      this.resetInnerTemp3()
      this.dialogStatus = 'create'
      this.innerDialogFormVisible3 = true
      this.$nextTick(() => {
        this.$refs['innerDataForm3'].clearValidate()
      })
    },
    createInnerData3() {
      if (this.temp === null || this.temp.id === undefined) {
        this.$message({
          type: 'info',
          message: '请先选择具体转款记录'
        })
        return
      }
      this.$refs['innerDataForm3'].validate((valid) => {
        if (valid) {
          this.innerTemp3.finance_transfer_record_id = this.temp.id
          createFinanceTransferRecordComment(this.innerTemp3).then(response => {
            this.innerTemp3 = response.data
            this.innerList3.unshift(this.innerTemp3)
            this.innerDialogFormVisible3 = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
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
