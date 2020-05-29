<template>
  <div class="app-container calendar-list-container">
    <!--<el-button type="primary" v-waves icon="el-icon-refresh" size="small" @click="show = !show">筛选</el-button>-->
    <transition name="el-zoom-in-top">
      <div class="filter-container transition-box" v-show="show">
        <div class="filter-float">
          <el-button
            class="filter-item"
            type="primary"
            v-waves
            icon="el-icon-edit"
            size="small"
            @click="handleCreate"
          >添加</el-button>
        </div>
      </div>
    </transition>
    <!-- 代购单列表 -->
    <el-table :data="updatalists" border style="width: 100%">
      <el-table-column label="ID" align="center" width="70px">
        <template slot-scope="scope">
          <p>{{scope.row.id}}</p>
        </template>
      </el-table-column>
      <el-table-column label="微信号" align="center">
        <template slot-scope="scope">
          <p>{{scope.row.product_wx_account}}</p>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center">
        <template slot-scope="scope">
          <p>{{scope.row.customer_id}}</p>
        </template>
      </el-table-column>
      <el-table-column label="粉丝信息" align="center">
        <template slot-scope="scope">
          <p>手机号：{{scope.row.fans_info.phone}}</p>
          <p>加粉时间：{{scope.row.fans_info.fans_join_time}}</p>
        </template>
      </el-table-column>
      <el-table-column label="收货信息" align="center">
        <template slot-scope="scope">
          <p>收货人：{{scope.row.receive_info.receive_name}}</p>
          <p>手机号：{{scope.row.receive_info.phone}}</p>
        </template>
      </el-table-column>
      <el-table-column label="商品信息" align="center" width="300px">
        <template slot-scope="scope">
          <el-table :data="scope.row.product_info" :show-header="hideTableHeader" :cell-style="cellStyle2"  element-loading-text="给我一点时间" fit style="width: 100%;border:none;margin-bottom:-2px;">
            <el-table-column align="left">
              <template slot-scope="scope">
                <span>商品名称{{scope.row.goods_info.goods_title}}</span>
                <span>单价:{{scope.row.goods_info.actual_price}}</span>
                <span>数量:{{scope.row.number}}</span>
              </template>
            </el-table-column>
          </el-table>
            <span style="float: left; margin-top:10px;">总价:{{scope.row.total_price}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="order_remark" label="备注" align="center"></el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" type="warning">{{scope.row.status | statusFilters}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px">
        <template slot-scope="scope">
          <el-button type="primary" @click="createsdata(scope.row)">修改</el-button>
          <el-button type="danger" @click="deletedata(scope.row)">删除</el-button>
          <el-button
            type="success"
            v-if="scope.row.status === 1"
            @click="shengcheng(scope.row)"
          >生成订单</el-button>
          <el-button type="success" v-if="scope.row.status === 0" @click="lianjie(scope.row)">生成链接</el-button>
          <el-button type="success" v-if="scope.row.status === 2">已完成</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]"
        :page-size="listQuery.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totals"
      ></el-pagination>
    </div>
    <!-- 生成链接 -->
    <el-dialog title="生成链接" :visible.sync="dialogFormVis">
      <p>{{webUrls}}</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVis = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVis = false">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 粉丝信息 -->
    <el-dialog title="添加粉丝" :visible.sync="dialogFormVisiblels">
      <el-form
        :rules="rules"
        ref="dataForm"
        :model="temps"
        label-position="left"
        label-width="100px"
        style="width: 80%; margin-left:50px;"
      >
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="temps.phone" :disabled="dialogStatus === 'update'"></el-input>
        </el-form-item>
        <el-form-item label="推广微信号" prop="product_weixin.id">
          <multiselect
            v-model="temps.product_weixin"
            :options="productWeixinOptions"
            @search-change="queryProductWeixinList"
            placeholder="搜索推广微信号"
            selectLabel="选择"
            deselectLabel="删除"
            :internalSearch="false"
            label="weixin_accounts"
          >
            <span slot="noResult">无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="加粉时间" prop="fans_join_time">
          <el-date-picker
            v-model="temps.fans_join_time"
            style="width: 100%"
            format="yyyy-MM-dd HH:mm"
            align="right"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="选择加粉时间"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="类型" prop="is_promotion">
          <el-radio-group v-model="temps.is_promotion" :disabled="dialogStatus === 'update'">
            <el-radio-button :label="promotionFans">推广粉</el-radio-button>
            <el-radio-button :label="fissionFans">裂变粉</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisiblels = false">取 消</el-button>
        <el-button type="primary" @click="createDatas">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 生成订单 -->
    <el-dialog :visible.sync="innerDialogOrderDetailVisibles" width="40%">
      <el-card>
        <div slot="header" class="clearfix">
          <span>生成订单详情</span>
        </div>
        <h4>基本信息</h4>
        <p class="data-items">
          <template>
            <span>出单客服:{{ templs.product_wx_account}}</span>
          </template>
        </p>
        <p class="data-items">
          <template>
            <span>出单微信号:{{ templs.product_wx_account}}</span>
          </template>
        </p>
        <p class="data-items">
          <template>
            <span>加粉时间: {{fans_info.fans_join_time}}</span>
          </template>
        </p>
        <h4>客户信息</h4>
        <p class="data-items">
          <template>
            <span>姓名:{{receive_info.receive_name}}</span>
          </template>
        </p>
        <p class="data-items">
          <template>
            <span>电话:{{receive_info.phone}}</span>
          </template>
        </p>
        <p class="data-items">
          <template>
            <span>收货地址:{{receive_info.address}}</span>
          </template>
        </p>
        <h4>商品明细</h4>
        <p class="data-items">
          <template>
            <span>{{goods_info.goods_title}} x {{product_info.number}}</span>
          </template>
        </p>
        <h4>支付明细 (订单总额:{{templs.total_price}})</h4>
        <p class="data-items">
          <template>
            <span>物流代收款: {{templs.total_price}}</span>
          </template>
        </p>
      </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogOrderDetailVisibles = false">取 消</el-button>
        <el-button :loading="btnLoading" type="primary" @click="handleCheckOrders">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 添加弹框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        :rules="rules"
        ref="dataForm1"
        :model="temp"
        label-position="left"
        label-width="20%"
        style="width: 80%; margin-left:10%;"
      >
        <el-form-item label="备注" prop="remark">
          <el-input placeholder="请输入订单备注" v-model="temp.orders_receiver_info.order_remark"></el-input>
        </el-form-item>
        <el-form-item label="收货地址" prop="is_promotion">
          <span v-for="(item,index) in datalist" :key="index">
            <br />
            {{'收件人: ' + item.receive_name}}
            <br />
            {{'电话: ' + item.phone}}
          </span>
          <span class="link-type" @click="handleOpenInner4">选择收货地址</span>
        </el-form-item>
        <el-form-item label="粉丝信息" prop="is_promotion">
          <span v-for="(item,index) in firstlist" :key="index">
            <br />
            {{'手机号: ' + item.phone}}
            <br />
            {{'微信号: ' + item.product_weixin.info}}
            <br />
            {{'时间: ' + item.fans_join_time}}
          </span>
          <span class="link-type" @click="handleOpenInnerls">添加粉丝</span>
        </el-form-item>
        <el-form-item label="商品列表" prop="is_promotion">
          <div v-for="(shopGoods,index) in temp.shop_goods" :key="index">
            <span>
              <img
                :src="shopGoods.goods_info.shop_goods_common.main_images_default"
                style="width: 35px;"
              />
              {{shopGoods.goods_info.shop_goods_common.goods_name}}
            </span>
            (
            <span
              v-for="(item,index) in shopGoods.goods_info.species_value"
              :key="index"
            >{{item}}</span>
            )
            <span>x {{shopGoods.number}}</span>
            <span
              style="margin-left:15px;"
            >¥{{shopGoods.goods_info.actual_price * shopGoods.number}}</span>
          </div>
          <span class="link-type" @click="handleInnerCreate1">添加商品</span>
        </el-form-item>

        <el-form-item label="运费" prop="is_promotion">
          <span style="font-size:25px !important;text-align:right;">{{calculated_freight}}</span>
        </el-form-item>
        <el-form-item label="商品合计" prop="actual_pay">
          <div v-if="actualPayEditable">
            <el-input class="edit-input" size="small" v-model="temp.changed_price"></el-input>
          </div>
          <div v-if="actualPayEditable">
            <el-input class="edit-input" size="small" v-model="tempactual_pay.actual_pay"></el-input>
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="actualPayEditable = false"
            >取消</el-button>
            <el-button
              type="success"
              @click="updateActualPayData()"
              size="small"
              icon="el-icon-circle-check-outline"
            >完成</el-button>
          </div>
          <span
            style="font-size:25px !important;text-align:right;"
            @click="editactualPay"
            v-else
          >{{ computed_actual_pay }}</span>
          <p
            style="font-size:25px !important;text-align:right;"
            v-if="temp.changed_price !== undefined"
          >实收: {{temp.changed_price}}</p>
        </el-form-item>

        <el-form-item label="订单总金额" prop="actual_pay">
          <span style="font-size:25px !important;text-align:right;">{{ computed_total_actual_pay }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="quxiaosl">取 消</el-button>
        <el-button type="primary" @click="createDatasls">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 搜索商品 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible1" width="60%">
      <el-form
        :rules="innerRules1"
        ref="innerDataForm1"
        :model="innerTemp1"
        label-position="left"
        label-width="80px"
        style="width: 80%; margin-left:10%;"
      >
        <el-form-item label="商品" prop="shop_goods">
          <multiselect
            v-model="selectedShopGoods"
            :options="shopGoodsOptions"
            @search-change="queryProductGoodsList"
            placeholder="搜索商品"
            selectLabel="选择"
            deselectLabel="删除"
            track-by="id"
            :internalSearch="false"
            label="id"
          >
            <template slot="singleLabel" slot-scope="props">
              <span class="option__desc" v-if="props.option.shop_goods_common">
                <span class="option__title">{{ props.option.shop_goods_common.goods_name}}</span>
                <span
                  style="color: #666;background-color: #dbdbdb;padding: 2px 8px;border-radius:5px;"
                >
                  <span v-for="(items,index) in props.option.species_value" :key="index">{{ items }}</span>
                </span>
                <span
                  style="margin-left: 5px;color: darkred;background-color: #dbdbdb;padding: 1px 8px;border-radius:5px;"
                >¥{{ props.option.actual_price }}</span>
              </span>
            </template>
            <template slot="option" slot-scope="props">
              <span class="option__desc" v-if="props.option.shop_goods_common">
                <span class="option__title">{{ props.option.shop_goods_common.goods_name}}</span>
                <span
                  style="color: #666;background-color: #dbdbdb;padding: 1px 8px;border-radius:5px;"
                >
                  <span v-for="(items,index) in props.option.species_value" :key="index">{{ items }}</span>
                </span>
                <span
                  style="margin-left: 5px;color: darkred;background-color: #dbdbdb;padding: 1px 8px;border-radius:5px;"
                >¥{{ props.option.actual_price }}</span>
              </span>
            </template>
            <span slot="noResult">无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="数量" prop="number">
          <el-input-number v-model="selectedShopGoodsNumber"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible1 = false">取 消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="createInnerData1">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 收货地址 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible4" width="70%">
      <el-form
        :rules="innerRules4"
        ref="innerDataForm4"
        :model="innerTemp4"
        label-position="left"
        label-width="15%"
        style="width: 80%; margin-left:10%;"
      >
        <el-form-item label="收货人姓名" prop="receive_name">
          <el-input v-model="innerTemp4.receive_name"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model.trim="innerTemp4.phone"></el-input>
        </el-form-item>
        <el-form-item label="收货地址" prop="address">
          <!-- <el-select v-model="innerTemp4.regions" placeholder="请选择" style="width:100%;">
    <el-option

      v-for="item in regionData"
      :key="item.area_number"
      :label="item.area_name"
      :value="item.area_number">
    </el-option>
          </el-select>-->
          <el-cascader
            size="large"
            :options="regionData"
            v-model="innerTemp4.regions"
            @change="handleRegionChange"
            :props="props"
            style="width:100%;"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="地址详情" prop="address">
          <el-input v-model="innerTemp4.address"></el-input>
        </el-form-item>
        <el-form-item label="是否默认收货地址" prop="address">
          <el-checkbox-group v-model="innerTemp4.if_default">
            <el-checkbox-button :label="1">默认收货地址</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible4 = false">取 消</el-button>
        <el-button type="primary" @click="createInnerData4">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改弹框 -->
    <el-dialog title="修改" :visible.sync="dialogFormVisiblerouls" @close="goodsEditClose">
      <el-form
        :rules="rules"
        ref="dataForm1"
        :model="templs"
        label-position="left"
        label-width="20%"
        style="width: 80%; margin-left:10%;"
      >
        <el-form-item label="备注" prop="remark">
          <el-input placeholder="请输入订单备注" v-model="templs.order_remark"></el-input>
        </el-form-item>
        <el-form-item label="商品列表" prop="is_promotion">
          <div v-for="(shopGoods,index) in temp.shop_goods" :key="index">
            <span>
              <img
                :src="shopGoods.goods_info.shop_goods_common.main_images_default"
                style="width: 35px;"
              />
              {{shopGoods.goods_info.shop_goods_common.goods_name}}
            </span>
            (
            <span
              v-for="(item,index) in shopGoods.goods_info.species_value"
              :key="index"
            >{{item}}</span>
            )
            <span>x {{shopGoods.number}}</span>
            <span
              style="margin-left:15px;"
            >¥{{shopGoods.goods_info.actual_price * shopGoods.number}}</span>
          </div>
          <span class="link-type" @click="handleInnerCreate1">添加商品</span>
        </el-form-item>
        <el-form-item label="收货地址" prop="is_promotion">
          <span v-for="(item,index) in datalist" :key="index">
            {{item.province_name + ' ' + item.city_name + (item.district_name !== undefined ? item.district_name : ' ') + item.address}}
            <br />
            {{'收件人: ' + item.receive_name}}
            <br />
            {{'电话: ' + item.phone}}
          </span>
          <span class="link-type" @click="handleOpenInner4">选择收货地址</span>
        </el-form-item>
        <el-form-item label="粉丝信息" prop="is_promotion">
          <span v-for="(item,index) in firstlist" :key="index">
            <br />
            {{'手机号: ' + item.phone}}
            <br />
            {{'微信号: ' + item.product_weixin.info}}
            <br />
            {{'时间: ' + item.fans_join_time}}
          </span>
          <span class="link-type" @click="handleOpenInnerls">添加粉丝</span>
        </el-form-item>
        <el-form-item label="运费">
          <span style="font-size:25px !important;text-align:right;">{{calculated_freight}}</span>
        </el-form-item>
        <el-form-item label="商品合计" prop="actual_pay">
          <div v-if="actualPayEditable">
            <el-input class="edit-input" size="small" v-model="order_pay"></el-input>
          </div>
          <div v-if="actualPayEditable">
            <el-input class="edit-input" size="small" v-model="order_pay"></el-input>
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="actualPayEditable = false"
            >取消</el-button>
            <el-button
              type="success"
              @click="updateActualPayData()"
              size="small"
              icon="el-icon-circle-check-outline"
            >完成</el-button>
          </div>
          <span
            style="font-size:25px !important;text-align:right;"
            @click="editactualPay"
            v-else
          >{{ order_pay }}</span>
          <!-- <p style="font-size:25px !important;text-align:right;" v-if="temp.changed_price !== undefined">实收: {{temp.changed_price}}</p> -->
        </el-form-item>
        <el-form-item label="订单总金额" prop="actual_pay">
          <span style="font-size:25px !important;text-align:right;">{{all_pay}}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisiblerouls = false">取 消</el-button>
        <el-button type="primary" @click="updatesles">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getProductList,
  deleteProduct,
  getProductTemplateList
} from "@/api/product";
import { getSupportGroupList } from "@/api/support_member";
import { getSupportMemberList } from "@/api/support_member";
import { getProductGoodsList } from "@/api/product_goods";
// import { getSystemGlobalSettingInfo } from '@/api/system_global_setting'
import {
  deletedata,
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
  getOrdersLogsList,
  getOrdersAreaList,
  createUnidentifyReceiverInfo,
  parseAddress,
  resultOrders,
  destroyOrders,
  checkOrders,
  uncheckOrders,
  getWarehouseList,
  getOrdersItemList,
  getDirectPromotionRefundInfo,
  updateDirectPromotionRefund,
  createDirectPromotionRefund,
  updateOrdersActualPay,
  getGoodsFreight,
  creates,
  fatalist,
  updatas,
  updateShopReplacePurchase
} from "@/api/orders";

