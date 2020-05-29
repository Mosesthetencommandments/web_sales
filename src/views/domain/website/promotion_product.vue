<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="渠道" v-model="listQuery.channel_name">
      </el-input>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="商品名" v-model="listQuery.product_name">
      </el-input>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="推广人" v-model="listQuery.promotion_member_nickname">
      </el-input>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="网站名" v-model="listQuery.url">
      </el-input>
      <!--<el-select-->
        <!--class="filter-item"-->
        <!--style="width:200px;"-->
        <!--@change='handleUserAccountChange'-->
        <!--v-model="listQuery.support_user_account_id"-->
        <!--filterable-->
        <!--clearable-->
        <!--remote-->
        <!--placeholder="请选择客服"-->
        <!--:remote-method="getUserAccountList"-->
        <!--:loading="userAccountLoading">-->
        <!--<el-option-->
          <!--v-for="item in userAccountOptions"-->
          <!--:key="item.nickname"-->
          <!--:label="item.nickname"-->
          <!--:value="item.id">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <!--<el-select-->
        <!--class="filter-item"-->
        <!--style="width:200px;"-->
        <!--@change='getList'-->
        <!--v-model="listQuery.product_weixin_id"-->
        <!--filterable-->
        <!--clearable-->
        <!--remote-->
        <!--placeholder="请选择微信"-->
        <!--:remote-method="getProductWeixinList"-->
        <!--:loading="productWeixinLoading">-->
        <!--<el-option-->
          <!--v-for="item in userAccountWeixinOptions"-->
          <!--:key="item.id"-->
          <!--:label="item.info"-->
          <!--:value="item.id">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <el-select @change='handleFilter' clearable style="width: 100px" class="filter-item" v-model="listQuery.status" placeholder="状态">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item"  @click="handleCreate" type="primary" icon="el-icon-edit">添加</el-button>
    </div>

    <el-table :span-method="objectSpanMethod" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="域名">
        <template slot-scope="scope">
          <span class="link-type" style="font-weight: bold">{{scope.row.full_domain}}</span>
          <p>{{scope.row.domain_sub.info}}</p>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="left" label="网址">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.promotion_product_type_id === 1" size="small" style="font-weight: bold;font-size: 16px;">推</el-tag>
          <el-tag v-if="scope.row.promotion_product_type_id === 2" type="success" size="small" style="font-weight: bold;font-size: 16px;">导</el-tag>
          <el-tag v-if="scope.row.promotion_product_type_id === 3" type="warning" size="small" style="font-weight: bold;font-size: 16px;">转</el-tag>
          <el-tag v-if="scope.row.promotion_product_type_id === 4" type="danger" size="small" style="font-weight: bold;font-size: 16px;">审</el-tag>
          <span class="link-type"><a :href="'http://' + scope.row.url" target="_blank">{{scope.row.url}}</a></span>
        </template>
      </el-table-column>
      <el-table-column min-width="300px" align="left" label="产品">
        <template slot-scope="scope">
          <el-tag :type="'warning'" style="font-weight: bold;font-size: inherit;">{{scope.row.product.product_name}}</el-tag>
          <el-tag :type="'danger'" style="font-weight: bold;font-size: inherit;">{{scope.row.promotion_channel.channel_name}}</el-tag>
          <el-tag :type="'primary'" style="font-weight: bold;font-size: inherit;">{{scope.row.promotion_member.nickname}}</el-tag>
          <el-tag :type="'success'" style="font-weight: bold;font-size: inherit;" v-if="scope.row.product_template">{{scope.row.product_template.template_name}}
            <span v-if="scope.row.is_owner_template === 1">(副本)</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="65px" align="center" label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            @change="handleModifyStatus(scope.row)"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#B7B7B7">
          </el-switch>
          <!--<el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>-->
        </template>
      </el-table-column>
      <el-table-column align="left" label="操作" min-width="225" class-name="small-padding">
        <template slot-scope="scope">
          <div @click="releasePromotionProduct(scope.row)" style="float:left;" v-if="roleArry.indexOf($store.state.user.roles) >= 0" v-show="scope.row.need_release">
            <el-tooltip class="item" effect="dark" content="发布" placement="top">
              <svg-icon icon-class="upload" class="svg_icon upload-icon"/>
            </el-tooltip>
          </div>
          <div style="float:left;cursor: pointer" @click="downloadHtml(scope.row.promotion_product_id)">
            <el-tooltip class="item" effect="dark" content="下载html" placement="top">
              <svg-icon icon-class="download" class="svg_icon download-icon"/>
            </el-tooltip>
          </div>

          <el-tooltip class="item" effect="dark" content="删除" placement="top">
            <el-button v-if="roleArry.indexOf($store.state.user.roles) >= 0" size="mini" class="promotion-product-button" @click="handleDelect(scope.row)">
              <svg-icon icon-class="empty_fill" class="svg_icon"style="color: #F56C6C"/>
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="附加代码管理" placement="top">
            <el-button size="mini" class="promotion-product-button" @click="handleOpenInner2(scope.row)">
              <svg-icon icon-class="code" class="svg_icon" style="color: #409EFF"/>
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="微信号列表" placement="top">
            <el-button size="mini" class="promotion-product-button" @click="handleOpenInner1(scope.row)">
              <svg-icon icon-class="list" class="svg_icon" style="color: #E6A23C;"/>
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="编辑" placement="top">
            <el-button v-if="roleArry.indexOf($store.state.user.roles) >= 0" size="mini" class="promotion-product-button" @click="handleUpdate(scope.row)">
              <svg-icon icon-class="edit" class="svg_icon" style="color: #409EFF;"/>
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="预览" placement="top">
            <el-button size="mini" class="promotion-product-button" @click="handlePreviewPromotionProduct(scope.row)">
              <svg-icon icon-class="preview" class="svg_icon" style="color: #67C23A;"/>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,50, 100]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="80px" style='width: 80%; margin-left:10%;'>
        <el-form-item label="域名名称" prop="url" v-show="dialogStatus === 'update'">
          <span class="link-type" style="font-weight: bold"><el-input disabled v-model="temp.url"></el-input></span>
        </el-form-item>
        <el-form-item label="域名名称" prop="domain_prefix" v-show="dialogStatus === 'create'">
          <el-col :span="5">
            <multiselect :disabled="dialogStatus !== 'create'" v-model="temp.domain_sub" :options="domainSubOptions" @search-change="queryDomainSubList" placeholder="搜索子域名" selectLabel="选择"
                         deselectLabel="删除" track-by="domain_prefix" :internalSearch="false" label="domain_prefix">
              <span slot='noResult'>无结果</span>
            </multiselect>
          </el-col>
          <el-col class="line" :span="1" style="text-align:center;">.</el-col>
          <el-col :span="12">
            <multiselect v-model="temp.domain" :options="domainOptions" @input="resetDomainSub" @search-change="queryDomainList" placeholder="搜索主域名" selectLabel="选择"
                         deselectLabel="删除" track-by="domain_name" :internalSearch="false" label="domain_name">
              <span slot='noResult'>无结果</span>
            </multiselect>
          </el-col>
          <el-col class="line" :span="1" style="text-align:center;">/</el-col>
          <el-col :span="5">
            <el-input v-model="temp.directory"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="网站类型" prop="promotion_product_type_id">
          <el-radio-group v-model="temp.promotion_product_type_id" size="medium">
            <el-radio-button label="1" >推广网站</el-radio-button>
            <el-radio-button label="2">导航页面</el-radio-button>
            <el-radio-button label="3">中转页面</el-radio-button>
            <el-radio-button label="4">审核页</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="parseInt(temp.promotion_product_type_id) === 3" label="跳转链接" prop="transfer_url">
          <el-input v-model="temp.transfer_url"></el-input>
        </el-form-item>
        <el-form-item label="推广产品" prop="product">
          <multiselect v-model="temp.product" :options="productOptions"@input="resetProductTemplate" @search-change="queryProductList" placeholder="搜索商品" selectLabel="选择"
                       deselectLabel="删除" track-by="product_name" :internalSearch="false" label="product_name">
            <span slot='noResult'>无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="产品模板" prop="product_template">
          <multiselect v-model="temp.product_template" :options="productTemplateOptions" @open="handleOpenTemplateDialog" @input="queryProductTemplateInfo" @search-change="queryProductTemplateList" placeholder="搜索商品模板" selectLabel="选择"
                       deselectLabel="删除" track-by="template_name" :internalSearch="false" label="template_name">
            <span slot='noResult'>无结果</span>
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
        <el-form-item label="复制代码" prop="copy_type_code">
          <el-radio-group v-model="temp.copy_type_code" size="medium">
            <el-radio-button label="none" >无</el-radio-button>
            <el-radio-button label="button">按钮型</el-radio-button>
            <el-radio-button label="press">长按型</el-radio-button>
            <el-radio-button label="compound">复合型</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板类型" prop="user_account_type_id">
          <el-radio-group v-model="temp.is_owner_template" size="small" @change="queryProductTemplateInfo">
            <el-radio-button v-for="item in templateTypeOptions" :key="item.key" :label="item.key" :value="item.key">
              {{item.label}}
            </el-radio-button>
          </el-radio-group>
          <p style="font-size:12px;line-height:12px;">副本模板只能用于微调页面样式和图片， 代码修改请使用附加代码功能</p>
        </el-form-item>
        <el-form-item label="模板代码" style="width: 100%;" prop="code" v-show="this.temp.is_owner_template === 1">
          <el-input type="textarea" :autosize="{ minRows: 5, maxRows: 20}" placeholder="请输入内容" v-model="temp.code">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="innerTableTitle1" :visible.sync="innerTableVisible1" width="90%" >
      <div class="filter-container" align="left">
        <el-date-picker
          v-model="innerListQuery1.online_date"
          align="right"
          type="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          :picker-options="pickerOptions1"
          @change="handleInnerFilter1">
        </el-date-picker>
      </div>

      <el-table :stripe="true" :key='innerTableKey1' :data="innerList1" v-loading="innerListLoading1" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="客服">
          <template slot-scope="scope">
            <el-tag class="smalltag" :type="info">{{scope.row.support_member.user_account_group.group_name}}</el-tag>
            <span class="link-type">{{scope.row.support_member.nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="微信昵称">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.weixin_nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="130px" align="center" label="微信号">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.weixin_account}}</span>
            <el-tag :type="scope.row.time_interval_type | timeIntervalFilter">{{scope.row.time_interval_type|timeIntervalTranslator}}</el-tag>
            <el-tag :type="warning" v-if="scope.row.is_promoting">推</el-tag>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="备注名">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.info}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="当日展示量">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.visit}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="当日复制量">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.copy}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="当日咨询/加粉">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.consult_count}} / {{scope.row.add_count}}</span>
            <el-tag :type="scope.row.has_added | hasAddedFilter">{{scope.row.has_added|hasAddedTranslator}}</el-tag>

          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="状态">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusWeixinFilter">{{scope.row.status|statusWeixinTranslator}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="$store.state.user.roles === 'administrator' || $store.state.user.roles === 'promotionManager' || $store.state.user.roles === 'promotionDirector'" align="center" label="操作" width="320" class-name="small-padding">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status===1 || scope.row.status===2 || scope.row.status===3" size="small" type="gray" @click="handleModifyWeixinStatus(scope.row,0)">冻结
            </el-button>
            <el-button v-if="scope.row.status===0" size="small" type="success" @click="handleModifyWeixinStatus(scope.row,1)">开启
            </el-button>
            <el-button v-if="scope.row.status===0" size="small" type="error" @click="handleModifyWeixinStatus(scope.row,3)">关闭
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!innerListLoading1" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange1" @current-change="handleInnerCurrentChange1" :current-page.sync="innerListQuery1.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery1.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal1">
        </el-pagination>
      </div>
    </el-dialog>
    <el-dialog :title="innerTableTitle2" :visible.sync="innerTableVisible2" width="70%" >
      <div class="filter-container">
        <el-button class="filter-item" style="margin-left: 10px;float:right;" @click="handleInnerCreate2" type="primary" icon="el-icon-edit">添加</el-button>
      </div>
      <el-table :stripe="true" :key='innerTableKey2' :data="innerList2" v-loading="innerListLoading2" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="300px" align="center" label="附加代码类型">
          <template slot-scope="scope">
            <el-tag type="warning">{{scope.row.promotion_product_extra_code_type.type_name}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column min-width="80px" align="center" label="状态">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="150" class-name="small-padding">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status===0" size="small" type="success" @click="handleInnerUpdateStatus2(scope.row,1)">开启
            </el-button>
            <el-button v-if="scope.row.status===1" size="small" type="error" @click="handleInnerUpdateStatus2(scope.row,0)">关闭
            </el-button>
            <el-button type="primary" size="mini" @click="handleInnerUpdate2(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleInnerDelect2(scope.row)">删除
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible2">
      <el-form :rules="innerRules1" ref="innerDataForm2" :model="innerTemp2" label-position="left" label-width="180px" style='width: 60%;margin-left:80px;'>
        <el-form-item label="附加代码类型" prop="promotion_product_extra_code_type_id">
          <el-select :disabled="dialogStatus === 'update'" v-model="innerTemp2.promotion_product_extra_code_type_id" placeholder="请选择附加代码类型" @change="handleChangeExtraCodeType">
            <el-option
              v-for="item in extraCodeTypeOptions"
              :key="item.value"
              :label="item.label"
              class="bg"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-for="item in innerTemp2.promotion_product_extra_code_type_data" :label="item.label" :key="item.id">
          <el-input v-if="item.form_type === 'input'" v-model="item.value"></el-input>
          <el-input type="textarea" v-if="item.form_type === 'textarea'" v-model="item.value"></el-input>
          <el-radio-group v-if="item.form_type === 'radio'" v-model="item.value">
            <el-radio-button v-for="it in item.selection" :key="it.name" :label="it.value">{{it.name}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <p v-if="innerTemp2.info" style="color:red;font-size:12px;padding-left:180px;">{{innerTemp2.info}}</p>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible2 = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createInnerData2">确 定</el-button>
        <el-button v-else type="primary" @click="updateInnerData2">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :fullscreen="true" :title="previewTitle" :visible.sync="previewDialogVisible" width="padding: 30px 0px;" @close="handlePreviewClose">
      <div v-html='previewContent'></div>
    </el-dialog>
    <el-dialog :title="templateTitle" :visible.sync="templateDialogVisible" width="90%">
      <div class="filter-container">
        <el-input @keyup.enter.native="handleFilter" style="width: 400px;" class="filter-item" placeholder="模板名称" v-model="innerListQuery3.template_name">
        </el-input>
        <el-button class="filter-item" style="margin-left: 10px;" @click="getTemplateList" type="primary" icon="el-icon-search">搜索</el-button>
      </div>
      <div>
        <el-row>
          <el-col :span="4" v-for="item in productTemplateOptions" :key="item.id">
            <el-card :body-style="{ padding: '0px' }" style="width:94%;margin:10px auto;">
              <div style="width:100%;padding-bottom:120%;height:0;overflow: hidden;">
                <img :src="item.preview_image" class="template-image">
              </div>
              <div style="padding: 14px;">
                <span>{{item.template_name}}</span>
                <div class="template-bottom template-clearfix">
                  <time class="template-time">{{item.promotion_product_type.type_name}}模板</time>
                  <el-button type="text" class="template-button" @click="handleChooseTemplate(item)">选择模板</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <el-pagination background @size-change="handleInnerSizeChange3" @current-change="handleInnerCurrentChange3" :current-page.sync="innerListQuery3.page"
                     :page-sizes="[20,40,60, 80]" :page-size="innerListQuery3.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal3">
      </el-pagination>
    </el-dialog>
  </div>
</template>

<script>
import { getPromotionProductList, createPromotionProduct, updatePromotionProduct, getPromotionProductInfo, getPromotionProductWeixinList, releasePromotionProduct, previewPromotionProduct, deletePromotionProduct } from '@/api/promotion_product'

import { getDomainSubList } from '@/api/domain_sub'
import { getDomainList } from '@/api/domain'
import { getProductList, getProductTemplateList, getProductTemplateInfo } from '@/api/product'
import { getPromotionChannelList } from '@/api/promotion_channel'
import { getPromotionMemberList } from '@/api/promotion_member'
import { getUserAccountList } from '@/api/user'
import { getProductWeixinList, updateProductWeixin } from '@/api/product_weixin'
import { getPromotionProductExtraCodeList, getPromotionProductExtraCodeTypeList, getPromotionProductExtraCodeInfo, getPromotionProductExtraCodeTypeInfo, updatePromotionProductExtraCode, updatePromotionProductExtraCodeStatus, createPromotionProductExtraCode, deletePromotionProductExtraCode } from '@/api/promotion_product_extra_code'

import waves from '@/directive/waves' // 水波纹指令
import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'
// 多选框组件css

export default {
  name: 'promotion_product',
  components: {
    Multiselect },
  directives: {
    waves
  },
  data() {
    return {
      roleArry: ['administrator', 'promotion', 'promotionManager', 'promotionGroup', 'templateManager', 'promotionDirector'],
      scrollTop: 0,
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        page_size: 50,
        product_weixin_id: undefined,
        support_user_account_id: undefined,
        promotion_member_nickname: undefined,
        channel_name: undefined,
        product_name: undefined,
        status: undefined,
        url: ''
      },
      importanceOptions: [1, 2, 3],
      statusOptions: [{ label: '关闭', key: 0 }, { label: '开启', key: 1 }, { label: '告警', key: 2 }],
      showAuditor: false,
      temp: {
        id: undefined,
        domain_sub: {
          id: undefined,
          domain_prefix: ''
        },
        domain: {
          id: undefined,
          domain_name: ''
        },
        directory: '',
        product: {
          id: undefined,
          product_name: ''
        },
        product_template: {
          id: undefined,
          template_name: ''
        },
        promotion_channel: {
          id: undefined,
          channel_name: ''
        },
        promotion_member: {
          id: undefined,
          nickname: ''
        },
        status: undefined,
        is_owner_template: 0,
        promotion_product_type_id: 1,
        copy_type_code: 'none',
        transfer_url: '',
        code: ''
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

      innerTotal1: null,
      innerList1: null,
      innerTableKey1: 1,
      innerTableTitle1: '',
      innerListQuery1: {
        page: 1,
        page_size: 10,
        sort: '-id',
        online_date: new Date()
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
      innerTotal2: null,
      innerList2: null,
      innerTableKey2: 2,
      innerTableTitle2: '',
      innerListQuery2: {
        page: 1,
        page_size: 10,
        sort: '-id'
      },
      innerTemp2: {
        id: undefined,
        promotion_product_id: null,
        promotion_product_extra_code_type_id: null,
        info: '',
        promotion_product_extra_code_type_data: []
      },
      innerListLoading2: false,
      innerTableVisible2: false,
      innerDialogFormVisible2: false,
      innerTotal3: null,
      innerListQuery3: {
        page: 1,
        page_size: 20,
        sort: '-id',
        status: 1
      },
      templateTypeOptions: [{
        key: 0,
        label: '公共模板'
      }, {
        key: 1,
        label: '副本'
      }],
      countNumber: [],
      countIndex: [],
      domainOptions: [],
      domainSubOptions: [],
      productOptions: [],
      productTemplateOptions: [],
      promotionChannelOptions: [],
      promotionMemberOptions: [],
      previewDialogVisible: false,
      previewTitle: '',
      previewContent: '',
      userAccountOptions: [],
      userAccountLoading: false,
      productWeixinLoading: false,
      userAccountWeixinOptions: [],
      pickerOptions1: {},
      extraCodeTypeOptions: [],
      templateDialogVisible: false,
      templateTitle: '模板列表',
      downloadPromotionProductUrl: process.env.BASE_API + '/api/promotion/downloadPromotionProduct' + '?token=' + this.$store.state.user.token
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
        0: '关闭',
        1: '开启',
        2: '告警'
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
    hasAddedFilter(status) {
      const statusMap = {
        0: 'gray',
        1: 'success'
      }
      return statusMap[status]
    },
    hasAddedTranslator(status) {
      const statusTransMap = {
        0: '未录',
        1: '已录'
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
    this.getList()
    this.getUserAccountList(' ')
    this.getProductWeixinList(' ')
    this.queryProductList(' ')
    this.getPromotionProductExtraCodeTypeList()
  },
  methods: {
    downloadHtml(promotion_product_id) {
      const form = document.createElement('form')
      form.action = this.downloadPromotionProductUrl + '&promotion_product_id=' + promotion_product_id
      form.method = 'post'
      form.style.display = 'none'
      const button = document.createElement('input')
      button.type = 'submit'
      form.appendChild(button)
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    },
    getPromotionProductExtraCodeTypeList() {
      getPromotionProductExtraCodeTypeList().then(response => {
        this.extraCodeTypeOptions = response.data.data.map(v => ({
          key: v.id,
          label: v.type_name
        }))
      })
    },
    handleModifyWeixinStatus(row, status) {
      const tempData = {}
      tempData.product_weixin_id = row.id
      tempData.status = status
      updateProductWeixin(tempData).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        for (const v of this.innerList1) {
          if (v.id === row.id) {
            const index = this.innerList1.indexOf(v)
            v.status = status
            this.innerList1.splice(index, 1, v)
            break
          }
        }
      })
    },
    handleUserAccountChange() {
      this.getProductWeixinList(' ')
      this.getList()
    },
    handleDelect(row) {
      this.$confirm('此操作将永久删除该推广网站, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const tempData = {
          promotion_product_id: row.promotion_product_id
        }
        deletePromotionProduct(tempData).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    getProductWeixinList(query) {
      if (query !== '') {
        this.productWeixinLoading = true
        getProductWeixinList({ info: query, support_user_account_id: this.listQuery.support_user_account_id }).then(response => {
          this.userAccountWeixinOptions = response.data.data
          this.productWeixinLoading = false
        })
      }
    },
    getUserAccountList(query) {
      if (query !== '') {
        this.userAccountLoading = true
        getUserAccountList({ nickname: query, user_account_type_code: 'support', status: 1 }).then(response => {
          this.userAccountOptions = response.data.data
          this.userAccountLoading = false
        })
      }
    },
    queryDomainList(query) {
      this.resetDomainSub()
      getDomainList({ domain_name: query }).then(response => {
        if (!response.data.data) return
        console.log(response)
        this.domainOptions = response.data.data.map(v => ({
          id: v.id,
          domain_name: v.domain_name
        }))
      })
    },
    queryDomainSubList(query) {
      const domain_id = this.temp.domain.id
      if (domain_id) {
        getDomainSubList({ domain_prefix: query, domain_id: domain_id, status: 1 }).then(response => {
          if (!response.data.data) return
          console.log(response)
          this.domainSubOptions = response.data.data.map(v => ({
            id: v.id,
            domain_prefix: v.domain_prefix
          }))
        })
      }
    },
    queryProductList(query) {
      this.resetProductTemplate()
      getProductList({ product_name: query, is_promote: 1, sort: '-sort' }).then(response => {
        if (!response.data.data) return
        this.productOptions = response.data.data.map(v => ({
          id: v.id,
          product_name: v.product_name
        }))
      })
    },
    queryProductTemplateList(query) {
      this.resetPromotionChannel()
      const product_id = this.temp.product.id
      if (product_id) {
        getProductTemplateList({ template_name: query, product_id: product_id, status: 1 }).then(response => {
          if (!response.data.data) return
          this.productTemplateOptions = response.data.data.map(v => ({
            id: v.id,
            template_name: v.template_name,
            promotion_product_type: v.promotion_product_type
          }))
        })
      }
    },
    queryProductTemplateInfo() {
      if (this.temp.is_owner_template === 1 && this.temp.product_template.id) {
        getProductTemplateInfo({ product_template_id: this.temp.product_template.id }).then(response => {
          if (!response.data) return
          this.temp.code = response.data.template_code
        })
      }
      // this.queryPromotionMemberList(' ')
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
    resetPromotionChannel() {
      this.promotionChannelOptions = []
      this.temp.promotion_channel = {
        id: undefined,
        channel_name: ''
      }
      // this.queryPromotionChannelList(' ')
    },
    resetDomainSub() {
      this.domainSubOptions = []
      this.temp.domain_sub = {
        id: undefined,
        domain_prefix: ''
      }
    },
    resetProductTemplate() {
      this.productTemplateOptions = []
      this.temp.product_template = {
        id: undefined,
        template_name: ''
      }
      this.queryProductTemplateList(' ')
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
      getPromotionProductList(this.listQuery).then(response => {
        this.list = []
        const tempData = response.data.data
        for (const v of tempData) {
          const cellData = v
          cellData.promotion_product_id = v.id
          cellData.id = v.domain_sub_id
          cellData.code = ''
          this.list.push(cellData)
        }
        this.countRowSpan()
        //  this.list = response.data.data
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
    handleInnerCurrentChange1(val) {
      this.innerListQuery1.page = val
      this.getInnerList1()
    },
    handleInnerSizeChange1(val) {
      this.innerListQuery1.page_size = val
      this.getInnerList1()
    },
    handleModifyStatus(row) {
      const tempData = {}
      tempData.promotion_product_id = row.promotion_product_id
      const status = (row.status === 1) ? 1 : 0
      console.log(row.status)
      tempData.status = status
      this.temp = Object.assign({}, row) // copy obj
      this.temp.status = status
      updatePromotionProduct(tempData).then(response => {
        this.temp.need_release = response.data.need_release
        for (const v of this.list) {
          if (v.promotion_product_id === this.temp.promotion_product_id) {
            const index = this.list.indexOf(v)
            this.list.splice(index, 1, this.temp)
            break
          }
        }
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        domain_sub: {
          id: undefined,
          domain_prefix: ''
        },
        domain: {
          id: undefined,
          domain_name: ''
        },
        directory: '',
        product: {
          id: undefined,
          product_name: ''
        },
        product_template: {
          id: undefined,
          template_name: ''
        },
        promotion_channel: {
          id: undefined,
          channel_name: ''
        },
        promotion_member: {
          id: undefined,
          nickname: ''
        },
        promotion_product_id: undefined,
        promotion_product_type_id: 1,
        copy_type_code: 'off',
        transfer_url: '',
        status: undefined,
        is_owner_template: 0,
        code: ''
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
          this.temp.product_template_id = this.temp.product_template.id
          this.temp.domain_sub_id = this.temp.domain_sub.id
          this.temp.domain_prefix = this.temp.domain_sub.domain_prefix
          this.temp.domain_name = this.temp.domain.domain_name
          createPromotionProduct(this.temp).then(response => {
            this.getList()
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
      const tempData = {}
      tempData.promotion_product_id = this.temp.promotion_product_id
      getPromotionProductInfo(tempData).then(response => {
        this.temp.code = response.data.code
        this.temp.is_owner_template = response.data.is_owner_template
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.promotion_product_type_id = parseInt(this.temp.promotion_product_type_id)
          const tempData = Object.assign({}, this.temp)
          tempData.promotion_product_id = this.temp.promotion_product_id
          tempData.product_id = this.temp.product.id
          tempData.product_template_id = this.temp.product_template.id
          tempData.promotion_user_account_id = this.temp.promotion_member.id
          tempData.promotion_channel_id = this.temp.promotion_channel.id
          tempData.is_owner_template = this.temp.is_owner_template
          tempData.code = this.temp.code
          updatePromotionProduct(tempData).then(response => {
            this.temp.need_release = response.data.need_release
            for (const v of this.list) {
              // alert(JSON.stringify(v))
              if (v.promotion_product_id === this.temp.promotion_product_id) {
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
    releasePromotionProduct(row) {
      this.temp = Object.assign({}, row) // copy obj
      const tempData = {}
      tempData.promotion_product_id = this.temp.promotion_product_id
      releasePromotionProduct(tempData).then(response => {
        this.temp.need_release = response.data.need_release
        for (const v of this.list) {
          if (v.promotion_product_id === this.temp.promotion_product_id) {
            const index = this.list.indexOf(v)
            this.list.splice(index, 1, this.temp)
            break
          }
        }
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '发布成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handlePreviewClose() {
      this.previewContent = ''
      this.previewTitle = ''
    },
    handlePreviewPromotionProduct(row) {
      this.temp = Object.assign({}, row) // copy obj
      const tempData = {}
      tempData.promotion_product_id = this.temp.promotion_product_id
      previewPromotionProduct(tempData).then(response => {
        this.previewContent = response.data.content
        this.previewTitle = this.temp.url + ' --预览'
        this.previewDialogVisible = true
      })
    },
    handleOpenInner1(row) {
      this.innerTableVisible1 = true
      this.innerTableTitle1 = row.url + ' -- 微信号详情'
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
    handleInnerCreate2() {
      this.resetInnerTemp2()
      this.dialogStatus = 'create'
      this.innerDialogFormVisible2 = true
    },
    resetInnerTemp2() {
      this.innerTemp2 = {
        id: undefined,
        promotion_product_id: null,
        promotion_product_extra_code_type_id: null,
        promotion_product_extra_code_type_data: []
      }
    },
    handleChangeExtraCodeType(extra_code_type_id) {
      this.innerTemp2.promotion_product_extra_code_type_id = extra_code_type_id
      getPromotionProductExtraCodeTypeInfo({ promotion_product_extra_code_type_id: extra_code_type_id }).then(response => {
        this.innerTemp2.promotion_product_extra_code_type_data = response.data.promotion_product_extra_code_type_data
        this.innerTemp2.info = response.data.info
      })
    },
    createInnerData2() {
      this.innerTemp2.promotion_product_id = this.temp.promotion_product_id
      createPromotionProductExtraCode(this.innerTemp2).then(response => {
        this.innerList2.unshift(response.data)
        this.innerDialogFormVisible2 = false
        for (const v of this.list) {
          if (v.promotion_product_id === this.temp.promotion_product_id) {
            const index = this.list.indexOf(v)
            v.need_release = 1
            this.list.splice(index, 1, v)
            break
          }
        }
        this.total++
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleInnerUpdateStatus2(row, status) {
      const temp = Object.assign({}, row) // copy obj
      temp.status = status
      const tempData = {}
      tempData.promotion_product_extra_code_id = temp.id
      tempData.status = status
      updatePromotionProductExtraCodeStatus(tempData).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        for (const v of this.list) {
          if (v.promotion_product_id === this.temp.promotion_product_id) {
            const index = this.list.indexOf(v)
            v.need_release = 1
            this.list.splice(index, 1, v)
            break
          }
        }
        for (const v of this.innerList2) {
          if (v.id === temp.id) {
            const index = this.innerList2.indexOf(v)
            this.innerList2.splice(index, 1, temp)
            break
          }
        }
      })
      this.dialogStatus = 'update'
    },
    handleInnerUpdate2(row) {
      const temp = Object.assign({}, row) // copy obj
      const tempData = {}
      tempData.promotion_product_extra_code_id = temp.id
      getPromotionProductExtraCodeInfo(tempData).then(response => {
        temp.promotion_product_extra_code_type_data = response.data.promotion_product_extra_code_type_data
        this.innerTemp2 = temp
        this.innerTemp2.info = response.data.info
        this.innerDialogFormVisible2 = true
      })
      this.dialogStatus = 'update'
    },
    updateInnerData2() {
      const tempData = Object.assign({}, this.innerTemp2)
      tempData.promotion_product_extra_code_id = this.innerTemp2.id
      tempData.promotion_product_extra_code_type_data = this.innerTemp2.promotion_product_extra_code_type_data
      updatePromotionProductExtraCode(tempData).then(response => {
        for (const v of this.list) {
          if (v.promotion_product_id === this.temp.promotion_product_id) {
            const index = this.list.indexOf(v)
            v.need_release = 1
            this.list.splice(index, 1, v)
            break
          }
        }
        for (const v of this.innerList2) {
          if (v.id === this.innerTemp2.id) {
            const index = this.innerList2.indexOf(v)
            this.innerList2.splice(index, 1, this.innerTemp2)
            break
          }
        }
        this.innerDialogFormVisible2 = false
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleInnerDelect2(row) {
      this.$confirm('此操作将永久删除该附加代码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          promotion_product_extra_code_id: row.id
        }
        deletePromotionProductExtraCode(ttempData).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.innerList2.indexOf(row)
          this.innerList2.splice(index, 1)
          this.total--
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleInnerCurrentChange2(val) {
      this.innerListQuery2.page = val
      this.getInnerList2()
    },
    handleInnerSizeChange2(val) {
      this.innerListQuery2.page_size = val
      this.getInnerList2()
    },
    handleOpenInner2(row) {
      this.innerTableVisible2 = true
      this.innerTableTitle2 = row.url + ' -- 附加代码'
      this.temp = Object.assign({}, row) // copy obj
      this.getInnerList2()
    },
    getInnerList2() {
      this.innerListQuery2.promotion_product_id = this.temp.promotion_product_id
      this.innerListLoading1 = true
      getPromotionProductExtraCodeList(this.innerListQuery2).then(response => {
        this.innerList2 = response.data.data
        this.innerTotal2 = response.data.total
        this.innerListLoading2 = false
      })
    },
    handleInnerFilter2() {
      this.innerListQuery1.page = 1
      this.getInnerList1()
    },
    handleInnerCurrentChange3(val) {
      this.innerListQuery3.page = val
      this.getTemplateList()
    },
    handleInnerSizeChange3(val) {
      this.innerListQuery3.page_size = val
      this.getTemplateList()
    },
    getTemplateList() {
      this.innerListQuery3.product_id = this.temp.product.id
      this.innerListQuery3.promotion_product_type_id = this.temp.promotion_product_type_id
      getProductTemplateList(this.innerListQuery3).then(response => {
        this.productTemplateOptions = response.data.data
        this.innerTotal3 = response.data.total
      })
    },
    handleOpenTemplateDialog() {
      this.templateDialogVisible = true
      this.getTemplateList()
    },
    handleChooseTemplate(row) {
      this.temp.product_template = row
      this.templateDialogVisible = false
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
<style>
  .is-fullscreen .el-dialog__body {
    padding:30px 0px !important;
  }
  .smalltag {
    height: 20px;
    line-height: 20px;
  }
  .upload-icon {
    color:red;
    font-size:40px;
    transform: translate(0%, 10%);
  }
  .download-icon {
    color:#45A0FF;
    font-size:40px;
    transform: translate(0%, 7%);
  }
  .promotion-product-button {
    float:right;
    margin-left: 3px !important;
    font-size:22px;
    padding: 3px 5px;
    transform: translate(0%, 15%);
  }
   .template-time {
     font-size: 13px;
     color: #999;
   }

  .template-bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .template-button {
    padding: 0;
    float: right;
  }

  .template-image {
    width: 100%;
    display: block;
  }

  .template-clearfix:before,
  .template-clearfix:after {
    display: table;
    content: "";
  }

  .template-clearfix:after {
    clear: both
  }
</style>
