<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <!--<el-select-->
      <!--@change='handleFilter'-->
      <!--clearable-->
      <!--placeholder="审核"-->
      <!--class="filter-item"-->
      <!--style="width:80px"-->
      <!--v-model="listQuery.is_verified">-->
      <!--<el-option v-for="item in filteroptions2" :key="item.id" :label="item.label" :value="item.id">-->
      <!--</el-option>-->
      <!--</el-select>-->
      <el-select
        @change="handleFilter"
        clearable
        filterable
        placeholder="选择产品"
        class="filter-item"
        style="width:200px"
        remote
        :remote-method="getProductList"
        :loading="productListLoading"
        v-model="listQuery.product_id">
        <el-option v-for="item in productListOptions" :key="item.id" :label="item.product_name" :value="item.id">
        </el-option>
      </el-select>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="标题" v-model="listQuery.title" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">创建计划</el-button>
    </div>

    <el-table
      :data="list"
      v-loading="listLoading"
      element-loading-text="给我一点时间"
      border
      fit
      highlight-current-row
      style="width: 100%"
      stripe>
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="售后" width="80">
        <template slot-scope="scope">
          <el-tag  :type="scope.row.is_after_sale | statusWeixinFilter1">{{scope.row.is_after_sale | statusWeixinFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="标题">
        <template slot-scope="scope">
          <span>{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="产品" >
        <template slot-scope="scope">
          <el-tag type="pirmary">{{scope.row.product.product_name}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="客户标签">
        <template slot-scope="scope">
          <el-tag v-if="item.tag_type.type_code === 'custom'"  v-for="item of scope.row.tag" :key="item.tag_name">{{item.tag_name}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="追访标签">
        <template slot-scope="scope">
          <el-tag v-if="item.tag_type.type_code === 'tract'" v-for="item of scope.row.tag" :key="item.tag_name">{{item.tag_name}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="开始时间">
        <template slot-scope="scope">
          <span>第{{scope.row.min_date}}天</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="结束时间" >
        <template slot-scope="scope">
          <span>第{{scope.row.max_date}}天</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="300px">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleeditSpeechTag(scope.row,'custom')">客户标签</el-button>
          <el-button type="primary" size="mini" @click="handleeditSpeechTag(scope.row,'tract')">追访标签</el-button>
          <el-button type="primary" size="mini" @click="handleInnerUpdate5(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handledeleteSpeech(scope.row)">刪除</el-button>
        </template>
      </el-table-column>

    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="编辑标签" :visible.sync="innerDialogFormVisible5">
      <el-form :rules="innerRules1" ref="innerDataForm5" :model="innerTemp5" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="选择标签" prop="tag_ids">
          <div>
            <template v-for="(item,index) in TagIdArry1">
              <el-radio-group size="mini"  style="width: 100%;margin-top: 10px;" v-model="innerTemp5.tag_ids">
                <el-radio-button
                  border
                  :key="index2"
                  v-for="(item2,index2) in item.child"
                  :label="item2.id">{{item2.tag_name}}
                </el-radio-button>
              </el-radio-group>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible5 = false">取 消</el-button>
        <el-button type="primary" @click="updateInnerData5">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑标签" :visible.sync="innerDialogFormVisible6">
      <el-form ref="innerDataForm5" :model="innerTemp6" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="选择标签" >
          <div>
            <template  v-for="(item,index) in TagIdArry2">
              <el-radio-group size="mini" style="width: 100%;margin-top: 10px;" v-model="innerTemp6.tag_ids">
                <el-radio-button
                  border
                  :key="index2"
                  v-for="(item2,index2) in item.child"
                  :label="item2.id">{{item2.tag_name}}
                </el-radio-button>
              </el-radio-group>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible6 = false">取 消</el-button>
        <el-button type="primary" @click="updateInnerData5">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form :rules="rules" ref="DataForm" :model="temp" label-position="left" label-width="100px" style='width: 90%; margin-left:5%;'>
        <el-form-item label="回访标题" prop="title">
          <el-input v-model="temp.title"></el-input>
        </el-form-item>
        <el-form-item label="售后" prop="is_after_sale">
          <el-select
            placeholder=""
            class="filter-item"
            style="width:150px"
            v-model="temp.is_after_sale">
            <el-option v-for="item in filteroptions2" :key="item.id" :label="item.label" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择产品" prop="product_id">
          <el-select
            clearable
            filterable
            placeholder="选择产品"
            class="filter-item"
            style="width:300px"
            remote
            :remote-method="getProductList"
            :loading="productListLoading"
            v-model="temp.product_id">
            <el-option v-for="item in productListOptions" :key="item.id" :label="item.product_name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="min_date">
          <el-input  type="number" v-model="temp.min_date"></el-input>
        </el-form-item>
        <el-form-item label="结束时间" prop="max_date">
          <el-input  type="number" v-model="temp.max_date"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='tag'" type="primary" @click="editSpeechTag">确 定</el-button>
        <el-button v-else type="primary" @click="createTrackTimeRange">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog  title="编辑计划" :visible.sync="dialogFormVisible2" width="40%" >
      <el-form :rules="rules" ref="DataFormUpdate" :model="tempUpdate" v-show="dialogStatus!=='tag'" label-position="left" label-width="100px" style='width: 90%; margin-left:5%;'>
        <el-form-item label="回访标题" prop="title">
          <el-input v-model="tempUpdate.title"></el-input>
        </el-form-item>
        <el-form-item label="售后" prop="is_after_sale">
          <el-select
            placeholder=""
            class="filter-item"
            style="width:150px"
            v-model="tempUpdate.is_after_sale">
            <el-option v-for="item in filteroptions2" :key="item.id" :label="item.label" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择产品" prop="product_id">
          <el-select
            clearable
            filterable
            placeholder="选择产品"
            class="filter-item"
            style="width:300px"
            remote
            :remote-method="getProductList"
            :loading="productListLoading"
            v-model="tempUpdate.product_id">
            <el-option v-for="item in productListOptions" :key="item.id" :label="item.product_name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最短时间" prop="min_date">
          <el-input  type="number" v-model="tempUpdate.min_date" placeholder="天数"></el-input>
        </el-form-item>
        <el-form-item label="最长时间" prop="max_date">
          <el-input  type="number" v-model="tempUpdate.max_date" placeholder="天数"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible2 = false">取 消</el-button>
          <el-button type="primary" @click="updateData">确 定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script >
  import { createTrackTimeRange, deleteTrackTimeRange, updateTrackTimeRange, getTrackTimeRangeList, editTrackTimeRangeTag } from '@/api/track'
  import { getTagTree } from '@/api/tag'
  import { editSpeechTag } from '@/api/speech'
  import { getProductList } from '@/api/product'
  import { wangEditor } from '@/utils/wang'
  export default {
    name: 'track_setting',
    data() {
      return {
        wangeditor2: wangEditor('#editorElem2'),
        wangeditor1: wangEditor('#editorElem1'),
        speech: undefined,
        editorContent: '',
        tableKey: 0,
        total: undefined,
        listLoading: false,
        list: [],
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          product_id: undefined,
          title: undefined
        },
        TagIdArry1: [],
        TagIdArry2: [],
        innerTemp5: {
          track_time_range_id: undefined,
          tag_ids: undefined
        },
        innerTemp6: {
          track_time_range_id: undefined,
          tag_ids: undefined
        },
        temp: {
          title: undefined,
          is_after_sale: 0,
          product_id: undefined,
          min_date: undefined,
          max_date: undefined
        },
        dialogStatus: '',
        dialogFormVisible: false,
        dialogFormVisible2: false,
        innerDialogFormVisible5: false,
        innerDialogFormVisible6: false,
        dialogFormVisibleUpdate: false,
        dialogFormVisibleUpdate2: false,
        textMap: {
          update: '编辑',
          create: '创建',
          tag: '编辑标签'
        },
        filteroptions: [
          { id: 1, label: '强制' },
          { id: 0, label: '非强制' }
        ],
        filteroptions2: [
          { id: 1, label: '售后' },
          { id: 0, label: '售前' }
        ],
        rules: {
          title: [{ required: true, message: '回访时间段标题', trigger: 'change' }],
          product_id: [{ required: true, message: '选择产品', trigger: 'change' }],
          min_date: [{ required: true, message: '填写最短时间', trigger: 'change' }],
          max_date: [{ required: true, message: '填写最长时间', trigger: 'change' }]
        },
        innerRules1: {
          tag_ids: [{ required: true, message: '选择标签', trigger: 'change' }]
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
        tagTree: undefined,
        tempSpeechTag: {
          speech_id: undefined,
          tag_ids: []
        },
        tagtypeid: undefined,
        tempUpdate: {
          track_time_range_id: undefined,
          title: undefined,
          is_after_sale: undefined,
          product_id: undefined,
          min_date: undefined,
          max_date: undefined
        },
        tagtype: undefined,
        tempSpeech: {
          speech_title: undefined,
          speech_content: this.editorContent
        },
        defaultProps: {
          children: 'child',
          label: 'tag_name'
        },
        parmtagids: [],
        allTagArry1: [],
        tagtyptemparray: undefined,
        tagtyptreearray: [],
        productListLoading: false,
        productListOptions: []
      }
    },
    filters: {
      statusWeixinFilter1(status) {
        const statusMap1 = {
          '0': 'success',
          '1': 'danger'
        }
        return statusMap1[status]
      },
      statusWeixinFilter(status) {
        const statusMap = {
          0: '售前',
          1: '售后'
        }
        return statusMap[status]
      }
    },
    methods: {
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      getList() {
        this.listLoading = true
        getTrackTimeRangeList(this.listQuery).then(res => {
          this.list = res.data.data
          this.total = res.data.total
          this.listLoading = false
        })
      },
      getProductList(query) {
        if (query !== '') {
          this.productListLoading = true
          getProductList({ product_name: query, is_promote: 1 }).then(response => {
            this.productListOptions = response.data.data
            this.productListLoading = false
          })
        }
      },
      updateInnerData5() {
        const tempparm1 = []
        if (this.innerTemp5.tag_ids) {
          tempparm1.push(this.innerTemp5.tag_ids)
        }
        if (this.innerTemp6.tag_ids) {
          tempparm1.push(this.innerTemp6.tag_ids)
        }
        const tempparm = {
          track_time_range_id: this.tagtypeid,
          tag_ids: tempparm1
        }
        editTrackTimeRangeTag(tempparm).then(() => {
          this.innerDialogFormVisible5 = false
          this.innerDialogFormVisible6 = false
          this.getList()
        })
      },
      handleeditSpeechTag(row, data) {
        this.tagtypeid = row.id
        this.innerTemp5.tag_ids = undefined
        this.innerTemp6.tag_ids = undefined
        if (data === 'custom') {
          this.tagtype = 'custom'
          this.tagtyptemparray = undefined
          this.innerTemp5.tag_ids = undefined
          if (row.tag.length !== 0) {
            for (const v in row.tag) {
              if (row.tag[v].tag_type.type_code === 'custom') {
                this.innerTemp5.tag_ids = row.tag[v].id
              }
              if (row.tag[v].tag_type.type_code === 'tract') {
                this.innerTemp6.tag_ids = row.tag[v].id
              }
            }
          }
          this.innerDialogFormVisible5 = true
        }
        if (data === 'tract') {
          this.tagtype = 'tract'
          this.tagtyptemparray = undefined
          this.innerTemp6.tag_ids = undefined
          if (row.tag.length !== 0) {
            for (const v in row.tag) {
              if (row.tag[v].tag_type.type_code === 'tract') {
                this.innerTemp6.tag_ids = row.tag[v].id
              }
              if (row.tag[v].tag_type.type_code === 'custom') {
                this.innerTemp5.tag_ids = row.tag[v].id
              }
            }
          }
          this.innerDialogFormVisible6 = true
        }
      },
      // handletractTag(row) {
      //   this.tagtype = 'tract'
      //   this.tagtypeid = row.id
      //   this.innerDialogFormVisible6 = true
      //   this.tagtyptemparray = []
      //   this.tagtyptreearray = []
      //   this.innerTemp6.tag_ids = []
      //   if (row.tag.length !== 0) {
      //     for (const v in row.tag) {
      //       if (row.tag[v].tag_type.type_code === 'tract') {
      //         this.tagtyptreearray.push(row.tag[v].id)
      //       } else {
      //         this.tagtyptemparray.push(row.tag[v].id)
      //       }
      //     }
      //   }
      //   this.innerTemp6.track_time_range_id = row.id
      //   this.$nextTick(() => {
      //     this.$refs.tree.setCheckedKeys(this.tagtyptreearray)
      //   })
      // },
      resetTemp() {
        this.temp = {
          title: undefined,
          is_after_sale: 0,
          product_id: undefined,
          min_date: undefined,
          max_date: undefined
        }
      },
      handleSizeChange(val) {
        this.listQuery.page_size = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      handledeleteSpeech(row) {
        this.$confirm('此操作将永久删除该设置, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteTrackTimeRange({ track_time_range_id: row.id }).then(response => {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['DataForm'].clearValidate()
        })
      },
      createTrackTimeRange() {
        this.$refs['DataForm'].validate((valid) => {
          if (valid) {
            createTrackTimeRange(this.temp).then(() => {
              this.getList()
              this.dialogFormVisible = false
            })
          }
        })
      },
      handleUpdatespeech(row) {
        this.dialogFormVisibleUpdate = true
        this.tempUpdate = Object.assign({}, row)
        this.tempUpdate.track_time_range_id = row.id
        this.$nextTick(() => {
          this.$refs['DataFormUpdate'].clearValidate()
        })
      },
      getTagTree() {
        getTagTree({ tag_type_code: 'custom', is_customized: 0 }).then(res => {
          this.TagIdArry1 = res.data
        })
        getTagTree({ tag_type_code: 'tract', is_customized: 0 }).then(res => {
          this.TagIdArry2 = res.data
        })
      },
      handleInnerUpdate5(row) {
        this.productListOptions = []
        this.productListOptions.push(row.product)
        this.tempUpdate = Object.assign({ track_time_range_id: row.id }, row)
        this.dialogStatus = 'update'
        this.dialogFormVisible2 = true
        this.$nextTick(() => {
          this.$refs['DataFormUpdate'].clearValidate()
        })
      },
      editSpeechTag() {
        this.tempSpeechTag.tag_ids = this.$refs.tree.getCheckedKeys()
        editSpeechTag(this.tempSpeechTag).then(res => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.dialogFormVisible = false
          this.getList()
        })
      },
      updateData() {
        this.$refs['DataFormUpdate'].validate((valid) => {
          if (valid) {
            updateTrackTimeRange(this.tempUpdate).then(() => {
              this.getList()
              this.dialogFormVisible2 = false
            })
          }
        })
      }
    },
    created() {
      this.getList()
      this.getTagTree()
    },
    mounted() {
    }
  }
</script>

<style scoped>

  .el-tree >>> .el-tree-node{
    margin: 8px 0;
  }
  .el-tree >>> .el-tree-node__expand-icon{
    font-size: 25px;
  }
  .el-tree >>> .el-tree-node__label{
    font-size: 20px;
  }
  #editorElem1 >>> .w-e-item{
    width: 40px;
  }
  #editorElem1 >>> .w-e-item img{
    width: 100%;
  }
  #editorElem2 >>> .w-e-item{
    width: 40px;
  }
  #editorElem2 >>> .w-e-item img{
    width: 100%;
  }
</style>
