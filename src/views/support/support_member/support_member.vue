<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <div class="filter-item">
        <div class="filter-label">排序</div>
        <el-select @change='handleFilter' size="small" style="width: 120px" v-model="listQuery.sort" placeholder="排序">
          <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服部门</div>
        <el-cascader
          clearable
          style="width: 260px"
          size="small"
          :options="userGroupTree"
          change-on-select
          placeholder="请选择"
          :props="defaultPropsGroup"
          v-model="userGroupOptions"
          @change="handleFilterGrounp">
        </el-cascader>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服</div>
        <el-input size="small" @keyup.enter.native="handleFilter" style="width: 200px;" placeholder="" v-model="listQuery.nickname">
        </el-input>
      </div>
      <div class="filter-float">
        <el-button class="filter-item" type="primary" size="small" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      </div>


    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" label="序号" width="60">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="客服">
        <template slot-scope="scope">
          <span>{{scope.row.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="180px" align="center" label="客服部(组)">
        <template slot-scope="scope">
          <span>
            {{scope.row.user_account_group.group_name}}
            <span v-if="scope.row.user_account_group_team">({{scope.row.user_account_group_team.team_name}})</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="销售产品">
        <template slot-scope="scope">
          <el-tag v-for="item in scope.row.support_product" :key="item.id" style="margin-right: 2px">{{ item.product.product_name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="等级名称">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.support_user_account_level_relations" style="margin-right: 2px">{{ scope.row.support_user_account_level_relations.support_level.level_name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="前后端">
        <template slot-scope="scope">
          <el-switch
            v-if="scope.row.support_info !== null"
            v-model="scope.row.support_info.is_front_model"
            @change="changeStatus($event, scope.row)"
            :active-value="1"
            :inactive-value="0"
            active-text="前端"
            inactive-text="后端"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
          <!--<el-tag v-if="scope.row.support_info.is_front_model === 0">后端</el-tag>-->
          <!--<el-tag type="success" v-if="scope.row.support_info.is_front_model === 1">前端</el-tag>-->
        </template>
      </el-table-column>
      <!--<el-table-column width="160px" align="center" label="时间">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{scope.row.updated_at}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column align="center" label="操作" width="240" class-name="small-padding">
        <template slot-scope="scope">
          <!--<el-button type="success" size="mini" v-if="scope.row.support_info.is_front_model === 0" @click="handleChangeModel(scope.row, 1)">前端</el-button>-->
          <!--<el-button type="primary" size="mini" v-else @click="handleChangeModel(scope.row, 0)">后端</el-button>-->
          <el-button type="primary" size="mini" @click="handleOpenInner5(scope.row)">销售产品</el-button>
          <el-button type="primary" size="mini" @click="handleCustomerService(scope.row)">客服等级</el-button>
          <!--<el-button type="success" size="mini" @click="handleOpenInner1(scope.row)">微信管理</el-button>-->
          <!--<el-button type="primary" size="mini" @click="handleOpenInner3(scope.row)">当日加粉</el-button>-->
          <!--<el-button type="warning" size="mini" @click="handleOpenInner4(scope.row)">未添加粉丝</el-button>-->
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
        <el-form-item label="域名名称" prop="domain_name">
          <el-input v-model="temp.domain_name"></el-input>
        </el-form-item>
        <el-form-item label="IP" prop="ip">
          <el-input v-model="temp.ip"></el-input>
        </el-form-item>
        <el-form-item label="资质信息" prop="copyright">
          <el-input v-model="temp.copyright"></el-input>
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容" v-model="temp.info">
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
      <el-table :stripe="true" :key='innerTableKey1' :data="innerList1" v-loading="innerListLoading1" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="微信昵称">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.weixin_nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="110px" align="left" label="联系方式">
          <template slot-scope="scope">
            <span class="link-type">微信：{{scope.row.weixin_account}}</span><br>
            <span class="link-type">QQ：{{scope.row.qq}}</span><br>
            <span class="link-type">电话：{{scope.row.phone}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="商品名称">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.product.product_name}}</span>
          </template>
        </el-table-column>
        <!--<el-table-column min-width="100px" align="center" label="推广人">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link-type">{{scope.row.promotion_member.nickname}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column min-width="100px" align="center" label="客服">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.support_member.nickname}}</span>
          </template>
        </el-table-column>
        <!--<el-table-column min-width="100px" align="center" label="渠道">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link-type">{{scope.row.promotion_channel.channel_name}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column width="100px" align="center" label="粉丝数">
          <template slot-scope="scope">
            <span>{{scope.row.fans_total}}</span>
          </template>
        </el-table-column>
        <el-table-column width="100px" align="center" label="告警阀值">
          <template slot-scope="scope">
            <span>{{scope.row.threshold}}</span>
          </template>
        </el-table-column>
        <!--<el-table-column min-width="100px" align="center" label="状态">-->
          <!--<template slot-scope="scope">-->
            <!--<el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column align="center" label="操作" width="240" class-name="small-padding">
          <template slot-scope="scope">
            <el-button type="info" size="mini" @click="handleInnerUpdate1(scope.row)">录入粉丝</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!innerListLoading1" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange1" @current-change="handleInnerCurrentChange1" :current-page.sync="innerListQuery1.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery1.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal1">
        </el-pagination>
      </div>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible1">
      <el-form :rules="innerRules1" ref="innerDataForm1" :model="innerTemp1" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="微信号">
          <el-input v-model="innerTemp1.weixin_account" disabled></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="innerTemp1.weixin_nickname" disabled></el-input>
        </el-form-item>
        <el-form-item label="粉丝微信号">
          <el-input v-model="innerTemp1.weixin_fans_weixin_account"></el-input>
        </el-form-item>
        <el-form-item label="加粉时间" prop="join_time">
          <el-date-picker
            style="width:100%;"
            v-model="innerTemp1.join_time"
            align="right"
            type="date"
            format="yyyy-MM-dd"
            placeholder="选择日期"
            :picker-options="pickerOptions1"
            @change="innerTemp2DateChange">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="innerTemp1.remark"></el-input>
        </el-form-item>
        <el-form-item label="是否已咨询">
          <el-radio-group v-model="innerTemp1.if_consult" size="medium">
            <el-radio-button label="1" >是</el-radio-button>
            <el-radio-button label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible1 = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="updateInnerData1">确 定</el-button>
        <el-button v-else type="primary" @click="updateInnerData1">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="innerTableTitle3" :visible.sync="innerTableVisible3" width="90%" >
      <div class="filter-container">
        <el-date-picker
          v-model="innerListQuery3.join_time"
          align="left"
          type="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          :picker-options="pickerOptions3"
          @change="getInnerList3">
        </el-date-picker>
      </div>
      <el-table :stripe="true" :key='innerTableKey3' :data="innerList3" v-loading="innerListLoading3" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="微信昵称">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.weixin_nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="110px" align="center" label="联系方式">
          <template slot-scope="scope">
            <span class="link-type">微信：{{scope.row.weixin_account}}</span><br>
            <!--<span class="link-type" @click="handleUpdate(scope.row)">QQ：{{scope.row.qq}}</span><br>-->
            <!--<span class="link-type" @click="handleUpdate(scope.row)">电话：{{scope.row.phone}}</span>-->
          </template>
        </el-table-column>
        <!--<el-table-column min-width="100px" align="center" label="商品名称">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link-type">{{scope.row.product.product_name}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column min-width="100px" align="center" label="推广人">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link-type">{{scope.row.promotion_member.nickname}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column min-width="100px" align="center" label="客服">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link-type">{{scope.row.support_member.nickname}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column min-width="100px" align="center" label="渠道">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link-type">{{scope.row.promotion_channel.channel_name}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column min-width="100px" align="center" label="状态">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="200px" label="加粉数"  align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.edit_add">
              <el-input-number v-model="scope.row.add_count" controls-position="right" :min="0" :max="200"></el-input-number>
              <el-button class='inline-btn' v-if="scope.row.edit_add" type="success" @click="confirmEditAdd(scope.row)" size="small" icon="el-icon-circle-check-outline">完成</el-button>
              <el-button class='inline-btn' size="small" icon="el-icon-refresh" type="warning" @click="cancelEditAdd(scope.row)">取消</el-button>
            </template>
            <span class="link-type" style="padding:2px 70px;" @click='scope.row.edit_add=!scope.row.edit_add' v-else>{{ scope.row.add_count }}</span>
          </template>
        </el-table-column>
        <el-table-column width="200px" label="咨询数"  align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.edit_consult">
              <el-input-number v-model="scope.row.consult_count" controls-position="right" :min="0" :max="200"></el-input-number>
              <el-button class='inline-btn' v-if="scope.row.edit_consult" type="success" @click="confirmEditConsult(scope.row)" size="small" icon="el-icon-circle-check-outline">完成</el-button>
              <el-button class='inline-btn' size="small" icon="el-icon-refresh" type="warning" @click="cancelEditConsult(scope.row)">取消</el-button>
            </template>
            <span class="link-type" style="padding:2px 70px;" @click='scope.row.edit_consult=!scope.row.edit_consult' v-else>{{ scope.row.consult_count }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!innerListLoading3" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange3" @current-change="handleInnerCurrentChange3" :current-page.sync="innerListQuery3.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery3.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal3">
        </el-pagination>
      </div>
    </el-dialog>
    <el-dialog :title="innerTableTitle4" :visible.sync="innerTableVisible4" width="90%" >
      <div class="filter-container">
        <el-date-picker
          v-model="innerListQuery4.join_time"
          align="left"
          type="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          :picker-options="pickerOptions4"
          @change="getInnerList4">
        </el-date-picker>
      </div>
      <el-table :stripe="true" :key='innerTableKey4' :data="innerList4" v-loading="innerListLoading4" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="微信昵称">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.weixin_nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="110px" align="center" label="联系方式">
          <template slot-scope="scope">
            <span class="link-type">微信：{{scope.row.weixin_account}}</span><br>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="状态">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="200px" label="未添加粉丝数"  align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.edit_unfilled">
              <el-input-number v-model="scope.row.unfilled_count" controls-position="right" :min="0" :max="200"></el-input-number>
              <el-button class='inline-btn' v-if="scope.row.edit_unfilled" type="success" @click="confirmEditUnfilled(scope.row)" size="small" icon="el-icon-circle-check-outline">完成</el-button>
              <el-button class='inline-btn' size="small" icon="el-icon-refresh" type="warning" @click="cancelEditUnfilled(scope.row)">取消</el-button>
            </template>
            <span class="link-type" style="padding:2px 70px;" @click='scope.row.edit_unfilled=!scope.row.edit_unfilled' v-else>{{ scope.row.unfilled_count }}</span>
          </template>
        </el-table-column>
        <el-table-column width="200px" label="添加粉丝数"  align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.edit_add">
              <el-input-number v-model="scope.row.add_count" controls-position="right" :min="0" :max="200"></el-input-number>
              <el-button class='inline-btn' v-if="scope.row.edit_add" type="success" @click="confirmUnfilledEditAdd(scope.row)" size="small" icon="el-icon-circle-check-outline">完成</el-button>
              <el-button class='inline-btn' size="small" icon="el-icon-refresh" type="warning" @click="cancelUnfilledEditAdd(scope.row)">取消</el-button>
            </template>
            <span class="link-type" style="padding:2px 70px;" @click='scope.row.edit_add=!scope.row.edit_add' v-else>{{ scope.row.add_count }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!innerListLoading3" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange3" @current-change="handleInnerCurrentChange3" :current-page.sync="innerListQuery3.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery3.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal3">
        </el-pagination>
      </div>
    </el-dialog>
    <!--销售产品弹出-->
    <el-dialog :title="innerTableTitle5" :visible.sync="innerTableVisible5" width="40%" >
      <el-form :rules="innerRules5" ref="dataForm5" :model="innerTemp5" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="销售产品" prop="product_ids">
          <el-select
            class="filter-item"
            style="width:100%;"
            v-model="innerTemp5.product_ids"
            clearable
            multiple
            placeholder="请选择产品">
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.product_name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerTableVisible5 = false">取 消</el-button>
        <el-button type="primary" @click="updateSupportProduct">确 定</el-button>
      </div>
    </el-dialog>
    <!--客服等级弹出-->
    <el-dialog :title="customerService" :visible.sync="handleCustomerServiceLevel" width="40%" >
      <el-form :rules="rulesLevel" ref="dataFormLevel" :model="innerTempLevel" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="客服等级" prop="support_level">
          <el-select
            class="filter-item"
            style="width:100%;"
            v-model="innerTempLevel.support_level_id"
            clearable
            placeholder="请选择客服等级">
            <el-option
              v-for="item in fullOptions"
              :key="item.id"
              :label="item.level_name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCustomerServiceLevel = false">取 消</el-button>
        <el-button type="primary" @click="updateSupportLevel">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createDomain, updateDomain, deleteDomain, createDomainExtraCode, deleteDomainExtraCode } from '@/api/domain'
import { editSupportInfo } from '@/api/support_member'
import { getProductList } from '@/api/product'
import { getSupportGroupList } from '@/api/support_member'
import { getSupportMemberWithAllList } from '@/api/support_member'
import { updateSupportProduct } from '@/api/support_member'
import { getUserAccountGroupList } from '@/api/user_group'
import { getUserAccountGroupTeamList } from '@/api/user_group_team'
import { getProductWeixinList } from '@/api/product_weixin'
import { createProductWeixinFans, getDateAddFansInfo, updateProductWeixinRecord, getDateUnfilledFansInfo, updateProductWeixinUnfilled } from '@/api/product_weixin_fans'
import { getSupportLevelList, updateSupportUserAccountLevelRelations } from '@/api/sales'
import waves from '@/directive/waves' // 水波纹指令

export default {
  name: 'customerPersonnelManagement',
  directives: {
    waves
  },
  data() {
    return {
      innerTempLevel: {
        level_name: undefined,
        support_user_account_id: undefined,
        support_level_id: undefined
      },
      rulesLevel: {
        support_level: [{ required: true, message: '请正确选择等级名称', trigger: 'change' }]
      },
      customerService: '',
      typeCustomerLoading: false,
      handleCustomerServiceLevel: false,
      fullOptions: [],
      scrollTop: 0,
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        page_size: 20,
        support_user_account_group_id: undefined,
        user_account_group_team_id: undefined,
        nickname: '',
        status: 1,
        sort: '-id'
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
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
        domain_name: '',
        ip: '',
        copyright: '',
        info: ''
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
        page_size: 10,
        support_user_account_id: undefined,
        sort: '-id'
      },
      innerTemp1: {
        weixin_fans_weixin_account: '',
        remark: '',
        join_time: new Date().setTime(new Date().getTime()),
        if_consult: 0
      },
      innerTemp2: {},
      innerListLoading1: false,
      innerTableVisible1: false,
      innerDialogFormVisible1: false,
      innerRules1: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      innerRules5: {
        product_ids: [{ required: true, message: '选择产品', trigger: 'change' }]
      },
      innerList3: null,
      innerTotal3: null,
      innerTableKey3: 1,
      innerTableTitle3: '',
      innerListQuery3: {
        page: 1,
        page_size: 10,
        support_user_account_id: undefined,
        join_time: new Date(),
        sort: '-id'
      },
      innerTemp3: {
        weixin_fans_weixin_account: '',
        remark: '',
        join_time: new Date().setTime(new Date().getTime()),
        if_consult: 0
      },
      innerListLoading3: false,
      innerTableVisible3: false,
      innerDialogFormVisible3: false,
      innerRules3: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      innerList4: null,
      innerTotal4: null,
      innerTableKey4: 1,
      innerTableTitle4: '',
      innerTableTitle5: '',
      innerListQuery4: {
        page: 1,
        page_size: 10,
        support_user_account_id: undefined,
        join_time: new Date(),
        sort: '-id'
      },
      innerTemp4: {
        weixin_fans_weixin_account: '',
        remark: '',
        join_time: new Date().setTime(new Date().getTime()),
        if_consult: 0
      },
      innerTemp5: {
        product_ids: [],
        support_user_account_id: undefined
      },
      innerListLoading4: false,
      innerTableVisible4: false,
      innerTableVisible5: false,
      innerDialogFormVisible4: false,
      innerRules4: {},
      userGroupOptions: [],
      productOptions: [],
      userGroupTeamOptions: [],
      userAccountOptions: [],
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
      pickerOptions3: {
        disabledDate(time) {
          return time.getTime() > Date.now() || time.getTime() < (Date.now() - 3600 * 1000 * 24 * 3)
        }
        // shortcuts: [{
        //   text: '今天',
        //   onClick(picker) {
        //     picker.$emit('pick', new Date())
        //   }
        // }, {
        //   text: '昨天',
        //   onClick(picker) {
        //     const date = new Date()
        //     date.setTime(date.getTime() - 3600 * 1000 * 24)
        //     picker.$emit('pick', date)
        //   }
        // }, {
        //   text: '一周前',
        //   onClick(picker) {
        //     const date = new Date()
        //     date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
        //     picker.$emit('pick', date)
        //   }
        // }]
      },
      pickerOptions4: {
        disabledDate(time) {
          return time.getTime() > Date.now() || time.getTime() < (Date.now() - 3600 * 1000 * 24 * 3)
        }
        // shortcuts: [{
        //   text: '今天',
        //   onClick(picker) {
        //     picker.$emit('pick', new Date())
        //   }
        // }, {
        //   text: '昨天',
        //   onClick(picker) {
        //     const date = new Date()
        //     date.setTime(date.getTime() - 3600 * 1000 * 24)
        //     picker.$emit('pick', date)
        //   }
        // }, {
        //   text: '一周前',
        //   onClick(picker) {
        //     const date = new Date()
        //     date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
        //     picker.$emit('pick', date)
        //   }
        // }]
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
    this.getUserGroupTree()
    this.getList()
    this.getProductList()
  },
  methods: {
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
    handleFilterGrounp(val) {
      this.listQuery.support_user_account_group_id = val[val.length - 1]
      this.handleFilter()
    },
    changeStatus(e, row) {
      const parm = {
        support_user_account_id: row.id,
        is_front_model: e
      }
      editSupportInfo(parm).then(res => {
        this.$notify({
          title: '成功',
          message: '转换成功',
          type: 'success',
          duration: 1000
        })
      }).catch(() => {
        row.support_info.is_front_model = e === 1 ? 0 : 1
      })
    },
    handleInnerSizeChange3(val) {
      this.listQuery.page_size = val
      this.getList()
    },
    handleInnerCurrentChange3(val) {
      this.listQuery.page = val
      this.getList()
    },
    innerTemp2DateChange(date) {
      const timestamp2 = Date.parse(new Date(date)) + 28800000
      this.innerTemp1.join_time = timestamp2
    },
    getGroupList() {
      getUserAccountGroupList({ user_account_type_id: 2 }).then(response => {
        if (response.data.data) {
          this.userGroupOptions = response.data.data
        }
      })
    },
    getProductList() {
      getProductList({ is_promote: 1, page_size: 0 }).then(response => {
        this.productOptions = response.data
      })
    },
    getGroupTeamList() {
      if (!this.listQuery.support_user_account_group_id) {
        return
      }
      const params = {}
      params.support_user_account_group_id = this.listQuery.support_user_account_group_id
      getUserAccountGroupTeamList(params).then(response => {
        if (response.data.data) {
          this.userGroupTeamOptions = response.data.data
        }
      })
    },
    getList() {
      this.listLoading = true
      getSupportMemberWithAllList(this.listQuery).then(response => {
        this.list = response.data.data.map(item => {
          if (item.support_info == null) {
            item.support_info = {
              is_front_model: 1
            }
          }
          return item
        })
        console.log(this.list)
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleGroupFilter() {
      this.listQuery.user_account_group_team_id = undefined
      this.getList()
    },
    handleGroupTeamFilter() {
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
        domain_name: '',
        ip: '',
        copyright: '',
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
          createDomain(this.temp).then(response => {
            this.temp = response.data
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
          tempData.domain_id = this.temp.id
          updateDomain(tempData).then(() => {
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
    updateSupportProduct() {
      this.$refs['dataForm5'].validate((valid) => {
        if (valid) {
          updateSupportProduct(this.innerTemp5).then(() => {
            this.getList()
            this.innerTableVisible5 = false
            this.$notify({
              title: '成功',
              message: '设置产品成功',
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
      this.innerTableTitle1 = row.nickname + ' -- 微信号管理'
      this.innerListQuery1.support_user_account_id = row.id // copy obj
      this.getInnerList1()
    },
    getInnerList1() {
      this.innerListLoading1 = true
      getProductWeixinList(this.innerListQuery1).then(response => {
        this.innerList1 = response.data.data
        this.innerTotal1 = response.data.total
        this.innerListLoading1 = false
      })
    },
    handleOpenInner3(row) {
      this.temp = Object.assign({}, row)
      this.innerTableVisible3 = true
      this.innerTableTitle3 = row.nickname + ' -- 微信号加粉管理'
      this.innerListQuery3.support_user_account_id = row.id // copy obj
      this.getInnerList3()
    },
    handleOpenInner4(row) {
      this.temp = Object.assign({}, row)
      this.innerTableVisible4 = true
      this.innerTableTitle4 = row.nickname + ' -- 微信号未加粉管理'
      this.innerListQuery4.support_user_account_id = row.id // copy obj
      this.getInnerList4()
    },
    handleOpenInner5(row) {
      console.log(row)
      if (row.support_product && row.support_product.length > 0) {
        row.support_product.map((item, index, array) => {
          this.innerTemp5.product_ids.push(item.product.id)
        })
      }
      this.innerTemp5.support_user_account_id = row.id
      this.innerTableVisible5 = true
      this.innerTableTitle5 = row.nickname + ' -- 销售产品'
      this.$nextTick(() => {
        this.$refs['dataForm5'].clearValidate()
      })
    },
    // 设置客服等级
    getSupportLevelList() {
      getSupportLevelList({ level_status: 1 }).then(response => {
        this.fullOptions = response.data.data
        this.typeCustomerLoading = false
      })
    },
    handleCustomerService(row) {
      this.handleCustomerServiceLevel = true
      this.resetempLevel()
      this.typeCustomerLoading = true
      this.getSupportLevelList()
      this.innerTempLevel.support_level_id = row.support_user_account_level_relations ? row.support_user_account_level_relations.support_level_id : undefined
      this.innerTempLevel.support_user_account_id = row.id
      // this.customerService = row.nickname + ' -- 等级名称'
      this.$nextTick(() => {
        this.$refs['dataFormLevel'].clearValidate()
      })
    },
    resetempLevel() {
      this.innerTempLevel = {
        support_level: {},
        support_user_account_id: undefined,
        support_level_id: undefined
      }
    },
    updateSupportLevel() {
      this.$refs['dataFormLevel'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.innerTempLevel)
          // tempData.support_level_id = this.support_level_id
          // tempData.support_user_account_id = this.support_user_account_id
          updateSupportUserAccountLevelRelations(tempData).then(response => {
            this.getList()
            this.handleCustomerServiceLevel = false
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
    getInnerList3() {
      this.innerListLoading3 = true
      getDateAddFansInfo(this.innerListQuery3).then(response => {
        this.innerList3 = response.data.data
        this.innerTotal3 = response.data.total
        this.innerListLoading3 = false
      })
    },
    getInnerList4() {
      this.innerListLoading4 = true
      getDateUnfilledFansInfo(this.innerListQuery4).then(response => {
        this.innerList4 = response.data.data
        this.innerTotal4 = response.data.total
        this.innerListLoading4 = false
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
        weixin_fans_weixin_account: '',
        remark: '',
        join_time: new Date().setTime(new Date().getTime()),
        if_consult: 0
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
      this.innerTemp2 = Object.assign({}, row) // copy obj
      this.resetInnerTemp1()
      this.innerTemp1.weixin_account = row.weixin_account
      this.innerTemp1.weixin_nickname = row.weixin_nickname
      this.innerTemp1.product_weixin_id = row.id
      this.dialogStatus = 'create'
      this.innerDialogFormVisible1 = true
      this.$nextTick(() => {
        this.$refs['innerDataForm1'].clearValidate()
      })
    },
    updateInnerData1() {
      this.$refs['innerDataForm1'].validate((valid) => {
        if (valid) {
          createProductWeixinFans(this.innerTemp1).then(() => {
            this.innerTemp2.fans_total = parseInt(this.innerTemp2.fans_total) + 1
            for (const v of this.innerList1) {
              if (v.id === this.innerTemp1.product_weixin_id) {
                const index = this.innerList1.indexOf(v)
                this.innerList1.splice(index, 1, this.innerTemp2)
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
    cancelEditAdd(row) {
      row.add_count = row.origin_add_count
      row.edit_add = false
      this.$message({
        message: '已取消修改',
        type: 'warning'
      })
    },
    cancelUnfilledEditAdd(row) {
      row.add_count = row.origin_add_count
      row.edit_add = false
      this.$message({
        message: '已取消修改',
        type: 'warning'
      })
    },
    cancelEditConsult(row) {
      row.consult_count = row.origin_consult_count
      row.edit_consult = false
      this.$message({
        message: '已取消修改',
        type: 'warning'
      })
    },
    cancelEditUnfilled(row) {
      row.consult_count = row.origin_unfilled_count
      row.edit_unfilled = false
      this.$message({
        message: '已取消修改',
        type: 'warning'
      })
    },
    confirmEditAdd(row) {
      const tempData = {}
      tempData.support_user_account_id = this.temp.id
      tempData.join_time = this.innerListQuery3.join_time
      tempData.add_count = row.add_count
      tempData.consult_count = row.consult_count
      tempData.product_weixin_id = row.id
      updateProductWeixinRecord(tempData).then(response => {
        row.edit_add = false
        row.origin_add_count = row.add_count
        this.$message({
          message: '新加好友数已修改',
          type: 'success'
        })
      })
    },
    confirmUnfilledEditAdd(row) {
      const tempData = {}
      tempData.support_user_account_id = this.temp.id
      tempData.join_time = this.innerListQuery4.join_time
      tempData.add_count = row.add_count
      tempData.unfilled_count = row.unfilled_count
      tempData.product_weixin_id = row.id
      updateProductWeixinUnfilled(tempData).then(response => {
        row.edit_add = false
        row.origin_add_count = row.add_count
        this.$message({
          message: '新加好友数已修改',
          type: 'success'
        })
      })
    },
    confirmEditConsult(row) {
      const tempData = {}
      tempData.support_user_account_id = this.temp.id
      tempData.join_time = this.innerListQuery3.join_time
      tempData.add_count = row.add_count
      tempData.consult_count = row.consult_count
      tempData.product_weixin_id = row.id
      updateProductWeixinRecord(tempData).then(response => {
        row.edit_consult = false
        row.origin_consult_count = row.consult_count
        this.$message({
          message: '咨询数已修改',
          type: 'success'
        })
      })
    },
    confirmEditUnfilled(row) {
      const tempData = {}
      tempData.support_user_account_id = this.temp.id
      tempData.join_time = this.innerListQuery3.join_time
      tempData.add_count = row.add_count
      tempData.unfilled_count = row.unfilled_count
      tempData.product_weixin_id = row.id
      updateProductWeixinUnfilled(tempData).then(response => {
        row.edit_unfilled = false
        row.origin_unfilled_count = row.unfilled_count
        this.$message({
          message: '未添加粉丝数已修改',
          type: 'success'
        })
      })
    }
  },
  watch: {
    innerTableVisible5(val) {
      if (val === false) {
        this.innerTemp5 = {
          product_ids: [],
          user_account_id: undefined
        }
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
  .inline-btn {
    margin-top:10px;
  }
  .el-tag {
    padding: 0 4px;
    font-size: 14px;
    line-height: 26px;
    height: 26px;
  }
</style>
