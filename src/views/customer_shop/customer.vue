<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="客户手机号" v-model="listQuery.phone">
      </el-input>
      <el-select @change='handleFilter' class="filter-item" style="width: 130px" v-model="listQuery.is_promotion" placeholder="类型">
        <el-option v-for="item in productTypeOptions" :key="item.key" :label="item.display_name" :value="item.key">
        </el-option>
      </el-select>
      <el-select @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.sort" placeholder="排序">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%" stripe>
      <el-table-column align="center" label="序号" width="105">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="客户信息">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)" v-if="scope.row.customer_shop !== null">{{scope.row.customer_shop.nickname}}({{scope.row.customer_shop.phone}})</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="所属微信号">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.product_weixin.info}}({{scope.row.product_weixin.weixin_account}})</span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" class-name="status-col" label="类型" width="100">-->
        <!--<template slot-scope="scope">-->
          <!--<el-tag v-if="scope.row.is_direct_promotion !== 0">推广粉</el-tag>-->
          <!--<el-tag v-if="scope.row.is_fission !== 0" type="warning">裂变粉</el-tag>-->
        <!--</template>-->

      <!--</el-table-column>-->
      <el-table-column width="180px" align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{scope.row.updated_at}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 80%; margin-left:50px;'>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="temp.phone" :disabled="dialogStatus === 'update'"></el-input>
        </el-form-item>
        <el-form-item label="推广微信号" prop="product_weixin.id">
          <multiselect v-model="temp.product_weixin" :options="productWeixinOptions"
                       @search-change="queryProductWeixinList" placeholder="搜索推广微信号" selectLabel="选择"
                       deselectLabel="删除" track-by="weixin_account" :internalSearch="false" label="weixin_account">
            <span slot='noResult'>无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item  label="加粉时间" prop="fans_join_time">
          <el-date-picker
            v-model="temp.join_time"
            style="width: 100%"
            format="yyyy-MM-dd HH:mm"
            align="right"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="选择加粉时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="类型" prop="is_promotion">
          <el-radio-group v-model="temp.is_promotion" :disabled="dialogStatus === 'update'">
            <el-radio-button :label="promotionFans">推广粉</el-radio-button>
            <el-radio-button :label="fissionFans">裂变粉</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getProductList, createProduct, updateProduct, deleteProduct, getProductTemplateInfo, getProductTemplateList, createProductTemplate, updateProductTemplate, deleteProductTemplate, releaseProductTemplate, previewProductTemplate } from '@/api/product'
  import { createCustomerShop, getCustomerShopList, updateCustomerShop } from '@/api/customer'
  import { getSupportMemberList } from '@/api/support_member'
  import waves from '@/directive/waves' // 水波纹指令
  import { getProductDeliverList } from '@/api/product'
  import { getProductWeixinList } from '@/api/product_weixin'
  import Multiselect from 'vue-multiselect'
  import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css
  export default {
    name: 'customerManagement',
    components: {
      Multiselect
    },
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
          phone: undefined,
          is_promotion: 1,
          sort: '-id'
        },
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showAuditor: false,
        temp: {
          id: undefined,
          join_time: undefined,
          phone: '',
          is_promotion: 1,
          product_weixin: {}
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        rules: {
          product_name: [{ required: true, message: '请正确填写商品名称', trigger: 'change' }],
          product_deliver_id: [{ required: true, message: '请正确填写商品名称', trigger: 'change' }]
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
          product_id: undefined,
          template_name: '',
          template_code: ''
        },
        innerListLoading1: false,
        innerTableVisible1: false,
        innerDialogFormVisible1: false,
        innerRules1: {
          template_name: [{ required: true, message: '请正确填写模板名称', trigger: 'change' }],
          template_code: [{ required: true, message: '请正确填写模板内容', trigger: 'change' }]
        },
        productType: {
          1: '推广',
          2: '附属产品'
        },
        productTypeOptions: [
          { key: 0, display_name: '裂变粉' },
          { key: 1, display_name: '推广粉' }
        ],
        previewDialogVisible: false,
        previewTitle: '',
        previewContent: '',
        getProductDeliverListLoading: false,
        productDeliverOptions: [],
        promotionFans: 1,
        fissionFans: 0,
        supportMemberOptions: [],
        productWeixinOptions: []
      }
    },
    filters: {
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
          2: '附属产品'
        }
        return statusMap[status]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      queryProductWeixinList(query) {
          console.log(query,11111)
        getProductWeixinList({ weixin_account: query }).then(response => {

          if (!response.data.data) return
          this.productWeixinOptions = response.data.data
          for (const v of this.productWeixinOptions) {
            v.weixin_account = v.weixin_account + '  (' + v.info + ')'
            const index = this.productWeixinOptions.indexOf(v)
            this.productWeixinOptions.splice(index, 1, v)
          }
        })
      },
      querySupportMemberList(query) {
        getSupportMemberList({ nickname: query, user_account_type_code: 'support', status: '1' }).then(response => {
          if (!response.data.data) return
          this.supportMemberOptions = response.data.data
        })
      },
      async getList() {
        try {
          this.listLoading = true
          const response = await getCustomerShopList(this.listQuery)
          this.list = response.data.data
          this.total = response.data.total
        } catch (e) {
          this.$router.push({ path: '/shop/bindCustomer' })
        } finally {
          this.listLoading = false
        }
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
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.status = status
      },
      resetTemp() {
        this.temp = {
          id: undefined,
          join_time: undefined,
          phone: '',
          is_promotion: 1,
          product_weixin: {}
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
            this.temp.product_weixin_id = this.temp.product_weixin.id
            createCustomerShop(this.temp).then(response => {
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
        this.productDeliverOptions = []
        this.temp = Object.assign({}, row) // copy obj
        this.temp.phone = row.customer_shop.phone
        if (row.is_direct_promotion === 1 && row.customer_promotion !== undefined && row.customer_promotion !== null) {
          this.temp.is_promotion = 1
          this.temp.fans_join_time = row.customer_promotion.join_time
          this.temp.product_weixin = row.customer_promotion.product_weixin
        } else if (row.is_fission === 1 && row.customer_fission !== undefined && row.customer_fission !== null) {
          this.temp.is_promotion = 0
          this.temp.fans_join_time = row.customer_fission.created_at
        }
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
            tempData.customer_id = this.temp.customer_id
            tempData.fans_join_time = this.temp.fans_join_time
            tempData.product_weixin_id = this.temp.product_weixin.id
            updateCustomerShop(tempData).then(() => {
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
      getProductDeliverList(query) {

        if (query !== '') {
          this.getProductDeliverListLoading = true
          getProductDeliverList({ name: query }).then(response => {
            this.productDeliverOptions = response.data.data
            this.getProductDeliverListLoading = false
          })
        }
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
      handleOpenInner1(row) {
        this.innerTableVisible1 = true
        this.innerTableTitle1 = row.product_name + ' -- 模板'
        this.temp = Object.assign({}, row) // copy obj
        this.getInnerList1()
      },
      getInnerList1() {
        this.innerListQuery1.product_id = this.temp.id
        this.innerTemp1.product_id = this.temp.id
        this.innerListLoading1 = true
        getProductTemplateList(this.innerListQuery1).then(response => {
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
          product_id: undefined,
          template_name: '',
          template_code: ''
        }
      },
      handleInnerCreate1() {
        this.resetInnerTemp1()
        this.dialogStatus = 'create'
        this.innerDialogFormVisible1 = true
        this.innerTemp1.product_id = this.temp.id
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      createInnerData1() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            createProductTemplate(this.innerTemp1).then(response => {
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
      handlePreviewProductTemplate(row) {
        this.innerTemp1 = Object.assign({}, row) // copy obj
        const tempData = {}
        tempData.product_template_id = this.innerTemp1.id
        previewProductTemplate(tempData).then(response => {
          this.previewContent = response.data.template_code
          this.previewTitle = response.data.template_name + ' --预览'
          this.previewDialogVisible = true
        })
      },
      handlePreviewClose() {
        this.previewContent = ''
        this.previewTitle = ''
      },
      handleInnerUpdate1(row) {
        this.innerTemp1 = Object.assign({}, row) // copy obj
        const tempData = {}
        tempData.product_template_id = this.innerTemp1.id
        getProductTemplateInfo(tempData).then(response => {
          this.innerTemp1 = response.data
        })
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
            tempData.product_template_id = this.innerTemp1.id
            updateProductTemplate(tempData).then(res => {
              this.innerTemp1.need_release = 1
              for (const v of this.innerList1) {
                if (v.id === this.innerTemp1.id) {
                  const index = this.innerList1.indexOf(v)
                  this.innerList1.splice(index, 1, res.data)
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
      releaseProductTemplate(row) {
        this.innerTemp1 = Object.assign({}, row)
        const tempData = {}
        tempData.product_template_id = this.innerTemp1.id
        releaseProductTemplate(tempData).then(() => {
          this.innerTemp1.need_release = 0
          for (const v of this.innerList1) {
            if (v.id === this.innerTemp1.id) {
              const index = this.innerList1.indexOf(v)
              this.innerList1.splice(index, 1, this.innerTemp1)
              break
            }
          }
          this.$notify({
            title: '成功',
            message: '发布成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      handleInnerDelete1(row) {
        this.$confirm('此操作将永久删除该模板, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const ttempData = {
            product_template_id: row.id
          }
          deleteProductTemplate(ttempData).then(response => {
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
<style>
  .is-fullscreen .el-dialog__body {
    padding:30px 0px !important;
  }
</style>
