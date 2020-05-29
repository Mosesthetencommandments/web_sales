<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <div class="filter-item">
        <div class="filter-label">排序</div>
        <el-select @change='handleFilter'
                   style="width: 120px"
                   size="small"
                   v-model="listQuery.sort"
                   placeholder="选择">
          <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
          </el-option>
        </el-select>
      </div>

      <div class="filter-item">
        <div class="filter-label">客服部门</div>
        <el-cascader
          clearable
          size="small"
          :options="userGroupTree"
          change-on-select
          placeholder="选择"
          :props="defaultPropsGroup"
          v-model="userGroupOptions"
          @change="handleFilterGrounp">
        </el-cascader>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服</div>
        <el-select
          style="width: 150px"
          size="small"
          @focus="getSupportUserAccountList(' ')"
          @change='handleFilter'
          v-model="listQuery.support_user_account_id"
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
        <el-button class="filter-item" size="small" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      </div>
    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column align="center" label="ID" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="客服">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="客服部门">
        <template slot-scope="scope">
          <span>
            {{scope.row.user_account_group.group_name}}
            <span v-if="scope.row.user_account_group_team">({{scope.row.user_account_group_team.team_name}})</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column width="250px" align="center" label="时间">
        <template slot-scope="scope">
          <span>{{scope.row.updated_at}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="230px" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleOpenInner5(scope.row)">粉丝查询</el-button>
          <el-button type="primary" size="mini" @click="handleOpenInner1(scope.row)">微信管理</el-button>
          <el-button type="primary" size="mini" @click="handleOpenInner3(scope.row)">当日加粉</el-button>
          <el-button type="warning" size="mini" @click="handleOpenInner4(scope.row)">未添加粉丝</el-button>
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

    <!--微信管理-->
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
            <span class="link-type" >微信：{{scope.row.weixin_account}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="产品">
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
        <el-table-column width="100px" align="center" label="备注">
          <template slot-scope="scope">
            <el-tag>{{scope.row.info}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="200" class-name="small-padding">
          <template slot-scope="scope">
            <el-button type="info" size="mini" @click="handleInnerCreateFans(scope.row)">录入粉丝</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="!innerListLoading1" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange1" @current-change="handleInnerCurrentChange1" :current-page.sync="innerListQuery1.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery1.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal1">
        </el-pagination>
      </div>
    </el-dialog>

    <!--粉丝查询-->
    <el-dialog :title="innerTableTitle5" :visible.sync="innerTableVisible5" width="90%" id="fans-query">
      <div class="filter-container">
        <div class="filter-item">
          <el-select @change='getInnerList5'
                     clearable
                     size="small"
                     style="width: 120px"
                     v-model="innerListQuery5.if_consult"
                     placeholder="是否咨询">
            <el-option v-for="item in ifonsultsOptions" :key="item.key" :label="item.label" :value="item.key">
            </el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <el-date-picker
            v-model="innerListQuery5.date_range"
            type="daterange"
            style="width: 250px;"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            align="right"
            size="small"
            unlink-panels
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions2"
            @change='getInnerList5'>
          </el-date-picker>
        </div>
        <div class="filter-item">
          <el-select
            style="width:120px;"
            @change='getInnerList5'
            @focus="getProductList(' ')"
            v-model="innerListQuery5.product_id"
            filterable
            size="small"
            clearable
            remote
            placeholder="选择产品"
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
        <div class="filter-item">
          <el-select
            style="width:140px;"
            size="small"
            @change='getInnerList5'
            v-model="innerListQuery5.product_weixin_id"
            filterable
            clearable
            remote
            placeholder="请选产品微信号"
            :remote-method="getProductWeixinList"
            :loading="ProductWeixinLoading">
            <el-option
              v-for="item in productWeixinOptions"
              :key="item.id"
              :label="item.weixin_account"
              :value="item.id">
            </el-option>
          </el-select>
        </div>


        <el-input @keyup.enter.native="getInnerList5"
                  style="width: 150px;"
                  clearable
                  size="small"
                  class="filter-item"
                  placeholder="备注"
                  v-model="innerListQuery5.remark">
        </el-input>
        <el-input @keyup.enter.native="getInnerList5"
                  size="small"
                  style="width: 150px;"
                  class="filter-item"
                  placeholder="粉丝微信号"
                  v-model="innerListQuery5.fans_weixin_account">
        </el-input>
        <div class="filter-float">
          <el-button class="filter-item" size="small" type="primary" v-waves icon="el-icon-search" @click="getInnerList5">搜索</el-button>
        </div>
      </div>

      <el-table stripe :key='innerTableKey5' :data="innerList5" v-loading="innerListLoading5" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="80">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="170px" align="center" label="微信号">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.product_weixin.weixin_account}}</span>
            <el-tag class="link-type">{{scope.row.product_weixin.info}}</el-tag>
          </template>
        </el-table-column>
        <!--<el-table-column min-width="80px" align="center" label="昵称">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link-type">{{scope.row.product_weixin.weixin_nickname}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column min-width="80px" align="center" label="粉丝微信">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.weixin_account}}</span><br>
          </template>
        </el-table-column>
        <el-table-column min-width="86px" align="center" label="产品">
          <template slot-scope="scope">
            <span>{{scope.row.product_weixin.product.product_name}}</span><br>
          </template>
        </el-table-column>
        <el-table-column min-width="160px" align="center" label="加粉时间">
          <template slot-scope="scope">
            <span>{{scope.row.join_time}}</span>
          </template>
        </el-table-column>
        <!--<el-table-column min-width="100px" align="center" label="客户标签">-->
          <!--<template slot-scope="scope">-->
            <!--<div v-for="item in scope.row.product_weixin_fans.tag">-->
              <!--<el-tag v-if="scope.row.product_weixin_fans.tag !== 0">{{item.tag_name}}</el-tag><br>-->
            <!--</div>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column min-width="120px" align="center" label="撞粉">
          <template slot-scope="scope">
            <template v-if="scope.row.id !== item.id" v-for="item in scope.row.same_fans">
              <el-tag class="link-type">{{item.product_weixin.info}}</el-tag>{{item.support_member.nickname}}<br/>
            </template>
          </template>
        </el-table-column>
        <el-table-column min-width="120px" align="center" label="备注">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.remark}}</span>
          </template>
        </el-table-column>
        <el-table-column width="100px" align="center" label="咨询">
          <template slot-scope="scope">
            <span>{{scope.row.fans_total}}</span>
            <el-tag :type="scope.row.if_consult | ifconsultFilter">{{scope.row.if_consult|ifconsultTranslator}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="160px" align="center" label="操作">
          <template slot-scope="scope">
            <el-button type="info" size="mini" @click="handleUpdateFans(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!innerListLoading5" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange5" @current-change="handleInnerCurrentChange5" :current-page.sync="innerListQuery5.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery5.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal5">
        </el-pagination>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible1">
      <el-form :rules="innerRules1" ref="innerDataForm1" :model="innerTemp1" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>
        <!--<el-form-item label="微信号">-->
          <!--<el-input v-model="innerTemp1.weixin_account" disabled></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="昵称">-->
          <!--<el-input v-model="innerTemp1.weixin_nickname" disabled></el-input>-->
        <!--</el-form-item>-->
        <el-form-item label="粉丝微信号">
          <el-input  @blur="productWeixinFansRegist" :disabled="dialogStatus === 'update'" v-model="innerTemp1.weixin_account"></el-input>
        </el-form-item>
        <el-form-item label="相同粉丝微信号" v-if="Regist.length > 0">
            <template v-for="item in Regist">
              {{item.product_weixin.weixin_account}}<el-tag style="margin-right: 2px;" class="link-type">{{item.product_weixin.info}}</el-tag>{{item.support_member.nickname}}<br/>
            </template>
        </el-form-item>
        <el-form-item label="加粉时间" prop="join_time">
          <el-date-picker
            style="width:100%;"
            v-model="innerTemp1.join_time"
            align="right"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期"
            :picker-options="pickerOptions1">
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
        <el-button v-if="dialogStatus=='create'" type="primary" @click="innerCreateFans">确 定</el-button>
        <el-button v-else type="primary" @click="innerUpdataFans">确 定</el-button>
      </div>
    </el-dialog>

    <!--当日加粉-->
    <el-dialog :title="innerTableTitle3" :visible.sync="innerTableVisible3" width="90%" >
      <div class="filter-container" >
        <el-date-picker
          v-model="innerListQuery3.join_time"
          align="left"
          type="date"
          size="small"
          class="filter-item"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          @change="getInnerList3">
        </el-date-picker>
      </div>

      <el-table stripe :key='innerTableKey3' :data="innerList3" v-loading="innerListLoading3" element-loading-text="给我一点时间" border fit highlight-current-row
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
            <span class="link-type">微信：{{scope.row.weixin_account}}</span>
            <el-tag>{{scope.row.info}}</el-tag>
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
        <!--<el-table-column min-width="100px" align="center" label="状态">-->
          <!--<template slot-scope="scope">-->
            <!--<el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column width="200px" label="加粉数"  align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.edit_add">
              <el-input-number v-model="scope.row.add_count" controls-position="right" :min="0" :max="200"></el-input-number>
              <el-button class='inline-btn' v-if="scope.row.edit_add" type="success" @click="confirmEditAdd(scope.row)" size="small" icon="el-icon-circle-check-outline">完成</el-button>
              <el-button class='inline-btn' size="small" icon="el-icon-refresh" type="warning" @click="cancelEditAdd(scope.row)">取消</el-button>
            </template>
            <span class="link-type" style="padding:2px 70px;" @click='openEdit(scope.row, "edit_add")' v-else>{{ scope.row.add_count }}</span>
          </template>
        </el-table-column>
        <el-table-column width="200px" label="咨询数"  align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.edit_consult">
              <el-input-number v-model="scope.row.consult_count" controls-position="right" :min="0" :max="200"></el-input-number>
              <el-button class='inline-btn' v-if="scope.row.edit_consult" type="success" @click="confirmEditConsult(scope.row)" size="small" icon="el-icon-circle-check-outline">完成</el-button>
              <el-button class='inline-btn' size="small" icon="el-icon-refresh" type="warning" @click="cancelEditConsult(scope.row)">取消</el-button>
            </template>
            <span class="link-type" style="padding:2px 70px;" @click='openEdit(scope.row, "edit_consult")' v-else>{{ scope.row.consult_count }}</span>
          </template>
        </el-table-column>
        <el-table-column width="200px" label="加粉情况"  align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.has_added | hasAddedFilter">{{scope.row.has_added|hasAddedTranslator}}</el-tag>
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
          size="small"
          class="filter-item"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
          :picker-options="pickerOptions4"
          @change="getInnerList4">
        </el-date-picker>
      </div>
      <el-table stripe :key='innerTableKey4' :data="innerList4" v-loading="innerListLoading4" element-loading-text="给我一点时间" border fit highlight-current-row
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
            <span class="link-type">微信：{{scope.row.weixin_account}}</span>
            <el-tag>{{scope.row.info}}</el-tag>
          </template>
        </el-table-column>
        <!--<el-table-column min-width="100px" align="center" label="状态">-->
          <!--<template slot-scope="scope">-->
            <!--<el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>-->
          <!--</template>-->
        <!--</el-table-column>-->
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

      <div v-show="!innerListLoading4" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange4" @current-change="handleInnerCurrentChange4" :current-page.sync="innerListQuery4.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery4.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal4">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { createDomain, updateDomain, deleteDomain, createDomainExtraCode, deleteDomainExtraCode } from '@/api/domain'
  // import { getProductWeixinFansProtraitItemList } from '@/api/fans_protrait'
  import { getSupportMemberList } from '@/api/support_member'
  import { getSupportGroupList } from '@/api/support_member'
  import { getTagTree } from '@/api/tag'
  import { getProductWeixinList, getProductWeixinFansList, updateProductWeixinFans } from '@/api/product_weixin'
  import { getProductList, getProductWeixinFansRegist } from '@/api/product'
  import { createProductWeixinFans, getDateAddFansInfo, updateProductWeixinRecord, getDateUnfilledFansInfo, updateProductWeixinUnfilled } from '@/api/product_weixin_fans'
  import waves from '@/directive/waves'
  import { parseTime } from '@/utils/index'

  export default {
    name: 'addFanSetting',
    directives: {
      waves
    },
    data() {
      return {
        Regist: [],
        scrollTop: 0,
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        tagData: [],
        dynamicTags: [],
        listQuery: {
          page: 1,
          page_size: 20,
          support_user_account_group_id: undefined,
          support_user_account_id: undefined,
          nickname: '',
          status: 1,
          sort: '-id'
        },
        defaultProps: {
          children: 'child',
          label: 'tag_name'
        },
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showAuditor: false,
        temp: {
          id: undefined,
          domain_name: '',
          ip: '',
          copyright: '',
          info: ''
        },
        userGroupOptions:[],
        userGroupTree: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        tag_color: ['gray', 'success', 'danger', 'warning'],
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        rules: {
          domain_name: [{ required: true, message: '请正确填写域名名称', trigger: 'change' }]
        },
        tempArry: [],
        innerList1: null,
        innerTotal1: null,
        innerTableKey1: 1,
        innerTableTitle1: '',
        TagIdArry: [],
        TagIdArry2: [],
        innerListQuery1: {
          page: 1,
          page_size: 10,
          support_user_account_id: undefined,
          sort: '-id'
        },
        innerTemp1: {
          weixin_account: '',
          remark: '',
          join_time: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
          if_consult: 1,
          product_weixin_fans_protrait: {}
        },
        innerTemp5: {
          join_time: '',
          product_weixin: {},
          product_weixin_fans: {},
          tag_ids: []
        },
        innerTemp6: {},
        innerTemp2: {},
        innerListLoading1: false,
        innerTableVisible1: false,
        innerDialogFormVisible1: false,
        innerRules1: {
          name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
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
        innerListLoading4: false,
        innerTableVisible4: false,
        innerDialogFormVisible4: false,
        innerRules4: {},
        userGroupTeamOptions: [],
        userAccountOptions: [],
        innerListLoading5: false,
        innerTableVisible5: false,
        innerList5: null,
        innerTotal5: null,
        innerTableKey5: 1,
        innerTableTitle5: '',
        allTagArry1: [],
        innerListQuery5: {
          page: 1,
          page_size: 10,
          weixin_account: '',
          product_weixin_id: undefined,
          sort: '-id',
          fans_weixin_account: '',
          remark: '',
          product_id: undefined,
          date_range: '',
          if_consult: undefined
        },
        productLoading: false,
        ProductWeixinLoading: false,
        productOptions: [],
        productWeixinOptions: [],
        protraitItemArray: [],
        ifonsultsOptions: [{ label: '未咨询', key: 0 }, { label: '已咨询', key: 1 }],
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
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        pickerOptions1: {
          disabledDate(time) {
            return time.getTime() > Date.now()
          }
        },
        pickerOptions3: {
          disabledDate(time) {
            return time.getTime() > Date.now() || time.getTime() < Date.now()
          }
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
      ifconsultFilter(status) {
        const statusMap = {
          0: 'gray',
          1: 'success'
        }
        return statusMap[status]
      },
      ifconsultTranslator(status) {
        const statusMap = {
          0: '未咨询',
          1: '已咨询'
        }
        return statusMap[status]
      },
      hasAddedFilter(status) {
        const statusMap = {
          0: 'gray',
          1: 'success'
        }
        return statusMap[status]
      },
      hasAddedTranslator(status) {
        const statusMap = {
          0: '未录',
          1: '已录'
        }
        return statusMap[status]
      },
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
      handleAddTag2(name, id, index) {
        for (const v in this.TagIdArry2) {
          if (this.TagIdArry2[v] === id) {
            this.TagIdArry2[v] = 99999
          }
        }
      },
      handleAddTag3(name, id, index) {
        this.TagIdArry2 = []
      },
      handleAddTag(name, id, index) {
      },
      handleClose(index) {
        this.TagIdArry.splice(index, 1)
      },
      getTagList() {
        getTagTree({ tag_type_code: 'custom', is_customized: 0 }).then(response => {
          this.allTagArry1 = response.data
        })
      },
      openEdit(row, key) {
        // if (this.$store.state.user.roles === 'support' && (new Date().getHours() < 17 || new Date().getHours() >= 20)) {
        //   this.$message.error('录粉时间 17:00 ~ 20:00')
        // } else {
        //   row[key] = 1
        // }
        row[key] = 1
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
      getProductWeixinList(query) {
        if (query !== '') {
          this.productWeixinLoading = true
          getProductWeixinList({ weixin_account: query, support_user_account_id: this.temp.id }).then(response => {
            this.productWeixinOptions = response.data.data
            this.productWeixinLoading = false
          })
        }
      },
      handleInnerSizeChange3(val) {
        this.innerListQuery3.page_size = val
        this.getInnerList3()
      },
      handleInnerCurrentChange3(val) {
        this.innerListQuery3.page = val
        this.getInnerList3()
      },
      handleInnerSizeChange4(val) {
        this.innerListQuery4.page_size = val
        this.getInnerList4()
      },
      handleInnerCurrentChange4(val) {
        this.innerListQuery4.page = val
        this.getInnerList4()
      },
      handleInnerSizeChange5(val) {
        this.innerListQuery5.page_size = val
        this.getInnerList5()
      },
      handleInnerCurrentChange5(val) {
        this.innerListQuery5.page = val
        this.getInnerList5()
      },
      getList() {
        this.listLoading = true
        getSupportMemberList(this.listQuery).then(response => {
          this.list = response.data.data
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
      getSupportUserAccountList(query) {
        if (query !== '') {
          this.supportUserAccountLoading = true
          getSupportMemberList({ nickname: query, status: 1 }).then(response => {
            this.supportUserAccountOptions = response.data.data
            this.supportUserAccountLoading = false
          })
        }
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
        this.temp = Object.assign({}, row)
        this.innerTableVisible5 = true
        this.innerTableTitle5 = row.nickname + ' -- 粉丝查询'
        this.innerListQuery5.support_user_account_id = row.id // copy obj
        this.getInnerList5()
      },
      getInnerList5() {
        this.getProductWeixinList(' ')
        this.innerListLoading5 = true
        getProductWeixinFansList(this.innerListQuery5).then(response => {
          this.innerList5 = response.data.data
          this.innerTotal5 = response.data.total
          this.innerListLoading5 = false
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
          weixin_account: '',
          remark: '',
          join_time: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
          if_consult: 1,
          product_weixin_fans_protrait: {}
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
      handleInnerCreateFans(row) {
        this.resetInnerTemp1()
        this.innerTemp1.product_weixin_id = row.id
        this.innerTemp2 = JSON.parse(JSON.stringify(row)) // copy obj
        // getProductWeixinFansProtraitItemList({
        //   product_id: row.product_id
        // }).then(res => {
        //   this.protraitItemArray = res.data
        // })
        this.Regist = []
        this.dialogStatus = 'create'
        this.innerDialogFormVisible1 = true
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      innerCreateFans() {
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
                message: '录入成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdateFans(row) {
        console.log(row)
        this.dialogStatus = 'update'
        this.innerTemp1 = JSON.parse(JSON.stringify(row))
        this.innerTemp1.weixin_account = row.weixin_account
        this.innerDialogFormVisible1 = true
        this.Regist = []
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      innerUpdataFans() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            const parm = this.innerTemp1
            parm.product_weixin_fans_id = parm.id
            updateProductWeixinFans(parm).then(() => {
              this.getInnerList5()
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
      productWeixinFansRegist() {
        if (!this.innerTemp1.weixin_account) {
          return false
        }
        getProductWeixinFansRegist({ fans_weixin_account: this.innerTemp1.weixin_account }).then(res => {
          if (res.data !== []) {
            this.Regist = res.data
          }
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
        // const date = new Date()
        // const nowTime = date.getTime()
        const startDay = new Date()
        const endDay = new Date()
        const startNight = new Date()
        const endNight = new Date()
        startDay.setHours(17)
        startDay.setMinutes(0)
        endDay.setHours(17)
        endDay.setMinutes(30)
        startNight.setHours(22)
        startNight.setMinutes(30)
        endNight.setHours(23)
        endNight.setMinutes(0)
        // const startTime = startDay.getTime()
        // const endTime = endDay.getTime()
        // const startTime1 = startNight.getTime()
        // const endTime1 = endNight.getTime()
        if (this.$store.state.user.roles === 'support') {
          // if ((nowTime >= startTime && nowTime < endTime) || (nowTime >= startTime1 && nowTime < endTime1)) {
          // if (true) {
          updateProductWeixinRecord(tempData).then(response => {
            row.has_added = 1
            row.edit_add = false
            row.origin_add_count = row.add_count
            this.$message({
              message: '新加好友数已修改',
              type: 'success'
            })
          })
          // } else {
          //   this.$message({
          //     message: '请在规定时间内加粉(白班17:00~17:30,晚班22:30~23:00)',
          //     type: 'danger'
          //   })
          // }
        } else {
          updateProductWeixinRecord(tempData).then(response => {
            row.has_added = 1
            row.edit_add = false
            row.origin_add_count = row.add_count
            this.$message({
              message: '新加好友数已修改',
              type: 'success'
            })
          })
        }
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
      innerDialogFormVisible1(val) {
        if (val === false) {
          this.allTagArry1.push(...this.dynamicTags)
          this.dynamicTags = []
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
  #fans-query >>> .el-dialog__body {
    padding: 0 20px 30px;
  }
</style>
