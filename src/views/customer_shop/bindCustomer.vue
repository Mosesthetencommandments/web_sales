<template>
  <div class="app-container calendar-list-container">
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :modal="false">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="150px" style='width: 80%; margin-left:50px;'>
        <el-form-item label="商城" prop="support_member.id">
          <multiselect v-model="temp.shop_store" :options="shopStoreOptions"
                       @search-change="queryShopStoreList" placeholder="请选择商城"
                       selectLabel="选择"
                       deselectLabel="删除" track-by="shop_name" :internalSearch="false" label="shop_name">
            <span slot='noResult'>无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="商城用户手机号" prop="phone">
          <el-input v-model="temp.phone" :placeholder="'请输入要绑定的上商城用户手机号'"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createData">绑定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getProductList, createProduct, updateProduct, deleteProduct, getProductTemplateInfo, getProductTemplateList, createProductTemplate, updateProductTemplate, deleteProductTemplate, releaseProductTemplate, previewProductTemplate } from '@/api/product'
  import { createCustomerShopSupport, getCustomerShopList } from '@/api/customer'
  import { getSupportMemberList } from '@/api/support_member'
  import { getShopStoreList } from '@/api/shop_store'
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
          is_promotion: undefined,
          sort: '-id'
        },
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showAuditor: false,
        temp: {
          id: undefined,
          phone: '',
          shop_store: {}
        },
        dialogFormVisible: true,
        dialogStatus: 'create',
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
        shopStoreOptions: []
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
      this.queryShopStoreList()
    },
    methods: {
      queryShopStoreList() {
        getShopStoreList().then(response => {
          if (!response.data.data) return
          this.shopStoreOptions = response.data.data
        })
      },
      querySupportMemberList(query) {
        getSupportMemberList({ nickname: query, user_account_type_code: 'support', status: '1' }).then(response => {
          if (!response.data.data) return
          this.supportMemberOptions = response.data.data
        })
      },
      getList() {
        this.listLoading = true
        getCustomerShopList(this.listQuery).then(response => {
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
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.status = status
      },
      resetTemp() {
        this.temp = {
          id: undefined,
          phone: '',
          shop_store: {}
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
        this.temp.shop_store_id = this.temp.shop_store.id
        createCustomerShopSupport(this.temp).then(response => {
          this.$router.back()
          this.$notify({
            title: '成功',
            message: '绑定成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      handleUpdate(row) {
        this.productDeliverOptions = []
        this.temp = Object.assign({}, row) // copy obj
        if (row.product_deliver) {
          this.productDeliverOptions.push({ id: row.product_deliver.id, name: row.product_deliver.name })
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
            tempData.product_id = this.temp.id
            updateProduct(tempData).then(() => {
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
