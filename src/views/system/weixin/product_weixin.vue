<template xmlns="http://www.w3.org/1999/html">
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <div class="filter-item">
        <div class="filter-label">状态</div>
        <el-select  @change='handleFilter'
                    clearable
                    size="small"
                    style="width: 100px" v-model="listQuery.status"
                    placeholder="请选择">
          <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">微信号</div>
        <el-input @keyup.enter.native="handleFilter"
                  size="small"
                  style="width: 200px;"
                  placeholder=""
                  v-model="listQuery.weixin_account">
        </el-input>
      </div>
      <div class="filter-item">
        <div class="filter-label">备注</div>
        <el-input @keyup.enter.native="handleFilter"
                  style="width: 200px"
                  size="small"
                  placeholder="" v-model="listQuery.info">
        </el-input>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服部门</div>
        <el-cascader
          clearable
          size="small"
          change-on-select
          :options="userGroupTree"
          placeholder="请选择"
          :props="defaultPropsGroup"
          v-model="userGroupOptions"
          @change="">
        </el-cascader>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服</div>
        <el-select
          size="small"
          @focus="getSupportUserAccountList(' ')"
          @change='handleFilter'
          v-model="listQuery.support_user_account_id"
          clearable
          filterable
          remote
          placeholder="请选择"
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
        <div class="filter-label">财务部门</div>
        <el-cascader
          size="small"
          clearable
          style="width: 180px"
          change-on-select
          placeholder="请选择"
          :options="financeUserGroupTree"
          :props="defaultPropsGroup"
          v-model="financeUserGroupOptions">
        </el-cascader>
      </div>
      <div class="filter-item">
        <div class="filter-label">商品</div>
        <el-select
          style="width:120px;"
          size="small"
          @change='handleFilter'
          v-model="listQuery.product_id"
          filterable
          clearable
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
      <!--<el-select @change='handleFilter' style="width: 100px" class="filter-item" v-model="listQuery.sort" placeholder="排序">-->
        <!--<el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <div class="filter-item">
        <div class="filter-label">渠道</div>
        <el-select
          style="width:160px;"
          size="small"
          @change='handleFilter'
          v-model="listQuery.promotion_channel_id"
          filterable
          clearable
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
      <div class="filter-item">
        <div class="filter-label">推广人</div>
        <el-select
          @focus=""
          style="width:140px;"
          size="small"
          @change='handleFilter'
          v-model="listQuery.promotion_user_account_id"
          filterable
          clearable
          remote
          placeholder="请选择"
          :remote-method="queryPromotionMemberList"
          :loading="promotionUserAccountLoading">
          <el-option
            v-for="item in promotionMemberOptions"
            :key="item.id"
            :label="item.nickname"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
        <el-button class="filter-item" type="primary" size="small" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
        <el-button class="filter-item" type="primary" size="small" v-waves icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="昵称">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.weixin_nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="160px" align="left" label="联系方式">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">微信：{{scope.row.weixin_account}}</span><br>
          <span class="link-type" @click="handleUpdate(scope.row)">备注名：{{scope.row.info}}</span><br>
          <span class="link-type" @click="handleUpdate(scope.row)">QQ：{{scope.row.qq}}</span><br>
          <span class="link-type" @click="handleUpdate(scope.row)">电话：{{scope.row.phone}}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="二维码">
        <template slot-scope="scope">
            <span class="link-type" @click="handleOpenImage(scope.row.weixin_qrcode)">
              <img style="height:100%;width:100%;" :src="scope.row.weixin_qrcode"/>
            </span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="产品名称">
        <template slot-scope="scope">
          <span v-if="scope.row.product">{{scope.row.product.product_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="推广人">
        <template slot-scope="scope">
          <span v-if="scope.row.promotion_member">{{scope.row.promotion_member.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="120px" align="center" label="财务部门">
        <template slot-scope="scope">
          <span v-if="scope.row.finance_group">{{scope.row.finance_group.group_name}}</span><br/>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="客服">
        <template slot-scope="scope">
          <span v-if="scope.row.support_member">{{scope.row.support_member.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="渠道">
        <template slot-scope="scope">
          <span v-if="scope.row.promotion_channel">{{scope.row.promotion_channel.channel_name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="粉丝数">
        <el-table-column width="150px" align="center" :label="'合计: ' + listFansTotal">
          <template slot-scope="scope" >
            <change-number :number="scope.row.fans_total"
                           style="font-size: 20px"
                           class="link-type"
                           @success="updateEditFansTotal($event, scope.row)">
            </change-number>
            <!--<span v-if="!scope.row.edit" @click="editFansTotal(scope.row)" class="link-type" style="font-size: 20px">{{scope.row.fans_total}}</span>-->
            <!--<el-input-number controls-position="right" v-else v-model="temp_fans_total" :min="0" ref="edit" @keyup.enter.native="updateEditFansTotal(scope.row)"></el-input-number>-->
            <!--<el-button v-if="scope.row.edit" @click="updateEditFansTotal(scope.row)" type="success" size="small" style="margin-top: 5px">确定</el-button>-->
            <!--<el-button v-if="scope.row.edit" @click="scope.row.edit = 0" type="warning" size="small" style="margin-top: 5px">取消</el-button>-->
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column width="100px" align="center" label="告警阀值">
        <template slot-scope="scope">
          <span>{{scope.row.threshold}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status===1 || scope.row.status===2 || scope.row.status===3" size="small" type="gray" @click="handleModifyStatus(scope.row,0)">冻结
          </el-button>
          <el-button v-if="scope.row.status===0" size="small" type="success" @click="handleModifyStatus(scope.row,1)">开启
          </el-button>
          <el-button v-if="scope.row.status===0" size="small" type="error" @click="handleModifyStatus(scope.row,3)">关闭
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="info" size="mini" @click="handleOpenInner1(scope.row)">修改记录</el-button>
          <!-- <el-button type="primary" size="mini" @click="handleroos(scope.row)">维码</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="微信昵称" prop="weixin_nickname">
          <el-input v-model="temp.weixin_nickname"></el-input>
        </el-form-item>
        <el-form-item label="微信号" prop="weixin_account">
          <el-input v-model="temp.weixin_account"></el-input>
        </el-form-item>
        <el-form-item label="备注名" prop="info">
          <el-input v-model="temp.info"></el-input>
        </el-form-item>
        <el-form-item label="QQ" prop="qq">
          <el-input v-model="temp.qq"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="temp.phone"></el-input>
        </el-form-item>
        <el-form-item label="推广商品" prop="product">
          <multiselect v-model="temp.product" :options="productOptions" @search-change="queryProductList" placeholder="搜索商品" selectLabel="选择"
                       deselectLabel="删除" track-by="product_name" :internalSearch="false" label="product_name">
            <span slot='noResult'>无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="财务部门" prop="finance_group">
          <multiselect v-model="temp.finance_group" :options="financeGroupOptions" @search-change="queryFinanceGroupList"
                       placeholder="搜索财务部门" selectLabel="选择" deselectLabel="删除" track-by="group_name" :internalSearch="false" label="group_name">
            </multiselect>
        </el-form-item>
        <el-form-item label="推广人" prop="promotion_member">
          <multiselect v-model="temp.promotion_member" :options="promotionMemberOptions" @input="resetPromotionChannel" @search-change="queryPromotionMemberList" placeholder="搜索推广人" selectLabel="选择"
                       deselectLabel="删除" track-by="nickname" :internalSearch="false" label="nickname">
            <span slot='noResult'>无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="推广渠道" prop="promotion_channel">
          <multiselect v-model="temp.promotion_channel" :options="promotionChannelOptions" @search-change="queryPromotionChannelList" placeholder="搜索渠道" selectLabel="选择"
                       deselectLabel="删除" track-by="channel_name" :internalSearch="false" label="channel_name">
            <span slot='noResult'>无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="客服" prop="support_member">
          <multiselect v-model="temp.support_member" :options="supportMemberOptions" @search-change="querySupportMemberList" placeholder="搜索客服" selectLabel="选择"
                       deselectLabel="删除" track-by="nickname" :internalSearch="false" label="nickname">
            <span slot='noResult'>无结果</span>
          </multiselect>
        </el-form-item>

        <el-form-item label="告警阀值" prop="threshold">
          <el-input v-model="temp.threshold"></el-input>
        </el-form-item>

        <el-form-item label="二维码">
          <el-upload
            :action="uploadUrl"
            list-type="picture-card"
            v-model="temp.weixin_qrcode"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handlePictureSuccess"
            name="image">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="innerTableTitle1" :visible.sync="innerTableVisible1" width="90%" >
      <!--<div class="filter-container" align="right">-->
        <!--<el-button align="right" class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate1" type="primary" icon="el-icon-edit">添加</el-button>-->
      <!--</div>-->

      <el-table :stripe="true" :key='innerTableKey1' :data="innerList1" v-loading="innerListLoading1" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作人" min-width="120">
          <template slot-scope="scope">
            <span>{{scope.row.type_name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="300">
          <template slot-scope="scope">
            <span v-for="(item, index) in scope.row.change_content" :key="index">{{item}}<br/></span>
          </template>
        </el-table-column>
        <!--<el-table-column min-width="100px" align="center" label="名称">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link-type" @click="handleInnerUpdate1(scope.row)">{{scope.row.name}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column width="180px" align="center" label="时间">-->
          <!--<template slot-scope="scope">-->
            <!--<span>{{scope.row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column align="center" label="操作" width="320" class-name="small-padding">-->
          <!--<template slot-scope="scope">-->
            <!--<el-button type="primary" size="mini" @click="handleInnerUpdate1(scope.row)">编辑</el-button>-->
            <!--<el-button size="mini" type="danger" @click="handleInnerDelete1(scope.row)">删除-->
            <!--</el-button>-->
          <!--</template>-->
        <!--</el-table-column>-->
      </el-table>

      <div v-show="!innerListLoading1" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange1" @current-change="handleInnerCurrentChange1" :current-page.sync="innerListQuery1.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery1.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal1">
        </el-pagination>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible1">
      <el-form :rules="innerRules1" ref="innerDataForm1" :model="innerTemp1" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="名称" prop="name">
          <el-input v-model="innerTemp1.name"></el-input>
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 100}" placeholder="请输入内容" v-model="innerTemp1.code">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible1 = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createInnerData1">确 定</el-button>
        <el-button v-else type="primary" @click="updateInnerData1">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="imageDialogVisible">
      <img width="100%" :src="publicImageUrl">
    </el-dialog>
        <!-- 二维码弹框 -->

    <!-- <el-dialog :visible.sync="outerVisible" width="50%">
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="innerVisibles">上传</el-button>
      </div>
      <el-table :data="roost" border v-loading="outerTable" height="500"  style="overflow: auto;max-height:500px;">
        <el-table-column property="id" label="序号" align="center"></el-table-column>
        <el-table-column property="name" label="名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column property label="二维码" align="center">
          <template slot-scope="scope">
            <img style="width:50px;height:50px;" :src="scope.row.qrcode" alt />
          </template>
        </el-table-column>
        <el-table-column property="click" label="点击次数" align="center"></el-table-column>
        <el-table-column property label="状态" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusTrans">{{scope.row.status | statusTrans}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column property="created_at" label="时间" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="操作" width="150" class-name="small-padding">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="updatas(scope.row)">修改</el-button>
            <el-button type="primary" size="mini" @click="deletes(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog width="30%" :visible.sync="innerVisible" append-to-body title="创建">
        <el-form ref="forms" :model="loginForms">
          <el-form-item label="名称 :">
            <el-input v-model="loginForms.name"></el-input>
          </el-form-item>
          <el-form-item label="状态 :">
            <el-radio-group v-model="loginForms.status" size="small">
              <el-radio-button label="1">开启</el-radio-button>
              <el-radio-button label="2">关闭</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <el-upload
          :action="baseUrl"
          name="image"
          list-type="picture-card"
          :file-list="fileList"
          :on-remove="handleRemove"
          :before-upload="beforeAvatarUpload"
          :on-success="handleUp"
          multiple
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <span>只能上传jpg/png文件,图片大小不能超过１M</span>
        <div slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">取 消</el-button>
          <el-button type="primary" @click="praevsor()">确 定</el-button>
        </div>
      </el-dialog>
    </el-dialog> -->
  </div>

</template>

<script>
import { deleteDomain, createDomainExtraCode, updateDomainExtraCode, deleteDomainExtraCode } from '@/api/domain'
import { getProductWeixinList, createProductWeixin, updateProductWeixin, getProductWeixinLogsList } from '@/api/product_weixin'
import { getProductList, erweima,chuangjian,deletesl,xiangqing,xiugai } from '@/api/product'
import { getFinanceGroupList, getFinanceMemberList, getFinanceGroupTree } from '@/api/financial'
import { getPromotionChannelList } from '@/api/promotion_channel'
import { getPromotionMemberList } from '@/api/promotion_member'
import { getSupportMemberList, getSupportGroupList } from '@/api/support_member'
import waves from '@/directive/waves' // 水波纹指令
import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css
import changeNumber from '@/components/ChangeNumber'

export default {
  name: 'wxAccountManagement',
  components: { Multiselect, changeNumber },
  directives: {
    waves
  },
  data() {
    return {
      row:{},
      outerVisible:false,
      innerVisiblesl: false,
      scrollTop: 0,
      tableKey: 0,
      list: [],
      total: null,
      listLoading: true,
      edit_fans_total: undefined,
      uploadUrl: process.env.BASE_API + '/api/document/uploadImage',
      publicImageUrl: '',
      imageDialogVisible: false,
       userid: "",
      listQuery: {
        page: 1,
        page_size: 20,
        weixin_qrcode: '',
        product_id: undefined,
        promotion_channel_id: undefined,
        promotion_user_account_id: undefined,
        finance_group_id: undefined,
        support_user_account_id: undefined,
        support_user_account_group_id: undefined,
        weixin_nickname: '',
        weixin_account: '',
        product_name: '',
        promotion_member_nickname: '',
        support_member_nickname: '',
        channel_name: '',
        status: undefined,
        info: ''
      },
      loginFormsls: {
        name: "",
        status: 1,
        qrcode: "",
        customer_id: ""
      },
      supportUserAccountLoading: false,
      supportUserAccountOptions: [],
      productLoading: false,
      promotionUserAccountLoading: false,
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
      statusOptions: [{ label: '冻结', key: 0 }, { label: '开启', key: 1 }, { label: '告警', key: 2 }, { label: '关闭', key: 3 }],
      userAccountOptions: [],
      userChannelOptions: [],
      userAccountLoading: false,
      userPromotionChannelLoading: false,
      showAuditor: false,
      userGroupOptions: [],
      userGroupTree: [],
      defaultPropsGroup: {
        children: 'child',
        label: 'group_name',
        value: 'id'
      },
      temp: {
        id: undefined,
        weixin_nickname: '',
        weixin_account: '',
        phone: '',
        qq: '',
        info: '',
        weixin_qrcode: '',
        product: {
          id: undefined,
          product_name: ''
        },
        finance_group: {
          id: undefined,
          group_name: ''
        },
        promotion_channel: {
          id: undefined,
          channel_name: ''
        },
        promotion_member: {
          id: undefined,
          nickname: ''
        },
        support_member: {
          id: undefined,
          nickname: ''
        },
        fans_total: undefined,
        threshold: undefined,
        status: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        domain_name: [{ required: true, message: '请正确填写域名名称', trigger: 'change' }]
      },

      innerList1: null,
      innerTotal1: null,
      innerTableKey1: 1,
      innerTableTitle1: '',
      innerListQuery1: {
        page: 1,
        page_size: 5,
        product_weixin_id: undefined,
        sort: '-id'
      },
      innerTemp1: {
        id: undefined,
        domain_id: undefined,
        name: '',
        code: ''
      },
      temp_fans_total: undefined,
      innerListLoading1: false,
      innerTableVisible1: false,
      innerDialogFormVisible1: false,
      innerRules1: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      financeUserGroupOptions: [],
      financeUserGroupTree: [],
      financeMemberOptions: [],
      productOptions: [],
      promotionUserAccountOptions: [],
      promotionChannelOptions: [],
      promotionMemberOptions: [],
      supportMemberOptions: [],
      SupportMemberLoading: false,
      financeGroupOptions: []
    }
  },
  computed: {
    listFansTotal() {
      let total = 0
      this.list.forEach(item => {
        total += item.fans_total
      })
      return total
    }
  },
  watch: {
    temp_fans_total(val) {
      if (val === '') {
        this.temp_fans_total = 0
      }
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'gray',
        1: 'success',
        2: 'danger',
        3: 'danger'
      }
      return statusMap[status]
    },
    statusTranslator(status) {
      const statusTransMap = {
        0: '冻结',
        1: '开启',
        2: '告警',
        3: '关闭'
      }
      return statusTransMap[status]
    }
  },
  created() {
    this.getList()
    this.getUserGroupTree()
    this.getProductList(' ')
    this.queryPromotionMemberList(' ')
    this.getUserChannelList(' ')
    this.getFinanceUserGroupTree()
  },
  methods: {
    async handleroos(row) {
      this.roost=null
      this.row = row;
      console.log(this.row,1111111)
      this.outerTable=true
      this.outerVisible = true;
      const roos = await erweima({ customer_id: row.customer_id });
      this.roost = roos.data;
      this.outerTable=false
    },

    getFinanceUserGroupTree() {
      getFinanceGroupTree().then(response => {
        this.financeUserGroupTree = this.formatFinanceUserGroupTree(response.data)
      })
    },
    formatFinanceUserGroupTree(tree) {
      const Group = tree.map(item => {
        if (item.child.length > 0) {
          item.child = this.formatFinanceUserGroupTree(item.child)
          return item
        } else {
          delete item.child
          return item
        }
      })
      return Group
    },
    handleGroupFilter() {
      this.userAccountOptions = []
      this.listQuery.support_user_account_id = undefined
      this.getUserAccountList(' ')
      this.handleFilter()
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
    getProductList(query) {
      if (query !== '') {
        this.productLoading = true
        getProductList({ product_name: query, is_promote: 1 }).then(response => {
          this.productOptions = response.data.data
          this.productLoading = false
        })
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
    queryProductList(query) {
      getProductList({ product_name: query }).then(response => {
        if (!response.data.data) return
        this.productOptions = response.data.data.map(v => ({
          id: v.id,
          product_name: v.product_name
        }))
      })
    },
    queryFinanceGroupList(query) {
      getFinanceGroupList().then(response => {
        if (!response.data) return
        this.financeGroupOptions = response.data.map(v => ({
          id: v.id,
          group_name: v.group_name
        }))
      })
    },
    queryFinanceMemberList(query) {
      getFinanceMemberList({ nickname: query }).then(response => {
        if (!response.data.data) return
        this.financeMemberOptions = response.data.data.map(v => ({
          id: v.id,
          nickname: v.nickname
        }))
        console.log(response.data.data)
      })
    },
    queryPromotionChannelList(query) {
      const promotion_member_id = this.temp.promotion_member.id
      if (promotion_member_id) {
        getPromotionChannelList({ channel_name: query, promotion_user_account_id: promotion_member_id }).then(response => {
          if (!response.data.data) return
          this.promotionChannelOptions = response.data.data.map(v => ({
            id: v.id,
            channel_name: v.channel_name
          }))
        })
      }
    },
    queryPromotionMemberList(query) {
      this.resetPromotionChannel()
      getPromotionMemberList({ nickname: query }).then(response => {
        if (!response.data.data) return
        this.promotionMemberOptions = response.data.data.map(v => ({
          id: v.id,
          nickname: v.nickname
        }))
      })
    },
    querySupportMemberList(query) {
      getSupportMemberList({ nickname: query, status: 1 }).then(response => {
        if (!response.data.data) return
        this.supportMemberOptions = response.data.data.map(v => ({
          id: v.id,
          nickname: v.nickname
        }))
      })
    },
    resetPromotionChannel() {
      this.promotionChannelOptions = []
      this.temp.promotion_channel = {
        id: undefined,
        channel_name: ''
      }
    },
    getList() {
      this.listLoading = true
      this.listQuery.support_user_account_group_id = this.userGroupOptions[this.userGroupOptions.length - 1]
      this.listQuery.finance_group_id = this.financeUserGroupOptions[this.financeUserGroupOptions.length - 1]
      getProductWeixinList(this.listQuery).then(response => {
        this.list = response.data.data.map(item => {
          return Object.assign({ edit: 0 }, item)
        })
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
      tempData.product_weixin_id = row.id
      tempData.status = status
      updateProductWeixin(tempData).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        for (const v of this.list) {
          if (v.id === row.id) {
            const index = this.list.indexOf(v)
            v.status = status
            this.list.splice(index, 1, v)
            break
          }
        }
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        weixin_nickname: '',
        weixin_account: '',
        phone: '',
        qq: '',
        product: {
          id: undefined,
          product_name: ''
        },
        promotion_channel: {
          id: undefined,
          channel_name: ''
        },
        promotion_member: {
          id: undefined,
          nickname: ''
        },
        support_member: {
          id: undefined,
          nickname: ''
        },
        fans_total: undefined,
        threshold: undefined,
        status: undefined
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
          this.temp.promotion_channel_id = this.temp.promotion_channel.id
          this.temp.promotion_user_account_id = this.temp.promotion_member.id
          this.temp.product_id = this.temp.product.id
          this.temp.support_user_account_id = this.temp.support_member.id
          this.temp.finance_group_id = this.temp.finance_group.id
          createProductWeixin(this.temp).then(response => {
            this.temp.id = response.data.id
            this.temp.status = 1
            this.temp.fans_total = 0
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
    editFansTotal(row) {
      if (this.list.find(item => item.edit === 1)) {
        this.list.find(item => item.edit === 1).edit = 0
      }
      this.temp_fans_total = row.fans_total
      this.temp = Object.assign({}, row) // copy obj
      row.edit = 1
      this.$nextTick(() => {
        this.$refs['edit'].focus()
      })
    },
    updateEditFansTotal(e, row) {
      const tempData = {
        product_weixin_id: row.id,
        fans_total: e
      }
      updateProductWeixin(tempData).then(() => {
        row.fans_total = e
        this.$message({
          type: 'success',
          message: '修改成功'
        })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.product_weixin_id = this.temp.id
          tempData.promotion_channel_id = this.temp.promotion_channel.id
          tempData.promotion_user_account_id = this.temp.promotion_member.id
          tempData.product_id = this.temp.product.id
          tempData.support_user_account_id = this.temp.support_member.id
          tempData.fans_total = this.temp_fans_total
          tempData.finance_group_id = this.temp.finance_group.id
          updateProductWeixin(tempData).then(() => {
            this.getList()
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
          domain_id: row.id
        }
        deleteDomain(ttempData).then(response => {
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
      this.innerTableTitle1 = row.weixin_account + ' -- 修改记录'
      this.temp = Object.assign({}, row) // copy obj
      this.getInnerList1()
    },
    getInnerList1() {
      this.innerListQuery1.product_weixin_id = this.temp.id
      this.innerListLoading1 = true
      getProductWeixinLogsList(this.innerListQuery1).then(response => {
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
        domain_id: this.temp.id,
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
          createDomainExtraCode(this.innerTemp1).then(response => {
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
          tempData.domain_extra_code_id = this.innerTemp1.id
          updateDomainExtraCode(tempData).then(() => {
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
    handleInnerDelete1(row) {
      this.$confirm('此操作将永久删除该附加代码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          domain_extra_code_id: row.id
        }
        deleteDomainExtraCode(ttempData).then(response => {
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
    },
    handlePictureSuccess(response, file, fileList) {
      this.temp.weixin_qrcode = response.data.url
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePictureCardPreview(file) {
      console.log(file)
      // this.publicImageUrl = file.url
      // this.imageDialogVisible = true
    },
    handleOpenImage(imgUrl) {
      this.publicImageUrl = imgUrl
      this.imageDialogVisible = true
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
<style scoped lang="scss">
  .el-table{
    /deep/ .el-input-number{
      width: 100%;
    }
  }
</style>
