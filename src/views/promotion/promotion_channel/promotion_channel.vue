<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="渠道名称" v-model="listQuery.channel_name">
      </el-input>
      <el-select @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.sort" placeholder="排序">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加渠道</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="渠道名称">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.channel_name}}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{scope.row.updated_at}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" label="操作" width="320" class-name="small-padding">-->
        <!--<template slot-scope="scope">-->
          <!--<el-button size="mini" type="danger" @click="handleDelete(scope.row)" v-if="scope.row.account_name">删除-->
          <!--</el-button>-->
        <!--</template>-->
      <!--</el-table-column>-->
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="渠道名称" prop="domain_name">
          <el-input v-model="temp.channel_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible1">
      <el-form :rules="innerRules1" ref="innerDataForm1" :model="temp" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="渠道名称" prop="domain_prefix" v-show="channelListShow">
          <multiselect v-model="temp.promotion_channel" :options="channelOptions" @search-change="queryChannelList" placeholder="搜索渠道" selectLabel="选择"
                       deselectLabel="删除" track-by="channel_name" :internalSearch="false" label="channel_name">
            <span slot='noResult'>无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="账户名称" prop="account_name">
          <el-input v-model="temp.account_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible1 = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createInnerData1">确 定</el-button>
        <el-button v-else type="primary" @click="updateInnerData1">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="innerTableTitle2" :visible.sync="innerTableVisible2" width="90%" >
      <div class="filter-container" align="right">
        <el-date-picker
          style="float:left"
          v-model="innerListQuery2.date_range"
          type="daterange"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          align="right"
          unlink-panels
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions2"
          @change='handleChangeDate'>
        </el-date-picker>
        <el-button align="left" class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate2" type="primary" icon="el-icon-edit">录入消费</el-button>
      </div>

      <el-table stripe="true" :key='innerTableKey2' :data="innerList2" v-loading="innerListLoading2" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="产品">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.product.product_name}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="推广人">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.promotion_member.nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="消费虚拟币">
          <template slot-scope="scope">
            <span>￥{{scope.row.virtual_money}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="反点">
          <template slot-scope="scope">
            <span>{{scope.row.ratio}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="折合人民币">
          <template slot-scope="scope">
            <span>{{scope.row.money}}</span>
          </template>
        </el-table-column>
        <el-table-column width="180px" align="center" label="消费时间">
          <template slot-scope="scope">
            <span>{{scope.row.consumption_time}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="320" class-name="small-padding">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="handleInnerDelete2(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!innerListLoading2" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange2" @current-change="handleInnerCurrentChange2" :current-page.sync="innerListQuery2.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery2.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal2">
        </el-pagination>
      </div>
    </el-dialog>
    <!--<el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible2">-->
      <!--<el-form :rules="innerRules2" ref="innerDataForm2" :model="innerTemp2" label-position="left" label-width="25%" style='width: 50%; margin-left:10%;'>-->
        <!--<el-form-item label="渠道" prop="channel_name">-->
          <!--<el-input v-model="temp.channel_name" disabled></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="账户" prop="account_name">-->
          <!--<el-input v-model="temp.account_name" disabled></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="消费时间" prop="channel_name">-->
          <!--<el-date-picker-->
            <!--v-model="innerTemp2.consumption_time"-->
            <!--align="right"-->
            <!--type="date"-->
            <!--format="yyyy-MM-dd"-->
            <!--placeholder="选择日期"-->
            <!--:picker-options="pickerOptions1"-->
            <!--@change="innerTemp2DateChange">-->
          <!--</el-date-picker>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="所属产品" prop="product_name">-->
          <!--<el-select-->
            <!--v-model="innerTemp2.product_id"-->
            <!--filterable-->
            <!--remote-->
            <!--placeholder="请选择产品"-->
            <!--:remote-method="getProductList"-->
            <!--:loading="productLoading">-->
            <!--<el-option-->
              <!--v-for="item in productResult"-->
              <!--:key="item.product_name"-->
              <!--:label="item.product_name"-->
              <!--:value="item.id">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="消费虚拟币" prop="virtual_money">-->
          <!--<el-input v-model="innerTemp2.virtual_money"></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="返点" prop="virtual_money">-->
          <!--<el-input v-model="innerTemp2.ratio" disabled></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="消费人民币" prop="money">-->
          <!--<el-input v-model="countedMoney" disabled></el-input>-->
        <!--</el-form-item>-->
      <!--</el-form>-->
      <!--<div slot="footer" class="dialog-footer">-->
        <!--<el-button @click="innerDialogFormVisible2 = false">取 消</el-button>-->
        <!--<el-button v-if="dialogStatus=='create'" type="primary" @click="createInnerData2">确 定</el-button>-->
        <!--<el-button v-else type="primary" @click="updateInnerData2">确 定</el-button>-->
      <!--</div>-->
    <!--</el-dialog>-->

    <el-dialog :title="innerTableTitle3" :visible.sync="innerTableVisible3" width="90%" >
      <div class="filter-container" align="right">
        <el-date-picker
          style="float:left"
          v-model="innerListQuery3.date_range"
          type="daterange"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          align="right"
          unlink-panels
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions2"
          @change='handleInnerFilter3'>
        </el-date-picker>
        <el-button align="left" class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate3" type="primary" icon="el-icon-edit">充值充值</el-button>
      </div>

      <el-table stripe="true" :key='innerTableKey3' :data="innerList3" v-loading="innerListLoading3" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="推广人">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.promotion_member.nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="充值虚拟币">
          <template slot-scope="scope">
            <span>￥{{scope.row.virtual_money}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="反点">
          <template slot-scope="scope">
            <span>{{scope.row.ratio}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="折合人民币">
          <template slot-scope="scope">
            <span>{{scope.row.money}}</span>
          </template>
        </el-table-column>
        <el-table-column width="180px" align="center" label="录入时间">
          <template slot-scope="scope">
            <span>{{scope.row.created_at}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="320" class-name="small-padding">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="handleInnerDelete3(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!innerListLoading3" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange3" @current-change="handleInnerCurrentChange3" :current-page.sync="innerListQuery3.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery3.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal3">
        </el-pagination>
      </div>
    </el-dialog>
    <!--<el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible3">-->
      <!--<el-form :rules="innerRules3" ref="innerDataForm3" :model="innerTemp3" label-position="left" label-width="25%" style='width: 50%; margin-left:10%;'>-->
        <!--<el-form-item label="渠道" prop="channel_name">-->
          <!--<el-input v-model="temp.channel_name" disabled></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="账户" prop="account_name">-->
          <!--<el-input v-model="temp.account_name" disabled></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="充值虚拟币" prop="virtual_money">-->
          <!--<el-input v-model="countedVirtualMoney" disabled></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="返点" prop="virtual_money">-->
          <!--<el-input v-model="innerTemp3.ratio"></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="充值人民币" prop="money">-->
          <!--<el-input v-model="innerTemp3.money"></el-input>-->
        <!--</el-form-item>-->
      <!--</el-form>-->
      <!--<div slot="footer" class="dialog-footer">-->
        <!--<el-button @click="innerDialogFormVisible3 = false">取 消</el-button>-->
        <!--<el-button v-if="dialogStatus=='create'" type="primary" @click="createInnerData3">确 定</el-button>-->
        <!--<el-button v-else type="primary" @click="updateInnerData3">确 定</el-button>-->
      <!--</div>-->
    <!--</el-dialog>-->
  </div>
</template>

<script>
import { createPromotionChannelAccount, updatePromotionChannelAccount, deletePromotionChannelAccount, createPromotionChannel, updatePromotionChannel, getPromotionChannelList, createPromotionChannelAccountConsumption, createPromotionChannelAccountRecharge, deletePromotionChannelAccountConsumption, deletePromotionChannelAccountRecharge, getPromotionChannelAccountConsumptionList, getPromotionChannelAccountRechargeList } from '@/api/promotion_channel'
import { getProductList } from '@/api/product'
import waves from '@/directive/waves' // 水波纹指令

import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'
// 多选框组件css

export default {
  name: 'promotion_channel',
  components: {
    Multiselect },
  directives: {
    waves
  },
  data() {
    return {
      scrollTop: 0,
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
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
      tableKey: 0,
      list: [],
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        page_size: 20,
        channel_name: undefined,
        sort: '-id'
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showAuditor: false,
      temp: {
        id: undefined,
        channel_name: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        channel_name: [{ required: true, message: '请正确填写渠道名称', trigger: 'change' }]
      },
      countNumber: [],
      countIndex: [],
      innerTemp1: {
        id: undefined,
        promotion_channel: undefined,
        promotion_channel_id: undefined,
        account_name: undefined
      },
      innerListLoading1: false,
      innerDialogFormVisible1: false,
      innerRules1: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      innerList2: null,
      innerTotal2: null,
      innerTableKey2: 2,
      innerTableTitle2: '',
      innerListQuery2: {
        page: 1,
        page_size: 5,
        promotion_channel_account_id: undefined,
        sort: '-id',
        date_range: ''
      },
      innerTemp2: {
        id: undefined,
        product_id: undefined,
        promotion_channel_account_id: undefined,
        promotion_user_account_id: undefined,
        money: undefined,
        virtual_money: undefined,
        ratio: undefined,
        consumption_time: new Date().setTime(new Date().getTime() - 3600 * 1000 * 24),
        product: {
          id: undefined,
          product_name: ''
        }
      },
      innerListLoading2: false,
      innerTableVisible2: false,
      innerDialogFormVisible2: false,
      innerRules2: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      innerList3: null,
      innerTotal3: null,
      innerTableKey3: 3,
      innerTableTitle3: '',
      innerListQuery3: {
        page: 1,
        page_size: 5,
        promotion_channel_account_id: undefined,
        sort: '-id',
        date_range: ''
      },
      innerTemp3: {
        id: undefined,
        promotion_channel_account_id: undefined,
        promotion_user_account_id: undefined,
        money: undefined,
        virtual_money: undefined,
        ratio: undefined,
        promotion_member: {
          id: undefined,
          nickname: ''
        }
      },
      innerListLoading3: false,
      innerTableVisible3: false,
      innerDialogFormVisible3: false,
      innerRules3: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      channelOptions: [],
      channelListShow: true,
      productResult: [],
      productLoading: false
    }
  },
  computed: {
    // 计算属性的 getter
    countedMoney: function() {
      // `this` 指向 vm 实例
      if (this.innerTemp2.virtual_money) {
        return Math.round(this.innerTemp2.virtual_money * 100 / this.temp.ratio) / 100
      } else {
        return 0.00
      }
    },
    countedVirtualMoney: function() {
      // `this` 指向 vm 实例
      if (this.innerTemp3.money && this.innerTemp3.ratio) {
        return Math.round(this.innerTemp3.money * this.innerTemp3.ratio * 100) / 100
      } else {
        return 0.00
      }
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    innerTemp2DateChange(date) {
      const timestamp2 = Date.parse(new Date(date)) + 28800000
      this.innerTemp2.consumption_time = timestamp2
    },
    getProductList(query) {
      this.productLoading = true
      getProductList({ product_name: query }).then(response => {
        this.productResult = response.data.data
        this.productLoading = false
      })
    },
    queryChannelList(query) {
      getPromotionChannelList({ channel_name: query }).then(response => {
        if (!response.data.data) return
        this.channelOptions = response.data.data.map(v => ({
          id: v.id,
          channel_name: v.channel_name
        }))
      })
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 || columnIndex === 1) {
        const spannum = this.countNumber[this.countIndex[rowIndex]]
        if (spannum) {
          return {
            rowspan: spannum,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    countRowSpan() {
      var i = 0
      this.countNumber = []
      const countHas = []
      this.countIndex = []
      for (const v of this.list) {
        if (countHas.indexOf(v.id) < 0) {
          countHas.push(v.id)
          this.countIndex[i] = v.id
          this.countNumber[v.id] = 1
        } else {
          this.countNumber[v.id] += 1
        }
        i++
      }
    },
    getList() {
      this.listLoading = true
      getPromotionChannelList(this.listQuery).then(response => {
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
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        channel_name: ''
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
          createPromotionChannel(this.temp).then(response => {
            this.getList()
            this.dialogFormVisible = false
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
          tempData.promotion_channel_id = this.temp.id
          updatePromotionChannel(tempData).then(() => {
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
      this.$confirm('此操作将永久删除该渠道账户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          promotion_channel_account_id: row.promotion_channel_account_id
        }
        deletePromotionChannelAccount(ttempData).then(response => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
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
    resetInnerTemp1() {
      this.innerTemp1 = {
        id: undefined,
        promotion_channel: undefined,
        promotion_channel_id: undefined,
        account_name: undefined
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
          if (!this.innerTemp1.promotion_channel.id) {
            return
          }
          this.innerTemp1.promotion_channel_id = this.innerTemp1.promotion_channel.id
          createPromotionChannelAccount(this.innerTemp1).then(response => {
            this.innerDialogFormVisible1 = false
            this.getList()
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
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.channelListShow = false
      this.innerDialogFormVisible1 = true
      this.$nextTick(() => {
        this.$refs['innerDataForm1'].clearValidate()
      })
    },
    updateInnerData1() {
      this.$refs['innerDataForm1'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updatePromotionChannelAccount(tempData).then(() => {
            this.getList()
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
    handleOpenInner2(row) {
      this.innerTableVisible2 = true
      this.innerTableTitle2 = row.account_name + ' -- 消费记录'
      this.temp = Object.assign({}, row) // copy obj
      this.getInnerList2()
    },
    getInnerList2() {
      this.innerListQuery2.promotion_channel_account_id = this.temp.promotion_channel_account_id
      this.innerListLoading2 = true
      getPromotionChannelAccountConsumptionList(this.innerListQuery2).then(response => {
        this.innerList2 = response.data.data
        this.innerTotal2 = response.data.total
        this.innerListLoading2 = false
      })
    },
    handleInnerFilter2() {
      this.innerListQuery2.page = 1
      this.getInnerList2()
    },
    handleChangeDate(date) {
      console.log(date)
      this.getInnerList2()
    },
    handleInnerSizeChange2(val) {
      this.innerListQuery2.page_size = val
      this.getInnerList2()
    },
    handleInnerCurrentChange2(val) {
      this.innerListQuery2.page = val
      this.getInnerList2()
    },
    resetInnerTemp2() {
      this.innerTemp2 = {
        id: undefined,
        product_id: undefined,
        promotion_channel_account_id: undefined,
        promotion_user_account_id: undefined,
        money: undefined,
        virtual_money: undefined,
        ratio: this.temp.ratio,
        consumption_time: new Date().setTime(new Date().getTime() - 3600 * 1000 * 24),
        product: {
          id: undefined,
          product_name: ''
        }
      }
    },
    handleInnerCreate2() {
      this.resetInnerTemp2()
      this.dialogStatus = 'create'
      this.innerDialogFormVisible2 = true
      this.$nextTick(() => {
        this.$refs['innerDataForm2'].clearValidate()
      })
    },
    createInnerData2() {
      this.$refs['innerDataForm2'].validate((valid) => {
        if (valid) {
          this.innerTemp2.promotion_channel_account_id = this.temp.promotion_channel_account_id
          createPromotionChannelAccountConsumption(this.innerTemp2).then(response => {
            this.innerTotal2++
            this.innerTemp2 = response.data
            this.innerList2.unshift(this.innerTemp2)
            this.innerDialogFormVisible2 = false
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
    handleInnerDelete2(row) {
      this.$confirm('此操作将永久删除该消费信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          promotion_channel_account_consumption_id: row.id
        }
        deletePromotionChannelAccountConsumption(ttempData).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.innerList2.indexOf(row)
          this.innerList2.splice(index, 1)
          this.innerTotal2--
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleOpenInner3(row) {
      this.innerTableVisible3 = true
      this.innerTableTitle3 = row.account_name + ' -- 充值记录'
      this.temp = Object.assign({}, row) // copy obj
      this.getInnerList3()
    },
    getInnerList3() {
      this.innerListQuery3.promotion_channel_account_id = this.temp.promotion_channel_account_id
      this.innerListLoading3 = true
      getPromotionChannelAccountRechargeList(this.innerListQuery3).then(response => {
        this.innerList3 = response.data.data
        this.innerTotal3 = response.data.total
        this.innerListLoading3 = false
      })
    },
    handleInnerFilter3() {
      this.innerListQuery3.page = 1
      this.getInnerList3()
    },
    handleInnerSizeChange3(val) {
      this.innerListQuery3.page_size = val
      this.getInnerList3()
    },
    handleInnerCurrentChange3(val) {
      this.innerListQuery3.page = val
      this.getInnerList3()
    },
    resetInnerTemp3() {
      this.innerTemp3 = {
        id: undefined,
        promotion_channel_account_id: undefined,
        promotion_user_account_id: undefined,
        money: undefined,
        virtual_money: undefined,
        ratio: this.temp.ratio,
        promotion_member: {
          id: undefined,
          nickname: ''
        }
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
      this.$refs['innerDataForm3'].validate((valid) => {
        if (valid) {
          this.innerTemp3.promotion_channel_account_id = this.temp.promotion_channel_account_id
          createPromotionChannelAccountRecharge(this.innerTemp3).then(response => {
            this.innerTotal3++
            this.innerTemp3 = response.data
            this.innerList3.unshift(this.innerTemp3)
            this.innerDialogFormVisible3 = false
            for (const v of this.list) {
              if (v.promotion_channel_account_id === this.innerTemp3.promotion_channel_account_id) {
                const index = this.list.indexOf(v)
                v.ratio = response.data.ratio
                this.list.splice(index, 1, v)
                break
              }
            }
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
    handleInnerDelete3(row) {
      this.$confirm('此操作将永久删除该充值信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          promotion_channel_account_recharge_id: row.id
        }
        deletePromotionChannelAccountRecharge(ttempData).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.innerList3.indexOf(row)
          this.innerList3.splice(index, 1)
          this.innerTotal3--
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
