<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <div class="filter-item">
        <div class="filter-label">日期</div>
        <el-date-picker
          format="yyyy-MM-dd"
          style="width: 220px;"
          value-format="yyyy-MM-dd"
          size="small"
          :clearable="false"
          v-model="listQuery.join_time"
          type="date"
          placeholder="选择日期"
          @change='handleFilter'>
        </el-date-picker>
      </div>
      <div class="filter-item">
        <div class="filter-label">产品</div>
        <el-select
          style="width:140px;"
          size="small"
          @change='handleFilter'
          @focus="getProductList(' ')"
          v-model="listQuery.product_id"
          filterable
          clearable
          remote
          placeholder="请选择"
          :remote-method="getProductList"
          :loading="productLoading">
          <el-option
            v-for="item in productOptions"
            :key="item.product_name"
            :label="item.product_name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">渠道</div>
        <el-select
          style="width:200px;"
          size="small"
          @change='getList'
          @focus="getPromotionChannel(' ')"
          v-model="listQuery.promotion_channel_id"
          filterable
          clearable
          remote
          placeholder="请选择"
          :remote-method="getPromotionChannel"
          :loading="promotionChannelLoading">
          <el-option
            v-for="item in promotionChannelOptions"
            :key="item.id"
            :label="item.channel_name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">推广人</div>
        <el-select
          style="width:140px;"
          size="small"
          @change='handleFilter'
          @focus="getPromotionUserAccountList(' ')"
          v-model="listQuery.promotion_user_account_id"
          filterable
          clearable
          remote
          placeholder="请选择"
          :remote-method="getPromotionUserAccountList"
          :loading="promotionUserAccountLoading">
          <el-option
            v-for="item in promotionUserAccountOptions"
            :key="item.nickname"
            :label="item.nickname"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服部门</div>
        <el-cascader
          style="width: 220px;"
          clearable
          size="small"
          :options="userGroupTree"
          change-on-select
          :props="defaultPropsGroup"
          v-model="userGroupOptions"
          @change="handleFilterGrounp">
        </el-cascader>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服</div>
        <el-select
          style="width:140px;"
          size="small"
          @change='handleUserAccountChange'
          @focus="getUserAccountList(' ')"
          v-model="listQuery.support_user_account_id"
          filterable
          clearable
          remote
          placeholder="请选择"
          :remote-method="getUserAccountList"
          :loading="userAccountLoading">
          <el-option
            v-for="item in userAccountOptions"
            :key="item.nickname"
            :label="item.nickname"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">微信号</div>
        <el-select
          style="width:140px;"
          @change='getList'
          size="small"
          v-model="listQuery.product_weixin_id"
          filterable
          clearable
          remote
          placeholder="请选择"
          :remote-method="getProductWeixinList"
          :loading="productWeixinLoading">
          <el-option
            v-for="item in userAccountWeixinOptions"
            :key="item.id"
            :label="item.info"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-float">
        <el-button class="filter-item" size="small" type="primary" v-waves icon="el-icon-refresh" @click="handleFilter">刷新</el-button>
      </div>
      <!--<el-select @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.sort" placeholder="排序">-->
      <!--<el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">-->
      <!--</el-option>-->
      <!--</el-select>-->
    </div>
    <el-table header-row-class-name="out_table_head"
              stripe
              :key='tableKey'
              :data="list"
              v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%;font-size:16px;font-weight:600;"
              :row-key="getRowKeys"
              :expand-row-keys="expands">
      <el-table-column type="expand">
        <!--<table style="width: 100%;">-->
        <!--<tr>-->
        <!--<td class="el-table_1_column_3 is-center ">ghtsi123(去疤V23)</td>-->
        <!--<td class="el-table_1_column_4 is-center ">23</td>-->
        <!--<td class="el-table_1_column_5 is-center ">66</td>-->
        <!--</tr>-->
        <!--</table>-->
        <template slot-scope="scope">
          <el-table :data="getArray(scope.row.product_weixin)" border>
            <el-table-column prop="weixin_account" label="微信">
              <template slot-scope="scopeI">
                <span v-if="scopeI.row.unfilled === '-'">{{scopeI.row.weixin_account}}</span>
                <span v-else-if="scopeI.row.unfilled.product_weixin">{{scopeI.row.unfilled.product_weixin.weixin_account}}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="info" label="备注">
              <template slot-scope="scopeI">
                <span v-if="scopeI.row.unfilled === '-'">{{scopeI.row.info}}</span>
                <span v-else-if="scopeI.row.unfilled.product_weixin">{{scopeI.row.unfilled.product_weixin.info}}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="info" label="状态">
              <template slot-scope="scopeI">
                <el-tag v-if="scopeI.row.unfilled === '-'" :type="scopeI.row.status | statusWeixinFilter">{{scopeI.row.status|statusWeixinTranslator}}</el-tag>
                <el-tag v-else-if="scopeI.row.unfilled.product_weixin" :type="scopeI.row.unfilled.product_weixin.status | statusWeixinFilter">{{scopeI.row.unfilled.product_weixin.status|statusWeixinTranslator}}</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="channel_name" label="渠道">
              <template slot-scope="scopeI">
                <span v-if="scopeI.row.promotion_channel">{{scopeI.row.promotion_channel.channel_name}}</span>
                <span v-else-if="scopeI.row.unfilled !== '-'">{{scopeI.row.unfilled.promotion_channel.channel_name}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="nickname" label="推广人">
              <template slot-scope="scopeI">
                <span v-if="scopeI.row.promotion_member">{{scopeI.row.promotion_member.nickname}}</span>
                <span v-else-if="scopeI.row.unfilled !== '-'">{{scopeI.row.unfilled.promotion_member.nickname}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="unfilled_count" label="未添加">
              <template slot-scope="scopeI">
                <span v-if="scopeI.row.unfilled === '-'">-</span>
                <span v-else>{{scopeI.row.unfilled.unfilled_count}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="add_count" label="已添加">
              <template slot-scope="scopeI">
                <span v-if="scopeI.row.unfilled === '-'">-</span>
                <span v-else>{{scopeI.row.unfilled.add_count}}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="320" class-name="small-padding">
              <template slot-scope="scopeI">
                <el-button size="small" type="primary" @click="handleUpdate(scopeI.row)">编辑</el-button>
                <el-button v-if="scopeI.row.unfilled.product_weixin && (scopeI.row.unfilled.product_weixin.status===1 || scopeI.row.unfilled.product_weixin.status===2 || scopeI.row.unfilled.product_weixin.status===3)" size="small" type="gray" @click="handleModifyWeixinStatus(scopeI.row,0)">冻结
                </el-button>
                <el-button v-else-if="scopeI.row.status===1 || scopeI.row.status===2 || scopeI.row.status===3" size="small" type="gray" @click="handleModifyWeixinStatus(scopeI.row,0)">冻结
                </el-button>
                <el-button v-if="scopeI.row.unfilled.product_weixin && (scopeI.row.unfilled.product_weixin.status===0)" size="small" type="success" @click="handleModifyWeixinStatus(scopeI.row,1)">开启
                </el-button>
                <el-button v-else-if="scopeI.row.status===0" size="small" type="success" @click="handleModifyWeixinStatus(scopeI.row,1)">开启
                </el-button>
                <el-button v-if="scopeI.row.unfilled.product_weixin && (scopeI.row.unfilled.product_weixin.status===0)" size="small" type="error" @click="handleModifyWeixinStatus(scopeI.row,3)">关闭
                </el-button>
                <el-button v-else-if="scopeI.row.status===0" size="small" type="error" @click="handleModifyWeixinStatus(scopeI.row,3)">关闭
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="客服">
        <template slot-scope="scope">
          <el-tag class="smalltag" type="info">{{scope.row.user_account_group.group_name}}</el-tag>
          <!--<el-tag class="smalltag" :type="scope.row.schedule.online_type | timeIntervalFilter">{{scope.row.schedule.online_type|timeIntervalTranslator}}</el-tag>-->
          <span class="link-type">{{scope.row.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="产品">
        <template slot-scope="scope">
          <el-tag class="smalltag" v-for="item in scope.row.support_product" :key="item.id" type="primary">{{item.product.product_name}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="当日未添加">
        <el-table-column align="center" :label="'合计:' + notaddfansTotal">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.support_total_unfilled}}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="当日已添加">
        <el-table-column align="center" :label="'合计:' + addfansTotal">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.support_total_add}}</span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="微信昵称">
          <el-input disabled v-model="temp.weixin_nickname"></el-input>
        </el-form-item>
        <el-form-item label="微信号">
          <el-input disabled v-model="temp.weixin_account"></el-input>
        </el-form-item>
        <el-form-item label="推广人" prop="promotion_member">
          <el-select
            style="width: 100%"
            v-model="temp.promotion_user_account_id"
            @focus="getPromotionUserAccountList2(' ')"
            remote
            filterable
            placeholder="请选择推广人"
            :remote-method="getPromotionUserAccountList2"
            :loading="promotionUserAccountLoading">
            <el-option
              v-for="item in promotionUserAccountOptions2"
              :key="item.id"
              :label="item.nickname"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推广渠道" prop="promotion_channel_id">
          <el-select
            v-model="temp.promotion_channel_id"
            @focus="getPromotionChannel2(' ')"
            placeholder="请选择渠道"
            style="width: 100%"
            filterable
            remote
            :remote-method="getPromotionChannel2"
            :loading="promotionChannelLoading">
            <el-option
              v-for="item in promotionChannelOptions2"
              :key="item.id"
              :label="item.channel_name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
  import { getSupportUnfilledList } from '@/api/promotion_statistics'
  import { updateProductWeixin, getProductWeixinList, getPromotionChannelList } from '@/api/product_weixin'
  import { getPromotionMemberList } from '@/api/promotion_member'
  import { getSupportGroupList } from '@/api/support_member'
  import { getSupportMemberList } from '@/api/support_member'
  import { getProductList } from '@/api/product'
  import { parseTime } from '@/utils/index'
  import { getUserAccountGroupList } from '@/api/user_group'
  import waves from '@/directive/waves' // 水波纹指令
  export default {
    name: 'addFansData',
    components: { },
    directives: {
      waves
    },
    data() {
      return {
        scrollTop: 0,
        ifExpandAll: false,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          page_size: 20,
          product_id: undefined,
          join_time: parseTime(new Date(), '{y}-{m}-{d}'),
          group_name: undefined,
          online_type: undefined,
          support_user_account_group_id: undefined,
          user_account_group_team_id: undefined,
          promotion_user_account_id: undefined,
          support_user_account_id: undefined,
          promotion_channel_id: undefined,
          user_account_group_id: undefined,
          sort: '+user_account_group_team_id'
        },
        userGroupTree: [],
        notaddfansTotal: 0,
        addfansTotal: 0,
        productLoading: false,
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按战队排序', key: '+user_account_group_team_id' }, { label: '按ID降序', key: '-id' }],
        onlineOptions: [{ label: '白班', id: '1' }, { label: '夜班', id: '2' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showAuditor: false,
        temp: {
          id: undefined,
          promotion_channel_id: undefined,
          promotion_user_account_id: undefined
        },
        productOptions: [],
        productOptions2: [],
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        rules: {
          promotion_channel_id: [{ required: true, message: '选择渠道', trigger: 'change' }],
          promotion_member: [{ required: true, message: '选择推广人', trigger: 'change' }]
        },
        promotionChannelOptions: [],
        promotionChannelOptions2: [],
        promotionChannelLoading: false,
        userAccountOptions: [],
        userAccountLoading: false,
        promotionUserAccountOptions: [],
        promotionUserAccountOptions2: [],
        promotionUserAccountLoading: false,
        productWeixinLoading: false,
        userAccountWeixinOptions: [],
        userGroupOptions: [],
        weixinExpandRowKeys: [],
        expands: [],
        getRowKeys(row) {
          return row.id
        }
      }
    },
    filters: {
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
      timeIntervalFilter(status) {
        const statusMap = {
          '0': 'info',
          '1': 'warning',
          '2': 'primary'
        }
        return statusMap[status]
      },
      timeIntervalTranslator(status) {
        const statusTransMap = {
          '0': '休',
          '1': '白',
          '2': '晚'
        }
        return statusTransMap[status]
      }
    },
    created() {
      this.getUserAccountList(' ')
      this.getPromotionUserAccountList(' ')
      this.getProductWeixinList(' ')
      this.getSupportGroupList(' ')
      this.getPromotionChannel(' ')
      this.getList()
    },
    methods: {
      fansTotal() {
        this.notaddfansTotal = 0
        this.addfansTotal = 0
        for (const v of this.list) {
          if (typeof v.support_total_unfilled === 'number') {
            this.notaddfansTotal += v.support_total_unfilled
          }
          if (typeof v.support_total_add === 'number') {
            this.addfansTotal += v.support_total_add
          }
        }
      },
      handleFilterGrounp(val) {
        this.listQuery.support_user_account_group_id = val[val.length - 1]
        this.handleFilter()
      },
      handlechangePromotionUser() {
        this.temp.promotion_channel_id = null
        this.promotionChannelOptions2 = []
        this.getPromotionChannel2(' ')
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.temp.product_weixin_id = this.temp.id
            updateProductWeixin(this.temp).then(() => {
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
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.getPromotionUserAccountList2(' ')
        this.getPromotionChannel2(' ')
        this.dialogFormVisible = true
        this.dialogStatus = 'update'
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      getSupportGroupList() {
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
      getPromotionChannel(query) {
        if (query !== '') {
          this.promotionChannelLoading = true
          getPromotionChannelList({ channel_name: query }).then(response => {
            this.promotionChannelOptions = response.data.data
            this.promotionChannelLoading = false
          })
        }
      },
      getPromotionChannel2(query) {
        if (query !== '') {
          this.promotionChannelLoading = true
          getPromotionChannelList({ promotion_user_account_id: this.temp.promotion_user_account_id, page_size: 0, channel_name: query }).then(response => {
            this.promotionChannelOptions2 = response.data
            this.promotionChannelLoading = false
          })
        }
      },
      handleGroupFilter() {
        this.userAccountOptions = []
        this.listQuery.support_user_account_id = undefined
        // this.getUserAccountList(' ')
        this.handleFilter()
      },
      handleUserAccountChange() {
        this.userAccountWeixinOptions = []
        this.listQuery.product_weixin_id = undefined
        this.getProductWeixinList(' ')
        this.getList()
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
          getProductWeixinList({ info: query, support_user_account_id: this.listQuery.support_user_account_id }).then(response => {
            this.userAccountWeixinOptions = response.data.data
            this.productWeixinLoading = false
          })
        }
      },
      getUserAccountList(query) {
        if (query !== '') {
          this.userAccountLoading = true
          const params = { nickname: query, status: 1 }
          getSupportMemberList(params).then(response => {
            this.userAccountOptions = response.data.data
            this.userAccountLoading = false
          })
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
      getPromotionUserAccountList2(query) {
        if (query !== '') {
          this.promotionUserAccountLoading = true
          getPromotionMemberList({ nickname: query, page_size: 0, status: 1 }).then(response => {
            this.promotionUserAccountOptions2 = response.data
            this.promotionUserAccountLoading = false
          })
        }
      },
      getArray(object) {
        const arr = []
        for (const v in object) {
          arr.push(object[v])
        }
        return arr
      },
      handleModifyWeixinStatus(row, status) {
        const tempData = {}
        if (row.unfilled !== '-') {
          tempData.product_weixin_id = row.unfilled.product_weixin.id
        } else {
          tempData.product_weixin_id = row.id
        }
        tempData.status = status
        updateProductWeixin(tempData).then(response => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          if (row.unfilled !== '-') {
            row.unfilled.product_weixin.status = status
          } else {
            row.status = status
          }
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
      getList() {
        this.listLoading = true
        getSupportUnfilledList(this.listQuery).then(response => {
          this.list = []
          for (const v in response.data) {
            this.list.push(response.data[v])
          }
          this.tableKey++
          this.listLoading = false
          this.fansTotal()
        })
      },
      toggleRowExpansion(row) {
        this.expands = []
        this.expands.push(row.id)
      }
    },
    mounted() {
      this.expands.push(40)
    },
    deactivated() {
      this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    },
    activated() {
      this.getList()
      window.scrollTo(0, this.scrollTop)
    }
  }
</script>
<style scoped>
  .smalltag {
    height: 26px;
    line-height: 26px;
    font-size:14px;
  }
  .el-table >>> .el-table__expanded-cell{
    padding: 20px;
  }
  .out_table_head {
    /*font-size:18px;*/
    /*background-color:#f9f9f9 !important;*/
  }
  .table_cell {
    background-color:#ecf5ff !important;
  }
</style>
