<template>
  <div class="app-container calendar-list-container">
    <el-date-picker
      class="filter-item"
      style="width: 200px"
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
    <el-select
      class="filter-item"
      style="width:150px;"
      @change='handleFilter'
      v-model="listQuery.product_id"
      filterable
      clearable
      remote
      placeholder="请选择产品"
      :remote-method="getProductList"
      :loading="productLoading">
      <el-option
        v-for="item in productOptions"
        :key="item.product_name"
        :label="item.product_name"
        :value="item.id">
      </el-option>
    </el-select>
    <el-select
      class="filter-item"
      style="width:150px;"
      @change='handleFilter'
      v-model="listQuery.promotion_user_account_id"
      filterable
      clearable
      remote
      placeholder="请选择推广人"
      :remote-method="getPromotionUserAccountList"
      :loading="promotionUserAccountLoading">
      <el-option
        v-for="item in promotionUserAccountOptions"
        :key="item.nickname"
        :label="item.nickname"
        :value="item.id">
      </el-option>
    </el-select>
    <el-select
      class="filter-item"
      style="width:150px;"
      @change='getList'
      v-model="listQuery.promotion_channel_id"
      filterable
      clearable
      remote
      placeholder="请选择渠道"
      :remote-method="getPromotionChannel"
      :loading="promotionChannelLoading">
      <el-option
        v-for="item in promotionChannelOptions"
        :key="item.id"
        :label="item.channel_name"
        :value="item.id">
      </el-option>
    </el-select>
    <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="推广网站" v-model="listQuery.url">
    </el-input>
    <el-button class="filter-item" style="float:right;margin-left: 10px" icon="el-icon-search" @click="getList" type="primary">搜索</el-button>

    <el-button class="filter-item" icon="el-icon-download" style="float:right;" @click="downExcel" type="primary">导出</el-button>
    <div class="app-container calendar-list-container">
      <el-switch
        @change="handleFilter"
        style="float:right;"
        v-model="listQuery.if_filtered"
        active-color="#409EFF"
        :active-value="1"
        inactive-color="#409EFF"
        :inactive-value="0"
        active-text="过滤无效复制"
        inactive-text="全部数据">
      </el-switch>
      <el-checkbox style="float:left;margin-right:15px;" v-model="showNetworkInfo">网络</el-checkbox>
      <el-checkbox style="float:left;margin-right:15px;" v-model="showDeviceInfo">设备</el-checkbox>
      <el-checkbox style="float:left;" v-model="showProvinceCity">省市</el-checkbox>
      <el-checkbox style="float:left;" v-model="showReferrer">来路</el-checkbox>
    </div>
    <div class="filter-container">

    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column
        align="center"
        type="index"
        width="50">
      </el-table-column>
      <el-table-column width="180px" align="center" label="时间">
        <template slot-scope="scope">
          <el-tag :type="'danger'" style="font-weight: bold;font-size: inherit;">{{scope.row.time}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="showProvinceCity" width="190px" align="center" label="地区">
        <template slot-scope="scope">
          <el-tag :type="'primary'" style="font-weight: bold;font-size: inherit;">{{scope.row.province}}-{{scope.row.city}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="480px" align="left" label="产品 / 渠道 / 推广人 / 模板">
        <template slot-scope="scope">
          <el-tag :type="'warning'" style="font-weight: bold;font-size: inherit;" v-if="scope.row.product">{{scope.row.product.product_name}}</el-tag>
          <el-tag :type="'danger'" style="font-weight: bold;font-size: inherit;" v-if="scope.row.promotion_channel">{{scope.row.promotion_channel.channel_name}}</el-tag>
          <el-tag :type="'primary'" style="font-weight: bold;font-size: inherit;" v-if="scope.row.promotion_member">{{scope.row.promotion_member.nickname}}</el-tag>
          <el-tag :type="'success'" style="font-weight: bold;font-size: inherit;" v-if="scope.row.product_template">{{scope.row.product_template.template_name}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="300px" align="center" label="站点">
        <template slot-scope="scope">
          <span>{{scope.row.url}}</span>
          <p v-if="showReferrer" style="color:blue;max-height:200px;overflow-y: scroll;">{{scope.row.referrer}}</p>
        </template>
      </el-table-column>
      <el-table-column v-if="showDeviceInfo" min-width="260px" align="center" label="设备信息">
        <template slot-scope="scope">
          <span>{{scope.row.platform_name}}-{{scope.row.brand}}-{{scope.row.browser}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showNetworkInfo" min-width="100px" align="center" label="网络">
        <template slot-scope="scope">
          <span>{{scope.row.network}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="复制内容">
        <template slot-scope="scope">
          <span style="font-weight:bold;color:#409EFF;">{{scope.row.product_weixin_content}}</span>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,50, 100]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { getPromotionChannelList } from '@/api/product_weixin'
import { getUserAccountList } from '@/api/user'
import { getProductList } from '@/api/product'
import { createDomainSub, updateDomainSub, deleteDomainSub, createDomainSubExtraCode, updateDomainSubExtraCode, deleteDomainSubExtraCode } from '@/api/domain_sub'
import { getPromotionProductWeixinList } from '@/api/promotion_product'
import { getPromotionCopyList } from '@/api/promotion_statistics'
import waves from '@/directive/waves' // 水波纹指令
import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css
export default {
  name: 'promotionCopy',
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
        if_filtered: 1,
        page: 1,
        page_size: 50,
        date_range: undefined,
        product_id: undefined,
        promotion_channel_id: undefined,
        promotion_user_account_id: undefined,
        url: '',
        sort: '-id'
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
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
      rules: {
        domain_prefix: [{ required: true, message: '请正确填写域名名称', trigger: 'change' }]
      },

      innerList1: null,
      innerTotal1: null,
      innerTableKey1: 1,
      innerTableTitle1: '',
      innerListQuery1: {
        page: 1,
        page_size: 5,
        domain_sub_id: undefined,
        sort: '-id'
      },
      innerTemp1: {
        id: undefined,
        domain_id: undefined,
        name: '',
        code: '',
        domain_sub_id: undefined
      },
      innerListLoading1: false,
      innerTableVisible1: false,
      innerDialogFormVisible1: false,
      innerRules1: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      domainOptions: [],
      showProvinceCity: false,
      showDeviceInfo: false,
      showNetworkInfo: false,
      showReferrer: false,
      promotionUserAccountOptions: [],
      promotionUserAccountLoading: false,
      promotionChannelOptions: [],
      promotionChannelLoading: false,
      productOptions: [],
      productLoading: false
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'gray',
        1: 'success'
      }
      return statusMap[status]
    },
    statusTranslator(status) {
      const statusTransMap = {
        0: '关闭',
        1: '开启'
      }
      return statusTransMap[status]
    },
    statusWeixinFilter(status) {
      const statusMap = {
        0: 'gray',
        1: 'success',
        2: 'danger',
        3: 'danger'
      }
      return statusMap[status]
    },
    statusWeixinTranslator(status) {
      const statusTransMap = {
        0: '冻结',
        1: '开启',
        2: '告警',
        3: '关闭'
      }
      return statusTransMap[status]
    },
    timeIntervalFilter(status) {
      const statusMap = {
        'none': 'info',
        'day': 'warning',
        'night': 'primary'
      }
      return statusMap[status]
    },
    timeIntervalTranslator(status) {
      const statusTransMap = {
        'none': '休',
        'day': '白',
        'night': '晚'
      }
      return statusTransMap[status]
    }
  },
  created() {
    this.getProductList(' ')
    this.getPromotionUserAccountList(' ')
    this.getPromotionChannel(' ')
    this.getList()
  },
  methods: {
    getPromotionChannel(query) {
      if (query !== '') {
        this.promotionChannelLoading = true
        getPromotionChannelList({ channel_name: query }).then(response => {
          this.promotionChannelOptions = response.data.data
          console.log(this.promotionChannelOptions)
          this.promotionChannelLoading = false
        })
      }
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
    getPromotionUserAccountList(query) {
      if (query !== '') {
        this.promotionUserAccountLoading = true
        getUserAccountList({ nickname: query, user_account_type_code: 'promote', status: 1 }).then(response => {
          this.promotionUserAccountOptions = response.data.data
          this.promotionUserAccountLoading = false
        })
      }
    },
    getList() {
      this.listLoading = true
      getPromotionCopyList(this.listQuery).then(response => {
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
    handleModifyStatus(row, status) {
      const tempData = {}
      tempData.domain_sub_id = row.id
      tempData.status = status
      row.status = status
      updateDomainSub(tempData).then(() => {
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
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
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.domain_id = this.temp.domain.id
          if ((this.temp.domain_id === undefined)) {
            this.$message({
              type: 'info',
              message: '请先填写域名信息'
            })
            return
          }
          createDomainSub(this.temp).then(response => {
            this.temp.id = response.data.id
            this.temp.status = response.data.status
            this.temp.updated_at = response.data.updated_at
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
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
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.domain_sub_id = this.temp.id
          tempData.domain_id = this.temp.domain.id
          updateDomainSub(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该域名, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          domain_sub_id: row.id
        }
        deleteDomainSub(ttempData).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
          this.total--
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleOpenInner1(row) {
      this.innerTableVisible1 = true
      this.innerTableTitle1 = row.promotion_product.url + ' -- 微信号详情'
      this.temp = Object.assign({}, row) // copy obj
      this.getInnerList1()
    },
    getInnerList1() {
      this.innerListQuery1.promotion_product_id = this.temp.promotion_product_id
      this.innerListLoading1 = true
      getPromotionProductWeixinList(this.innerListQuery1).then(response => {
        this.innerList1 = response.data.data
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
    resetInnerTemp1() {
      this.innerTemp1 = {
        id: undefined,
        domain_sub_id: this.temp.id,
        name: '',
        code: ''
      }
    },
    handleInnerCreate1() {
      this.resetInnerTemp1()
      this.dialogStatus = 'create'
      this.innerDialogFormVisible1 = true
      this.$nextTick(() => {
        this.$refs['innerDataForm1'].clearValidate()
      })
    },
    createInnerData1() {
      this.$refs['innerDataForm1'].validate((valid) => {
        if (valid) {
          this.innerTemp1.domain_sub_id = this.temp.promotion_product.domain_sub_id
          createDomainSubExtraCode(this.innerTemp1).then(response => {
            this.innerTotal1++
            this.innerTemp1 = response.data
            this.innerList1.unshift(this.innerTemp1)
            this.innerDialogFormVisible1 = false
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
    handleInnerUpdate1(row) {
      this.innerTemp1 = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.innerDialogFormVisible1 = true
      this.$nextTick(() => {
        this.$refs['innerDataForm1'].clearValidate()
      })
    },
    updateInnerData1() {
      this.$refs['innerDataForm1'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.innerTemp1)
          tempData.domain_sub_extra_code_id = this.innerTemp1.id
          updateDomainSubExtraCode(tempData).then(() => {
            for (const v of this.innerList1) {
              if (v.id === this.innerTemp1.id) {
                const index = this.list.indexOf(v)
                this.innerList1.splice(index, 1, this.innerTemp1)
                break
              }
            }
            this.innerDialogFormVisible1 = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    downExcel() {
      console.log(this.listQuery.date_range)
      const form = document.createElement('form')
      form.action = process.env.BASE_API + '/api/promotion/downloadCopyListByParam' + '?token=' + this.$store.state.user.token
      form.method = 'post'
      form.style.display = 'none'
      const product_id = document.createElement('input')
      const promotion_user_account_id = document.createElement('input')
      const promotion_channel_id = document.createElement('input')
      const url = document.createElement('input')
      const if_filtered = document.createElement('input')
      if (this.listQuery.date_range !== null && this.listQuery.date_range !== undefined && this.listQuery.date_range !== '') {
        const date_range = document.createElement('input')
        const date_range2 = document.createElement('input')
        date_range.name = 'date_range[0]'
        date_range.value = this.listQuery.date_range[0]
        date_range2.name = 'date_range[1]'
        date_range2.value = this.listQuery.date_range[1]
        form.appendChild(date_range)
        form.appendChild(date_range2)
      }
      product_id.name = 'product_id'
      product_id.value = this.listQuery.product_id
      promotion_user_account_id.name = 'promotion_user_account_id'
      promotion_user_account_id.value = this.listQuery.promotion_user_account_id
      promotion_channel_id.name = 'promotion_channel_id'
      promotion_channel_id.value = this.listQuery.promotion_channel_id
      url.name = 'url'
      url.value = this.listQuery.url
      if_filtered.name = 'if_filtered'
      if_filtered.value = this.listQuery.if_filtered
      form.appendChild(product_id)
      form.appendChild(promotion_user_account_id)
      form.appendChild(promotion_channel_id)
      form.appendChild(url)
      form.appendChild(if_filtered)
      const button = document.createElement('input')
      button.type = 'submit'
      form.appendChild(button)
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    },
    handleInnerDelete1(row) {
      this.$confirm('此操作将永久删除该附加代码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          domain_sub_extra_code_id: row.id
        }
        deleteDomainSubExtraCode(ttempData).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.innerList1.indexOf(row)
          this.innerList1.splice(index, 1)
          this.innerTotal1--
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
