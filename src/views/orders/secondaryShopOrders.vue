<template>
  <div class="app-container calendar-list-container">
    <!--<el-button type="primary" v-waves icon="el-icon-refresh" size="small" @click="show = !show">筛选</el-button>-->
    <div class="filter-container transition-box">
      <div class="filter-item">
        <div class="filter-label">订单时间</div>
        <el-date-picker v-model="listQuery.date_range"
                        type="daterange"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        align="right"
                        size="small"
                        style="width: 250px"
                        unlink-panels
                        range-separator="~"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        :picker-options="pickerOptions2"
                        @change='handleFilter'>
        </el-date-picker>
      </div>
      <div class="filter-item">
        <div class="filter-label">订单状态</div>
        <el-select @change='handleFilter'
                   clearable style="width: 100px"
                   size="small"
                   v-model="listQuery.orders_status"
                   placeholder="状态">
          <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key">
          </el-option>
        </el-select>
      </div>

      <div class="filter-item">
        <div class="filter-label">系统订单号</div>
        <el-input @keyup.enter.native="handleFilter"
                  style="width: 150px;" size="small"
                  clearable
                  v-model="listQuery.orders_unique_id">
        </el-input>
      </div>
      <div class="filter-item">
        <div class="filter-label">商城订单号</div>
        <el-input @keyup.enter.native="handleFilter" clearable style="width: 250px;" size="small"
                  v-model="listQuery.secondary_shop_orders_id">
        </el-input>
      </div>
      <div class="filter-item">
        <div class="filter-label">物流单号</div>
        <el-input @keyup.enter.native="handleFilter" clearable style="width: 150px;" size="small"
                  v-model="listQuery.orders_logistics_number">
        </el-input>
      </div>
      <div class="filter-item">
        <div class="filter-label">收货人姓名</div>
        <el-input @keyup.enter.native="handleFilter" clearable style="width: 150px;" size="small"
                  v-model="listQuery.secondary_name">
        </el-input>
      </div>
      <div class="filter-item">
        <div class="filter-label">收货人电话</div>
        <el-input @keyup.enter.native="handleFilter" clearable style="width: 150px;" size="small"
                  v-model="listQuery.secondary_phone">
        </el-input>
      </div>

      <!--<div class="filter-item">-->
        <!--<div class="filter-label">客服部门</div>-->
        <!--<el-cascader-->
          <!--clearable-->
          <!--size="small"-->
          <!--style="width: 250px"-->
          <!--:options="userGroupTree"-->
          <!--change-on-select-->
          <!--:props="defaultPropsGroup"-->
          <!--v-model="userGroupOptions"-->
          <!--@change="handleFilterGrounp">-->
        <!--</el-cascader>-->
      <!--</div>-->
      <!--<div class="filter-item">-->
        <!--<div class="filter-label">客服</div>-->
        <!--<el-select-->
          <!--style="width: 100px"-->
          <!--size="small"-->
          <!--@focus="getSupportUserAccountList(' ')"-->
          <!--@change='handleFilter'-->
          <!--v-model="listQuery.support_user_account_id"-->
          <!--filterable-->
          <!--clearable-->
          <!--remote-->
          <!--:remote-method="getSupportUserAccountList"-->
          <!--:loading="supportUserAccountLoading">-->
          <!--<el-option-->
            <!--v-for="item in supportUserAccountOptions"-->
            <!--:key="item.id"-->
            <!--:label="item.nickname"-->
            <!--:value="item.id">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</div>-->
      <!--<div class="filter-item">-->
        <!--<div class="filter-label">微信号</div>-->
        <!--<el-select v-model="listQuery.product_weixin_id"-->
                   <!--filterable-->
                   <!--clearable-->
                   <!--style="width: 150px;"-->
                   <!--remote-->
                   <!--size="small"-->
                   <!--:remote-method="getProductWeixinList"-->
                   <!--:loading="productWeixinLoading2"-->
                   <!--@change="handleFilter">-->
          <!--<el-option-->
            <!--v-for="item in productWeixinOptions2"-->
            <!--:key="item.id"-->
            <!--:label="item.info"-->
            <!--:value="item.id">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</div>-->
      <!--<div class="filter-item">-->
        <!--<div class="filter-label">产品</div>-->
        <!--<el-select-->
          <!--@change="handleFilter"-->
          <!--@focus="getProductList(' ')"-->
          <!--clearable-->
          <!--filterable-->
          <!--size="small"-->
          <!--style="width:150px"-->
          <!--remote-->
          <!--:remote-method="getProductList"-->
          <!--:loading="productListLoading"-->
          <!--v-model="listQuery.product_id">-->
          <!--<el-option v-for="item in productListOptions" :key="item.id" :label="item.product_name" :value="item.id">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</div>-->
      <!--<div class="filter-item">-->
        <!--<div class="filter-label">备注信息</div>-->
        <!--<el-input @keyup.enter.native="handleFilter"-->
                  <!--size="small"-->
                  <!--style="width: 200px;"-->
                  <!--v-model="listQuery.remark">-->
        <!--</el-input>-->
      <!--</div>-->

      <!--<el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="推广渠道" v-model="listQuery.channel_name">-->
      <!--</el-input>-->
      <div class="filter-float">
        <el-button class="filter-item" type="primary" v-waves size="small" :disabled="list2.length == 0" @click="handleBatch">批量操作</el-button>
        <el-button class="filter-item" style="margin-right: 20px" type="primary" :disabled="list.length == 0" v-waves size="small" @click="downExcel">导出</el-button>
        <el-button class="filter-item" type="primary" v-waves size="small" @click="handleFilter">搜索</el-button>
          <!--<el-button class="filter-item" type="primary" v-waves icon="el-icon-edit" size="small" @click="handleCreate">添加</el-button>-->
          <el-button class="filter-item" type="primary" v-waves size="small" @click="refreshOrdersList">刷新</el-button>
      </div>
    </div>

    <el-table stripe
              :data="list"
              ref="secondaryTable"
              v-loading="listLoading"
              element-loading-text="给我一点时间"
              border
              fit
              @selection-change="selectTablechange"
              highlight-current-row
              :expand-row-keys="expandList"
              @expand-change="expandRow"
              row-key="id"
              style="width: 100%" :default-expand-all="ifExpandAll" :row-class-name="tableRowClassName">
      <el-table-column
        align="center"
        :selectable="selecdisabled"
        type="selection"
        width="40">
      </el-table-column>
      <el-table-column type="expand" :default-expand-all="ifExpandAll">
        <template slot-scope="scope">
          <el-form inline label-position="left" inline class="demo-table-expand">
            <el-form-item label="订单商品">
              <p class="my-form-p" v-for="item in scope.row.orders_items">
                {{item.product_goods.goods_name}} x {{item.number}}
              </p>
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑商品信息
              </el-button>
            </el-form-item>
            <el-form-item label="发货信息">
              <p class="my-form-p">
                <span class="label-span">发货人：</span><span>{{scope.row.orders_sender_info.sender_name}}</span>
              </p>
              <p class="my-form-p">
                <span class="label-span">联系电话：</span><span>{{scope.row.orders_sender_info.sender_phone}}</span>
              </p>
            </el-form-item>
            <el-form-item label="收款信息">
              <p class="my-form-p" v-if="scope.row.orders_payment" v-for="item in scope.row.orders_payment.orders_payment_items"
                 :class="item.status === 2 ? if_deleted:''">
                <el-tag style="height:20px;line-height:20px;" :type="'success'" :class="item.status === 2 ? if_deleted : ''">
                  {{item.orders_pay_type.type_name}}
                </el-tag>
                ￥{{item.paid_money}}
              </p>
            </el-form-item>
            <el-form-item label="收货信息">
              <div v-if="scope.row.orders_secondary_receiver_info">
                <p class="my-form-p">
                  <span class="label-span">收货人：</span><span v-if="scope.row.orders_secondary_receiver_info">{{scope.row.orders_secondary_receiver_info.receive_name}}</span>
                </p>
                <p class="my-form-p">
                  <span class="label-span">联系电话：</span>
                  <span v-if="scope.row.orders_secondary_receiver_info && scope.row.orders_secondary_receiver_info.phone">{{scope.row.orders_secondary_receiver_info.phone}}</span>
                </p>
                <p class="my-form-p">
                  <span class="label-span">收货地址：</span>
                  <span>
                    {{scope.row.orders_secondary_receiver_info.province}} {{scope.row.orders_secondary_receiver_info.city}} {{scope.row.orders_secondary_receiver_info.district}}
                    {{scope.row.orders_secondary_receiver_info.address}}
                  </span>
                </p>
              </div>
            </el-form-item>
            <el-form-item label="留言备注">
              <p class="my-form-p" v-for="item in scope.row.orders_remarks" :class="item.status===0?if_deleted:''">
                <span class="label-span">{{item.user_account_type_id|userTypeStatusTranslator}}：</span>
                <span>{{item.remark}}</span>
              </p>
            </el-form-item>
            <el-form-item label="物流信息">
              <div v-if="scope.row.orders_logistics">
                <p class="my-form-p">
                  <span class="label-span">物流方式：</span>
                  <el-tag v-if="scope.row.orders_logistics.orders_logistics_type.name"
                          style="height:20px;line-height:20px;" type="warning">
                    {{scope.row.orders_logistics.orders_logistics_type.name}}
                  </el-tag>
                </p>
                <p class="my-form-p">
                  <span class="label-span">物流单号：</span>
                  <span >{{scope.row.orders_logistics.logistics_number}}</span>
                </p>
              </div>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column width="80" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag size="mini" :type="scope.row.status | orderStatusFilter">{{scope.row.status|orderStatusTranslator}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="系统单号" width="90">
        <template slot-scope="scope">
          <span>{{scope.row.orders_unique_id.slice(-8)}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="商城订单号" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.secondary_shop_orders_id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80" align="center" label="产品">
        <template slot-scope="scope">
          <span v-if="scope.row.secondary_shop_product">{{scope.row.secondary_shop_product.secondary_shop_product_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="170" align="center" label="标题">
        <template slot-scope="scope">
          <span>{{scope.row.secondary_shop_commodity_title}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="金额">
        <template slot-scope="scope">
          <span>￥{{scope.row.actual_pay}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="170px" align="center" label="订单商品">
        <template slot-scope="scope">
          <span size="small" v-for="item in scope.row.orders_items">
            {{item.product_goods.goods_name}}
          </span>
        </template>
      </el-table-column>
      <el-table-column min-width="60" align="center" label="数量">
        <template slot-scope="scope">
          <span size="small" v-for="item in scope.row.orders_items">
            {{item.number}}
          </span>
        </template>
      </el-table-column>
      <el-table-column min-width="155" align="center" label="时间">
        <template slot-scope="scope">
          <span>{{scope.row.order_time}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="180" class-name="small-padding">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 1" size="mini" type="success" @click="handleUpdateOrdersStatus(scope.row, 2)">确认</el-button>
          <el-button v-if="scope.row.status === 1" size="mini" type="info" @click="handleUpdateOrdersStatus(scope.row, 0)">无效</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30,50]" :page-size="listQuery.page_size"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

<!--编辑二类商品-->
    <el-dialog :title="innerTableTitle1" :visible.sync="innerTableVisible1" width="40%">
      <el-form :rules="rules1" ref="innerDataForm1" :model="temp" label-position="left" label-width="80px"
               style='width: 80%; margin-left:10%;margin-top: 10px'>
        <el-form-item label="商品名称" prop="product_goods_id">
          <el-select
            @focus="queryProductGoodsList(' ')"
            v-model="temp.product_goods_id"
            filterable
            size="small"
            style="width:300px;"
            remote
            placeholder="商品"
            :remote-method="queryProductGoodsList">
            <el-option
              v-for="item in productGoodsOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="number">
          <el-input-number size="small" v-model="temp.number"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="innerTableVisible1 = false">取消</el-button>
        <el-button v-if="dialogStatus == 'single'" type="primary" size="small" @click="updateSecondary">确 定</el-button>
        <el-button v-if="dialogStatus == 'batch'" type="primary" size="small" @click="batchSettingsProduct">确 定</el-button>
      </div>
    </el-dialog>

    <!--批量修改-->
    <el-dialog title="批量操作" :visible.sync="batchVisible" width="80%">
      <div class="filter-container">
        <div class="filter-float">
          <el-button type="primary" @click="handleBatchSettingsProduct" size="small" class="filter-item">批量设置商品</el-button>
          <el-button type="success" @click="handleBatchUpdateOrdersStatus" size="small" class="filter-item">批量确认订单</el-button>
        </div>
      </div>
      <el-table stripe
                :key='tableKey1'
                :data="list2"
                size="mini"
                v-loading="listLoading"
                element-loading-text="给我一点时间"
                border
                fit
                highlight-current-row
                style="width: 100%">
        <el-table-column width="90px" align="center" label="状态">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.status | orderStatusFilter">{{scope.row.status|orderStatusTranslator}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="订单金额">
          <template slot-scope="scope">
            <span>￥{{scope.row.actual_pay}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="340px" align="center" label="商品">
          <template slot-scope="scope">
            <el-tag size="small" v-for="item in scope.row.orders_items">
              {{item.product_goods.goods_name}} x {{item.number}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column min-width="170px" align="center" label="收货人/电话">
          <template slot-scope="scope">
            <span>{{scope.row.orders_secondary_receiver_info.receive_name}}</span>/
            <span>{{scope.row.orders_secondary_receiver_info.phone}}</span>
          </template>
        </el-table-column>
        <el-table-column width="180" align="center" label="时间">
          <template slot-scope="scope">
            <span>{{scope.row.order_time}}</span>
          </template>
        </el-table-column>
        <el-table-column width="65" align="center" label="删除">
          <template slot-scope="scope">
            <i class="el-icon-remove" @click="delectSelect(scope.row)" style="color: red;font-size: 20px;cursor: pointer"></i>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="batchVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="batchUpdateconfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getProductList,
    deleteProduct,
    getProductDeliverList,
    getProductDeliverExtraList
  } from '@/api/product'
  import { getSecondaryShopOrdersList, updateSecondaryShopOrdersStatus, updateSecondaryShopOrdersItems } from '@/api/secondary_shop'
  import { getSupportGroupList } from '@/api/support_member'
  import { getSupportMemberList } from '@/api/support_member'
  import { getProductGoodsList } from '@/api/product_goods'
  // import { getSystemGlobalSettingInfo } from '@/api/system_global_setting'
  import {
    getOrdersCountInfo,
    getOrdersList,
    createOrders,
    updateOrders,
    createOrdersItem,
    updateOrdersItem,
    deleteOrdersItem,
    deleteOrdersRemark,
    createOrdersRemark,
    updateOrdersLogistics,
    getOrdersLogisticsTypeList,
    getOrdersPayTypeList,
    createOrdersPaymentItem,
    updateOrdersPaymentItem,
    deleteOrdersPaymentItem,
    getOrdersPayProofList,
    getOrdersSFLogisticsNumber,
    getOrdersYTOLogisticsNumber,
    getOrdersAreaList,
    checkOrders,
    deliverOrders,
    getWarehouseList,
    getOrdersItemList
  } from '@/api/orders'
  import { getProductWeixinList, getProductWeixinFansPivotList } from '@/api/product_weixin'
  import { getUserAccountGroupList } from '@/api/user_group'
  import {
    getProductWeixinFansAddressList,
    createProductWeixinFansAddress,
    updateProductWeixinFansAddress,
    deleteProductWeixinFansAddress
  } from '@/api/product_weixin_fans'
  import waves from '@/directive/waves' // 水波纹指令
  import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
  import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css
  // import { regionData, CodeToText } from 'element-china-area-data'
  import { getLodop } from '@/directive/lodop/LodopFuncs'
  import { mapGetters } from 'vuex'
  import bus from '@/views/layout/bus'
  import { parseTime } from '@/utils/index'

  export default {
    name: 'secondaryShopOrders',
    components: {
      Multiselect
    },
    directives: {
      waves
    },
    data() {
      const validatePhone = (rule, value, callback) => {
        const myreg = /^[1][1,2,3,4,5,6,7,8,9,0][0-9]{9}$/
        if (!myreg.test(this.innerTemp4.phone)) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      }
      const validate = (rule, value, callback) => {
        if (!value) {
          callback(new Error('输入'))
        }
        if (/^\d+(\.\d+)?$/.test(value)) {
          callback()
        } else {
          callback(new Error('输入数字'))
        }
      }
      return {
        show: true,
        scrollTop: 0,
        ifExpandAll: false,
        tableKey1: 0,
        tableKey2: 0,
        productListLoading: false,
        productListOptions: [],
        tableKey3: 1,
        selectArray: [],
        select_ids: [],
        selected_ids: [],
        list: [],
        list2: [],
        orders_items: [],
        ordersItemLoading: false,
        list1: null,
        total: null,
        total1: null,
        listLoading: true,
        chooseId: undefined,
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        tempactual_pay:{
          actual_pay: undefined
        },
        listQuery: {
          date_range: [
            parseTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), '{y}-{m}-{d}'),
            parseTime(new Date().getTime(), '{y}-{m}-{d}')
          ],
          page: 1,
          page_size: 20,
          weixin_fans_address_receive_name: '',
          weixin_fans_address_phone: '',
          sort: '-id',
          orders_unique_id: '',
          orders_logistics_number: '',
          secondary_shop_orders_id: '',
          support_member_nickname: '',
          support_user_account_group_id: '',
          support_user_account_id: undefined,
          product_weixin_id: '',
          product_id: undefined,
          orders_status: '',
          remark: ''
        },
        listQuery1: {
          date_range: '',
          page: 1,
          page_size: 5,
          product_weixin_id: undefined
        },
        props: {
          value: 'area_number',
          label: 'area_name',
          children: 'children'
        },
        dialogStatus: 'single',
        btnLoading: false,
        warehouseLoading: false,
        warehouseOptions:[],
        productDeliverExtraOptions: [],
        productDeliverExtraLoading: false,
        productDeliverLoading: false,
        productDeliverOptions: [],
        queryLogisticsTypeOptions: [],
        queryLogisticsTypeLoading: false,
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: [
          { key: 1, label: '未确认' },
          { key: 2, label: '待发货' },
          { key: 3, label: '发货中' },
          { key: 4, label: '断货中' },
          { key: 5, label: '已签收' },
          { key: 6, label: '已拒收' },
          { key: 7, label: '已完成' }
        ],
        showAuditor: false,
        productWeixinLoading2: false,
        productWeixinOptions2: [],
        pickerOptions1: {},
        expandList: [],
        userGroupOptions:[],
        userGroupTree: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        temp: {
          id: null,
          product_goods_id: null,
          number: 0
        },
        rules1: {
          product_goods_id: [{ required: true, message: '选择商品', trigger: 'change' }],
          number: [{ required: true, message: '商品数量', trigger: 'change' }]
        },
        innerList1: null,
        innerTotal1: null,
        innerTableKey1: 1,
        innerTableTitle1: '',
        innerListQuery1: {
          page: 1,
          page_size: 5,
          product_id: undefined,
          sort: '-id'
        },
        innerTemp1: {
          id: undefined,
          product_goods: {
            id:undefined
          },
          warehouse_id: undefined,
          number: ''
        },
        innerListLoading1: false,
        innerTableVisible1: false,
        batchVisible: false,
        innerDialogFormVisible1: false,
        innerRules4: {
          phone: [{ required: true, trigger: 'blur', validator: validatePhone }]
        },
        innerRules1: {
          number: [{ required: true, trigger: 'change', validator: validate }],
          product_goods: {
            id: [{ required: true, trigger: 'change', message: '选择产品' }]
          }
        },
        innerList2: null,
        innerTotal2: null,
        innerTableKey2: 2,
        innerTableTitle2: '',
        innerListQuery2: {
          page: 1,
          page_size: 5,
          product_id: undefined,
          sort: '-id'
        },
        innerTemp2: {
          id: undefined,
          product: undefined,
          number: ''
        },
        innerListLoading2: false,
        innerDialogFormVisible2: false,
        innerRules2: {
          remark: [{ required: true, message: '输入备注信息内容', trigger: 'change' }]
        },
        innerListLoading3: false,
        innerTableVisible3: false,
        innerTableTitle3: '',
        innerTableKey3: 3,
        innerList3: null,
        innerTotal3: null,
        innerListQuery3: {
          page: 1,
          page_size: 10,
          sort: '-id',
          orders_id: undefined
        },
        innerTemp3: {
          id: undefined,
          logistics_type_id: undefined,
          product_deliver_extra_id: undefined,
          logistics_name: '',
          logistics_number: '',
          product_deliver_id: undefined,
          dest_code: '',
          dest_extra_code: '',
          orders_logistics_type: {
            code: '',
            id: '',
            name: ''
          }
        },
        innerDialogFormVisible3: false,
        innerRules3: {
          template_name: [{ required: true, message: '请正确填写模板名称', trigger: 'change' }],
          template_code: [{ required: true, message: '请正确填写模板内容', trigger: 'change' }]
        },
        innerList4: null,
        innerTotal4: null,
        innerTableKey4: 4,
        innerTableTitle4: '',
        innerListQuery4: {
          page: 1,
          page_size: 5,
          product_id: undefined,
          sort: '-id'
        },
        innerTemp4: {
          id: undefined,
          product: undefined,
          receive_name: '',
          phone: '',
          province: '',
          province_name: '',
          city: '',
          city_name: '',
          district: '',
          district_name: '',
          regions: [],
          address: '',
          if_default: undefined,
          product_weixin_fans_address_id: undefined
        },
        innerListLoading4: false,
        innerTableVisible4: false,
        innerDialogFormVisible4: false,
        innerList5: null,
        innerTotal5: null,
        innerTableKey5: 5,
        innerTableTitle5: '',
        innerTemp5: {
          id: undefined,
          orders_pay_type: {
            type_name: undefined
          },
          orders_pay_type_id: undefined,
          paid_money: undefined,
          orders_pay_proof_id: undefined
        },
        innerListLoading5: false,
        innerTableVisible5: false,
        innerDialogFormVisible5: false,
        innerRules5: {
          orders_pay_type_id: [{ required: true, message: '选择方式', trigger: 'change' }],
          paid_money: [{ required: true, message: '输入金额或选择凭证', trigger: 'change' }]
        },
        productType: {
          1: '推广',
          2: '附属产品',
          3: '赠品'
        },
        productTypeOptions: [
          { key: 1, display_name: '推广' },
          { key: 2, display_name: '附属产品' },
          { key: 3, display_name: '赠品' }
        ],
        userGroupOptions: [],
        supportMemberOptions: [],
        productWeixinOptions: [],
        productWeixinFansOptions: [],
        productOptions: [],
        productGoodsOptions: [],
        logisticsTypeOptions: [],
        payTypeOptions: [],
        if_deleted: 'deleted-p',
        regionData: [],
        tempProductId: undefined,
        selectedRegionOptions: [],
        // CodeToText: CodeToText,
        publicImageUrl: '',
        imageDialogVisible: false,
        tableDialogVisible: false,
        payTypeLoading: false,
        payProofVisiable: false,
        payProofImageUrl: undefined,
        innerTablePayProofVisible: false,
        ordersPayProofList: [],
        paidMoneyEnabled: false,
        payTypeDisabled: true,
        actualPayEditable: false,
        stepStatus: 'create',
        today_orders: 0,
        need_delivery: 0,
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
        delivery_address: '',
        delivery_product_name: '',
        sf_monthly_account: '',
        tempPay: undefined,
      }
    },
    computed: {
      ...mapGetters([
        'user_account_id',
        'roles'
      ])
    },
    watch: {
      batchVisible(newValue) {
        if (!newValue) {
          this.getList()
          // this.$refs['secondaryTable'].clearSelection()
        }
      },
      list(newValue) {
        // this.selected_ids.forEach()
      }
    },
    filters: {
      statusUnit(status) {
        const statusTransMap = {
          0: '件',
          1: '斤',
          2: 'g'
        }
        return statusTransMap[status]
      },
      statusFilter(status) {
        const statusMap = {
          1: 'success',
          2: 'info',
          3: 'danger'
        }
        return statusMap[status]
      },
      statusTranslator(status) {
        const statusMap = {
          1: '推广',
          2: '附属产品',
          3: '赠品'
        }
        return statusMap[status]
      },
      orderStatusFilter(status) {
        const statusMap = {
          0: 'info',
          1: 'info',
          2: 'warning',
          3: '',
          4: '',
          5: '',
          6: 'danger',
          7: 'success',
          8: '',
          9: 'danger'
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
          9: '废弃'
        }
        return statusMap[status]
      },
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
      },
      userTypeStatusTranslator(status) {
        const statusMap = {
          1: '推广',
          2: '客服',
          3: '文案',
          4: '库管',
          5: '管理员'
        }
        return statusMap[status]
      },
      orderPhoneVisibleTranslator(phone) {
        // this.$store.state.user.roles
        if (phone) {
          return phone.substr(0, 3) + '****' + phone.substr(7)
        } else {
          return phone
        }
      }
    },
    created() {
      this.getList()
      this.getUserGroupTree()
      this.getProductWeixinList(' ')
      this.queryOrderPayTypeList(' ')
      this.getOrdersCountInfo()
      this.getWarehouseList()
      // this.getSystemDeliveryAddress()
      // this.getSystemDeliveryProductName()
      // this.getSystemSfMonthlyAccount()
      this.getregionData()
    },
    methods: {
      selecdisabled(row) {
        if (row.status !== 1) {
          return false
        }
        return true
      },
      selectTablechange(selection) {
        console.log('检测', selection)
        this.list2 = selection
        this.select_ids = selection.map(item => {
          return item.secondary_id
        })
      },
      editactualPay(val) {
        this.tempactual_pay.actual_pay = val
        this.actualPayEditable = true
      },
      getUserGroupTree() {
        getSupportGroupList().then(response => {
          this.userGroupTree = this.formatUserGroupTree(response.data)
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
        console.log(row)
        this.innerTableTitle1 = row.orders_unique_id.slice(-8) + ' 商品列表'
        this.temp.secondary_id = row.secondary_id
        if (row.orders_items) {
          this.productGoodsOptions = [
            {
              id: row.orders_items[0].product_goods_id,
              label: row.orders_items[0].product_goods.goods_name,
            }
          ]
          this.temp.number = row.orders_items[0].number
          this.temp.product_goods_id = row.orders_items[0].product_goods_id
        } else {
          this.temp.product_goods_id = undefined
          this.temp.number = undefined
        }
        this.dialogStatus = 'single'
        this.innerTableVisible1 = true
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      updateSecondary() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            updateSecondaryShopOrdersItems(this.temp).then(() => {
              this.getList()
              this.innerTableVisible1 = false
              this.$notify({
                title: '成功',
                message: '商品添加成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdateOrdersStatus({secondary_id}, status) {
        updateSecondaryShopOrdersStatus({
          secondary_id,
          status
        }).then(() => {
          this.getList()
          this.$message.success('确认订单成功')
        })
      },
      resetTemp() {
        this.temp = {
          id: null,
          product_goods_id: null,
          number: 0
        }
      },
      handleBatch() {
        this.batchVisible = true
      },
      batchUpdateconfirm() {
        this.getList()
        this.$refs['secondaryTable'].clearSelection()
        this.batchVisible = false
      },
      handleBatchSettingsProduct() {
        this.productGoodsOptions = []
        this.temp.product_goods_id = undefined
        this.temp.number = undefined
        this.innerTableTitle1 = '批量设置商品'
        this.innerTableVisible1 = true
        this.dialogStatus = 'batch'
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      handleBatchUpdateOrdersStatus() {
        this.$confirm('批量确认订单后不可修改商品,是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          for (const secondary_id of this.select_ids) {
            updateSecondaryShopOrdersStatus({
              secondary_id,
              status: 2
            }).then(() => {
              this.list2[this.select_ids.indexOf(secondary_id)].status = 2
            }).catch(rej => {
              console.log(rej)
            })
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
      },
      delectSelect(row){
        console.log(row)
        const { id } = row
        const item = this.list.find(item => {
          return item.id === id
        })
        const index = this.list2.findIndex(item => {
          return item.id === id
        })
        console.log(!!item)
        if (item) {
          this.$nextTick(() => {
            this.$refs['secondaryTable'].toggleRowSelection(item,false)
          })
        } else {
          this.list2.splice(index,1)
          this.select_ids.splice(index,1)
        }
      },
      batchSettingsProduct() {
        this.$refs['innerDataForm1'].validate( valid => {
          if (valid) {
            this.innerTableVisible1 = false;
            (async () => {
              for (const secondary_id of this.select_ids) {
                const params = {
                  secondary_id,
                  product_goods_id: this.temp.product_goods_id,
                  number: this.temp.number
                }
                await updateSecondaryShopOrdersItems(params).then(res => {
                  this.list2[this.select_ids.indexOf(secondary_id)].orders_items = res.data.orders_items
                }).catch(rej => {
                  console.log(rej)
                })
              }
            })().then(() => {
              this.$message.success('设置成功')
            })
          }
        })
      },
      handleFilterGrounp(val) {
        this.listQuery.support_user_account_group_id = val[val.length - 1]
        this.handleFilter()
      },
      getregionData() {
        getOrdersAreaList().then(response => {
          this.regionData = response.data
        })
      },
      getProductDeliverExtraList(query) {
        if (query !== '') {
          this.productDeliverExtraLoading = true
          getProductDeliverExtraList({
            order_logistics_type_id: this.logisticsTypeOptions[this.logisticsTypeOptions.findIndex(d => d.code === this.innerTemp3.orders_logistics_type.code)].id,
            product_deliver_id: this.innerTemp3.product_deliver_id,
            description: query
          }).then(response => {
            this.productDeliverExtraOptions = response.data.data
            this.productDeliverExtraLoading = false
          })
        }
      },
      getProductDeliverList(query) {
        if (query !== '') {
          this.productDeliverLoading = true
          getProductDeliverList({ product_id: this.tempProductId, name: query }).then(response => {
            this.productDeliverOptions = response.data.data
            this.productDeliverLoading = false
          })
        }
      },
      // getSystemDeliveryAddress() {
      //   getSystemGlobalSettingInfo({ key_name: 'delivery_address' }).then(response => {
      //     this.delivery_address = response.data.key_value
      //   })
      // },
      // getSystemDeliveryProductName() {
      //   getSystemGlobalSettingInfo({ key_name: 'delivery_product_name' }).then(response => {
      //     this.delivery_product_name = response.data.key_value
      //   })
      // },
      // getSystemSfMonthlyAccount() {
      //   getSystemGlobalSettingInfo({ key_name: 'sf_monthly_account' }).then(response => {
      //     this.sf_monthly_account = response.data.key_value
      //   })
      // },
      refreshOrdersList() {
        this.getOrdersCountInfo()
        this.getList()
      },
      getOrdersCountInfo() {
        getOrdersCountInfo({}).then(response => {
          this.today_orders = response.data.today_orders
          this.need_delivery = response.data.need_delivery
        })
      },
      resetLogisticsNumber2() {
        if (this.innerTemp3.orders_logistics_type.code === '1001') {
          this.$confirm('选择顺丰快递将不可以修改订单内容， 确定选择？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            const tempdata = {}
            tempdata.orders_id = this.temp.id
            // tempdata.product_deliver_id = this.innerTemp3.product_deliver_id
            tempdata.product_warehouse_extra_id = this.innerTemp3.product_deliver_extra_id
            // tempdata.province_name = this.temp.product_weixin_fans_address.province_name
            // tempdata.city_name = this.temp.product_weixin_fans_address.city_name
            // tempdata.district_name = this.temp.product_weixin_fans_address.district_name
            tempdata.address = this.temp.product_weixin_fans_address.province_name + this.temp.product_weixin_fans_address.city_name + this.temp.product_weixin_fans_address.district_name + this.temp.product_weixin_fans_address.address
            getOrdersSFLogisticsNumber(tempdata).then(response => {
              this.innerTemp3.logistics_number = response.data.logistics_number
              this.innerTemp3.dest_code = response.data.dest_code
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            })
          })
        } else if (this.innerTemp3.orders_logistics_type.code === '1006') {
          this.$confirm('选择圆通将不可以修改订单内容， 确定选择？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            const tempdata = {}
            tempdata.orders_id = this.temp.id
            // tempdata.product_deliver_id = this.innerTemp3.product_deliver_id
            tempdata.product_warehouse_extra_id = this.innerTemp3.product_deliver_extra_id
            // tempdata.province = this.temp.product_weixin_fans_address.province_name
            // tempdata.city = this.temp.product_weixin_fans_address.city_name
            let tempCity = this.temp.product_weixin_fans_address.city_name
            if ((tempCity === undefined) || (tempCity === null)) {
              tempCity = ''
            }
            let tempDistrict = this.temp.product_weixin_fans_address.district_name
            if ((tempDistrict === undefined) || (tempDistrict === null)) {
              tempDistrict = ''
            }
            tempdata.address = this.temp.product_weixin_fans_address.province_name + tempCity + tempDistrict + this.temp.product_weixin_fans_address.address
            getOrdersYTOLogisticsNumber(tempdata).then(response => {
              this.innerTemp3.logistics_number = response.data.logistics_number
              this.innerTemp3.dest_code = response.data.dest_code
              this.innerTemp3.dest_extra_code = response.data.dest_extra_code
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            })
          })
        }
      },
      resetLogisticsNumber() {
        this.productDeliverExtraOptions = []
        this.innerTemp3.logistics_number = ''
        this.innerTemp3.dest_code = undefined
        this.innerTemp3.product_deliver_extra_id = undefined
      },
      resetLogisticsNumber3() {
        this.productDeliverOptions = []
        this.productDeliverExtraOptions = []
        this.logisticsTypeOptions = []
        this.innerTemp3.logistics_number = ''
        this.innerTemp3.dest_code = undefined
        this.innerTemp3.product_deliver_extra_id = undefined
        this.innerTemp3.orders_logistics_type = ''
      },
      printOrdersa() {
        const basicUrl = process.env.BASE_API + '/api/orders/downloadNeedCheckOrder' + '?token=' + this.$store.state.user.token
        const form = document.createElement('form')
        form.action = basicUrl
        form.method = 'post'
        form.style.display = 'none'
        const button = document.createElement('input')
        button.type = 'submit'
        form.appendChild(button)
        document.body.appendChild(form)
        form.submit()
        document.body.removeChild(form)
        // downloadNeedCheckOrder().then()
      },
      handleChangePayType(value) {
        if (value !== 1 && value !== 2) {
          this.payProofVisiable = true
          this.paidMoneyEnabled = true
        } else {
          this.payProofVisiable = false
          this.paidMoneyEnabled = false
        }
        this.innerTemp5.paid_money = undefined
        this.payProofImageUrl = undefined
        this.innerTemp5.orders_pay_proof_id = undefined
      },
      queryOrderPayTypeList(query) {
        if (query !== '') {
          this.payTypeLoading = true
          getOrdersPayTypeList({ type_name: query }).then(response => {
            this.payTypeOptions = response.data
            this.payTypeLoading = false
          })
        }
      },
      getProductWeixinList(query) {
        if (query !== '') {
          this.productWeixinLoading2 = true
          getProductWeixinList({ info: query }).then(response => {
            this.productWeixinOptions2 = response.data.data
            this.productWeixinLoading2 = false
          })
        }
      },
      handleAddressRowClick(row, column, cell, event) {
        if (cell.cellIndex === 3) {
          this.temp.product_weixin_fans_address_id = row.id
        }
        this.innerTemp4 = Object.assign({}, row) // copy obj
      },
      handleRegionChange(value) {
      },
      tableRowClassName({ row, rowIndex }) {
        return 'colored-row'
      },
      querySupportMemberList(query) {
        getSupportMemberList({ nickname: query, user_account_type_code: 'support', status: '1' }).then(response => {
          if (!response.data.data) return
          this.supportMemberOptions = response.data.data
        })
      },
      queryProductWeixinList(query) {
        if (!this.temp.support_member.id) {
          return
        }
        const tempData = {}
        tempData.weixin_account = query
        if ((this.$store.state.user.roles === 'administrator') || (this.$store.state.user.roles === 'supportDirector') || (this.$store.state.user.roles === 'supportManager')) {
          // alert(this.$store.state.user.roles)
        } else {
          tempData.support_user_account_id = this.temp.support_member.id
        }
        getProductWeixinList(tempData).then(response => {
          if (!response.data.data) return
          this.productWeixinOptions = response.data.data
          for (const v of this.productWeixinOptions) {
            v.weixin_account = v.weixin_account + '  (' + v.info + ')'
            const index = this.productWeixinOptions.indexOf(v)
            this.productWeixinOptions.splice(index, 1, v)
          }
        })
      },
      getProductList(query) {
        if (query !== '') {
          this.productListLoading = true
          getProductList({ product_name: query, is_promote: 1 }).then(response => {
            this.productListOptions = response.data.data
            this.productListLoading = false
          })
        }
      },
      getWarehouseList() {
        this.warehouseLoading = true
        getWarehouseList().then(response => {
          this.warehouseOptions = response.data.data
          this.warehouseLoading = false
        })
      },
      queryProductWeixinFansList(query) {
        if (!this.temp.product_weixin.id) {
          return
        }
        getProductWeixinFansPivotList({
          fans_weixin_account: query,
          product_weixin_id: this.temp.product_weixin.id
        }).then(response => {
          if (!response.data.data) return
          this.productWeixinFansOptions = response.data.data
        })
      },
      queryProductList(query) {
        getProductList({ product_name: query }).then(response => {
          if (!response.data.data) return
          this.productOptions = response.data.data
        })
      },
      queryProductGoodsList(query) {
        getProductGoodsList({ goods_name: query, page_size: 20,is_sale: 1 }).then(response => {
          this.productGoodsOptions = response.data.data.map(item => {
            return {
              id: item.id,
              label: item.goods_name,
            }
          })
        })
      },
      queryLogisticsTypeList(query) {
        if (this.innerTemp3.product_deliver_id === undefined || this.innerTemp3.product_deliver_id === '') {
          this.$message.error('先选择仓库')
          return
        }
        if (query !== '') {
          this.queryLogisticsTypeLoading = true
          getOrdersLogisticsTypeList({
            logistics_name: query,
            product_deliver_id: this.innerTemp3.product_deliver_id
          }).then(response => {
            this.logisticsTypeOptions = response.data.data
            this.queryLogisticsTypeLoading = false
          })
        }
      },
      resetSupportMember() {
        this.temp.product_weixin_id = undefined
        this.productWeixinOptions = []
        this.temp.product_weixin = {
          id: undefined,
          product_id: undefined,
          promotion_user_account_id: undefined,
          support_user_account_id: undefined,
          promotion_channel_id: undefined,
          weixin_nickname: '',
          weixin_account: '',
          phone: '',
          qq: '',
          promotion_channel: {
            id: undefined,
            channel_name: ''
          },
          product: {
            id: undefined,
            product_name: '',
            price: undefined,
            stock: undefined,
            is_promote: undefined
          }
        }
        this.resetProductWeixin()
      },
      resetProductWeixin() {
        this.temp.product_weixin_fans_id = undefined
        this.productWeixinFansOptions = []
        this.temp.product_weixin_fans = {
          id: undefined,
          product_weixin_id: undefined,
          weixin_account: '',
          weixin_nickname: '',
          created_at: ''
        }
        this.resetProductWeixinFans()
      },
      resetProductWeixinFans() {
        this.temp.product_weixin_fans_address_id = undefined
        this.temp.product_weixin_fans_address = {
          id: undefined,
          product_weixin_fans_id: undefined,
          receive_name: '',
          phone: '',
          postcode: '',
          address: '',
          remark: ''
        }
      },
      getList() {
        this.listLoading = true
        getSecondaryShopOrdersList(this.listQuery).then(response => {
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
      handleCreate() {
        this.resetTemp()
        this.stepStatus = 'create'
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm1'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm1'].validate((valid) => {
          if (valid) {
            this.btnLoading = true
            this.temp.support_user_account_id = this.temp.support_member.id
            this.temp.product_weixin_id = this.temp.product_weixin.id
            this.temp.product_weixin_fans_id = this.temp.product_weixin_fans.product_weixin_fans_id
            this.temp.warehouse_id = this.temp.warehouse_id
            createOrders(this.temp).then(response => {
              this.btnLoading = false
              this.temp = response.data
              this.getList()
              this.dialogFormVisible = false
            }).catch(() => {
              this.btnLoading = false
            })
          }
        })
      },
      updateData() {
        this.$refs['dataForm1'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            tempData.orders_id = this.temp.id
            tempData.support_user_account_id = this.temp.support_member.id
            tempData.product_weixin_id = this.temp.product_weixin.id
            tempData.product_weixin_fans_id = this.temp.product_weixin_fans.product_weixin_fans_id
            updateOrders(tempData).then(() => {
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
      handleCashOnDeliveryPaidMoney() {
        let totalPayMoney = 0.00
        console.log(this.temp.orders_payment.orders_payment_items)
        for (const v of this.temp.orders_payment.orders_payment_items) {
          if (v.orders_pay_type.type_code !== 'cash_on_delivery' && (v.status !== 2)) {
            totalPayMoney += parseFloat(v.paid_money)
          }
        }
        let cashOnDeliveryPaidMoney = this.temp.actual_pay - totalPayMoney
        cashOnDeliveryPaidMoney = (cashOnDeliveryPaidMoney > 0) ? cashOnDeliveryPaidMoney : 0.00
        for (const v of this.temp.orders_payment.orders_payment_items) {
          if (v.orders_pay_type.type_code === 'cash_on_delivery') {
            v.paid_money = cashOnDeliveryPaidMoney
            const index = this.temp.orders_payment.orders_payment_items.indexOf(v)
            this.temp.orders_payment.orders_payment_items.splice(index, 1, v)
          }
        }
      },
      updateActualPayData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.temp.actual_pay = this.tempactual_pay.actual_pay
            const tempData = Object.assign({}, this.temp)
            tempData.orders_id = this.temp.id
            tempData.actual_pay = this.temp.actual_pay
            updateOrders(tempData).then(() => {
              this.handleCashOnDeliveryPaidMoney()
              this.getList()
              bus.$emit('upDateRealTimeRanking')
              this.actualPayEditable = false
            })
          }
        })
      },
      handleDelete(row) {
        this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const ttempData = {
            product_id: row.id
          }
          deleteProduct(ttempData).then(response => {
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

      getOrdersItemList() {
        this.ordersItemLoading = true
        getOrdersItemList({ orders_id: this.temp.id }).then(res => {
          this.orders_items = res.data.data
          this.ordersItemLoading = false
          this.innerTableKey1++
        })
      },
      handleInnerCreate1() {
        console.log(this.temp)
        this.dialogStatus = 'create'
        this.innerDialogFormVisible1 = true
        this.innerTemp1.product_id = this.temp.id
        this.innerTemp1.warehouse_id = this.temp.warehouse_id
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      createInnerData1() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            this.btnLoading = true
            this.innerTemp1.product_goods_id = this.innerTemp1.product_goods.id
            // this.innerTemp1.product_goods_storage_id = this.innerTemp1.product_common.id
            this.innerTemp1.orders_id = this.temp.id
            createOrdersItem(this.innerTemp1).then(res => {
              this.getOrdersItemList()
              this.getList()
              this.innerDialogFormVisible1 = false
              this.btnLoading = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            }).catch(() => {
              this.btnLoading = false
            })
          }
        })
      },
      handleInnerUpdate1(row) {
        this.innerTemp1 = Object.assign({}, row) // copy obj
        this.productGoodsOptions = []
        this.productGoodsOptions.push(row.product_goods)
        this.dialogStatus = 'update'
        this.innerDialogFormVisible1 = true
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      // 修改订单商品
      updateInnerData1() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            this.btnLoading = true
            const params = Object.assign({}, this.innerTemp1)
            params.orders_item_id = this.innerTemp1.id
            params.product_goods_id = this.innerTemp1.product_goods.id
            updateOrdersItem(params).then(() => {
              this.getOrdersItemList()
              this.getList()
              this.innerDialogFormVisible1 = false
              this.btnLoading = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            }).catch(() => {
              this.btnLoading = false
            })
          }
        })
      },
      handleInnerDelete1(row) {
        this.$confirm('确定删除订单商品?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteOrdersItem({ orders_item_id: row.id }).then(res => {
            this.$message.success('删除成功')
            this.getOrdersItemList()
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      resetInnerTemp2() {
        this.innerTemp2 = {}
      },
      handleInnerCreate2() {
        this.resetInnerTemp2()
        this.dialogStatus = 'create'
        this.innerDialogFormVisible2 = true
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      createInnerData2() {
        this.$refs['innerDataForm2'].validate((valid) => {
          if (valid) {
            this.btnLoading = true
            this.innerTemp2.orders_id = this.temp.id
            createOrdersRemark(this.innerTemp2).then(response => {
              this.innerTotal2++
              this.innerTemp2.id = response.data.id
              this.innerTemp2.user_account_id = response.data.user_account_id
              this.innerTemp2.status = 1
              this.innerTemp2.user_account_type_id = response.data.user_account_type_id
              this.innerTemp2.updated_at = response.data.updated_at
              this.temp.orders_remarks.push(this.innerTemp2)
              this.innerDialogFormVisible2 = false
              this.btnLoading = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            }).catch(() => {
              this.btnLoading = false
            })
          }
        })
      },
      handleInnerDelete2(row) {
        this.$confirm('确定删除此备注?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const ttempData = Object.assign({}, row) // copy obj
          ttempData.orders_remark_id = row.id
          deleteOrdersRemark(ttempData).then(response => {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            ttempData.status = 0
            const index = this.temp.orders_remarks.indexOf(row)
            this.temp.orders_remarks.splice(index, 1, ttempData)
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      resetInnerTemp3() {
        this.innerTemp3 = {
          id: undefined,
          logistics_type_id: undefined,
          product_deliver_extra_id: undefined,
          product_deliver_id: undefined,
          logistics_name: '',
          logistics_number: '',
          orders_logistics_type: {
            id: undefined,
            name: '',
            code: '',
            status: undefined
          }
        }
      },
      handleInnerUpdate3(row) {
        this.logisticsTypeOptions = []
        this.tempProductId = row.product_id
        this.temp = Object.assign({}, row)
        this.dialogStatus = 'update'
        this.innerDialogFormVisible3 = true
        if (row.orders_logistics.id !== 0) {
          this.logisticsTypeOptions.push({
            id: row.orders_logistics.orders_logistics_type.id,
            name: row.orders_logistics.orders_logistics_type.name,
            code: row.orders_logistics.orders_logistics_type.code
          })
          if (row.orders_logistics.product_deliver_extra_id !== null) {
            this.productDeliverExtraOptions = [{
              id: row.orders_logistics.product_deliver_extra.id,
              description: row.orders_logistics.product_deliver_extra.description
            }]
          }
          this.productDeliverOptions = [{
            id: row.orders_logistics.product_deliver.id,
            name: row.orders_logistics.product_deliver.name
          }]
          this.innerTemp3 = Object.assign({}, row.orders_logistics)
        } else {
          this.resetInnerTemp3()
          this.productDeliverOptions = []
          this.logisticsTypeOptions = []
          this.innerTemp3.orders_logistics_type = ''
        }
        this.$nextTick(() => {
          this.$refs['innerDataForm3'].clearValidate()
        })
      },
      createInnerData3() {
        this.$refs['innerDataForm3'].validate((valid) => {
          if (valid) {
            const tempData = this.innerTemp3
            tempData.orders_id = this.temp.id
            tempData.logistics_type_id = this.innerTemp3.orders_logistics_type.id
            updateOrdersLogistics(tempData).then(response => {
              this.temp.orders_logistics = tempData
              this.innerDialogFormVisible3 = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              const index = this.list.findIndex(d => d.id === this.temp.id)
              this.list[index].orders_logistics = response.data
            })
          }
        })
      },
      handleOpenInner4() {
        this.stepStatus = 'create'
        this.innerTableVisible4 = true
        this.innerTableVisible1 = false
        this.dialogStatus = 'create'
        this.innerTableTitle4 = this.temp.orders_unique_id.slice(-8) + ' -- 编辑收货地址'
        this.getInnerList4()
      },
      handleOpenAnotherInner4(row) {
        this.stepStatus = 'update'
        this.innerTableVisible4 = true
        this.dialogStatus = 'update'
        this.innerTableTitle4 = row.orders_unique_id.slice(-8) + ' -- 编辑收货地址'
        this.temp = Object.assign({}, row) // copy obj
        // this.chooseId = this.temp.product_weixin_fans_address_id
        // this.temp.product_weixin_fans_address_id = this.innerTemp4.product_weixin_fans_address_id
        this.getInnerList4()
      },
      getInnerList4() {
        this.innerListQuery4.product_id = this.temp.id
        this.innerTemp4.product_weixin_fans_id = this.temp.id
        this.innerTemp4.product_weixin_fans_address_id = this.temp.product_weixin_fans_address_id
        const tempdata = {}
        tempdata.product_weixin_fans_id = this.temp.product_weixin_fans_id
        this.innerListLoading4 = true
        getProductWeixinFansAddressList(tempdata).then(response => {
          this.innerList4 = response.data.data
          this.innerTotal4 = response.data.total
          this.innerListLoading4 = false
        })
      },
      handleInnerFilter4() {
        this.innerListQuery4.page = 1
        this.getInnerList4()
      },
      handleInnerSizeChange4(val) {
        this.innerListQuery4.page_size = val
        this.getInnerList4()
      },
      handleInnerCurrentChange4(val) {
        this.innerListQuery4.page = val
        this.getInnerList4()
      },
      resetInnerTemp4() {
        this.innerTemp4 = {
          id: undefined,
          product: undefined,
          receive_name: '',
          phone: '',
          province: '',
          province_name: '',
          city: '',
          city_name: '',
          district: '',
          district_name: '',
          regions: [],
          address: '',
          if_default: undefined,
          product_weixin_fans_address_id: undefined
        }
      },
      handleInnerCreate4() {
        this.resetInnerTemp4()
        this.dialogStatus = 'create'
        this.innerDialogFormVisible4 = true
        this.innerTemp4.product_weixin_fans_id = this.temp.product_weixin_fans_id
        this.$nextTick(() => {
          this.$refs['innerDataForm4'].clearValidate()
        })
      },
      createInnerData4() {
        this.$refs['innerDataForm4'].validate((valid) => {
          if (valid) {
            this.innerTemp4.orders_id = this.temp.id
            this.innerTemp4.province = this.innerTemp4.regions[0]
            this.innerTemp4.city = this.innerTemp4.regions[1]
            this.innerTemp4.district = this.innerTemp4.regions[2]
            createProductWeixinFansAddress(this.innerTemp4).then(response => {
              if (this.innerTemp4.if_default) {
                this.temp.product_weixin_fans.default_address_id = response.data.id
              }
              this.innerTemp4.id = response.data.id
              this.innerTemp4.updated_at = response.data.updated_at
              this.getInnerList4()
              this.innerDialogFormVisible4 = false
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
      handleInnerUpdate4(row) {
        this.innerTemp4 = Object.assign({regions: []}, row) // copy obj
        this.innerTemp4.regions = [parseInt(row.province),parseInt(row.city),parseInt(row.district)]
        this.dialogStatus = 'update'
        this.innerDialogFormVisible4 = true
        this.innerTemp4.product_weixin_fans_id = this.temp.product_weixin_fans_id
        this.innerTemp4.if_default = (this.temp.product_weixin_fans.default_address_id === this.innerTemp4.id)
        this.$nextTick(() => {
          this.$refs['innerDataForm4'].clearValidate()
        })
      },
      updateInnerData4() {
        this.$refs['innerDataForm4'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.innerTemp4)
            tempData.province = this.innerTemp4.regions[0]
            tempData.city = this.innerTemp4.regions[1]
            tempData.district = this.innerTemp4.regions[2]
            tempData.product_weixin_fans_address_id = this.innerTemp4.id
            updateProductWeixinFansAddress(tempData).then(response => {
              if (this.innerTemp4.if_default) {
                this.temp.product_weixin_fans.default_address_id = this.innerTemp4.id
              }
              this.getInnerList4()
              this.innerDialogFormVisible4 = false
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
      handleInnerDelete4(row) {
        this.$confirm('确定删除收货地址?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // if (this.temp.product_weixin_fans_address_id === row.id) {
          //   this.$message({
          //     type: 'warning',
          //     message: '不能删除已选中的收货地址'
          //   })
          //   return
          // }
          const ttempData = {
            product_weixin_fans_address_id: row.id,
            product_weixin_fans_id: row.product_weixin_fans_id
          }
          deleteProductWeixinFansAddress(ttempData).then(response => {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            const index = this.innerList4.indexOf(row)
            this.innerList4.splice(index, 1)
            this.innerTotal4--
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 打开关闭行
      expandRow(row, expandedRows) {
        this.expandList = expandedRows.map(item => {
          return item.id
        })
        console.log(this.expandList)
      },
      updateOrderAddress() {
        let tempAddressInfo = null
        for (const v of this.innerList4) {
          if (v.id === this.temp.product_weixin_fans_address_id) {
            const index = this.innerList4.indexOf(v)
            tempAddressInfo = this.innerList4[index]
          }
        }
        if (tempAddressInfo === null) {
          this.$message({
            type: 'error',
            message: '添加并选择地址信息'
          })
          return false
        }
        const tempData = {}
        tempData.product_weixin_fans_address_id = tempAddressInfo.id
        tempData.orders_id = this.temp.id
        updateOrders(tempData).then(() => {
          this.getList()
          this.innerTableVisible4 = false
        })
      },
      updateOrderAddressCreate() {
        const tempData = {}
        tempData.product_weixin_fans_address_id = this.temp.product_weixin_fans_address_id
        tempData.orders_id = this.temp.id
        updateOrders(tempData).then(response => {
          for (const v of this.list) {
            if (v.id === response.data.id) {
              const index = this.list.indexOf(v)
              this.list[index].product_weixin_fans_address_id = response.data.product_weixin_fans_address_id
            }
          }
          // for (const v in this.list) {
          //   if (this.list[v].id === response.data.id) {
          //     this.list[v].product_weixin_fans_address_id = response.data.product_weixin_fans_address_id
          //     this.list[v].product_weixin_fans_address.province_name = this.innerTemp4.province_name
          //     this.list[v].product_weixin_fans_address.city_name = this.innerTemp4.city_name
          //     this.list[v].product_weixin_fans_address.district_name = this.innerTemp4.district_name
          //   }
          // }
          let tempAddressInfo = null
          for (const v of this.innerList4) {
            if (v.id === this.temp.product_weixin_fans_address_id) {
              const index = this.innerList4.indexOf(v)
              tempAddressInfo = this.innerList4[index]
            }
          }
          if (tempAddressInfo === null) {
            this.$message({
              type: 'error',
              message: '请先选择地址信息'
            })
            return
          }
          this.temp.product_weixin_fans_address_id = tempAddressInfo.product_weixin_fans_address_id
          this.temp.product_weixin_fans_address.id = tempAddressInfo.id
          this.temp.product_weixin_fans_address.receive_name = tempAddressInfo.receive_name
          this.temp.product_weixin_fans_address.phone = tempAddressInfo.phone
          this.temp.product_weixin_fans_address.address = tempAddressInfo.address
          this.temp.product_weixin_fans_address.province_name = tempAddressInfo.province_name
          this.temp.product_weixin_fans_address.city_name = tempAddressInfo.city_name
          this.temp.product_weixin_fans_address.district_name = tempAddressInfo.district_name
          this.innerTableVisible4 = false
          this.innerTableVisible5 = true
          this.stepStatus = 'create'
        })
      },
      // handleOpenInner5(row) {
      //   this.dialogStatus = 'create'
      //   this.innerTableTitle5 = row.orders_unique_id + ' -- 编辑收款信息'
      //   this.temp = JSON.parse(JSON.stringify(row)) // copy obj
      //   this.innerTableVisible5 = true
      // },
      handleOpenPayProof() {
        this.innerTablePayProofVisible = true
        this.ordersPayProofList = []
        getOrdersPayProofList({ is_used: 0, pay_type_id: this.innerTemp5.orders_pay_type_id }).then(response => {
          this.ordersPayProofList = response.data.data
        })
      },
      handleSelectPayProof(row) {
        this.innerTemp5.paid_money = row.paid_money
        this.payProofImageUrl = row.image_url
        this.innerTemp5.orders_pay_proof_id = row.id
        this.innerTablePayProofVisible = false
      },
      createInnerData5() {
        this.$refs['innerDataForm5'].validate((valid) => {
          if (valid) {
            this.btnLoading = true
            createOrdersPaymentItem(this.innerTemp5).then(response => {
              this.innerDialogFormVisible5 = false
              this.innerTotal5++
              this.innerTemp5.id = response.data.id
              this.innerTemp5.status = response.data.status
              this.innerTemp5.orders_pay_type_id = response.data.pay_type_id
              this.innerTemp5.orders_pay_proof = response.data.orders_pay_proof
              this.innerTemp5.updated_at = response.data.updated_at
              this.innerTemp5.orders_pay_type.type_name = response.data.orders_pay_type.type_name
              this.temp.orders_payment.orders_payment_items.push(this.innerTemp5)
              this.handleCashOnDeliveryPaidMoney()
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.btnLoading = false
            }).catch(() => {
              this.btnLoading = false
            })
          }
        })
      },
      handleInnerUpdate5(row) {
        this.innerTemp5 = Object.assign({}, row) // copy obj
        this.payTypeDisabled = true
        this.dialogStatus = 'update'
        this.innerDialogFormVisible5 = true
        this.innerTemp5.orders_payment_id = this.temp.orders_payment.id
        this.innerTemp5.orders_pay_type_id = row.orders_pay_type.id
        this.innerTemp5.orders_payment_item_id = row.id
        this.$nextTick(() => {
          this.$refs['innerDataForm5'].clearValidate()
        })
      },
      updateInnerData5() {
        this.$refs['innerDataForm5'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.innerTemp5)
            updateOrdersPaymentItem(tempData).then(response => {
              this.innerTemp5.updated_at = response.data.updated_at
              for (const v of this.temp.orders_payment.orders_payment_items) {
                if (v.id === this.innerTemp5.id) {
                  const index = this.temp.orders_payment.orders_payment_items.indexOf(v)
                  this.temp.orders_payment.orders_payment_items.splice(index, 1, this.innerTemp5)
                  break
                }
              }
              this.handleCashOnDeliveryPaidMoney()
              this.innerDialogFormVisible5 = false
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
      handleInnerDelete5(row) {
        this.$confirm('确定删除收款信息?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          row.status = 2
          const tempData = { orders_payment_item_id: row.id }
          deleteOrdersPaymentItem(tempData).then(response => {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            const index = this.temp.orders_payment.orders_payment_items.indexOf(row)
            this.temp.orders_payment.orders_payment_items.splice(index, 1, row)
            this.handleCashOnDeliveryPaidMoney()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      handleOpenImage(imageUrl) {
        this.publicImageUrl = imageUrl
        this.imageDialogVisible = true
      },
      checkPre(row) {
        console.log(row)
        this.tableDialogVisible = true
        this.listQuery1.product_weixin_fans_id = row.product_weixin_fans_id
        this.getList2()
      },
      getList2() {
        this.listLoading = true
        getOrdersList(this.listQuery1).then(response => {
          this.list1 = response.data.data
          this.total1 = response.data.total
          this.listLoading = false
        })
      },
      downExcel() {
        // console.log(this.listQuery.date_range)
        const form = document.createElement('form')
        form.action = process.env.BASE_API + '/api/secondary_shop/downloadSecondaryShopOrders' + '?token=' + this.$store.state.user.token
        form.method = 'post'
        form.style.display = 'none'
        const orders_status = document.createElement('input')
        // 订单状态
        const orders_unique_id = document.createElement('input')
        // 订单号
        const orders_logistics_number = document.createElement('input')
        // 物流单号
        const group_name = document.createElement('input')
        const secondary_shop_orders_id = document.createElement('input')
        // 客服部门
        const nickname = document.createElement('input')
        // 客服
        const product_weixin_id = document.createElement('input')
        // 搜索微信号
        const product_name = document.createElement('input') // 产品名称
        const receive_name = document.createElement('input')
        // 收件人姓名
        const receive_phone = document.createElement('input')
        // 收件人电话
        const remark = document.createElement('input')
        // 备注
        if (this.listQuery.date_range !== null && this.listQuery.date_range !== undefined && this.listQuery.date_range !== '') {
          const date_range = document.createElement('input')
          const date_range2 = document.createElement('input')
          date_range.name = 'date_range[0]'
          date_range.value = this.listQuery.date_range[0]
          date_range2.name = 'date_range[1]'
          date_range2.value = this.listQuery.date_range[1]
          form.appendChild(date_range)
          form.appendChild(date_range2)
        } else {
          const date_range = document.createElement('input')
          const date_range2 = document.createElement('input')
          date_range.name = 'date_range[0]'
          date_range.value = parseTime(new Date(), '{y}-{m}-{d}')
          date_range2.name = 'date_range[1]'
          date_range2.value = parseTime(new Date(), '{y}-{m}-{d}')
          form.appendChild(date_range)
          form.appendChild(date_range2)
          // console.log(parseTime(new Date(), '{y}-{m}-{d}'))
        }
        orders_status.name = 'orders_status'
        orders_status.value = this.listQuery.orders_status
        orders_unique_id.name = 'orders_unique_id'
        orders_unique_id.value = this.listQuery.orders_unique_id
        orders_logistics_number.name = 'orders_logistics_number'
        orders_logistics_number.value = this.listQuery.orders_logistics_number
        secondary_shop_orders_id.name = 'secondary_shop_orders_id'
        secondary_shop_orders_id.value = this.listQuery.secondary_shop_orders_id

        group_name.name = 'support_user_account_group_id'
        group_name.value = this.listQuery.support_user_account_group_id
        nickname.name = 'support_member_nickname'
        nickname.value = this.listQuery.support_member_nickname
        product_weixin_id.name = 'product_weixin_id'
        product_weixin_id.value = this.listQuery.product_weixin_id

        product_name.name = 'product_name'
        product_name.value = this.listQuery.product_name
        receive_name.name = 'weixin_fans_address_receive_name'
        receive_name.value = this.listQuery.weixin_fans_address_receive_name
        receive_phone.name = 'weixin_fans_address_phone'
        receive_phone.value = this.listQuery.weixin_fans_address_phone
        remark.name = 'remark'
        remark.value = this.listQuery.remark

        form.appendChild(orders_status)
        form.appendChild(orders_unique_id)
        form.appendChild(orders_logistics_number)
        form.appendChild(secondary_shop_orders_id)
        form.appendChild(group_name)
        form.appendChild(nickname)
        form.appendChild(product_weixin_id)
        form.appendChild(product_name)
        form.appendChild(receive_name)
        form.appendChild(receive_phone)
        form.appendChild(remark)

        const button = document.createElement('input')
        button.type = 'submit'
        form.appendChild(button)
        document.body.appendChild(form)
        form.submit()
        document.body.removeChild(form)
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
  .el-tag{
    /*height: 24px;*/
    /*line-height: 22px;*/
    /*font-size: 14px;*/
    /*padding: 0 4px;*/
  }
  .el-form--inline .el-form-item__content {
    width: 85%;
    padding: 5px 15% 0px 0px;
  }

  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 15%;
    color: #5e81bf;
    font-size: 16px;
  }

  .my-edit-type, .my-edit-type:focus {
    color: #288ccb;
    cursor: pointer;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 15px;
    width: 49%;
    margin-left: 1%;
  }

  .my-form-p {
    margin: 0;
    padding: 0;
    line-height: 40px;
    color: #7d3d3d;
  }

  .label-span {
    font-weight: bold;
    color: #5e81bf;
  }

  .deleted-p {
    text-decoration: crimson underline overline line-through;
    text-decoration: underline overline line-through;
  }

</style>
