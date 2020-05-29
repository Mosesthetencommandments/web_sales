<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-date-picker
        class="filter-item"
        v-model="listQuery.date_range"
        type="daterange"
        style="width: 260px"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        align="right"
        unlink-panels
        range-separator="~"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions2"
        @change='getList'>
      </el-date-picker>
      <el-select @change='handleFilter'
                 clearable
                 class="filter-item"
                 style="width:160px"
                 v-model="listQuery.product_id"
                 placeholder="产品类型"
                 filterable
                 remote
                 :remote-method="getProductOption"
                 :loading="innerloading">
        <el-option v-for="item in productTypeOptions" :key="item.id" :label="item.product_name" :value="item.id">
        </el-option>
      </el-select>
      <el-select @change='handleFilter'
                 clearable
                 class="filter-item"
                 style="width:160px"
                 v-model="listQuery.status"
                 placeholder="使用状态">
        <el-option key="0" label="关闭" value="0">
          关闭
        </el-option>
        <el-option key="1" label="开启" value="1">
          开启
        </el-option>
      </el-select>
      <el-input @keyup.enter.native="handleFilter" style="width: 300px;" class="filter-item" placeholder="模板名称" v-model="listQuery.template_name">
      </el-input>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" icon="el-icon-search">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加</el-button>
    </div>
    <el-tabs type="border-card" v-model="listQuery.promotion_product_type_id" @tab-click="handleFilter">
      <el-tab-pane label="推广网站模板" name="1">
        <el-row>
          <el-col :span="6" v-for="item in list" :key="item.id">
            <el-card :body-style="{ padding: '0px' }" style="width:94%;margin:10px auto;">
              <div style="width:100%;padding-bottom:120%;height:0;overflow: hidden;">
                <img :src="item.preview_image" class="template-image" @click="handlePreviewProductTemplate(item)">
              </div>
              <div style="padding: 14px;">
                <span @click="handlePreviewProductTemplate(item)" style="cursor: pointer">{{item.template_name}}</span>
                <div @click="releaseProductTemplate(item)" style="float:right;" v-show="item.need_release">
                  <el-tooltip class="item" effect="dark" content="发布" placement="right">
                    <svg-icon icon-class="upload" class="svg_icon template-upload-icon"/>
                  </el-tooltip>
                </div>
                <div class="template-bottom template-clearfix">
                  <time class="template-time">{{item.promotion_product_type.type_name}}模板</time>
                  <el-button type="text" class="template-button" @click="handleUpdate(item)">编辑模板</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="导航页面模板" name="2">
        <el-row>
          <el-col :span="6" v-for="item in list" :key="item.id">
            <el-card :body-style="{ padding: '0px' }" style="width:94%;margin:10px auto;">
              <div style="width:100%;padding-bottom:120%;height:0;overflow: hidden;">
                <img :src="item.preview_image" class="template-image" @click="handlePreviewProductTemplate(item)">
              </div>
              <div style="padding: 14px;">
                <span @click="handlePreviewProductTemplate(item)" style="cursor: pointer">{{item.template_name}}</span>
                <div @click="releaseProductTemplate(item)" style="float:right;" v-show="item.need_release">
                  <el-tooltip class="item" effect="dark" content="发布" placement="right">
                    <svg-icon icon-class="upload" class="svg_icon template-upload-icon"/>
                  </el-tooltip>
                </div>
                <div class="template-bottom template-clearfix">
                  <time class="template-time">{{item.promotion_product_type.type_name}}模板</time>
                  <el-button type="text" class="template-button" @click="handleUpdate(item)">编辑模板</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="中转页面模板" name="3">
        <el-row>
          <el-col :span="6" v-for="item in list" :key="item.id">
            <el-card :body-style="{ padding: '0px' }" style="width:94%;margin:10px auto;">
              <div style="width:100%;padding-bottom:120%;height:0;overflow: hidden;">
                <img :src="item.preview_image" class="template-image" @click="handlePreviewProductTemplate(item)">
              </div>
              <div style="padding: 14px;">
                <span @click="handlePreviewProductTemplate(item)" style="cursor: pointer">{{item.template_name}}</span>
                <div @click="releaseProductTemplate(item)" style="float:right;" v-show="item.need_release">
                  <el-tooltip class="item" effect="dark" content="发布" placement="right">
                    <svg-icon icon-class="upload" class="svg_icon template-upload-icon"/>
                  </el-tooltip>
                </div>
                <div class="template-bottom template-clearfix">
                  <time class="template-time">{{item.promotion_product_type.type_name}}模板</time>
                  <el-button type="text" class="template-button" @click="handleUpdate(item)">编辑模板</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="审核页模板" name="4">
        <el-row>
          <el-col :span="6" v-for="item in list" :key="item.id">
            <el-card :body-style="{ padding: '0px' }" style="width:94%;margin:10px auto;">
              <div style="width:100%;padding-bottom:120%;height:0;overflow: hidden;">
                <img :src="item.preview_image" class="template-image" @click="handlePreviewProductTemplate(item)">
              </div>
              <div style="padding: 14px;">
                <span @click="handlePreviewProductTemplate(item)" style="cursor: pointer">{{item.template_name}}</span>
                <div @click="releaseProductTemplate(item)" style="float:right;" v-show="item.need_release">
                  <el-tooltip class="item" effect="dark" content="发布" placement="right">
                    <svg-icon icon-class="upload" class="svg_icon template-upload-icon"/>
                  </el-tooltip>
                </div>
                <div class="template-bottom template-clearfix">
                  <time class="template-time">{{item.promotion_product_type.type_name}}模板</time>
                  <el-button type="text" class="template-button" @click="handleUpdate(item)">编辑模板</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[20,40,60, 80]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="dialogtype[dialogStatus]" :visible.sync="dialogFormVisible" width="80%">
      <el-form :rules="Rules" ref="innerDataForm1" :model="tempcode" label-position="left" label-width="100px" style='width: 90%; margin-left:5%;'>
        <el-form-item label="ID" prop="id" v-if="dialogStatus === 'update'">
          <el-input disabled="true" v-model="tempcode.id"></el-input>
        </el-form-item>
        <el-form-item label="所属产品" prop="product_id">
          <el-select :disabled="dialogStatus === 'update'"
                     filterable @change='handleFilter'
                     clearable class="filter-item"
                     style="width:230px"
                     v-model="tempcode.product_id"
                     placeholder="产品类型"
                     remote
                     :remote-method="getProductOption2"
                     :loading="innerloading2">
            <el-option v-for="item in productTypeOptions2" :key="item.id" :label="item.product_name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板类型" prop="promotion_product_type_id">
          <el-radio-group v-model="tempcode.promotion_product_type_id" size="medium">
            <el-radio-button label="1" >推广网站</el-radio-button>
            <el-radio-button label="2">导航页面</el-radio-button>
            <el-radio-button label="3">中转页面</el-radio-button>
            <el-radio-button label="4">审核页</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="使用状态" prop="status">
          <el-radio-group v-model="tempcode.status" size="medium">
            <el-radio-button label="0" >关闭</el-radio-button>
            <el-radio-button label="1">开启</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板名称" prop="template_name">
          <el-input v-model="tempcode.template_name"></el-input>
        </el-form-item>
        <el-form-item label="模板预览图" prop="preview_image">
          <el-upload
            :action="baseUrl"
            :file-list="previewImageList"
            list-type="picture-card"
            :limit="1"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handlePictureSuccess"
            name="image">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="模板代码" style="width: 100%;" prop="template_code">
          <el-input type="textarea" :autosize="{ minRows: 18, maxRows: 18}" placeholder="请输入内容" v-model="tempcode.template_code">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createInnerData1">确 定</el-button>
        <el-button v-if="dialogStatus=='update'" type="primary" @click="updateInnerData1">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :fullscreen="true" :title="previewTitle" :visible.sync="previewDialogVisible" width="padding: 30px 0px;" @close="handlePreviewClose">
      <div v-html='previewContent'></div>
    </el-dialog>
  </div>
