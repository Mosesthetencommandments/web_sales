<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="产品名称" v-model="listQuery.product_name">
      </el-input>
      <el-select @change='handleFilter' clearable class="filter-item" style="width: 130px" v-model="listQuery.is_promote" placeholder="类型">
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
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="产品名称">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.product_name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="status-col" label="类型" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.is_promote !== 0" :type="scope.row.is_promote | statusFilter">{{scope.row.is_promote | statusTranslator}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{scope.row.updated_at}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <!--<el-button v-show="scope.row.is_promote == 1" type="info" size="mini" @click="handleOpenInner1(scope.row)">模板</el-button>-->
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <!--<el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="产品名称" prop="product_name">
          <el-input v-model="temp.product_name"></el-input>
        </el-form-item>
        <!--<el-form-item label="价格" prop="price">-->
        <!--<el-input v-model="temp.price"></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="库存" prop="stock">-->
        <!--<el-input v-model="temp.stock"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item label="类型" prop="is_promote">
          <el-radio-group v-model="temp.is_promote">
            <el-radio-button label="1">推广</el-radio-button>
            <el-radio-button label="2">附属产品</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <!--<el-form-item label="发货地址" prop="product_deliver_id">-->
          <!--<el-select  v-model="temp.product_deliver_id"-->
                      <!--filterable-->
                      <!--remote-->
                      <!--placeholder="请选择发货地址"-->
                      <!--:remote-method="getProductDeliverList"-->
                      <!--:loading="getProductDeliverListLoading">-->
            <!--<el-option-->
              <!--v-for="item in productDeliverOptions"-->
              <!--:key="item.id"-->
              <!--:label="item.name"-->
              <!--:value="item.id">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
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

      <el-table :key='innerTableKey1' :data="innerList1" v-loading="innerListLoading1" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="模板名称">
          <template slot-scope="scope">
            <span class="link-type" @click="handleInnerUpdate1(scope.row)">{{scope.row.template_name}}</span>
          </template>
        </el-table-column>
        <el-table-column width="180px" align="center" label="时间">
          <template slot-scope="scope">
            <span>{{scope.row.updated_at}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="320" class-name="small-padding">
          <template slot-scope="scope">
            <el-button v-show="scope.row.need_release" type="danger" size="mini" @click="releaseProductTemplate(scope.row)">发布</el-button>
            <el-button type="primary" size="mini" @click="handlePreviewProductTemplate(scope.row)">预览</el-button>
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible1" width="70%">
      <el-form :rules="innerRules1" ref="innerDataForm1" :model="innerTemp1" label-position="left" label-width="80px" style='width: 80%; margin-left:10%;'>
        <el-form-item label="模板名称" prop="template_name">
          <el-input v-model="innerTemp1.template_name"></el-input>
        </el-form-item>
        <el-form-item label="模板代码" style="width: 100%;" prop="template_code">
          <el-input type="textarea" :autosize="{ minRows: 20, maxRows: 20}" placeholder="请输入内容" v-model="innerTemp1.template_code">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible1 = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createInnerData1">确 定</el-button>
        <el-button v-else type="primary" @click="updateInnerData1">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :fullscreen="true" :title="previewTitle" :visible.sync="previewDialogVisible" width="padding: 30px 0px;" @close="handlePreviewClose">
      <div v-html='previewContent'></div>
    </el-dialog>
  </div>
</template>

<script>
  import { getProductList, createProduct, updateProduct, deleteProduct, getProductTemplateInfo, getProductTemplateList, createProductTemplate, updateProductTemplate, deleteProductTemplate, releaseProductTemplate, previewProductTemplate } from '@/api/product'
  import waves from '@/directive/waves' // 水波纹指令
  import { getProductDeliverList } from '@/api/product'
  export default {
    name: 'goodsManagement',
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
          product_name: undefined,
          is_promote: undefined,
          sort: '-id'
        },
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showAuditor: false,
        temp: {
          id: undefined,
          product_name: '',
          is_promote: undefined,
          product_deliver_id: undefined
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
          { key: 1, display_name: '推广' },
          { key: 2, display_name: '附属产品' }
        ],
        previewDialogVisible: false,
        previewTitle: '',
        previewContent: '',
        getProductDeliverListLoading: false,
        productDeliverOptions: []
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
      getList() {
        this.listLoading = true
        getProductList(this.listQuery).then(response => {
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
          product_name: '',
          price: undefined,
          stock: undefined,
          is_promote: undefined,
          product_deliver_id: undefined
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
            createProduct(this.temp).then(response => {
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
