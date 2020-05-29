<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container" align="left">
      <el-date-picker
        class="filter-item"
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
      <el-select
        class="filter-item"
        style="width:200px;"
        @change='handleInnerFilter3'
        v-model="innerListQuery3.promotion_user_account_id"
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
        style="width:200px;"
        @change='handleInnerFilter2'
        v-model="innerListQuery3.promotion_channel_id"
        filterable
        clearable
        remote
        placeholder="渠道"
        :remote-method="queryChannelList"
        :loading="userPromotionChannelLoading">
        <el-option
          v-for="item in channelOptions"
          :key="item.channel_name"
          :label="item.channel_name"
          :value="item.id">
        </el-option>
      </el-select>
      <el-select
        class="filter-item"
        style="width:200px;"
        @change='handleInnerFilter3'
        v-model="innerListQuery3.promotion_channel_account_id"
        filterable
        clearable
        remote
        placeholder="账户"
        :remote-method="getPromotionChannelAccountOption"
        :loading="promotionChannelAccountLoading">
        <el-option
          v-for="item in promotionChannelAccountOption"
          :key="item.id"
          :label="item.account_name"
          :value="item.id">
        </el-option>
      </el-select>
      <!--<el-button align="left" class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate3" type="primary" icon="el-icon-edit">充值充值</el-button>-->
    </div>

    <el-table :stripe="true" :key='innerTableKey3' :data="innerList3" v-loading="innerListLoading3" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="审核状态" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.check_status | statusFilter">{{scope.row.check_status | statusTranslator}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="80" align="center" label="推广人">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.promotion_member.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="账户" width="140">
        <template slot-scope="scope">
          <span v-if="scope.row.promotion_channel_account" class="link-type">{{scope.row.promotion_channel_account.account_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="充值虚拟币">
        <template slot-scope="scope">
          <span>￥{{scope.row.virtual_money}}</span>
        </template>
      </el-table-column>
      <el-table-column width="70px" align="center" label="返点">
        <template slot-scope="scope">
          <span>{{scope.row.ratio}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="折合人民币">
        <template slot-scope="scope">
          <span>{{scope.row.money}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="类型">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type | tagTypeFilter">{{scope.row.type | typeFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" width="100px" align="center" label="凭证">
        <template slot-scope="scope">
          <span v-if="scope.row.proof_img !== null" class="link-type" @click="handleOpenImage(scope.row.proof_img)">
              <img style="height:100%;width:100%;" :src="scope.row.proof_img"/>
          </span>
        </template>
      </el-table-column>
      <el-table-column width="100" align="center" label="充值时间">
        <template slot-scope="scope">
          <span v-if="scope.row.operate_at !== null">{{scope.row.operate_at.slice(0, 10)}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.remark !== null">{{scope.row.remark}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="300" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleUpdateProof(scope.row)">凭证</el-button>
          <el-button size="mini" type="info" @click="handleInnerDelete3(scope.row)">删除</el-button>
          <el-button size="mini" type="success" v-if="($store.state.user.roles === 'promotionManager' || $store.state.user.roles === 'administrator' || $store.state.user.roles === 'promotionDirector') && scope.row.check_status === 0" @click="handleInnerDelete2(scope.row, 1)">通过</el-button>
          <el-button size="mini" type="danger" v-if="($store.state.user.roles === 'promotionManager' || $store.state.user.roles === 'administrator' || $store.state.user.roles === 'promotionDirector') && scope.row.check_status === 0" @click="handleInnerDelete2(scope.row, 2)">不通过</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!innerListLoading3" class="pagination-container">
      <el-pagination background @size-change="handleInnerSizeChange3" @current-change="handleInnerCurrentChange3" :current-page.sync="innerListQuery3.page"
                     :page-sizes="[10,20,50, 100]" :page-size="innerListQuery3.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal3">
      </el-pagination>
    </div>
    <!--<el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible3">-->
      <!--<el-form :rules="innerRules3" ref="innerDataForm3" :model="innerTemp3" label-position="left" label-width="25%" style='width: 50%; margin-left:10%;'>-->
        <!--<el-form-item label="渠道" prop="channel_name" v-if="temp.promotion_channel">-->
          <!--<el-input v-model="temp.promotion_channel.channel_name" disabled></el-input>-->
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

    <el-dialog :visible.sync="proofDialogVisible">
      <el-form :rules="innerRules4" ref="innerDataForm4" :model="tempProof" label-position="left" label-width="25%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="上传凭证" >
          <el-upload
            :action="baseUrl"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handlePictureSuccess"
            :on-exceed="handlelimit"
            :before-upload="beforeImgUpload"
            :file-list="fileList"
            :limit="1"
            name="image">
            <i class="el-icon-plus"></i>
            <div slot="tip" >只能上传jpg/png文件,图片大小不能超过5M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="proofDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateProof">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="imageDialogVisible">
      <img width="100%" :src="publicImageUrl">
    </el-dialog>
  </div>
</template>

<script>
  import { getPromotionChannelAccountList, createPromotionChannelAccount, updatePromotionChannelAccount, deletePromotionChannelAccount, createPromotionChannel, updatePromotionChannel, getPromotionChannelList, createPromotionChannelAccountConsumption, createPromotionChannelAccountRecharge, deletePromotionChannelAccountRecharge, getPromotionChannelAccountConsumptionList, getPromotionChannelAccountRechargeList } from '@/api/promotion_channel'
  import { getProductList } from '@/api/product'
  import { checkPromotionChannelAccountRecharge } from '@/api/promotion_statistics'
  import { updatePromotionChannelAccountRechargeProof } from '@/api/promotion_channel'
  import { getPromotionMemberList } from '@/api/promotion_member'

  import waves from '@/directive/waves' // 水波纹指令

  import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
  import 'vue-multiselect/dist/vue-multiselect.min.css'
  // 多选框组件css

  export default {
    name: 'promotion_channel_account_recharge',
    components: {
      Multiselect },
    directives: {
      waves
    },
    data() {
      return {
        scrollTop: 0,
        publicImageUrl: undefined,
        promotionChannelAccountOption: [],
        baseUrl: process.env.BASE_API + '/api/document/uploadImage',
        promotionChannelAccountLoading: false,
        fileList: [],
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
        imageDialogVisible: false,
        proofDialogVisible: false,
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
        tempProof: {
          promotion_channel_account_recharge_id: undefined,
          proof_img: undefined
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
        channelOptions: [],
        promotionUserAccountOptions: [],
        promotionUserAccountLoading: false,
        userPromotionChannelLoading: false,
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
          page_size: 20,
          promotion_channel_account_id: undefined,
          promotion_user_account_id: undefined,
          promotion_channel_id: undefined,
          account_name: undefined,
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
        innerRules4: {
          proof_img: [{ required: true, message: '凭证不可删除', trigger: 'blur' }]
        },
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
      tagTypeFilter(status) {
        const statusMap = {
          '0': 'primary',
          '1': 'warning'
        }
        return statusMap[status]
      },
      typeFilter(status) {
        const statusTransMap = {
          '0': '充值',
          '1': '转账'
        }
        return statusTransMap[status]
      },
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
          0: '待审核',
          1: '通过',
          2: '不通过'
        }
        return statusTransMap[status]
      }
    },
    created() {
      this.getInnerList3()
      this.queryChannelList(' ')
      this.getPromotionUserAccountList(' ')
    },
    methods: {
      updateProof() {
        if (this.tempProof.proof_img == null || this.tempProof.proof_img === undefined) {
          this.$message.error('凭证不能为空')
          return false
        }
        this.$refs['innerDataForm4'].validate((valid) => {
          if (valid) {
            updatePromotionChannelAccountRechargeProof(this.tempProof).then(() => {
              this.proofDialogVisible = false
              this.getInnerList3()
              this.$notify({
                title: '成功',
                message: '录入成功',
                type: 'success',
                duration: 2000
              })
              this.$refs['innerDataForm4'].clearValidate()
            })
          }
        })
      },
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
      handleOpenImage(imageUrl) {
        this.publicImageUrl = imageUrl
        this.imageDialogVisible = true
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
      getList() {
        this.listLoading = true
        getPromotionChannelAccountList(this.listQuery).then(response => {
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
      handlePictureCardPreview(file) {
        this.publicImageUrl = file.url
        this.imageDialogVisible = true
      },
      handleRemove(file, fileList) {
        this.tempProof.proof_img = undefined
      },
      handlePictureSuccess(response, file, fileList) {
        this.fileList = fileList
        this.tempProof.proof_img = process.env.BASE_API + fileList[0].response.data.url
      },
      handlelimit(files, fileList) {
        this.$message.error('最多上传1张图片')
      },
      beforeImgUpload(file) {
        const isLt5M = file.size / 1024 / 1024 < 5
        if (['image/png', 'image/jpeg'].indexOf(file.type) === -1) {
          this.$message.error('请上传正确的图片格式')
          return false
        }
        if (!isLt5M) {
          this.$message.error('上传图片大小不能超过5MB')
          return false
        }
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
      getPromotionUserAccountList(query) {
        if (query !== '') {
          this.promotionUserAccountLoading = true
          getPromotionMemberList({ nickname: query, status: 1 }).then(response => {
            this.promotionUserAccountOptions = response.data.data
            this.promotionUserAccountLoading = false
          })
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
        this.innerListQuery2.promotion_channel_account_id = this.temp.id
        this.innerListLoading2 = true
        getPromotionChannelAccountConsumptionList(this.innerListQuery2).then(response => {
          this.innerList2 = response.data.data
          this.innerTotal2 = response.data.total
          this.innerListLoading2 = false
        })
      },
      handleInnerFilter2() {
        this.innerListQuery3.promotion_channel_account_id = undefined
        this.innerListQuery3.page = 1
        this.promotionChannelAccountOption = []
        this.getInnerList3()
      },
      getPromotionChannelAccountOption(query) {
        if (query !== '') {
          this.promotionChannelAccountLoading = true
          getPromotionChannelAccountList({
            promotion_channel_id: this.innerListQuery3.promotion_channel_id,
            account_name: query
          }).then(response => {
            this.promotionChannelAccountOption = response.data.data
            this.promotionChannelAccountLoading = false
          })
        }
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
      handleInnerDelete2(row, status) {
        this.$confirm('是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const ttempData = {
            promotion_channel_account_recharge_id: row.id,
            check_status: status
          }
          checkPromotionChannelAccountRecharge(ttempData).then(response => {
            const index = this.innerList3.indexOf(row)
            this.innerList3[index].check_status = status
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
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
      handleUpdateProof(row) {
        this.tempProof.promotion_channel_account_recharge_id = row.id
        this.tempProof.proof_img = row.proof_img
        console.log(row.proof_img)
        if (row.proof_img !== undefined && row.proof_img !== null) {
          this.fileList = [{ name: 0, url: row.proof_img }]
        }
        this.proofDialogVisible = true
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
    watch: {
      proofDialogVisible(val) {
        if (val === false) {
          this.tempProof.proof_img = undefined
          this.fileList = []
        }
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
  .el-table >>> thead {
    font-size: 14px;
  }
</style>
