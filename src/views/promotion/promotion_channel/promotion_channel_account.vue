<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-select
        class="filter-item"
        style="width:150px;"
        @change='handleFilter'
        v-model="listQuery.promotion_channel_id"
        filterable
        clearable
        remote
        placeholder="渠道"
        :remote-method="getPromotionMemberInfo"
        :loading="userPromotionChannelLoading">
        <el-option
          v-for="item in userChannelOptions"
          :key="item.channel_name"
          :label="item.channel_name"
          :value="item.id">
        </el-option>
      </el-select>
      <el-input @keyup.enter.native="handleFilter" style="width: 150px;" class="filter-item" placeholder="账户名称" v-model="listQuery.account_name">
      </el-input>
      <el-select style="width: 150px"
                 class="filter-item"
                 @change='handleFilter'
                 v-model="listQuery.promotion_user_account_id"
                 filterable
                 clearable
                 remote
                 placeholder="请选择推广人"
                 :remote-method="getPromotionMemberList2"
                 :loading="promotionMemberLoading">
        <el-option
          v-for="item in promotionMemberOptions2"
          :key="item.id"
          :label="item.nickname"
          :value="item.id">
        </el-option>
      </el-select>
      <el-input @keyup.enter.native="handleFilter" style="width: 150px;" class="filter-item" placeholder="开户人" v-model="listQuery.bank_creator">
      </el-input>
      <el-select @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.sort" placeholder="排序">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-select @change='handleFilter' clearable style="width: 120px" class="filter-item" v-model="listQuery.status" placeholder="状态">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button v-if="($store.state.user.roles === 'administrator') || ($store.state.user.roles === 'promotionManager') || ($store.state.user.roles === 'promotionDirector')|| ($store.state.user.roles === 'promotiondataclerk')" class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate1" type="primary" icon="el-icon-edit">添加账户</el-button>
      <p style="text-align: right;padding-right:20px;font-size:22px;">
        <span>总余额：<span style="color:red;">{{Math.floor(total_balance * 100) / 100}}</span></span>
      </p>
    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column align="center" label="序号" width="40">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="130px" align="center" label="账号名称">
        <template slot-scope="scope">
          <span class="link-type" @click="handleInnerUpdate1(scope.row)">{{scope.row.account_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="渠道名称">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.promotion_channel.channel_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="余额">
        <template slot-scope="scope">
          <span class="link-type" @click="handleInnerUpdate1(scope.row)">{{scope.row.total_money}}</span>
        </template>
      </el-table-column>
      <el-table-column width="70px" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="推广人" width="65">
        <template slot-scope="scope">
          <span v-if="scope.row.promotion_user_account !== null">{{scope.row.promotion_user_account.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="开户人" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.bank_creator}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="开户行" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.bank_info}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="收款人" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.receiver}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="	收款账户" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.bank_account}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="120px" align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{scope.row.updated_at}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="400px" class-name="small-padding">
        <template slot-scope="scope">
          <el-button v-if="($store.state.user.roles === 'administrator') || ($store.state.user.roles === 'promotionManager') || ($store.state.user.roles === 'promotionGroup') || ($store.state.user.roles === 'promotion')|| ($store.state.user.roles === 'promotionDirector')" type="primary" size="mini" @click="handleOpenInner3(scope.row)">充值</el-button>
          <el-button type="success" size="mini" @click="handleOpenInner4(scope.row)">消费</el-button>
          <el-button type="danger" size="mini" @click="handleRefund(scope.row)">退款</el-button>
          <!--<el-button v-if="($store.state.user.roles === 'administrator') || ($store.state.user.roles === 'promotionManager') || ( this.$store.state.user.roles === 'promotionDirector')" type="warning" size="mini" @click="handleTransfer(scope.row)">转账</el-button>-->
          <!--<el-button v-if="scope.row.status!=0" size="small" type="gray" @click="handleModifyStatus(scope.row,0)">关闭-->
          <!--</el-button>-->
          <!--<el-button v-if="scope.row.status!=1" size="small" type="success" @click="handleModifyStatus(scope.row,1)">开启-->
          <!--</el-button>-->
          <!--<el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除-->
          <!--</el-button>-->
          <el-dropdown @command="changeStatus" placement="bottom" trigger="click" style="margin-left: 10px">
            <el-button type="info" size="mini" @click="handleChangeStatus(scope.row.id)">状态</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="scope.row.status === 0 || scope.row.status === 3" command="1">正常</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.status === 1 || scope.row.status === 2" command="0">关闭</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.status === 1" command="2">退款中</el-dropdown-item>
              <el-dropdown-item v-if="scope.row.status === 1" command="3">暂停</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
      <el-form :rules="innerRules1" ref="innerDataForm1" :model="innerTemp1" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="渠道名称" prop="domain_prefix" v-show="channelListShow">
          <multiselect v-model="innerTemp1.promotion_channel" :options="channelOptions" @search-change="queryChannelList" placeholder="搜索渠道" selectLabel="选择"
                       deselectLabel="删除" track-by="channel_name" :internalSearch="false" label="channel_name">
            <span slot='noResult'>无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="推广人">
          <el-select style="width: 100%"
                     v-model="innerTemp1.promotion_user_account_id"
                     filterable
                     clearable
                     remote
                     placeholder="请选择推广人"
                     :remote-method="getPromotionMemberList"
                     :loading="promotionMemberLoading">
            <el-option
              v-for="item in promotionMemberOptions"
              :key="item.id"
              :label="item.nickname"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账户名称" prop="account_name">
          <el-input v-model="innerTemp1.account_name"></el-input>
        </el-form-item>
        <el-form-item label="余额" prop="channel_name" v-if="dialogStatus === 'update'">
          <el-input v-model="innerTemp1.total_money"></el-input>
        </el-form-item>
        <el-form-item label="开户人" >
          <el-input v-model="innerTemp1.bank_creator"></el-input>
        </el-form-item>
        <el-form-item label="开户行" >
          <el-input v-model="innerTemp1.bank_info"></el-input>
        </el-form-item>
        <el-form-item label="收款人" >
          <el-input v-model="innerTemp1.receiver"></el-input>
        </el-form-item>
        <el-form-item label="收款账户" >
          <el-input v-model="innerTemp1.bank_account"></el-input>
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

      <el-table :stripe="true" :key='innerTableKey2' :data="innerList2" v-loading="innerListLoading2" element-loading-text="给我一点时间" border fit highlight-current-row
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
        <!--<el-table-column align="center" label="操作" width="320" class-name="small-padding">-->
          <!--<template slot-scope="scope">-->
            <!--<el-button size="mini" type="danger" @click="handleInnerDelete2(scope.row)">删除-->
            <!--</el-button>-->
          <!--</template>-->
        <!--</el-table-column>-->
      </el-table>

      <div v-show="!innerListLoading2" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange2" @current-change="handleInnerCurrentChange2" :current-page.sync="innerListQuery2.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery2.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal2">
        </el-pagination>
      </div>
    </el-dialog>
    <!--<el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible2">-->
      <!--<el-form :rules="innerRules2" ref="innerDataForm2" :model="innerTemp2" label-position="left" label-width="25%" style='width: 50%; margin-left:10%;'>-->
        <!--<el-form-item label="渠道" prop="channel_name" v-if="temp.promotion_channel">-->
          <!--<el-input v-model="temp.promotion_channel.channel_name" disabled></el-input>-->
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
    <!--<el-dialog :title="innerTableTitle3" :visible.sync="innerTableVisible3" width="90%" >-->
      <!--<div class="filter-container" align="right">-->
        <!--<el-date-picker-->
          <!--style="float:left"-->
          <!--v-model="innerListQuery3.date_range"-->
          <!--type="daterange"-->
          <!--format="yyyy-MM-dd"-->
          <!--value-format="yyyy-MM-dd"-->
          <!--align="right"-->
          <!--unlink-panels-->
          <!--range-separator="~"-->
          <!--start-placeholder="开始日期"-->
          <!--end-placeholder="结束日期"-->
          <!--:picker-options="pickerOptions2"-->
          <!--@change='handleInnerFilter3'>-->
        <!--</el-date-picker>-->
        <!--<el-button align="left" class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate3" type="primary" icon="el-icon-edit">充值</el-button>-->
      <!--</div>-->

      <!--<el-table :stripe="true" :key='innerTableKey3' :data="innerList3" v-loading="innerListLoading3" element-loading-text="给我一点时间" border fit highlight-current-row-->
                <!--style="width: 100%">-->
        <!--<el-table-column align="center" label="序号" width="65">-->
          <!--<template slot-scope="scope">-->
            <!--<span>{{scope.row.id}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column min-width="100px" align="center" label="推广人">-->
          <!--<template slot-scope="scope">-->
            <!--<span class="link-type">{{scope.row.promotion_member.nickname}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column min-width="100px" align="center" label="充值虚拟币">-->
          <!--<template slot-scope="scope">-->
            <!--<span>￥{{scope.row.virtual_money}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column min-width="100px" align="center" label="反点">-->
          <!--<template slot-scope="scope">-->
            <!--<span>{{scope.row.ratio}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column min-width="100px" align="center" label="折合人民币">-->
          <!--<template slot-scope="scope">-->
            <!--<span>{{scope.row.money}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column width="180px" align="center" label="录入时间">-->
          <!--<template slot-scope="scope">-->
            <!--<span>{{scope.row.created_at}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--&lt;!&ndash;<el-table-column align="center" label="操作" width="320" class-name="small-padding">&ndash;&gt;-->
          <!--&lt;!&ndash;<template slot-scope="scope">&ndash;&gt;-->
            <!--&lt;!&ndash;<el-button size="mini" type="danger" @click="handleInnerDelete3(scope.row)">删除&ndash;&gt;-->
            <!--&lt;!&ndash;</el-button>&ndash;&gt;-->
          <!--&lt;!&ndash;</template>&ndash;&gt;-->
        <!--&lt;!&ndash;</el-table-column>&ndash;&gt;-->
      <!--</el-table>-->

      <!--<div v-show="!innerListLoading3" class="pagination-container">-->
        <!--<el-pagination background @size-change="handleInnerSizeChange3" @current-change="handleInnerCurrentChange3" :current-page.sync="innerListQuery3.page"-->
                       <!--:page-sizes="[5,10,50, 100]" :page-size="innerListQuery3.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal3">-->
        <!--</el-pagination>-->
      <!--</div>-->
    <!--</el-dialog>-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible3">
      <el-form :rules="innerRules3" ref="innerDataForm3" :model="innerTemp3" label-position="left" label-width="25%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="渠道" prop="channel_name" v-if="temp.promotion_channel">
          <el-input v-model="temp.promotion_channel.channel_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="账户" prop="account_name">
          <el-input v-model="temp.account_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="充值虚拟币" prop="virtual_money">
          <el-input v-model="countedVirtualMoney" disabled></el-input>
        </el-form-item>
        <el-form-item label="请款时间" prop="operate_at">
          <el-date-picker
            v-model="innerTemp3.operate_at"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="返点" prop="virtual_money">
          <el-input v-model="innerTemp3.ratio"></el-input>
        </el-form-item>
        <el-form-item label="充值人民币" prop="money">
          <el-input v-model="innerTemp3.money"></el-input>
        </el-form-item>
        <el-form-item label="上传凭证" >
          <el-upload
            :action="baseUrl"
            :class="{disabledUpload:uploadDisabled}"
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
        <el-button @click="innerDialogFormVisible3 = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createInnerData3">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="退款录入" :visible.sync="innerDialogFormVisibleRefund">
      <el-form :rules="innerRules5" ref="innerDataForm5" :model="temprefund" label-position="left" label-width="25%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="渠道" prop="channel_name" >
          <el-input v-model="temprefund.channel_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="账户" prop="account_name">
          <el-input v-model="temprefund.account_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="返点" prop="ratio">
          <el-input v-model="temprefund.ratio"></el-input>
        </el-form-item>
        <el-form-item label="退款金额" prop="money">
          <el-input v-model="temprefund.money"></el-input>
        </el-form-item>
        <el-form-item label="上传凭证">
          <el-upload
            :action="baseUrl"
            :class="{disabledUpload:uploadDisabled}"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemoveRefund"
            :on-success="handlePictureSuccess2"
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
        <el-button @click="innerDialogFormVisibleRefund = false">取 消</el-button>
        <el-button type="primary" @click="createRefund">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="账户转账" :visible.sync="innerDialogFormVisibleTransfer" width="70%">
      <el-form :rules="innerRules6" ref="innerDataForm6" :model="tempTransfer" label-position="left" label-width="40%" style='width: 80%; margin-left:10%;'>
        <el-row>
          <el-col :span="10">
            <el-form-item label="转出账户">
              <el-input v-model="tempTransfer.account_name" disabled></el-input>
            </el-form-item>
            <el-form-item label="转出返点" prop="ratio">
              <el-input v-model="tempTransfer.ratio"></el-input>
            </el-form-item>
            <el-form-item label="转出虚拟币" prop="virtual_money">
              <el-input v-model.number="tempTransfer.virtual_money"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4" style="text-align: center;height: 100%;line-height: 100%">
            <i class="el-icon-back" style="transform: rotate(180deg);font-size: 60px;margin-top:40%"></i>
          </el-col>
          <el-col :span="10">
            <el-form-item label="转入账户" prop="target_promotion_channel_account">
              <el-select clearable
                         @change="getTargetRatio"
                          filterable
                          placeholder="转入账户"
                          remote
                         value-key="id"
                         style="width: 100%"
                          :remote-method="getChannelAccountOption"
                          :loading="channelAccountLoading"
                          v-model="tempTransfer.target_promotion_channel_account">
                <el-option v-for="item in channelAccountOption"
                           :key="item.id"
                           :label="item.account_name"
                           :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="转入返点" prop="target_ratio">
              <el-input v-model.number="tempTransfer.target_ratio"></el-input>
            </el-form-item>
            <el-form-item label="转入虚拟币" prop="target_virtual_money">
              <el-input v-model.number="tempTransfer.target_virtual_money"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisibleTransfer = false">取 消</el-button>
        <el-button type="primary" @click="createTransfer">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="innerTableTitle4" :visible.sync="innerDialogFormVisible4">
      <el-form :rules="innerRules4" ref="innerDataForm4" :model="innerTemp4" label-position="left" label-width="15%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="渠道" prop="channel_name" v-if="temp.promotion_channel">
          <el-input v-model="temp.promotion_channel.channel_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="账户" prop="account_name">
          <el-input v-model="temp.account_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="返点" prop="virtual_money">
          <el-input v-model="innerTemp4.ratio" disabled></el-input>
        </el-form-item>
        <el-form-item label="消费时间" prop="channel_name">
          <el-date-picker
            v-model="innerTemp4.consumption_time"
            align="right"
            type="date"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            :picker-options="pickerOptions1"
            @change="innerTemp4DateChange">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="产品-消费">
          <el-row :gutter="20" v-for="item in promotionChannelAccountProductOptions":key="item.id" style="margin-bottom: 5px;clear: both;">
            <el-col :span="8">
              <el-input v-model="item.product_name"></el-input>
            </el-col>
            <el-col :span="16">
              <el-input v-model="item.virtual_money"></el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible4 = false">取 消</el-button>
        <el-button type="primary" @click="updateInnerData4">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="innerTableTitle4" :visible.sync="innerTableVisible5">
      <el-table :stripe="true" :data="virtual_money_list" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="推广人">
          <template slot-scope="scope">
            <span>{{$store.state.user.name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="产品">
          <template slot-scope="scope">
            <span>{{scope.row.product_name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="消费">
          <template slot-scope="scope">
            <span>{{scope.row.virtual_money}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerTableVisible5 = false">取 消</el-button>
        <el-button type="primary" @click="updateInnerData5">录 入</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="imageDialogVisible">
      <img width="100%" :src="publicImageUrl">
    </el-dialog>
  </div>
</template>

<script>
  import { createPromotionChannelAccountConsumptionMassively, getPromotionChannelAccountList, createPromotionChannelAccount, updatePromotionChannelAccount, deletePromotionChannelAccount, createPromotionChannel, updatePromotionChannel, getPromotionChannelList, createPromotionChannelAccountConsumption, createPromotionChannelAccountRecharge, deletePromotionChannelAccountConsumption, deletePromotionChannelAccountRecharge, getPromotionChannelAccountConsumptionList, getPromotionChannelAccountRechargeList, getPromotionChannelAccountProductList, createPromotionChannelAccountRefund, getPromotionChannelAccountTotalMoney } from '@/api/promotion_channel'
  import { getProductList } from '@/api/product'
  import { getPromotionMemberList } from '@/api/promotion_member'
  import { getPromotionMemberInfo } from '@/api/promotion_member'
  import { changePromotionChannelAccountStatus } from '@/api/promotion_channel'
  import { createPromotionChannelAccountTransfer } from '@/api/promotion_statistics'
  import { parseTime } from '@/utils/index'
  import waves from '@/directive/waves' // 水波纹指令
  import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
  import 'vue-multiselect/dist/vue-multiselect.min.css'
  // 多选框组件css

  export default {
    name: 'promotion_channel_account',
    components: { Multiselect },
    directives: {
      waves
    },
    data() {
      const validate = (rule, value, callback) => {
        if (value === '' || value === undefined) {
          callback(new Error('请输入虚拟币'))
        } else if (typeof value !== 'number') {
          callback(new Error('输入数字!'))
        } else {
          callback()
        }
      }
      return {
        roleArry: ['administrator', 'promotionManager', 'promotionGroup', 'promotionDirector'],
        scrollTop: 0,
        baseUrl: process.env.BASE_API + '/api/document/uploadImage',
        promotionMemberOptions: [],
        promotionMemberOptions2: [],
        promotionMemberLoading: false,
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
        total_balance: 0,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          page_size: 20,
          promotion_user_account_id: undefined,
          bank_creator: undefined,
          promotion_channel_id: undefined,
          channel_name: undefined,
          sort: '-id',
          status: 1
        },
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: [{ label: '正常', key: 1 }, { label: '关闭', key: 0 }, { label: '退款中', key: 2 }, { label: '暂停', key: 3 }],
        showAuditor: false,
        temp: {
          id: undefined,
          promotion_channel_account_id: undefined,
          status: undefined
        },
        channelAccountOption: [],
        channelAccountLoading: false,
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
          promotion_user_account_id: undefined,
          total_money: undefined,
          account_name: undefined,
          channel_name: undefined,
          bank_creator: undefined,
          bank_info: undefined,
          receiver: undefined,
          bank_account: undefined
        },
        innerListLoading1: false,
        innerDialogFormVisible1: false,
        innerRules1: {
          name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
        },
        temprefund: {
          channel_name: undefined,
          account_name: undefined,
          ratio: undefined,
          proof_img: undefined,
          money: undefined,
          promotion_channel_account_id: undefined
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
          proof_img: undefined,
          operate_at: undefined,
          virtual_money: undefined,
          ratio: undefined,
          promotion_member: {
            id: undefined,
            nickname: ''
          }
        },
        fileList: [],
        innerListLoading3: false,
        innerTableVisible3: false,
        innerDialogFormVisible3: false,
        innerRules3: {
          name: [{ required: true, message: '请正确填写名称', trigger: 'change' }],
          operate_at: [{ required: true, message: '请正确请款时间', trigger: 'change' }]
        },
        channelOptions: [],
        userChannelOptions: [],
        channelListShow: true,
        productResult: [],
        productLoading: false,
        innerTemp4: {
          id: undefined,
          product_id: undefined,
          promotion_channel_account_id: undefined,
          promotion_user_account_id: undefined,
          money: undefined,
          virtual_money: undefined,
          ratio: undefined,
          consumption_time: new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24)),
          product: {
            id: undefined,
            product_name: ''
          }
        },
        tempTransfer: {
          account_name: undefined,
          promotion_channel_account_id: undefined,
          virtual_money: undefined,
          ratio: undefined,
          target_promotion_channel_account: undefined,
          target_ratio: undefined,
          target_virtual_money: undefined
        },
        publicImageUrl: undefined,
        innerTableTitle4: '',
        innerDialogFormVisible4: false,
        innerRules4: {
          name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
        },
        innerRules5: {
          ratio: [{ required: true, message: '请正确填写返点', trigger: 'change' }],
          money: [{ required: true, message: '请正确填写退款金额', trigger: 'change' }]
        },
        innerRules6: {
          ratio: [{ required: true, message: '填写转出返点', trigger: 'change' }],
          virtual_money: [{ trigger: 'change', validator: validate }],
          target_promotion_channel_account: [{ required: true, message: '选择转入账户', trigger: 'change' }],
          target_ratio: [{ required: true, message: '填写转入返点', trigger: 'change' }],
          target_virtual_money: [{ trigger: 'change', validator: validate }]
        },
        promotionChannelAccountProductOptions: [],
        virtual_money_list: [],
        imageDialogVisible: false,
        innerTableVisible5: false,
        userPromotionChannelLoading: false,
        innerDialogFormVisibleRefund: false,
        innerDialogFormVisibleTransfer: false,
        changeStatus_id: undefined
      }
    },
    computed: {
      // 计算属性的 getter
      uploadDisabled: function() {
        return this.fileList.length > 0
      },
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
          0: 'danger',
          1: 'success',
          2: 'warning',
          3: 'info'
        }
        return statusMap[status]
      },
      statusTranslator(status) {
        const statusTransMap = {
          0: '关闭',
          1: '正常',
          2: '退款中',
          3: '暂停'
        }
        return statusTransMap[status]
      }
    },
    created() {
      this.getList()
      this.getTotalBalance()
      this.getPromotionMemberInfo(' ')
    },
    methods: {
      handlePictureCardPreview(file) {
        this.publicImageUrl = file.url
        this.imageDialogVisible = true
      },
      handleRemove(file, fileList) {
        this.innerTemp3.proof_img = undefined
        this.fileList = []
      },
      handleRemoveRefund(file, fileList) {
        this.temprefund.proof_img = undefined
        this.fileList = []
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
      handlePictureSuccess(response, file, fileList) {
        this.fileList = fileList
        this.innerTemp3.proof_img = process.env.BASE_API + fileList[0].response.data.url
      },
      handlePictureSuccess2(response, file, fileList) {
        this.fileList = fileList
        this.temprefund.proof_img = process.env.BASE_API + fileList[0].response.data.url
      },
      getPromotionMemberList(query) {
        if (query !== '') {
          this.promotionMemberLoading = true
          getPromotionMemberList({ nickname: query, status: 1 }).then(response => {
            this.promotionMemberOptions = response.data.data
            this.promotionMemberLoading = false
          })
        }
      },
      getPromotionMemberList2(query) {
        if (query !== '') {
          this.promotionMemberLoading = true
          getPromotionMemberList({ nickname: query, status: 1 }).then(response => {
            this.promotionMemberOptions2 = response.data.data
            this.promotionMemberLoading = false
          })
        }
      },
      changeStatus(command) {
        changePromotionChannelAccountStatus({ promotion_channel_account_id: this.changeStatus_id, status: command }).then(res => { // 拉取用户信息
          // this.list[this.list.findIndex(d => d.id === res.data.id)].status === command
          this.getList()
          this.$notify({
            title: '成功',
            message: '修改成功',
            type: 'success',
            duration: 1000
          })
        }).catch(() => {
        })
      },
      handleChangeStatus(id) {
        this.changeStatus_id = id
      },
      getTargetRatio(val) {
        this.tempTransfer.target_ratio = val.ratio
        console.log(this.tempTransfer)
      },
      createRefund() {
        this.$refs['innerDataForm5'].validate((valid) => {
          if (valid) {
            createPromotionChannelAccountRefund(this.temprefund).then(() => {
              this.innerDialogFormVisibleRefund = false
              this.getList()
              this.$notify({
                title: '成功',
                message: '录入成功',
                type: 'success',
                duration: 2000
              })
              this.$refs['innerDataForm5'].clearValidate()
            })
          }
        })
      },
      createTransfer() {
        this.$refs['innerDataForm6'].validate((valid) => {
          if (valid) {
            this.tempTransfer.target_promotion_channel_account_id = this.tempTransfer.target_promotion_channel_account.id
            createPromotionChannelAccountTransfer(this.tempTransfer).then(() => {
              this.innerDialogFormVisibleTransfer = false
              this.getList()
              this.$notify({
                title: '成功',
                message: '录入成功',
                type: 'success',
                duration: 2000
              })
              this.$refs['innerDataForm6'].clearValidate()
            })
          }
        })
      },
      getPromotionChannelAccountProductList() {
        getPromotionChannelAccountProductList({ is_promote: 1, consumption_time: this.innerTemp4.consumption_time, promotion_channel_account_id: this.temp.id }).then(response => {
          this.promotionChannelAccountProductOptions = response.data.data
        })
      },
      innerTemp2DateChange(date) {
        const timestamp2 = Date.parse(new Date(date)) + 28800000
        this.innerTemp2.consumption_time = timestamp2
      },
      innerTemp4DateChange(date) {
        this.getPromotionChannelAccountProductList()
      },
      getProductList(query) {
        this.productLoading = true
        getProductList({ product_name: query }).then(response => {
          this.productResult = response.data.data
          this.productLoading = false
        })
      },
      getPromotionMemberInfo(query) {
        if (this.roleArry.indexOf(this.$store.state.user.roles) < 0) {
          this.userPromotionChannelLoading = true
          getPromotionMemberInfo().then(response => {
            this.userPromotionChannelLoading = false
            if (!response.data.promotion_channel) return
            this.userChannelOptions = response.data.promotion_channel.map(v => ({
              id: v.id,
              channel_name: v.channel_name
            }))
          })
        } else {
          this.userPromotionChannelLoading = true
          getPromotionChannelList({ channel_name: query }).then(response => {
            this.userPromotionChannelLoading = false
            if (!response.data.data) return
            this.userChannelOptions = response.data.data.map(v => ({
              id: v.id,
              channel_name: v.channel_name
            }))
          })
        }
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
      getChannelAccountOption(query) {
        if (query !== '') {
          this.channelAccountLoading = true
          getPromotionChannelAccountList({ account_name: query, status: 1 }).then(response => {
            this.channelAccountOption = response.data.data
            this.channelAccountLoading = false
          })
        }
      },
      getTotalBalance() {
        getPromotionChannelAccountTotalMoney(this.listQuery).then(response => {
          this.total_balance = response.data.total_balance
          console.log(this.total_balance)
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
        this.getTotalBalance()
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
        this.temp = Object.assign({}, row)
        this.temp.promotion_channel_account_id = row.id
        this.temp.status = status
        updatePromotionChannelAccount(this.temp).then(() => {
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
          promotion_user_account_id: undefined,
          total_money: undefined,
          account_name: undefined,
          channel_name: undefined,
          bank_creator: undefined,
          bank_info: undefined,
          receiver: undefined,
          bank_account: undefined
        }
      },
      handleInnerCreate1() {
        this.resetInnerTemp1()
        this.channelListShow = true
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
        this.promotionMemberOptions = []
        this.innerTemp1 = Object.assign({}, row)
        if (row.promotion_user_account !== null) {
          this.promotionMemberOptions.push({ id: row.promotion_user_account.id, nickname: row.promotion_user_account.nickname })
        }
        console.log(this.promotionMemberOptions)
        if (row.promotion_user_account_id === 0) {
          this.innerTemp1.promotion_user_account_id = undefined
        }
        // this.innerTemp1.account_name = row.account_name
        // this.innerTemp1.total_money = row.total_money
        // this.innerTemp1.id = row.id// copy obj
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
            const tempData = Object.assign({ promotion_channel_account_id: this.innerTemp1.id }, this.innerTemp1)
            updatePromotionChannelAccount(tempData).then(() => {
              // for (const v of this.list) {
              //   if (v.id === this.temp.id) {
              //     const index = this.list.indexOf(v)
              //     this.list.splice(index, 1, this.temp)
              //     break
              //   }
              // }
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
            this.innerDialogFormVisible1 = false
            this.channelListShow = true
          }
        })
      },
      updateInnerData4() {
        this.virtual_money_list = []
        for (const v of this.promotionChannelAccountProductOptions) {
          if (v.virtual_money > 0) {
            this.virtual_money_list.push(v)
          }
        }
        this.innerTableVisible5 = true
      },
      updateInnerData5() {
        const tempDate = {}
        tempDate.promotion_channel_account_id = this.temp.id
        tempDate.consumption_time = this.innerTemp4.consumption_time
        tempDate.product_consumption_list = this.virtual_money_list
        createPromotionChannelAccountConsumptionMassively(tempDate).then(response => {
          this.innerTableVisible5 = false
          this.innerDialogFormVisible4 = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      handleOpenInner2(row) {
        this.innerTableVisible2 = true
        this.innerTableTitle2 = row.account_name + ' -- 消费记录'
        this.temp = Object.assign({}, row) // copy obj
        this.getInnerList2()
      },
      handleOpenInner4(row) {
        this.innerDialogFormVisible4 = true
        this.innerTableTitle4 = row.account_name + ' -- 消费录入'
        this.temp = Object.assign({}, row) // copy obj
        this.resetInnerTemp4()
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
      resetInnerTemp4() {
        this.innerTemp4 = {
          id: undefined,
          product_id: undefined,
          promotion_channel_account_id: undefined,
          promotion_user_account_id: undefined,
          money: undefined,
          virtual_money: undefined,
          ratio: this.temp.ratio,
          consumption_time: new Date(new Date().setTime(new Date().getTime() - 3600 * 1000 * 24)),
          product: {
            id: undefined,
            product_name: ''
          }
        }
        this.getPromotionChannelAccountProductList()
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
            this.innerTemp2.promotion_channel_account_id = this.temp.id
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
        // this.innerTableVisible3 = true
        // this.innerTableTitle3 = row.account_name + ' -- 充值记录'
        this.temp = Object.assign({}, row) // copy obj
        this.temp.operate_at = parseTime(new Date(), '{y}-{m}-{d}')
        this.handleInnerCreate3()
      },
      handleRefund(row) {
        this.temprefund.channel_name = row.promotion_channel.channel_name
        this.temprefund.account_name = row.account_name
        this.temprefund.promotion_channel_account_id = row.id
        this.innerDialogFormVisibleRefund = true
      },
      handleTransfer(row) {
        this.tempTransfer.account_name = row.account_name
        this.tempTransfer.promotion_channel_account_id = row.id
        this.tempTransfer.ratio = row.ratio
        this.innerDialogFormVisibleTransfer = true
        this.$nextTick(() => {
          this.$refs['innerDataForm6'].clearValidate()
        })
      },
      getInnerList3() {
        this.innerListQuery3.promotion_channel_account_id = this.temp.id
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
          operate_at: parseTime(new Date(), '{y}-{m}-{d}'),
          money: undefined,
          proof_img: undefined,
          virtual_money: undefined,
          ratio: this.temp.ratio,
          promotion_member: {
            id: undefined,
            nickname: ''
          }
        }
        this.fileList = []
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
            this.innerTemp3.promotion_channel_account_id = this.temp.id
            createPromotionChannelAccountRecharge(this.innerTemp3).then(response => {
              this.innerTotal3++
              this.innerTemp3 = response.data
              // this.innerList3.unshift(this.innerTemp3)
              this.innerDialogFormVisible3 = false
              this.getList()
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
      this.getList()
    },
    watch: {
      innerDialogFormVisible3(value) {
        if (value === false) {
          this.fileList = []
        }
      },
      innerDialogFormVisible1(value) {
        if (value === false) {
          this.channelListShow = true
        }
      },
      innerDialogFormVisibleTransfer(value) {
        if (value === false) {
          for (const v in this.tempTransfer) {
            this.tempTransfer[v] = undefined
          }
          this.$refs['innerDataForm6'].clearValidate()
        }
      },
      innerDialogFormVisibleRefund(value) {
        if (value === false) {
          for (const v in this.temprefund) {
            this.temprefund[v] = undefined
          }
          this.fileList = []
          this.$refs['innerDataForm5'].clearValidate()
        }
      }
    }
  }
</script>

<style scoped>
  .disabledUpload >>> .el-upload--picture-card {
    display: none;
  }
  .el-table >>> .cell{
    padding: 0px;
  }
  .el-table{
    font-size: 12px;
  }
  .el-table >>> thead {
    font-size: 13px;
  }
</style>
