<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="微信号" v-model="listQuery.weixin_account">
      </el-input>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="商品名" v-model="listQuery.product_name">
      </el-input>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="推广人" v-model="listQuery.promotion_member_nickname">
      </el-input>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="客服" v-model="listQuery.support_member_nickname">
      </el-input>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="渠道" v-model="listQuery.channel_name">
      </el-input>
      <el-select  @change='handleFilter' clearable class="filter-item" style="width: 130px" v-model="listQuery.status" placeholder="状态">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-select @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.sort" placeholder="排序">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加</el-button>
    </div>

    <el-table stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
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
          <span class="link-type" @click="handleUpdate(scope.row)">微信：{{scope.row.weixin_account}}</span><br>
          <span class="link-type" @click="handleUpdate(scope.row)">QQ：{{scope.row.qq}}</span><br>
          <span class="link-type" @click="handleUpdate(scope.row)">电话：{{scope.row.phone}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="商品名称">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.product.product_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="推广人">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.promotion_member.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="客服">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.support_member.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="渠道">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.promotion_channel.channel_name}}</span>
        </template>
      </el-table-column>
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
      <el-table-column min-width="100px" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{scope.row.status|statusTranslator}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="handleOpenInner1(scope.row)">粉丝管理</el-button>
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="innerTableTitle1" :visible.sync="innerTableVisible1" width="90%" >
      <div class="filter-container" align="right">
        <el-button align="right" class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate1" type="primary" icon="el-icon-edit">添加</el-button>
      </div>

      <el-table stripe="true" :key='innerTableKey1' :data="innerList1" v-loading="innerListLoading1" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="名称">
          <template slot-scope="scope">
            <span class="link-type" @click="handleInnerUpdate1(scope.row)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column width="180px" align="center" label="时间">
          <template slot-scope="scope">
            <span>{{scope.row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="320" class-name="small-padding">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleInnerUpdate1(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleInnerDelete1(scope.row)">删除
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
  </div>
</template>

<script>
  import { deleteDomain, getDomainExtraCodeList, createDomainExtraCode, updateDomainExtraCode, deleteDomainExtraCode } from '@/api/domain'
  import { getProductWeixinList, createProductWeixin, updateProductWeixin } from '@/api/product_weixin'
  import { getProductList } from '@/api/product'
  import { getPromotionChannelList } from '@/api/promotion_channel'
  import { getPromotionMemberList } from '@/api/promotion_member'
  import { getSupportMemberList } from '@/api/support_member'
  import waves from '@/directive/waves' // 水波纹指令
  import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
  import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css

  export default {
    name: 'complexTable',
    components: { Multiselect },
    directives: {
      waves
    },
    data() {
      return {
        scrollTop: 0,
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          page_size: 20,
          weixin_nickname: '',
          weixin_account: '',
          product_name: '',
          promotion_member_nickname: '',
          support_member_nickname: '',
          channel_name: '',
          status: undefined
        },
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: [{ label: '冻结', key: 0 }, { label: '开启', key: 1 }, { label: '告警', key: 2 }],
        showAuditor: false,
        temp: {
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
          domain_id: undefined,
          sort: '-id'
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
        productOptions: [],
        promotionChannelOptions: [],
        promotionMemberOptions: [],
        supportMemberOptions: []
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
          0: '冻结',
          1: '开启',
          2: '告警'
        }
        return statusTransMap[status]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      queryProductList(query) {
        getProductList({ product_name: query }).then(response => {
          if (!response.data.data) return
          this.productOptions = response.data.data.map(v => ({
            id: v.id,
            product_name: v.product_name
          }))
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
        getSupportMemberList({ nickname: query }).then(response => {
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
        getProductWeixinList(this.listQuery).then(response => {
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
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            tempData.product_weixin_id = this.temp.id
            tempData.promotion_channel_id = this.temp.promotion_channel.id
            tempData.promotion_user_account_id = this.temp.promotion_member.id
            tempData.product_id = this.temp.product.id
            tempData.support_user_account_id = this.temp.support_member.id
            updateProductWeixin(tempData).then(() => {
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
        this.innerTableTitle1 = row.domain_name + ' -- 附加代码'
        this.temp = Object.assign({}, row) // copy obj
        this.getInnerList1()
      },
      getInnerList1() {
        this.innerListQuery1.domain_id = this.temp.id
        this.innerTemp1.domain_id = this.temp.id
        this.innerListLoading1 = true
        getDomainExtraCodeList(this.innerListQuery1).then(response => {
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
