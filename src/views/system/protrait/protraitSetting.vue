<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-select @change='handleFilter'
                 @focus="getProductList(' ')"
                 class="filter-item"
                 style="width: 200px"
                 clearable
                 v-model="listQuery.product_id"
                 placeholder="产品">
        <el-option v-for="item in productOptions" :key="item.id" :label="item.product_name" :value="item.id">
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
      <el-table-column min-width="100px" align="center" label="画像问题">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.script}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="status-col" label="选择类型" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type | statusFilter">{{scope.row.type | statusTranslator}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="100px" align="center" label="优先级">
        <template slot-scope="scope">
          <span>{{scope.row.sort}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="status-col" label="关闭/开启" width="100">
        <template slot-scope="scope">
          <el-switch
            @change="changeIsClose($event, scope.row)"
            v-model="scope.row.is_close"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="0"
            :inactive-value="1">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="handleOpenInner(scope.row)">问题选项</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 90%; margin-left:5%;'>
        <el-form-item label="选项问题" prop="script">
          <el-input size="small" v-model="temp.script"></el-input>
        </el-form-item>
        <el-form-item label="所属产品" prop="script">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="temp.product_ids" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="item in productOptions" :label="item.id" :key="item.id">{{item.product_name}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <!--<el-form-item label="开启" >-->
          <!--<el-switch-->
            <!--v-model="temp.is_close"-->
            <!--active-color="#13ce66"-->
            <!--inactive-color="#ff4949"-->
            <!--:active-value="0"-->
            <!--:inactive-value="1">-->
          <!--</el-switch>-->
        <!--</el-form-item>-->
        <el-form-item label="类型" prop="type">
          <el-radio-group size="small" v-model="temp.type">
            <el-radio-button :label="0">单选</el-radio-button>
            <el-radio-button :label="1">多选</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number size="small"
                           v-model="temp.sort"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="innerTableTitle" :visible.sync="innerTableVisible" width="60%" >

      <div class="filter-container" align="right">
        <el-button align="right" class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate1" type="primary" icon="el-icon-edit">添加选项</el-button>
      </div>

      <el-table :key='innerTableKey1' :data="innerList" v-loading="innerListLoading1" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="ID" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="key">
          <template slot-scope="scope">
            <span class="link-type" @click="handleInnerUpdate1(scope.row)">{{scope.row.key}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="按钮名称">
          <template slot-scope="scope">
            <span class="link-type" @click="handleInnerUpdate1(scope.row)">{{scope.row.script}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="表头名称">
          <template slot-scope="scope">
            <span class="link-type" @click="handleInnerUpdate1(scope.row)">{{scope.row.column_name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="关闭/开启" width="100">
          <template slot-scope="scope">
            <el-switch
              @change="changeIsClose2($event, scope.row)"
              v-model="scope.row.is_close"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="0"
              :inactive-value="1">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column width="100px" align="center" label="报表显示">
          <template slot-scope="scope">
            <el-switch
              @change="changeIsShowStatics($event, scope.row)"
              v-model="scope.row.is_show_statics"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="150" class-name="small-padding">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleInnerUpdate1(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog width="30%" :visible.sync="innerDialogFormVisible1" append-to-body>
        <el-form :rules="rules2" ref="innerDataForm1" :model="innerTemp1" label-position="left" label-width="100px" style='width: 90%; margin-left:5%;'>
          <el-form-item label="key" prop="key">
            <el-input size="small" v-model="innerTemp1.key"></el-input>
          </el-form-item>
          <el-form-item label="按钮名称" prop="script">
            <el-input size="small" v-model="innerTemp1.script"></el-input>
          </el-form-item>
          <el-form-item label="表头名称" prop="column_name">
            <el-input size="small" v-model="innerTemp1.column_name"></el-input>
          </el-form-item>
          <!--<el-form-item label="开启" v-if="dialogStatus == 'create'">-->
            <!--<el-switch-->
              <!--v-model="innerTemp1.is_close"-->
              <!--active-color="#13ce66"-->
              <!--inactive-color="#ff4949"-->
              <!--:active-value="0"-->
              <!--:inactive-value="1">-->
            <!--</el-switch>-->
          <!--</el-form-item>-->
          <!--<el-form-item label="报表中显示" v-if="dialogStatus == 'create'">-->
            <!--<el-switch-->
              <!--v-model="innerTemp1.is_show_statics"-->
              <!--active-color="#13ce66"-->
              <!--inactive-color="#ff4949"-->
              <!--:active-value="1"-->
              <!--:inactive-value="0">-->
            <!--</el-switch>-->
          <!--</el-form-item>-->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="innerDialogFormVisible1 = false">取 消</el-button>
          <el-button v-if="dialogStatus == 'create'" type="primary" @click="createInnerData1">确 定</el-button>
          <el-button v-else type="primary" @click="updateInnerData1">确 定</el-button>
        </div>
      </el-dialog>
    </el-dialog>

  </div>
</template>

<script>
  import { getProductWeixinFansProtraitItemList, updateProductWeixinFansProtraitItem, createProductWeixinFansProtraitItem, updateProductWeixinFansProtraitItemSection, createProductWeixinFansProtraitItemSection } from '@/api/fans_protrait'
  import { getProductList } from '@/api/product'
  import waves from '@/directive/waves' // 水波纹指令
  export default {
    name: 'protraitSetting',
    directives: {
      waves
    },
    data() {
      return {
        scrollTop: 0,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: false,
        listQuery: {
          page: 1,
          page_size: 20,
          product_id: undefined,
          sort: '-id'
        },
        checkAll: false,
        isIndeterminate: false,
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showAuditor: false,
        temp: {
          product_ids: [],
          script: '',
          type: 0,
          sort: undefined,
          is_close: 0,
          product_weixin_fans_protrait_item_section: []
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
        rules2: {
          script: [{ required: true, trigger: 'change', message: '必填' }],
          key: [{ required: true, trigger: 'change', message: '必填' }],
          column_name: [{ required: true, trigger: 'change', message: '必填' }]
        },
        innerList: null,
        innerTotal1: null,
        innerTableKey1: 1,
        innerTableTitle: '',
        innerListQuery1: {
          page: 1,
          page_size: 5,
          product_id: undefined,
          sort: '-id'
        },
        innerTemp1: {
          script: undefined,
          key: undefined,
          is_close: 0,
          is_show_statics: 0,
          column_name: undefined
        },
        innerListLoading1: false,
        innerTableVisible: false,
        innerDialogFormVisible1: false,
        innerRules1: {
          template_name: [{ required: true, message: '请正确填写模板名称', trigger: 'change' }],
          template_code: [{ required: true, message: '请正确填写模板内容', trigger: 'change' }]
        },
        productType: {
          1: '推广',
          2: '附属产品'
        },
        productOptions: [],
        previewDialogVisible: false,
        previewTitle: '',
        previewContent: '',
        getProductDeliverListLoading: false,
        productDeliverOptions: [],
        temp_id: undefined
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: 'success',
          1: 'primary'
        }
        return statusMap[status]
      },
      statusTranslator(status) {
        const statusMap = {
          0: '单选',
          1: '多选'
        }
        return statusMap[status]
      },
      statusFilter2(status) {
        const statusMap = {
          0: 'success',
          1: 'danger'
        }
        return statusMap[status]
      },
      statusTranslator2(status) {
        const statusMap = {
          0: '开启',
          1: '关闭'
        }
        return statusMap[status]
      }
    },
    created() {
      this.getProductList(' ')
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        getProductWeixinFansProtraitItemList(this.listQuery).then(response => {
          this.list = response.data
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
      changeIsClose(event, row) {
        updateProductWeixinFansProtraitItem({
          id: row.id,
          is_close: event
        }).then(() => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
        }).catch(() => {
          row.is_close = event === 0 ? 1 : 0
        })
      },
      changeIsClose2(event, row) {
        updateProductWeixinFansProtraitItemSection({
          id: row.id,
          is_close: event
        }).then(() => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
        }).catch(() => {
          row.is_close = event === 0 ? 1 : 0
        })
      },
      changeIsShowStatics(event, row) {
        updateProductWeixinFansProtraitItemSection({
          id: row.id,
          is_show_statics: event
        }).then(() => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
        }).catch(() => {
          row.is_show_statics = event === 0 ? 1 : 0
        })
      },
      resetTemp() {
        this.temp = {
          product_ids: [],
          script: '',
          type: 0,
          sort: undefined,
          is_close: 0,
          product_weixin_fans_protrait_item_section: []
        }
      },
      handleCreate() {
        this.resetTemp()
        console.log(this.temp)
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createProductWeixinFansProtraitItem(this.temp).then(response => {
              this.temp = response.data
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
        this.resetTemp()
        this.temp = Object.assign({ product_ids: [] }, JSON.parse(JSON.stringify(row)))// copy obj
        this.temp.product_ids.push(...row.product.map(item => item.id))
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const parm = Object.assign({}, this.temp)
            updateProductWeixinFansProtraitItem(parm).then(() => {
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
      getProductList(query) {
        if (query !== '') {
          this.productLoading = true
          getProductList({ product_name: query, is_promote: 1 }).then(response => {
            this.productOptions = response.data.data
            this.productLoading = false
          })
        }
      },
      handleOpenInner(row) {
        this.innerTableVisible = true
        this.innerTableTitle = row.script + ' -- 选项'
        this.innerList = Object.assign([], row.product_weixin_fans_protrait_item_section) // copy obj
        this.temp_id = row.id
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
          script: undefined,
          key: undefined,
          is_close: 0,
          is_show_statics: 1,
          column_name: undefined
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
            const parm = Object.assign({}, this.innerTemp1)
            parm.product_weixin_fans_protrait_item_id = this.temp_id
            createProductWeixinFansProtraitItemSection(parm).then(response => {
              this.innerTemp1 = response.data
              this.innerList.unshift(this.innerTemp1)
              this.getList()
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
      handleCheckAllChange(val) {
        console.log(val)
        this.temp.product_ids = val ? this.productOptions.map(item => item.id) : []
        this.isIndeterminate = false
      },
      handleCheckedCitiesChange(value) {
        console.log(value)
        console.log(this.temp.product_ids)
        const checkedCount = value.length
        this.checkAll = checkedCount === this.productOptions.length
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.productOptions.length
      },
      handlePreviewClose() {
        this.previewContent = ''
        this.previewTitle = ''
      },
      handleInnerUpdate1(row) {
        this.innerTemp1 = JSON.parse(JSON.stringify(row))
        this.dialogStatus = 'update'
        this.innerDialogFormVisible1 = true
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      updateInnerData1() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            const parm = Object.assign({}, this.innerTemp1)
            parm.product_weixin_fans_protrait_item_id = this.temp_id
            updateProductWeixinFansProtraitItemSection(parm).then(res => {
              for (const v of this.innerList) {
                if (v.id === this.innerTemp1.id) {
                  const index = this.innerList.indexOf(v)
                  this.innerList.splice(index, 1, res.data)
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
      }
    },
    deactivated() {
      this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    },
    activated() {
      window.scrollTo(0, this.scrollTop)
      this.getProductList(' ')
    }
  }
</script>
<style scoped lang="scss">
  .el-form-item {
    margin-bottom: 10px;
  }
  .el-checkbox-group {
    line-height: 20px;
  }
  .el-checkbox+.el-checkbox {
    margin: 0;
    margin-right: 20px;
  }
  .el-checkbox {
    margin-right: 20px;
  }
</style>