import {
  getProductWeixinList,
  getProductWeixinFansList
} from "@/api/product_weixin";
import { getShopGoodsList } from "@/api/shop_goods";
import {
  updatePreparedOrders,
  lockOrders,
  confirmOrders,
  cancelOrders,
  finishShopReplacePurchase
} from "@/api/orders_shop";
import {
  getCustomerShopList,
  deleteCustomerAddress,
  createCustomerAddress,
  getCustomerAddressList
} from "@/api/customer";
import waves from "@/directive/waves"; // 水波纹指令
import Multiselect from "vue-multiselect"; // 使用的一个多选框组件，element-ui的select不能满足所有需求
import "vue-multiselect/dist/vue-multiselect.min.css"; // 多选框组件css
// import { regionData, CodeToText } from 'element-china-area-data'
import { mapGetters } from "vuex";
import bus from "@/views/layout/bus";
import { parseTime } from "@/utils/index";
import Sticky from "@/components/Sticky";

export default {
  name: "ordersManage",
  components: {
    Multiselect,
    Sticky
  },
  directives: {
    waves
  },
  data() {
    const validatePhone = (rule, value, callback) => {
      const myreg = /^[1][1,2,3,4,5,6,7,8,9,0][0-9]{9}$/;
      if (!myreg.test(this.innerTemp4.phone)) {
        callback(new Error("请输入正确的手机号"));
      } else {
        callback();
      }
    };
    const validate = (rule, value, callback) => {
      if (!value) {
        callback(new Error("输入"));
      }
      if (/^\d+(\.\d+)?$/.test(value)) {
        callback();
      } else {
        callback(new Error("输入数字"));
      }
    };
    return {
      oderNums: [],
      oderNum: [],
      webUrl: "",
      webUrls: "",
      // websUrl:'http://shop.badboluo.com/#/pages/indentSheet/indentSheet',
      dialogFormVis: false,
      idsl: "",
      check: "",
      fans_infos: {},
      product_infos: [],
      receive_infos: {},
      fans_info: {},
      product_info: [],
      receive_info: {},
      innerDialogOrderDetailVisibles: false,
      imgs: "",
      dialogFormVisiblerouls: false,
      lists: {},
      totals: "",
      updatalists: [],
      dialogFormVisiblels: false,
      tableLoading: "",
      show: true,
      scrollTop: 0,
      ifExpandAll: false,
      tableKey: 0,
      hideTableHeader: false,
      tableKey2: 0,
      productListLoading: false,
      productListOptions: [],
      tableKey3: 1,
      list: null,
      orders_items: [],
      ordersItemLoading: false,
      list1: null,
      total: null,
      total1: null,
      listLoading: false,
      chooseId: undefined,
      supportUserAccountLoading: false,
      supportUserAccountOptions: [],
      tempactual_pay: {
        actual_pay: undefined
      },
      lists: {
        page_size: 10,
        page: 1
      },

      listQuery: {
        page: 1,
        page_size: 10
      },
      tabSelection: "all",
      listQuery1: {
        date_range: "",
        page: 1,
        page_size: 5,
        product_weixin_id: undefined
      },
      props: {
        value: "area_number",
        label: "area_name",
        children: "children"
      },
      btnLoading: false,
      warehouseLoading: false,
      warehouseOptions: [],
      allWarehouseOptions: [],
      productDeliverExtraOptions: [],
      productDeliverExtraLoading: false,
      productDeliverLoading: false,
      productDeliverOptions: [],
      queryLogisticsTypeOptions: [],
      queryLogisticsTypeLoading: false,
      importanceOptions: [1, 2, 3],
      sortOptions: [
        { label: "按ID升序列", key: "+id" },
        { label: "按ID降序", key: "-id" }
      ],
      statusOptions: [
        { key: 1, label: "未确认" },
        { key: 2, label: "待发货" },
        { key: 3, label: "发货中" },
        { key: 4, label: "断货中" },
        { key: 5, label: "已签收" },
        { key: 6, label: "已拒收" },
        { key: 7, label: "已完成" }
      ],
      showAuditor: false,
      productWeixinLoading2: false,
      productWeixinOptions2: [],
      pickerOptions1: {},
      expandList: [],
      userGroupOptions: [],
      userGroupTree: [],
      defaultPropsGroup: {
        children: "child",
        label: "group_name",
        value: "id"
      },
      goods_info: [],
      temp: {
        id: undefined,
        is_promotion: 1,
        customer: {},
        shop_goods: [],
        orders_receiver_info: {
          id: 1938,
          city: "",
          province: "",
          district: "",
          city_name: "",
          district_name: "",
          province_name: "",
          receive_name: "",
          address: "",
          phone: "",
          postcode: "",
          order_remark: "",
          regions: [],
          changed_price: undefined
        },
        customer_address_id: undefined,
        remark: undefined,

        orders_unique_id: "",
        support_user_account_id: undefined,
        product_weixin_id: undefined,
        price_total: undefined,
        actual_pay: 0.0,
        status: 1,
        warehouse_id: undefined,
        deliver_date: new Date(),
        orders_items: [],
        support_member: {
          id: undefined,
          user_id: undefined,
          nickname: "",
          head_img: "",
          user_account_type_id: undefined,
          user_account_group_id: undefined,
          user_account_role_id: undefined,
          status: undefined
        },
        product_weixin: {
          id: undefined,
          weixin_nickname: "",
          weixin_account: "",
          info: ""
        },

        product_weixin_fans: {
          id: undefined,
          product_weixin_id: undefined,
          weixin_account: "",
          product_weixin: {}
        },
        orders_remarks: [],
        orders_payment: {
          id: undefined,
          orders_id: undefined,
          payment_total: undefined,
          status: 1,
          orders_payment_items: []
        },
        orders_logistics: {
          id: undefined,
          logistics_type_id: undefined,
          logistics_name: "",
          logistics_number: "",
          orders_logistics_type: {
            code: ""
          }
        },
        fans_join_time: ""
      },
      tempOrdersPaymentItem: {
        id: undefined,
        orders_payment_id: undefined,
        paid_money: undefined,
        pay_type_id: undefined,
        pay_proof_id: undefined,
        created_at: "",
        orders_pay_type: {
          id: undefined,
          type_name: ""
        }
      },
      tempOrderRemark: {
        id: undefined,
        orders_id: undefined,
        user_account_id: undefined,
        user_account_type_id: undefined,
        remark: "",
        created_at: ""
      },
      tempOrdersItem: {
        id: undefined,
        product_id: undefined,
        orders_id: undefined,
        number: undefined,
        product: {
          id: undefined,
          product_name: "",
          price: undefined,
          stock: undefined,
          is_promote: undefined
        }
      },
      payProofQuery: {
        paid_money: undefined
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "创建"
      },
      rules: {
        product_name: [
          { required: true, message: "请正确填写商品名称", trigger: "change" }
        ],
        warehouse_id: [
          { required: true, message: "选择仓库", trigger: "change" }
        ],
        support_member: {
          id: [{ required: true, message: "选择客服", trigger: "change" }]
        },
        product_weixin: {
          id: [{ required: true, message: "选择推广微信", trigger: "change" }]
        },
        product_weixin_fans: {
          id: [{ required: true, message: "选择粉丝微信", trigger: "change" }]
        },
        deliver_date: [
          { required: true, message: "选择发货时间", trigger: "change" }
        ]
      },
      rules1: {
        actual_pay: [{ validator: validate, trigger: "change" }]
      },
      innerList1: null,
      innerTotal1: null,
      innerTableKey1: 1,
      innerTableTitle1: "",
      innerListQuery1: {
        page: 1,
        page_size: 5,
        product_id: undefined,
        sort: "-id"
      },
      innerTemp1: {
        id: undefined,
        product_goods: {
          id: undefined
        },
        warehouse_id: undefined,
        number: ""
      },
      innerListLoading1: false,
      innerTableVisible1: false,
      innerDialogFormVisible1: false,
      innerRules4: {
        phone: [{ required: true, trigger: "blur", validator: validatePhone }]
      },
      innerRules1: {},
      freights: 0,
      innerList2: null,
      innerTotal2: null,
      innerTableKey2: 2,
      innerTableTitle2: "",
      innerListQuery2: {
        page: 1,
        page_size: 5,
        product_id: undefined,
        sort: "-id"
      },
      innerTemp2: {
        id: undefined,
        product: undefined,
        number: ""
      },
      innerListLoading2: false,
      innerTableVisible2: false,
      innerDialogFormVisible2: false,
      innerRules2: {
        remark: [
          { required: true, message: "输入备注信息内容", trigger: "change" }
        ]
      },
      innerListLoading3: false,
      innerTableVisible3: false,
      innerTableTitle3: "",
      innerTableKey3: 3,
      innerList3: null,
      innerTotal3: null,
      innerListQuery3: {
        page: 1,
        page_size: 10,
        sort: "-id",
        orders_id: undefined
      },
      customer_address_id: "",
      innerTemp3: {
        id: undefined,
        logistics_type_id: undefined,
        product_deliver_extra_id: undefined,
        logistics_name: "",
        logistics_number: "",
        product_deliver_id: undefined,
        dest_code: "",
        dest_extra_code: "",
        orders_logistics_type: {
          code: "",
          id: "",
          name: ""
        }
      },
      innerDialogFormVisible3: false,
      innerRules3: {
        template_name: [
          { required: true, message: "请正确填写模板名称", trigger: "change" }
        ],
        template_code: [
          { required: true, message: "请正确填写模板内容", trigger: "change" }
        ]
      },
      innerList5: null,
      innerTotal5: null,
      innerTableKey5: 5,
      innerTableTitle5: "",
      innerListQuery5: {
        page: 1,
        page_size: 5,
        product_id: undefined,
        sort: "-id"
      },
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
        orders_pay_type_id: [
          { required: true, message: "选择方式", trigger: "change" }
        ],
        paid_money: [
          { required: true, message: "输入金额或选择凭证", trigger: "change" }
        ]
      },
      innerTemp7: {
        orders_id: undefined,
        support_user_account_id: undefined,
        finance_user_account_id: undefined,
        refund_money: undefined,
        receiver_info: undefined,
        status: undefined,
        remark: undefined,
        refund_img_url: undefined
      },
      innerDialogFormVisible7: false,
      btnLoading7: false,
      innerDataForm7: 7,
      innerRules7: {},
      productType: {
        1: "推广",
        2: "附属产品",
        3: "赠品"
      },
      productTypeOptions: [
        { key: 1, display_name: "推广" },
        { key: 2, display_name: "附属产品" },
        { key: 3, display_name: "赠品" }
      ],
      supportMemberOptions: [],
      productWeixinOptions: [],
      productWeixinFansOptions: [],
      productOptions: [],
      productGoodsOptions: [],
      logisticsTypeOptions: [],
      payTypeOptions: [],
      if_deleted: "deleted-p",
      regionData: [],
      tempProductId: undefined,
      selectedRegionOptions: [],
      // CodeToText: CodeToText,
      publicImageUrl: "",
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
      stepStatus: "create",
      today_orders: 0,
      need_delivery: 0,
      pickerOptions2: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      datalist: [],
      firstlist: [],
      delivery_address: "",
      delivery_product_name: "",
      sf_monthly_account: "",
      tempPay: undefined,
      temp_receiver_info: "",
      showReceiverForm: false,
      countNeedManualHandleOrders: 0,
      innerDialogOrderDetailVisible: false,
      promotionFans: 1,
      fissionFans: 0,
      customerOptions: [],
      selectedShopGoods: {},
      selectedShopGoodsNumber: 1,
      shopGoodsOptions: [],
      innerList4: null,
      innerTotal4: null,
      innerTableKey4: 4,
      innerTableTitle4: "",
      query: 11,
      innerListQuery4: {
        page: 1,
        page_size: 5,
        product_id: undefined,
        sort: "-id"
      },
      orders_id: "",
      innerTemp4: {
        id: undefined,
        customer_id: undefined,
        product: undefined,
        receive_name: "",
        phone: "",
        province: "",
        province_name: "",
        city: "",
        city_name: "",
        district: "",
        district_name: "",
        regions: [],
        address: "",
        if_default: undefined,
        product_weixin_fans_address_id: undefined
      },
      temps: {
        id: undefined,
        fans_join_time: undefined,
        phone: "",
        is_promotion: 1,
        product_weixin: {}
      },
      innerListLoading4: false,
      innerTableVisible4: false,
      innerDialogFormVisible4: false,
      calculated_freight: 0,
      freight: 0,
      productWeixinOptions: [],
      templs: {
        order_remark: ""
      },
      goods_info: {},
      addGoodsIf: 0,
      fright_pay: 0, //运费计算
      order_pay: 0, //订单价
      all_pay: 0, //总价
      ID: null,
      updateObj: {},
      createOrderObj: {},
      product_infosl: []
    };
  },
  computed: {
    ...mapGetters(["user_account_id", "roles"]),
    computed_actual_pay() {
      let actual_pay = 0.0;
      if (
        this.temp.shop_goods === undefined ||
        this.temp.shop_goods === null ||
        this.temp.shop_goods.length <= 0
      ) {
        return actual_pay;
      }
      for (const v of this.temp.shop_goods) {
        actual_pay += parseFloat(v.goods_info.actual_price) * v.number;
      }
      // actual_pay += parseFloat(this.calculated_freight)
      return Math.round(actual_pay * 100) / 100;
    },
    computed_total_actual_pay() {
      let actual_pay = 0;
      if (
        this.temp.changed_price !== undefined &&
        this.temp.changed_price !== null
      ) {
        actual_pay = parseFloat(this.temp.changed_price);
      } else if (
        this.temp.shop_goods === undefined ||
        this.temp.shop_goods === null ||
        this.temp.shop_goods.length <= 0
      ) {
        return actual_pay;
      } else {
        for (const v of this.temp.shop_goods) {
          actual_pay += parseFloat(v.goods_info.actual_price) * v.number;
        }
      }
      actual_pay += parseFloat(this.calculated_freight);
      return Math.round(actual_pay * 100) / 100;
    }
  },
  filters: {
    statusUnit(status) {
      const statusTransMap = {
        0: "件",
        1: "斤",
        2: "g"
      };
      return statusTransMap[status];
    },
    statusFilters(status) {
      const statusMap = {
        0: "待确认",
        1: "已确认",
        2: "生成订单"
      };
      return statusMap[status];
    },
    statusFilter(status) {
      const statusMap = {
        1: "success",
        2: "info",
        3: "danger"
      };
      return statusMap[status];
    },
    statusTranslator(status) {
      const statusMap = {
        1: "推广",
        2: "附属产品",
        3: "赠品"
      };
      return statusMap[status];
    },
    orderStatusFilter(status) {
      const statusMap = {
        0: "info",
        1: "info",
        2: "warning",
        3: "",
        4: "",
        5: "",
        6: "danger",
        7: "success",
        8: "",
        9: "danger"
      };
      return statusMap[status];
    },
    orderStatusTranslator(status) {
      const statusMap = {
        0: "无效订单",
        1: "未确认",
        2: "待发货",
        3: "发货中",
        4: "断货中",
        5: "已签收",
        6: "已拒收",
        7: "已完成",
        8: "已退回",
        9: "废弃",
        10: "已退款"
      };
      return statusMap[status];
    },
    paymentItemStatusFilter(status) {
      const statusMap = {
        0: "info",
        1: "success",
        2: "danger",
        3: ""
      };
      return statusMap[status];
    },
    paymentItemStatusTranslator(status) {
      const statusMap = {
        0: "未确认",
        1: "已确认",
        2: "已删除",
        3: "已提现"
      };
      return statusMap[status];
    },
    userTypeStatusTranslator(status) {
      const statusMap = {
        1: "推广",
        2: "客服",
        3: "文案",
        4: "库管",
        5: "管理员"
      };
      return statusMap[status];
    },
    orderPhoneVisibleTranslator(phone) {
      // this.$store.state.user.roles
      if (phone) {
        return phone.substr(0, 3) + "****" + phone.substr(7);
      } else {
        return phone;
      }
    }
  },
  created() {
    this.getGoodsFreight();
    this.getList();
    this.getUserGroupTree();
    this.getProductWeixinList(" ");
    this.queryOrderPayTypeList(" ");
    this.queryProductWeixinList();
    this.getregionData();
    this.getdatalist();
    // this.createDatasls()
  },
  methods: {
    // 修改弹窗关闭时候的事件
    goodsEditClose() {
      this.oderNum = [];
      this.oderNums = [];
      this.temp.shop_goods = [];
      this.datalist = [];
      this.firstlist = [];
    },
    lianjie(row) {
      this.dialogFormVis = true;
      updatas({ id: row.id }).then(res => {
        this.idsl = res.data.id;
        this.check = res.data.check;
        this.webUrl = `http://shopapp.home258.com/#/pages/indentSheet/indentSheet?id=${this.idsl}&check=${this.check}`;
        this.webUrls = `http://shop.badboluo.com/#/pages/indentSheet/indentSheet?id=${this.idsl}&check=${this.check}`;
      });
    },
    shengcheng(row) {
      this.innerDialogOrderDetailVisibles = true;
      updatas({ id: row.id }).then(response => {
        this.$nextTick(() => {
          this.templs = response.data;
          this.fans_info = response.data.fans_info;
          this.product_info = response.data.product_info[0];
          this.goods_info = response.data.product_info[0].goods_info;
          console.log(this.goods_info, 3333);
          this.receive_info = response.data.receive_info;
        });
      });
    },
    quxiaosl() {
      this.dialogFormVisible = false;
      this.datalist = [];
      this.firstlist = [];
      this.innerTemp4 = [];
      this.temps = [];
    },
    updatesles() {
      this.updateObj = {};
      this.updateObj.order_remark = this.templs.order_remark;
      this.updateObj.id = this.ID;
      this.updateObj.product_wx_account = this.temps.product_weixin.weixin_account;
      this.updateObj.fans_info = this.fans_info;
      this.updateObj.receive_info = this.receive_info;
      this.updateObj.product_info = this.temp.shop_goods;
      this.updateObj.freight = this.calculated_freight;

      this.updateObj.total_price = this.order_pay;
      this.updateObj.order_price = this.all_pay;
      updateShopReplacePurchase(this.updateObj).then(response => {
        this.$notify({
          title: "成功",
          message: "修改成功",
          type: "success"
        });
        this.dialogFormVisiblerouls = false;
        this.updateObj = {};
        this.getdatalist();
      });
    },
    createsdata(row) {
      this.temp.shop_goods= []
      this.dialogFormVisiblerouls = true;
      this.ID = row.id;
      updatas({ id: row.id }).then(res => {
        console.log(res, 111);
        this.templs = res.data;
        this.fans_info = res.data.fans_info;
        this.product_info = res.data.product_info;

        // this.product_info.freight = res.data.freight
        this.calculated_freight = res.data.freight / 1;
        // console.log(this.calculated_freight,11111)
        this.order_pay = res.data.total_price / 1;
        // console.log(this.order_pay,2222)
        this.all_pay = res.data.order_price / 1;
        // console.log(this.all_pay,3333)
        this.receive_info = res.data.receive_info;
      });
    },

    deletedata(row) {
      this.$confirm("确定要删除此项吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deletedata({ id: row.id }).then(response => {
            this.$notify({
              title: "成功",
              message: "删除成功",
              type: "success"
            });
            this.getdatalist();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },

    async getdatalist() {
      const res = await fatalist(this.listQuery);
      this.updatalists = res.data.data;
      this.totals = res.data.total;
      console.log(this.listQuery);
      console.log(this.updatalists);
    },

    createDatasls() {
      this.dialogFormVisible = false;
      const tempsl = this.temp;
      const temps = this.temps;
      const product_wx_account = temps.product_weixin.weixin_account;
      const fans_info = this.temps;
      const receive_info = this.lists;
      const product_info = tempsl.shop_goods;
      const product_weixin_id = temps.product_weixin.id;
      const order_remark = tempsl.orders_receiver_info.order_remark;
      const freight = this.calculated_freight;
      this.freight = this.calculated_freight;
      const total_price = this.computed_actual_pay;
      const order_price = this.computed_total_actual_pay;
      creates({
        freight: freight,
        total_price: total_price,
        order_price: order_price,
        product_weixin_id: product_weixin_id,
        product_wx_account: product_wx_account,
        order_remark: order_remark,
        fans_info: fans_info,
        product_info: product_info,
        receive_info: receive_info
      }).then(res => {
        this.$notify({
          title: "成功",
          message: "创建成功",
          type: "success"
        });
        this.getdatalist();
        window.reload();
        this.temp = [];
        this.temps = [];
        this.datalist = [];
      });
    },

    queryProductWeixinList(query) {
      getProductWeixinList({ weixin_account: query }).then(response => {
        if (!response.data.data) return;
        this.productWeixinOptions = response.data.data;
        for (const v of this.productWeixinOptions) {
          v.weixin_account = v.weixin_account;
          v.weixin_accounts = v.weixin_account + "  (" + v.info + ")";
          const index = this.productWeixinOptions.indexOf(v);
          this.productWeixinOptions.splice(index, 1, v);
        }
      });
    },
    createDatas() {
      this.dialogFormVisiblels = false;
      this.firstlist = [];
      this.firstlist.push(this.temps);
    },

    handleOpenInnerls() {
      this.dialogFormVisiblels = true;
    },
    confirmChangePrice() {
      if (
        this.temp.shop_goods === undefined ||
        this.temp.shop_goods === null ||
        this.temp.shop_goods.length <= 0
      ) {
        this.actualPayEditable = false;
        return;
      }
      let actual_pay = 0.0;
      for (const v of this.temp.shop_goods) {
        actual_pay += parseFloat(v.goods_info.actual_price) * v.number;
      }
      if (actual_pay >= this.temp.changed_price) {
        this.actualPayEditable = false;
        return;
      }
      this.$message({
        type: "info",
        message: "价格不能高于商城定价"
      });
      this.temp.changed_price = undefined;
    },
    async getGoodsFreight() {
      const response = await getGoodsFreight({
        shop_goods: this.temp.shop_goods,
        province: this.arr
      });
      console.log(response, 999);
      this.calculated_freight = response.data.freight;
    },

    handleOpenInner4() {
      this.innerDialogFormVisible4 = true;
    },
    getInnerList4() {
      const tempdata = {};
      tempdata.customer_id = this.temp.customer.customer_id;
      this.innerListLoading4 = true;
      getCustomerAddressList(tempdata).then(response => {
        this.innerList4 = response.data.data;
        this.innerTotal4 = response.data.total;
        this.innerListLoading4 = false;
      });
    },
    handleInnerCreate4() {
      this.resetInnerTemp4();
      this.dialogStatus = "create";
      this.innerDialogFormVisible4 = true;
      this.innerTemp4.customer_id = this.temp.customer.customer_id;
      this.$nextTick(() => {
        this.$refs["innerDataForm4"].clearValidate();
      });
    },
    resetInnerTemp4() {
      this.innerTemp4 = {
        id: undefined,
        customer_id: undefined,
        product: undefined,
        receive_name: "",
        phone: "",
        province: "",
        province_name: "",
        city: "",
        city_name: "",
        district: "",
        district_name: "",
        regions: [],
        address: "",
        if_default: undefined
      };
    },
    createInnerData4() {
      this.$refs["innerDataForm4"].validate(valid => {
        if (valid) {
          this.innerTemp4.province = this.innerTemp4.regions[0];
          this.innerTemp4.city = this.innerTemp4.regions[1];
          this.innerTemp4.district = this.innerTemp4.regions[2];
          this.lists = this.innerTemp4;
          console.log(this.lists, 333);
          this.datalist = [];
          this.datalist.push(this.innerTemp4);
          console.log(this.datalist, 4444);
          this.innerDialogFormVisible4 = false;
          // createCustomerAddress(this.innerTemp4).then(response => {
          //   console.log(response,99999)
          //   this.getInnerList4()
          //   this.innerDialogFormVisible4 = false
          //   this.$notify({
          //     title: '成功',
          //     message: '创建成功',
          //     type: 'success',
          //     duration: 2000
          //   })
          // })
        }
      });
    },
    handleInnerDelete4(row) {
      this.$confirm("确定删除收货地址?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const ttempData = {
            customer_address_id: row.id,
            customer_id: row.customer_id
          };
          deleteCustomerAddress(ttempData).then(response => {
            this.temp.orders_receiver_info = {};
            this.temp.customer_address_id = undefined;
            this.$notify({
              title: "成功",

              message: "删除成功",
              type: "success",
              duration: 2000
            });
            this.getInnerList4();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    handleAddressRowClick(row, column, cell, event) {
      console.log(cell);
      // console.log(cell.path)
      // console.log(cell.path[1].classList)
      if (cell.cellIndex === 4) {
        this.temp.customer_address_id = row.id;
        this.temp.orders_receiver_info.phone = row.phone;
        this.temp.orders_receiver_info.province_name = row.province_name;
        this.temp.orders_receiver_info.city_name = row.city_name;
        this.temp.orders_receiver_info.district_name = row.district_name;
        this.temp.orders_receiver_info.address = row.address;
        this.temp.orders_receiver_info.receive_name = row.receive_name;
      }
    },
    getOrdersDetail(row) {
      this.$router.push({
        path: "/orders/ordersDetail/",
        query: {
          orders_id: row.id
        }
      });
    },
    resetOrders() {},
    resetWarehouse() {
      this.temp.warehouse_id = undefined;
      this.warehouseOptions = [];
      this.getWarehouseList(this.temp.product_weixin.finance_group_id);
    },
    resetWarehouse2() {
      this.temp.warehouse_id = undefined;
      this.warehouseOptions = [];
      this.getWarehouseList(
        this.temp.product_weixin_fans.product_weixin.finance_group_id
      );
    },
    handleUnidenfyReceiverInfo() {
      createUnidentifyReceiverInfo({ content: this.temp_receiver_info }).then(
        () => {
          this.$notify({
            title: "成功",
            message: "感谢你对完善系统做的贡献, 技术正在努力修改中",
            type: "success",
            duration: 5000
          });
        }
      );
    },
    handleClick(tab, event) {
      this.listQuery.status = "";
      this.listQuery.need_manual_handle = undefined;
      if (tab.name !== "all" && tab.name !== "need_manual_handle") {
        this.listQuery.status = parseInt(tab.name);
      }
      if (tab.name === "need_manual_handle") {
        this.listQuery.status = 3;
        this.listQuery.need_manual_handle = 1;
      }
      this.getList();
    },
    rowStyle1() {
      return "min-height: 160px;";
    },
    cellStyle1({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return "padding: 0px;border-bottom:none;";
      }
      // if (columnIndex === 1) {
      //   return 'border-left:2px solid #ebeef5;'
      // }
    },
    cellStyle2({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return "border-right:none;";
      }
    },
    smartParse() {
      parseAddress({ receiver_info: this.temp_receiver_info }).then(
        response => {
          this.showReceiverForm = true;
          this.temp.orders_receiver_info.receive_name = response.data.name;
          this.temp.orders_receiver_info.phone = response.data.mobile;
          this.temp.orders_receiver_info.regions = [
            parseInt(response.data.detail.province),
            parseInt(response.data.detail.city),
            parseInt(response.data.detail.district)
          ];
          this.temp.orders_receiver_info.address = response.data.detail.address;
        }
      );
    },
    editactualPay() {
      let tempPrice = 0.0;
      for (const v of this.temp.shop_goods) {
        tempPrice += parseFloat(v.goods_info.actual_price) * v.number;
      }
      // tempPrice += parseFloat(this.calculated_freight)
      this.temp.changed_price = Math.round(tempPrice, 2);
      this.actualPayEditable = true;
    },
    getUserGroupTree() {
      getSupportGroupList().then(response => {
        this.userGroupTree = this.formatUserGroupTree(response.data);
      });
    },
    formatUserGroupTree(tree) {
      const Group = tree.map(item => {
        if (item.child.length > 0) {
          item.child = this.formatUserGroupTree(item.child);
          return item;
        } else {
          delete item.child;
          return item;
        }
      });
      return Group;
    },
    getSupportUserAccountList(query) {
      if (query !== "") {
        this.supportUserAccountLoading = true;
        getSupportMemberList({ nickname: query, status: 1 }).then(response => {
          this.supportUserAccountOptions = response.data.data;
          this.supportUserAccountLoading = false;
        });
      }
    },
    handleFilterGrounp(val) {
      this.listQuery.support_user_account_group_id = val[val.length - 1];
      this.handleFilter();
    },
    getregionData() {
      getOrdersAreaList().then(response => {
        this.regionData = response.data;
        console.log(this.regionData, 11111);
      });
    },
    refreshOrdersList() {
      this.getNeedManualHandleOrdersCountInfo();
      this.getList();
    },
    getNeedManualHandleOrdersCountInfo() {
      const tempParams = Object.assign({}, this.listQuery);

      tempParams.status = 3;
      tempParams.need_manual_handle = 1;
      getOrdersList(tempParams).then(response => {
        this.countNeedManualHandleOrders = response.data.total;
      });
    },
    handleChangePayType(value) {
      if (value !== -1 && value !== 1 && value !== 2) {
        this.payProofVisiable = true;
        this.paidMoneyEnabled = true;
      } else {
        this.payProofVisiable = false;
        this.paidMoneyEnabled = false;
      }
      this.innerTemp5.paid_money = undefined;
      this.payProofImageUrl = undefined;
      this.innerTemp5.orders_pay_proof_id = undefined;
    },
    queryOrderPayTypeList(query) {
      if (query !== "") {
        this.payTypeLoading = true;
        getOrdersPayTypeList({ type_name: query }).then(response => {
          this.payTypeOptions = response.data;
          this.payTypeLoading = false;
        });
      }
    },
    getProductWeixinList(query) {
      if (query !== "") {
        this.productWeixinLoading2 = true;
        getProductWeixinList({ info: query }).then(response => {
          this.productWeixinOptions2 = response.data.data;
          this.productWeixinLoading2 = false;
        });
      }
    },
    handleRegionChange(value) {
      this.array = value;
      this.arr = this.array[0];
    },
    tableRowClassName({ row, rowIndex }) {
      return "colored-row";
    },
    async queryCustomerList(query) {
      try {
        const tempQuery = {};
        tempQuery.phone = query;
        tempQuery.is_promotion = this.temp.is_promotion;
        const response = await getCustomerShopList(tempQuery);
        this.customerOptions = response.data.data;
      } catch (e) {
        this.$router.push({ path: "/shop/bindCustomer" });
      } finally {
        this.listLoading = false;
      }
    },
    querySupportMemberList(query) {
      getSupportMemberList({
        nickname: query,
        user_account_type_code: "support",
        status: "1"
      }).then(response => {
        if (!response.data.data) return;
        this.supportMemberOptions = response.data.data;
      });
    },
    getProductList(query) {
      if (query !== "") {
        this.productListLoading = true;
        getProductList({ product_name: query, is_promote: 1 }).then(
          response => {
            this.productListOptions = response.data.data;
            this.productListLoading = false;
          }
        );
      }
    },
    getWarehouseList(finance_group_id) {
      this.warehouseLoading = true;
      getWarehouseList({ finance_group_id: finance_group_id }).then(
        response => {
          this.warehouseOptions = response.data.data;
          console.log(this.warehouseOptions, 10101010);
          if (this.warehouseOptions.length === 1) {
            this.temp.warehouse_id = this.warehouseOptions[0].id;
          }
          this.warehouseLoading = false;
        }
      );
    },
    getAllWarehouseList() {
      getWarehouseList().then(response => {
        this.allWarehouseOptions = response.data.data;
      });
    },
    queryProductWeixinFansList(query) {
      getProductWeixinFansList({
        fans_weixin_account: query
      }).then(response => {
        if (!response.data.data) return;
        this.productWeixinFansOptions = response.data.data;
      });
    },
    queryProductList(query) {
      getProductList({ product_name: query }).then(response => {
        if (!response.data.data) return;
        this.productOptions = response.data.data;
      });
    },
    queryProductGoodsList(query) {
      getShopGoodsList({
        goods_name: query,
        page_size: 50,
        is_sale: 1,
        status: 1
      }).then(response => {
        this.shopGoodsOptions = response.data.data;
      });
    },
    queryLogisticsTypeList(query) {
      if (
        this.innerTemp3.product_deliver_id === undefined ||
        this.innerTemp3.product_deliver_id === ""
      ) {
        this.$message.error("先选择仓库");
        return;
      }
      if (query !== "") {
        this.queryLogisticsTypeLoading = true;
        getOrdersLogisticsTypeList({
          logistics_name: query,
          product_deliver_id: this.innerTemp3.product_deliver_id
        }).then(response => {
          this.logisticsTypeOptions = response.data.data;
          this.queryLogisticsTypeLoading = false;
        });
      }
    },
    resetSupportMember() {
      this.temp.product_weixin_id = undefined;
      this.productWeixinOptions = [];
      this.temp.product_weixin = {
        id: undefined,
        product_id: undefined,
        promotion_user_account_id: undefined,
        support_user_account_id: undefined,
        promotion_channel_id: undefined,
        weixin_nickname: "",
        weixin_account: "",
        phone: "",
        qq: ""
      };
    },
    resetProductWeixinFans() {
      this.temp.product_weixin_fans_address_id = undefined;
      this.temp.product_weixin_fans_address = {
        id: undefined,
        product_weixin_fans_id: undefined,
        receive_name: "",
        phone: "",
        postcode: "",
        address: "",
        remark: ""
      };
    },
    getList() {
      this.tableLoading = "filtered";
      getOrdersList(this.listQuery).then(response => {
        this.list = response.data.data;
        console.log(this.list, 9999);
        this.total = response.data.total;
        this.tableLoading = "";
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getNeedManualHandleOrdersCountInfo();
    },
    handleSizeChange(val) {
      this.listQuery.page_size = val;
      this.getdatalist();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getdatalist();
    },
    handleModifyStatus(row, status) {
      uncheckOrders({ orders_id: row.id, status: status }).then(() => {
        this.$message({
          message: "取消订单成功",
          type: "success"
        });
        this.getList();
      });
    },
    handleCheckOrders() {
      const row = this.templs;
      this.createOrderObj.id = row.id;
      this.createOrderObj.remark = row.order_remark;
      this.createOrderObj.customer_id = row.customer_id;
      this.createOrderObj.receive_name = row.receive_info.receive_name;
      this.createOrderObj.province = row.receive_info.province;
      this.createOrderObj.phone = row.receive_info.phone;
      this.createOrderObj.city = row.receive_info.city;
      this.createOrderObj.district = row.receive_info.district;
      this.createOrderObj.address = row.receive_info.address;
      this.createOrderObj.if_default = row.receive_info.if_default;
      this.product_infosl = row.product_info;
      this.$confirm("确认订单信息无误", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          createCustomerAddress(this.createOrderObj).then(response => {
            this.customer_address_id = response.data.id;
            if (response.code == 200) {
              updatePreparedOrders({
                customer_id: this.createOrderObj.customer_id,
                shop_goods: this.product_infosl
              }).then(res => {
                if (res.code == 200) {
                  lockOrders({
                    customer_id: this.createOrderObj.customer_id,
                    customer_address_id: this.customer_address_id,
                    remark: this.createOrderObj.remark
                  }).then(res => {
                    this.orders_id = res.data.id;
                    if (res.code == 200) {
                      finishShopReplacePurchase({
                        id: this.createOrderObj.id,
                        condition: 1
                      }).then(res => {
                        this.$notify({
                          title: "成功",
                          message: "生成订单成功",
                          type: "success"
                        });
                        this.getdatalist();
                        this.innerDialogOrderDetailVisibles = false;
                      });
                    }
                  });
                }
              });
            }

            console.log(response.code);
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    handleOpenOrdersDetail(row) {
      this.temp = Object.assign({}, row);
      this.innerDialogOrderDetailVisible = true;
    },
    handleResultOrders(row) {
      const tempParms = {
        orders_id: row.id
      };
      resultOrders(tempParms).then(res => {
        row.status = 7;
      });
    },
    handleDestoryOrders(row) {
      this.$confirm("此操作将永久删除该订单, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const tempParms = {
            orders_id: row.id
          };
          destroyOrders(tempParms)
            .then(res => {
              this.getList();
            })
            .catch(() => {});
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    resetTemp() {
      this.showReceiverForm = false;
      this.temp_receiver_info = "";
      this.calculated_freight = 0;
      this.temp = {
        id: undefined,
        is_promotion: 1,
        customer: undefined,
        shop_goods: [],
        customer_address_id: undefined,

        create_orders_type: 1,
        orders_unique_id: "",
        support_user_account_id: undefined,
        product_weixin_id: undefined,
        price_total: undefined,
        actual_pay: 0.0,
        status: 1,
        warehouse_id: undefined,
        deliver_date: new Date(),
        orders_items: [],
        support_member: {
          id: undefined,
          user_id: undefined,
          nickname: "",
          head_img: "",
          user_account_type_id: undefined,
          user_account_group_id: undefined,
          user_account_role_id: undefined,
          status: undefined
        },
        product_weixin: {
          id: undefined,
          weixin_nickname: "",
          weixin_account: "",
          info: ""
        },
        orders_receiver_info: {
          id: undefined,
          city: "",
          province: "",
          district: "",
          city_name: "",
          district_name: "",
          province_name: "",
          receive_name: "",
          order_remark: "",
          address: "",
          phone: "",
          postcode: "",
          remark: "",
          regions: []
        },
        array: [],
        arr: "",
        product_weixin_fans: {
          id: undefined,
          product_weixin_id: undefined,
          weixin_account: "",
          product_weixin: {}
        },
        orders_remarks: [],
        orders_payment: {
          id: undefined,
          orders_id: undefined,
          payment_total: undefined,
          status: 1,
          orders_payment_items: []
        },
        orders_logistics: {
          id: undefined,
          logistics_type_id: undefined,
          logistics_name: "",
          logistics_number: "",
          orders_logistics_type: {
            code: ""
          }
        },
        fans_join_time: "",
        changed_price: undefined
      };
      // if (this.$store.state.user.roles === 'support') {
      //   this.temp.support_member.id = this.$store.state.user.user_account_id
      //   this.temp.support_member.nickname = this.$store.state.user.name
      // }
    },
    handleCreate() {
      this.resetTemp();
      this.stepStatus = "create";
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm1"].clearValidate();
      });
    },

    handleUpdate(row) {
      this.stepStatus = "update";
      this.temp_receiver_info = "";
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.showReceiverForm = true;
      this.temp.orders_receiver_info.regions = [
        parseInt(this.temp.orders_receiver_info.province),
        parseInt(this.temp.orders_receiver_info.city),
        parseInt(this.temp.orders_receiver_info.district)
      ];
      this.$nextTick(() => {
        this.$refs["dataForm1"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm1"].validate(valid => {
        if (valid) {
          this.temp.receive_name = this.temp.orders_receiver_info.receive_name;
          this.temp.phone = this.temp.orders_receiver_info.phone;
          this.temp.address = this.temp.orders_receiver_info.address;
          this.temp.province = this.temp.orders_receiver_info.regions[0];
          this.temp.city = this.temp.orders_receiver_info.regions[1];
          this.temp.district = this.temp.orders_receiver_info.regions[2];
          const tempData = Object.assign({}, this.temp);
          tempData.orders_id = this.temp.id;
          tempData.support_user_account_id = this.temp.support_member.id;
          if (this.temp.product_weixin) {
            tempData.product_weixin_id = this.temp.product_weixin.id;
          }
          if (this.temp.product_weixin_fans) {
            tempData.product_weixin_fans_id = this.temp.product_weixin_fans.id;
          }
          updateOrders(tempData).then(() => {
            this.getList();
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleCashOnDeliveryPaidMoney() {
      let totalPayMoney = 0.0;
      console.log(this.temp.orders_payment.orders_payment_items);
      for (const v of this.temp.orders_payment.orders_payment_items) {
        if (
          v.orders_pay_type.type_code !== "cash_on_delivery" &&
          v.status !== 2
        ) {
          totalPayMoney += parseFloat(v.paid_money);
        }
      }
      let cashOnDeliveryPaidMoney = this.temp.actual_pay - totalPayMoney;
      cashOnDeliveryPaidMoney =
        cashOnDeliveryPaidMoney > 0 ? cashOnDeliveryPaidMoney : 0.0;
      for (const v of this.temp.orders_payment.orders_payment_items) {
        if (v.orders_pay_type.type_code === "cash_on_delivery") {
          v.paid_money = cashOnDeliveryPaidMoney;
          const index = this.temp.orders_payment.orders_payment_items.indexOf(
            v
          );
          this.temp.orders_payment.orders_payment_items.splice(index, 1, v);
        }
      }
    },
    updateActualPayData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.temp.actual_pay = this.tempactual_pay.actual_pay;
          const tempData = Object.assign({}, this.temp);
          tempData.orders_id = this.temp.id;
          tempData.actual_pay = this.temp.actual_pay;
          updateOrdersActualPay(tempData).then(() => {
            this.handleCashOnDeliveryPaidMoney();
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v);
                this.list.splice(index, 1, this.temp);
                break;
              }
            }
            bus.$emit("upDateRealTimeRanking");
            this.actualPayEditable = false;
          });
        }
      });
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const ttempData = {
            product_id: row.id
          };
          deleteProduct(ttempData).then(response => {
            this.$notify({
              title: "成功",
              message: "删除成功",
              type: "success",
              duration: 2000
            });
            const index = this.list.indexOf(row);
            this.list.splice(index, 1);
            this.total--;
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    handleOpenInner1(row) {
      console.log(row);
      this.stepStatus = "update";
      this.innerTableVisible1 = true;
      this.dialogStatus = "update";
      this.innerTableTitle1 = row.orders_unique_id.slice(-8) + " 商品列表";
      this.temp = Object.assign({}, row); // copy obj
      this.$nextTick(() => {
        this.getOrdersItemList();
      });
    },
    getOrdersItemList() {
      this.ordersItemLoading = true;
      getOrdersItemList({ orders_id: this.temp.id }).then(res => {
        this.orders_items = res.data.data;

        this.ordersItemLoading = false;
        this.innerTableKey1++;
      });
    },
    getInnerList1() {
      this.innerListQuery1.product_id = this.temp.id;
      this.innerTemp1.product_id = this.temp.id;
      this.innerListLoading1 = true;
      getProductTemplateList(this.innerListQuery1).then(response => {
        this.innerList1 = response.data.data;
        this.innerTotal1 = response.data.total;
        this.innerListLoading1 = false;
      });
    },
    handleInnerFilter1() {
      this.innerListQuery1.page = 1;
      this.getInnerList1();
    },
    handleInnerSizeChange1(val) {
      this.innerListQuery1.page_size = val;
      this.getInnerList1();
    },
    handleInnerCurrentChange1(val) {
      this.innerListQuery1.page = val;
      this.getInnerList1();
    },
    resetInnerTemp1() {
      this.innerTemp1 = {
        id: undefined,
        product_goods: {
          id: undefined
        },
        warehouse_id: undefined,
        product_id: undefined,
        number: ""
      };
    },
    handleInnerCreatePro() {
      this.addGoodsIf = 1;
      this.resetInnerTemp1();
      this.dialogStatus = "create";
      this.innerDialogFormVisible1 = true;
      this.shopGoodsOptions = [];
      this.selectedShopGoods = undefined;
      this.selectedShopGoodsNumber = 1;
      this.$nextTick(() => {
        this.$refs["innerDataForm1"].clearValidate();
      });
    },
    handleInnerCreate1() {
      this.resetInnerTemp1();
      this.dialogStatus = "create";
      this.innerDialogFormVisible1 = true;
      this.shopGoodsOptions = [];
      this.selectedShopGoods = undefined;
      this.selectedShopGoodsNumber = 1;
      this.$nextTick(() => {
        this.$refs["innerDataForm1"].clearValidate();
      });
    },
    createInnerData1() {
      // if(this.addGoodsIf === 1){
      //   console.log(this.product_info)
      //   console.log(this.selectedShopGoods)
      //   this.selectedShopGoods.number = this.selectedShopGoodsNumber
      //   let addObj = {}
      //   addObj.number = this.selectedShopGoodsNumber
      //   addObj.goods_info = this.selectedShopGoods

      //   addObj.goods_info.goods_title = this.selectedShopGoods.shop_goods_common.goods_title
      //   this.product_info.push(addObj)
      //   this.selectedShopGoods.goods_info.goods_title = this.selectedShopGoods.shop_goods_common.goods_title

      //   this.innerDialogFormVisible1 = false
      //   this.order_pay += this.selectedShopGoods.actual_price * this.selectedShopGoods.number / 1
      //   this.all_pay += this.selectedShopGoods.actual_price * this.selectedShopGoods.number / 1
      //   this.getGoodsFreight()
      // }
      // this.temp.shop_goods.push({ goods_info: this.selectedShopGoods, number: this.selectedShopGoodsNumber })
      // this.getGoodsFreight()
      // this.innerDialogFormVisible1 = false

      getGoodsFreight({ shop_goods: this.temp.shop_goods }).then(res => {
        console.log(res,'大数组')
        this.freights = res.data.freight;
        console.log(this.freights,'运费')
        this.goods_info = this.temp.shop_goods;
        console.log(this.goods_info, "数组");
        this.all_pay = 0;
        this.order_pay = 0;
        this.oderNum = []
        this.oderNums = []
        this.goods_info.map(item => {
          this.oderNums.push((item.goods_info.actual_price * item.number) / 1 );
          this.oderNum.push((item.goods_info.actual_price  * item.number ) / 1  + this.freights);
          this.order_pay = this.oderNums.reduce((x,y)=>x+y) //数组求和方法
          this.all_pay = this.oderNum.reduce((x,y)=>x+y)
        });
      });





      this.temp.shop_goods.push({
        goods_info: this.selectedShopGoods,
        number: this.selectedShopGoodsNumber
      });
      this.getGoodsFreight();
      this.innerDialogFormVisible1 = false;
    },
    handleInnerUpdate1(row) {
      this.innerTemp1 = Object.assign({}, row); // copy obj
      this.productGoodsOptions = [];
      this.productGoodsOptions.push(row.product_goods);
      this.dialogStatus = "update";
      this.innerDialogFormVisible1 = true;
      this.$nextTick(() => {
        this.$refs["innerDataForm1"].clearValidate();
      });
    },
    // 修改订单商品
    updateInnerData1() {
      this.$refs["innerDataForm1"].validate(valid => {
        if (valid) {
          this.btnLoading = true;
          const params = Object.assign({}, this.innerTemp1);
          params.orders_item_id = this.innerTemp1.id;
          params.product_goods_id = this.innerTemp1.product_goods.id;
          updateOrdersItem(params)
            .then(() => {
              this.getOrdersItemList();
              this.getList();
              this.innerDialogFormVisible1 = false;
              this.btnLoading = false;
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000
              });
            })
            .catch(() => {
              this.btnLoading = false;
            });
        }
      });
    },
    handleInnerDelete1(row) {
      this.$confirm("确定删除订单商品?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteOrdersItem({
            orders_item_id: row.id,
            orders_id: this.temp.id
          }).then(res => {
            this.$message.success("删除成功");
            this.getOrdersItemList();
            this.getList();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    handleOpenInner2(row) {
      this.innerTableVisible2 = true;
      this.innerTableTitle2 = row.orders_unique_id.slice(-8) + " -- 备注";
      this.temp = Object.assign({}, row);
      // this.getInnerList1()
    },
    handleInnerSizeChange3(val) {
      this.innerListQuery3.page_size = val;
      this.getInnerList3();
    },
    handleInnerCurrentChange3(val) {
      this.innerListQuery3.page = val;
      this.getInnerList3();
    },
    getInnerList3() {
      this.innerListQuery3.orders_id = this.temp.id;
      this.innerListLoading3 = true;
      getOrdersLogsList(this.innerListQuery3).then(response => {
        this.innerList3 = response.data.data;
        this.innerTotal3 = response.data.total;
        this.innerListLoading3 = false;
      });
    },
    handleOpenInner3(row) {
      this.innerTableVisible3 = true;
      this.innerTableTitle3 = row.orders_unique_id.slice(-8) + " -- 订单日志";
      this.temp = Object.assign({}, row); // copy obj
      this.getInnerList3();
    },
    resetInnerTemp2() {
      this.innerTemp2 = {};
    },
    handleInnerCreate2() {
      this.resetInnerTemp2();
      this.dialogStatus = "create";
      this.innerDialogFormVisible2 = true;
      this.$nextTick(() => {
        this.$refs["innerDataForm1"].clearValidate();
      });
    },
    createInnerData2() {
      this.$refs["innerDataForm2"].validate(valid => {
        if (valid) {
          this.btnLoading = true;
          this.innerTemp2.orders_id = this.temp.id;
          createOrdersRemark(this.innerTemp2)
            .then(response => {
              this.innerTotal2++;
              this.innerTemp2.id = response.data.id;
              this.innerTemp2.type_name = response.data.type_name;
              this.innerTemp2.status = 1;
              this.innerTemp2.type = 1;
              this.innerTemp2.updated_at = response.data.updated_at;
              this.temp.orders_remarks.push(this.innerTemp2);
              this.innerDialogFormVisible2 = false;
              this.btnLoading = false;
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
            })
            .catch(() => {
              this.btnLoading = false;
            });
        }
      });
    },
    handleInnerDelete2(row) {
      this.$confirm("确定删除此备注?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const ttempData = Object.assign({}, row); // copy obj
          ttempData.orders_remark_id = row.id;
          deleteOrdersRemark(ttempData).then(response => {
            this.$notify({
              title: "成功",
              message: "删除成功",
              type: "success",
              duration: 2000
            });
            ttempData.status = 0;
            const index = this.temp.orders_remarks.indexOf(row);
            this.temp.orders_remarks.splice(index, 1, ttempData);
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    resetInnerTemp3() {
      this.innerTemp3 = {
        id: undefined,
        logistics_type_id: undefined,
        product_deliver_extra_id: undefined,
        product_deliver_id: undefined,
        logistics_name: "",
        logistics_number: "",
        orders_logistics_type: {
          id: undefined,
          name: "",
          code: "",
          status: undefined
        }
      };
    },
    handleInnerUpdate3(row) {
      this.logisticsTypeOptions = [];
      this.tempProductId = row.product_id;
      this.temp = Object.assign({}, row);
      this.dialogStatus = "update";
      this.innerDialogFormVisible3 = true;
      if (row.orders_logistics.id !== 0) {
        this.logisticsTypeOptions.push({
          id: row.orders_logistics.orders_logistics_type.id,
          name: row.orders_logistics.orders_logistics_type.name,
          code: row.orders_logistics.orders_logistics_type.code
        });
        if (row.orders_logistics.product_deliver_extra_id !== null) {
          this.productDeliverExtraOptions = [
            {
              id: row.orders_logistics.product_deliver_extra.id,
              description:
                row.orders_logistics.product_deliver_extra.description
            }
          ];
        }
        this.productDeliverOptions = [
          {
            id: row.orders_logistics.product_deliver.id,
            name: row.orders_logistics.product_deliver.name
          }
        ];
        this.innerTemp3 = Object.assign({}, row.orders_logistics);
      } else {
        this.resetInnerTemp3();
        this.productDeliverOptions = [];
        this.logisticsTypeOptions = [];
        this.innerTemp3.orders_logistics_type = "";
      }
      this.$nextTick(() => {
        this.$refs["innerDataForm3"].clearValidate();
      });
    },
    createInnerData3() {
      this.$refs["innerDataForm3"].validate(valid => {
        if (valid) {
          const tempData = this.innerTemp3;
          tempData.orders_id = this.temp.id;
          tempData.logistics_type_id = this.innerTemp3.orders_logistics_type.id;
          updateOrdersLogistics(tempData).then(response => {
            this.temp.orders_logistics = tempData;
            this.innerDialogFormVisible3 = false;
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000
            });
            const index = this.list.findIndex(d => d.id === this.temp.id);
            this.list[index].orders_logistics = response.data;
          });
        }
      });
    },
    handleOpenPayProof() {
      this.innerTablePayProofVisible = true;
      this.ordersPayProofList = [];
      getOrdersPayProofList({
        paid_money: this.payProofQuery.paid_money,
        is_used: 0,
        pay_type_id: this.innerTemp5.orders_pay_type_id,
        orders_id: this.temp.id
      }).then(response => {
        this.ordersPayProofList = response.data.data;
      });
    },
    handleSelectPayProof(row) {
      this.innerTemp5.paid_money = row.paid_money;
      this.payProofImageUrl = row.image_url;
      this.innerTemp5.orders_pay_proof_id = row.id;
      this.innerTablePayProofVisible = false;
    },
    handleOpenAnotherInner5(row) {
      console.log(row);
      this.temp = Object.assign({}, row); // copy obj
      this.innerTableVisible5 = true;
      this.dialogStatus = "update";
      this.innerTableTitle5 =
        row.orders_unique_id.slice(-8) + " -- 编辑收款信息";
    },
    resetInnerTemp5() {
      this.innerTemp5 = {
        id: undefined,
        orders_pay_type: {
          type_name: undefined
        },
        orders_pay_type_id: undefined,
        paid_money: undefined,
        orders_pay_proof_id: undefined
      };
      this.payProofImageUrl = false;
    },
    handleInnerCreate5() {
      this.resetInnerTemp5();
      this.dialogStatus = "create";
      this.payTypeDisabled = false;
      this.innerDialogFormVisible5 = true;
      this.innerTemp5.orders_id = this.temp.id;
      this.$nextTick(() => {
        this.$refs["innerDataForm5"].clearValidate();
      });
    },
    createInnerData5() {
      this.$refs["innerDataForm5"].validate(valid => {
        if (valid) {
          this.btnLoading = true;
          createOrdersPaymentItem(this.innerTemp5)
            .then(response => {
              this.innerDialogFormVisible5 = false;
              this.innerTotal5++;
              this.innerTemp5.id = response.data.id;
              this.innerTemp5.status = response.data.status;
              this.innerTemp5.orders_pay_type_id = response.data.pay_type_id;
              this.innerTemp5.orders_pay_proof = response.data.orders_pay_proof;
              this.innerTemp5.updated_at = response.data.updated_at;
              this.innerTemp5.orders_pay_type.type_name =
                response.data.orders_pay_type.type_name;
              this.temp.orders_payment.orders_payment_items.push(
                this.innerTemp5
              );
              this.handleCashOnDeliveryPaidMoney();
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
              this.btnLoading = false;
            })
            .catch(() => {
              this.btnLoading = false;
            });
        }
      });
    },
    handleInnerUpdate5(row) {
      this.innerTemp5 = Object.assign({}, row); // copy obj
      this.payTypeDisabled = true;
      this.dialogStatus = "update";
      this.innerDialogFormVisible5 = true;
      this.innerTemp5.orders_payment_id = this.temp.orders_payment.id;
      this.innerTemp5.orders_pay_type_id = row.orders_pay_type.id;
      this.innerTemp5.orders_payment_item_id = row.id;
      this.$nextTick(() => {
        this.$refs["innerDataForm5"].clearValidate();
      });
    },
    updateInnerData5() {
      this.$refs["innerDataForm5"].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.innerTemp5);
          updateOrdersPaymentItem(tempData).then(response => {
            this.innerTemp5.updated_at = response.data.updated_at;
            for (const v of this.temp.orders_payment.orders_payment_items) {
              if (v.id === this.innerTemp5.id) {
                const index = this.temp.orders_payment.orders_payment_items.indexOf(
                  v
                );
                this.temp.orders_payment.orders_payment_items.splice(
                  index,
                  1,
                  this.innerTemp5
                );
                break;
              }
            }
            this.handleCashOnDeliveryPaidMoney();
            this.innerDialogFormVisible5 = false;
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleInnerDelete5(row) {
      this.$confirm("确定删除收款信息?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          row.status = 2;
          const tempData = {
            orders_payment_item_id: row.id,
            orders_id: this.temp.id
          };
          deleteOrdersPaymentItem(tempData).then(response => {
            this.$notify({
              title: "成功",
              message: "删除成功",
              type: "success",
              duration: 2000
            });
            const index = this.temp.orders_payment.orders_payment_items.indexOf(
              row
            );
            this.temp.orders_payment.orders_payment_items.splice(index, 1, row);
            this.handleCashOnDeliveryPaidMoney();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    handleOpenInner7(row) {
      if (row.status !== 10) {
        this.$confirm("申请退款将会影响业绩, 确定此订单发起申请退款?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            createDirectPromotionRefund({ orders_id: row.id }).then(
              response => {
                row.status = 10;
                this.openInnerDialog7(row);
              }
            );
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消退款申请"
            });
          });
      } else {
        this.openInnerDialog7(row);
      }
    },
    openInnerDialog7(row) {
      getDirectPromotionRefundInfo({ orders_id: row.id }).then(response => {
        this.innerTemp7.orders_id = row.id;
        this.innerTemp7 = response.data;
        this.innerDialogFormVisible7 = true;
      });
    },
    updateInnerData7() {
      const tempData = Object.assign({}, this.innerTemp7);
      updateDirectPromotionRefund(tempData).then(response => {
        this.innerDialogFormVisible7 = false;
        this.$notify({
          title: "成功",
          message: "更新成功",
          type: "success",
          duration: 2000
        });
      });
    },
    handleOpenImage(imageUrl) {
      this.publicImageUrl = imageUrl;
      this.imageDialogVisible = true;
    },
    checkPre(row) {
      console.log(row);
      this.tableDialogVisible = true;
      this.listQuery1.product_weixin_fans_id = row.product_weixin_fans_id;
      this.getList2();
    },
    getList2() {
      this.listLoading = true;
      getOrdersList(this.listQuery1).then(response => {
        this.list1 = response.data.data;
        this.total1 = response.data.total;
        this.listLoading = false;
      });
    },
    downExcel() {
      // console.log(this.listQuery.date_range)
      const form = document.createElement("form");
      form.action =
        process.env.BASE_API +
        "/api/orders/downloadSaleData" +
        "?token=" +
        this.$store.state.user.token;
      form.method = "post";
      form.style.display = "none";
      // 订单状态
      const orders_status = document.createElement("input");
      orders_status.name = "status";
      orders_status.value = this.listQuery.status;
      form.appendChild(orders_status);
      // 订单号
      const warehouse_id = document.createElement("input");
      warehouse_id.name = "warehouse_id";
      warehouse_id.value = this.listQuery.warehouse_id;
      form.appendChild(warehouse_id);
      // 订单号
      const orders_unique_id = document.createElement("input");
      orders_unique_id.name = "orders_unique_id";
      orders_unique_id.value = this.listQuery.orders_unique_id;
      form.appendChild(orders_unique_id);
      // 物流单号
      const orders_logistics_number = document.createElement("input");
      orders_logistics_number.name = "orders_logistics_number";
      orders_logistics_number.value = this.listQuery.orders_logistics_number;
      form.appendChild(orders_logistics_number);
      // 客服部门
      if (this.listQuery.support_user_account_group_id !== "") {
        const support_user_account_group_id = document.createElement("input");
        support_user_account_group_id.name = "support_user_account_group_id";
        support_user_account_group_id.value = this.listQuery.support_user_account_group_id;
        form.appendChild(support_user_account_group_id);
      }
      // 客服
      if (
        this.listQuery.support_user_account_id !== "" &&
        this.listQuery.support_user_account_id !== undefined
      ) {
        const support_user_account_id = document.createElement("input");
        support_user_account_id.name = "support_user_account_id";
        support_user_account_id.value = this.listQuery.support_user_account_id;
        form.appendChild(support_user_account_id);
      }
      // 搜索微信号
      const product_weixin_id = document.createElement("input");
      product_weixin_id.name = "product_weixin_id";
      product_weixin_id.value = this.listQuery.product_weixin_id;
      form.appendChild(product_weixin_id);
      // 产品
      const product_id = document.createElement("input"); // 产品名称
      product_id.name = "product_id";
      product_id.value = this.listQuery.product_id;
      form.appendChild(product_id);
      // 备注
      const remark = document.createElement("input");
      remark.name = "remark";
      remark.value = this.listQuery.remark;
      form.appendChild(remark);
      let hasTime = false;
      if (
        this.listQuery.date_range !== null &&
        this.listQuery.date_range !== undefined &&
        this.listQuery.date_range !== ""
      ) {
        hasTime = true;
        const date_range = document.createElement("input");
        const date_range2 = document.createElement("input");
        date_range.name = "date_range[0]";
        date_range.value = this.listQuery.date_range[0];
        date_range2.name = "date_range[1]";
        date_range2.value = this.listQuery.date_range[1];
        form.appendChild(date_range);
        form.appendChild(date_range2);

        const sdate = new Date(date_range.value);
        const now = new Date(date_range2.value);
        const days = now.getTime() - sdate.getTime();
        const day = parseInt(days / (1000 * 60 * 60 * 24));
        if (day > 31) {
          this.$message({
            type: "info",
            message: "最多只能导出30天数据"
          });
          return;
        }
      }
      if (
        this.listQuery.created_at !== null &&
        this.listQuery.created_at !== undefined &&
        this.listQuery.created_at !== ""
      ) {
        hasTime = true;
        const created_at = document.createElement("input");
        const created_at2 = document.createElement("input");
        created_at.name = "created_at[0]";
        created_at.value = this.listQuery.created_at[0];
        created_at2.name = "created_at[1]";

        created_at2.value = this.listQuery.created_at[1];
        form.appendChild(created_at);
        form.appendChild(created_at2);

        const sdate = new Date(created_at.value);
        const now = new Date(created_at2.value);
        const days = now.getTime() - sdate.getTime();
        const day = parseInt(days / (1000 * 60 * 60 * 24));
        if (day > 31) {
          this.$message({
            type: "info",
            message: "最多只能导出30天数据"
          });
          return;
        }
      }
      if (hasTime !== true) {
        this.$message({
          type: "info",
          message: "必须选择时间"
        });
        return;
      }
      // else {
      //   const date_range = document.createElement('input')
      //   const date_range2 = document.createElement('input')
      //   date_range.name = 'date_range[0]'
      //   date_range.value = parseTime(new Date(), '{y}-{m}-{d}')
      //   date_range2.name = 'date_range[1]'
      //   date_range2.value = parseTime(new Date(), '{y}-{m}-{d}')
      //   form.appendChild(date_range)
      //   form.appendChild(date_range2)
      //   // console.log(parseTime(new Date(), '{y}-{m}-{d}'))        // }

      const button = document.createElement("input");
      button.type = "submit";
      form.appendChild(button);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    }
    // getRemark(remake) {
    //   var remarks;
    //   // var remake = scope.row.orders_remarks;
    //   for(var i = 0; i<remake.length;i++ ){
    //     remarks += remake[i].remark
    //   }
    //   console.log(remarks)
    //   return remarks;
    // },
  },
  deactivated() {
    this.scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
  },
  activated() {
    window.scrollTo(0, this.scrollTop);
    if (
      this.$route.query.refresh !== undefined &&
      this.$route.query.refresh !== null
    ) {
      this.handleFilter();
    }
  }
};
</script>
<style scoped>
.el-tag {
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

.my-edit-type,
.my-edit-type:focus {
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
  color: #155bd4;
}

.label-span {
  font-weight: bold;
  color: #5e81bf;
}

.deleted-p {
  text-decoration: crimson underline overline line-through;
  text-decoration: underline overline line-through;
}
.grid-content {
  text-align: left;
  background-color: #edf2f9;
  color: #323233;
  padding: 15px 25px;
}
.filtered {
  -webkit-filter: url(#f1);
  filter: url(#f1);
}
.data-items {
  padding-left: 50px;
}
</style>