</template>

<script>
  import { getProductList, getProductTemplateList, createProductTemplate, updateProductTemplate, deleteProductTemplate, releaseProductTemplate, previewProductTemplate, getProductTemplateInfo } from '@/api/product'
  import waves from '@/directive/waves' // 水波纹指令
  // import Clipboard from 'clipboard'
  export default {
    name: 'modelManagement',
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
        productTypeOptions: [],
        productTypeOptions2: [],
        Rules: undefined,
        listQuery: {
          page: 1,
          page_size: 20,
          template_name: undefined,
          product_id: undefined,
          promotion_product_type_id: '1',
          status: '1',
          sort: '-id',
          date_range: ''
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
        tempcode: {
          template_code: undefined,
          template_name: undefined,
          product_id: undefined,
          product_template_id: undefined,
          promotion_product_type_id: undefined,
          preview_image: undefined,
          status: undefined
        },
        dialogFormVisible: false,
        innerloading: false,
        innerloading2: false,
        innerRules1: {
          // product_id: [{ required: true, message: '请正确填写商品类', trigger: 'change' }],
          // promotion_product_type_id: [{ required: true, message: '请正确填写模板类型', trigger: 'change' }],
          // preview_image: [{ required: true, message: '请正确填写模板缩略图', trigger: 'change' }],
          // template_name: [{ required: true, message: '请正确填写模板名称', trigger: 'change' }],
          // template_code: [{ required: true, message: '请正确填写模板内容', trigger: 'change' }]
        },
        innerRules2: {
          // template_name: [{ required: true, message: '请正确填写模板名称', trigger: 'change' }],
          // promotion_product_type_id: [{ required: true, message: '请正确填写模板类型', trigger: 'change' }],
          // preview_image: [{ required: true, message: '请正确填写模板缩略图', trigger: 'change' }],
          // template_code: [{ required: true, message: '请正确填写模板内容', trigger: 'change' }]
        },
        dialogStatus: undefined,
        dialogtype: {
          'create': '新建模板',
          'update': '编辑模板'
        },
        previewDialogVisible: false,
        previewTitle: '',
        previewContent: '',
        baseUrl: process.env.BASE_API + '/api/document/uploadImage',
        previewImageList: []
      }
    },
    watch: {
      dialogStatus(val) {
        if (val === 'create') {
          this.Rules = this.innerRules1
        } else {
          this.Rules = this.innerRules2
        }
      }
    },
    created() {
      this.getList()
      this.getProductOption()
      this.getProductOption2()
    },
    methods: {
      handlePictureSuccess(response, file, fileList) {
        this.tempcode.preview_image = process.env.BASE_API + response.data.url
      },
      handleRemove(file, fileList) {
        console.log(file, fileList)
      },
      handlePictureCardPreview(file) { },
      getList() {
        this.listLoading = true
        getProductTemplateList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          window.scrollTo(0, 0)
          this.listLoading = false
        })
      },
      getProductOption(query) {
        if (query !== '') {
          this.innerloading = true
          getProductList({ product_name: query, is_promote: 1 }).then(res => {
            this.productTypeOptions = res.data.data
            this.innerloading = false
          })
        }
      },
      getProductOption2(query) {
        if (query !== '') {
          this.innerloading2 = true
          getProductList({ product_name: query, is_promote: 1 }).then(res => {
            this.productTypeOptions2 = res.data.data
            this.innerloading2 = false
          })
        }
      },
      handlePreviewProductTemplate(row) {
        previewProductTemplate({ product_template_id: row.id }).then(response => {
          this.previewContent = response.data.template_code
          this.previewTitle = response.data.template_name + ' --预览'
          this.previewDialogVisible = true
        })
      },
      handlePreviewClose() {
        this.previewContent = ''
        this.previewTitle = ''
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
        this.tempcode.template_code = undefined
        this.tempcode.template_name = undefined
        this.tempcode.product_id = undefined
        this.tempcode.product_template_id = undefined
        this.tempcode.promotion_product_type_id = undefined
        this.tempcode.preview_image = undefined
        this.tempcode.status = undefined
      },
      handleCreate() {
        this.resetTemp()
        this.previewImageList = []
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      createInnerData1() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            createProductTemplate(this.tempcode).then(response => {
              this.listQuery.promotion_product_type_id = this.tempcode.promotion_product_type_id
              this.handleFilter()
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
        this.dialogStatus = 'update'
        this.tempcode = Object.assign({}, row)
        getProductTemplateInfo({ product_template_id: row.id }).then(res => {
          this.tempcode.template_name = row.template_name
          this.tempcode.template_code = res.data.template_code
          this.tempcode.product_template_id = row.id
          this.tempcode.promotion_product_type_id = row.promotion_product_type_id
          this.tempcode.preview_image = row.preview_image
          if (this.tempcode.preview_image !== '' && this.tempcode.preview_image !== null) {
            this.previewImageList = [{ name: this.tempcode.template_name, url: this.tempcode.preview_image }]
          } else {
            this.previewImageList = []
          }
          this.dialogFormVisible = true
        })
      },
      updateInnerData1() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.tempcode)
            updateProductTemplate(tempData).then(res => {
              this.tempcode.promotion_product_type = res.data.promotion_product_type
              this.tempcode.need_release = res.data.need_release
              for (const v of this.list) {
                if (v.id === this.tempcode.product_template_id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.tempcode)
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
      releaseProductTemplate(row) {
        releaseProductTemplate({ product_template_id: row.id }).then(res => {
          for (const v of this.list) {
            if (v.id === res.data.id) {
              const index = this.list.indexOf(v)
              this.list[index].need_release = 0
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
      }
    },
    deactivated() {
      this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      this.getList()
    },
    activated() {
      window.scrollTo(0, this.scrollTop)
      this.getList()
    }
  }
</script>
<style>
  .is-fullscreen .el-dialog__body {
    padding:30px 0px !important;
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
    cursor: pointer;
  }

  .template-clearfix:before,
  .template-clearfix:after {
    display: table;
    content: "";
  }

  .template-clearfix:after {
    clear: both
  }
  .template-upload-icon {
    color:red;
    font-size:30px;
    transform: translate(0%, -25%);
  }
</style>
