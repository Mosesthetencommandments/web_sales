<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="订单号" v-model="listQuery.orders_unique_id">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>
    <div :class="tableLoading">
      <el-tabs v-model="tabSelection" type="card" @tab-click="handleClick">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待处理" name="1"></el-tab-pane>
        <el-tab-pane label="已处理" name="2"></el-tab-pane>
        <el-tab-pane label="处理失败" name="3"></el-tab-pane>
      </el-tabs>
      <el-row>
        <el-col :span="3"><div class="grid-content bg-purple">发货信息</div></el-col>
        <el-col :span="3"><div class="grid-content bg-purple-light">物流信息</div></el-col>
        <el-col :span="3"><div class="grid-content bg-purple">订单状态</div></el-col>
        <el-col :span="3"><div class="grid-content bg-purple-light">销售人员</div></el-col>
        <el-col :span="3"><div class="grid-content bg-purple">修改明细</div></el-col>
        <el-col :span="3"><div class="grid-content bg-purple-light">申请时间</div></el-col>
        <el-col :span="3"><div class="grid-content bg-purple-light">状态</div></el-col>
        <el-col :span="3"><div class="grid-content bg-purple">操作</div></el-col>
      </el-row>
      <br>
      <div v-for="orders in list" :key="orders.id">
        <div style="border:1px solid #ebeef5;width:100%;line-height:20px;padding:10px 20px;background-color:#f7f8fa;margin-bottom:-1px;color:#323233;">
          <div style="float:left;display:table-cell;line-height:30px;">
            <span>订单号： <span class="link-type">{{orders.orders.orders_unique_id}}</span></span>
            <span style="margin-left:10px;">下单时间： {{orders.orders.created_at}}</span>
            <span style="margin-left:10px;">
              <div class="red-circle"></div>
            <span>修改代收货款</span>
            </span>
          </div>
          <div style="clear:both;"></div>
        </div>
        <el-table :show-header="hideTableHeader" :key='tableKey' :data="[orders]" element-loading-text="给我一点时间" border fit
                  style="width: 100%;">
          <el-table-column min-width="100" align="center" label="发货人">
            <template slot-scope="scope">
              <p style="padding:0;margin:0;">
                {{scope.row.orders.orders_sender_info.sender_name}}
              </p>
              <p style="padding:0;margin:0;">
                {{scope.row.orders.orders_sender_info.sender_phone}}
              </p>
            </template>
          </el-table-column>
          <el-table-column align="center" label="物流信息" min-width="120">
            <template slot-scope="scope">
              <span>
                {{scope.row.orders.orders_warehouse.name}}
              </span>
              <br>
              <div v-if="scope.row.orders.orders_logistics">
                <span>
                  <el-tag v-if="scope.row.orders.orders_logistics.logistics_name"
                          style="height:20px;line-height:20px;" type="warning">
                    {{scope.row.orders.orders_logistics.logistics_name}}
                  </el-tag>
                </span>
                  <br>
                  <span>
                  <span class="link-type">{{scope.row.orders.orders_logistics.logistics_number}}</span>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="100" align="center" label="订单状态">
            <template slot-scope="scope">
              {{scope.row.orders.status|orderStatusTranslator}}
            </template>
          </el-table-column>
          <el-table-column min-width="100" align="center" label="销售">
            <template slot-scope="scope">
              <span slot="reference" class="link-type">{{scope.row.support_member.nickname}}</span>
              <br/>
              <span>{{ scope.row.support_member.user_account_group.group_name }}</span>
            </template>
          </el-table-column>
          <!--<el-table-column min-width="100" align="center" label="订单总额">-->
            <!--<template slot-scope="scope">-->
              <!--<span>￥{{scope.row.origin_actual_pay}} -> ￥{{scope.row.new_actual_pay}}</span><br>-->
              <!--<span>￥{{scope.row.origin_cash_on_delivery}} -> ￥{{scope.row.new_cash_on_delivery}}</span><br>-->
            <!--</template>-->
          <!--</el-table-column>-->
          <el-table-column min-width="100" align="center" label="代收货款变化">
            <template slot-scope="scope">
              <span>{{scope.row.origin_cash_on_delivery}} => <span class="link-type">{{scope.row.new_cash_on_delivery}}</span></span>
            </template>
          </el-table-column>
          <el-table-column min-width="100" align="center" label="申请时间">
            <template slot-scope="scope">
              <span>{{scope.row.created_at}}</span><br>
            </template>
          </el-table-column>
          <el-table-column min-width="100" align="center" label="改价记录状态">
            <template slot-scope="scope">
              {{scope.row.status|changePriceLogStatusTranslator}}
            </template>
          </el-table-column>
          <el-table-column min-width="100" align="center" label="操作">
            <template slot-scope="scope">
              <span v-if="scope.row.status === 1">
                <span @click="handleUpdate(scope.row, 2)" class="link-type">
                  已处理
                </span>
                <br>
                <span @click="handleUpdate(scope.row, 3)" class="link-type">
                  标记失败
                </span>
              </span>
            </template>
          </el-table-column>
        </el-table>
        <br>
      </div>
    </div>
    <div v-show="list.length > 0" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[20,50,100,200]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog title="退款详情" :visible.sync="innerDialogFormVisible7" width="40%">
      <el-form :rules="innerRules7" ref="innerDataForm7" :model="innerTemp7" label-position="left" label-width="100px"
               style='width: 80%; margin-left:10%;'>
        <el-form-item label="退款金额" prop="number" disabled>
          {{innerTemp7.refund_money}}
        </el-form-item>
        <el-form-item label="收款人信息">
          {{innerTemp7.receiver_info}}
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="innerTemp7.status" size="medium" :disabled="innerTemp7.status === 2">
            <el-radio-button label="1" >待审核</el-radio-button>
            <el-radio-button label="2">已退款</el-radio-button>
            <el-radio-button label="3">审核失败</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="innerTemp7.remark" :autosize="{ minRows: 6, maxRows: 20 }"></el-input>
        </el-form-item>
        <el-form-item label="转款截图">
          <span style="cursor: pointer" v-if="innerTemp7.refund_img_url" @click="handleOpenImage(innerTemp7.refund_img_url)">
            <el-image
              style="width: 100px; height: 100px"
              lazy
              :src="innerTemp7.refund_img_url"
              fit="fill"></el-image>
          </span>
          <el-upload
            ref="uploadFiles"
            :action="baseUrl"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handlePictureSuccess"
            name="image">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible7 = false">取 消</el-button>
        <el-button type="primary" :loading="btnLoading7" @click="updateInnerData7">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="imageDialogVisible">
      <img width="100%" :src="publicImageUrl">
    </el-dialog>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="0">
      <defs>
        <filter id="f1">
          <feGaussianBlur stdDeviation="3"/>
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script>
  import { getOrdersChangePriceLogList, updateOrdersChangePriceLog } from '@/api/orders'
  import waves from '@/directive/waves' // 水波纹指令
  export default {
    name: 'ordersChangePriceLog',
    components: {},
    directives: {
      waves
    },
    data() {
      return {
        scrollTop: 0,
        tableKey: 0,
        hideTableHeader: false,
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          page_size: 20,
          status: undefined,
          orders_unique_id: undefined
        },
        temp: { },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        rules: {
          domain_prefix: [{ required: true, message: '请正确填写域名名称', trigger: 'change' }]
        },
        tableLoading: '',
        tabSelection: 'all',
        innerTemp7: {
          orders_id: undefined,
          support_user_account_id: undefined,
          finance_user_account_id: undefined,
          refund_money: undefined,
          receiver_info: undefined,
          status: undefined,
          refund_img_url: undefined,
          remark: undefined
        },
        innerDialogFormVisible7: false,
        btnLoading7: false,
        innerDataForm7: 7,
        innerRules7: {},
        baseUrl: process.env.BASE_API + '/api/document/uploadImage',
        publicImageUrl: '',
        imageDialogVisible: false
      }
    },
    computed: {},
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
      changePriceLogStatusTranslator(status) {
        const statusMap = {
          1: '待处理',
          2: '已处理',
          3: '处理失败'
        }
        return statusMap[status]
      },
      orderStatusTranslator(status) {
        const statusMap = {
          0: '无效订单',
          1: '未确认',
          2: '待发货',
          3: '发货中',
          4: '断货中',
          5: '已签收',
          6: '已拒收',
          7: '已完成',
          8: '已退回',
          9: '废弃',
          10: '已退款'
        }
        return statusMap[status]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      handleRemove(file, fileList) {

      },
      handleOpenImage(imageUrl) {
        this.publicImageUrl = imageUrl
        this.imageDialogVisible = true
      },
      handlePictureSuccess(response, file, fileList) {
        this.innerTemp7.refund_img_url = response.data.url
      },
      handlePictureCardPreview(file) {
        this.publicImageUrl = file.url
        this.imageDialogVisible = true
      },
      handleClick(tab, event) {
        this.listQuery.status = ''
        if (tab.name !== 'all') {
          this.listQuery.status = parseInt(tab.name)
        }
        this.getList()
      },
      getList() {
        this.tableLoading = 'filtered'
        getOrdersChangePriceLogList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.tableLoading = ''
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleSizeChange(val) {
        window.scrollTo(0, 0)
        this.listQuery.page_size = val
        this.getList()
      },
      handleCurrentChange(val) {
        window.scrollTo(0, 0)
        this.listQuery.page = val
        this.getList()
      },
      handleUpdate(row, status) {
        const tempData = {}
        tempData.orders_id = row.orders.id
        tempData.status = status
        updateOrdersChangePriceLog(tempData).then(response => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      updateInnerData7() {
        const tempData = Object.assign({}, this.innerTemp7)
        tempData.orders_id = this.innerTemp7.orders.id
        updateOrdersChangePriceLog(tempData).then(response => {
          this.getList()
          this.innerDialogFormVisible7 = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
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
<style scoped>
  .grid-content {
    text-align: left;
    background-color:#edf2f9;
    color:#323233;
    padding: 15px 25px;
  }
  .filtered {
    -webkit-filter: url(#f1);
    filter: url(#f1);
  }
  .red-circle {
    width:6px;
    height:6px;
    background-color:red;
    display:inline-block;
    border-radius:100%;
  }
</style>
