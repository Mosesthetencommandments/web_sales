<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-select
        @change='handleFilter1'
        v-if="!($store.state.user.roles === 'support')"
        clearable
        filterable
        placeholder="请选择客服"
        class="filter-item"
        style="width:200px"
        remote
        :remote-method="getSupportMemberList"
        :loading="supportMemberListLoading"
        v-model="listQuery.support_user_account_id">
        <el-option v-for="item in supportMemberListOptions" :key="item.id" :label="item.nickname" :value="item.id">
        </el-option>
      </el-select>
      <el-select @change='handleFilter' style="width: 150px" class="filter-item" v-model="listQuery.status" placeholder="状态">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-select
        @change='handleFilter'
        clearable
        filterable
        placeholder="客服微信账号"
        class="filter-item"
        style="width:200px"
        remote
        :remote-method="getProductWeixinList"
        :loading="productWeixinListLoading"
        v-model="listQuery.product_weixin_id">
        <el-option v-for="item in productWeixinListOptions" :key="item.id" :label="item.weixin_account" :value="item.id">
        </el-option>
      </el-select>
      <el-select
        @change='handleFilter'
        clearable
        filterable
        placeholder="粉丝微信账号"
        class="filter-item"
        style="width:200px"
        remote
        :remote-method="getProductWeixinFansPivotList"
        :loading="productWeixinFansLoading"
        v-model="listQuery.product_weixin_fans_id">
        <el-option v-for="item in productWeixinFansOptions" :key="item.id" :label="item.product_weixin_fans.weixin_account" :value="item.id">
        </el-option>
      </el-select>
      <el-select
        @change='handleFilter'
        clearable
        filterable
        placeholder="计划分类"
        class="filter-item"
        style="width:200px"
        remote
        :remote-method="getTrackTimeRangeList"
        :loading="trackTimeRangeLoading"
        v-model="listQuery.track_time_range_id">
        <el-option v-for="item in trackTimeRangeOptions" :key="item.id" :label="item.title" :value="item.id">
        </el-option>
      </el-select>
      <el-select
        @change='handleFilter'
        placeholder="审核"
        class="filter-item"
        style="width:150px"
        v-model="listQuery.sort">
        <el-option v-for="item in filteroptions2" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>

    <el-table :data="list"
              v-loading="listLoading"
              element-loading-text="给我一点时间"
              border
              fit
              highlight-current-row
              style="width: 100%"
              stripe>
      <el-table-column align="center" label="粉丝微信号">
        <template slot-scope="scope">
          <span>{{scope.row.product_weixin_fans.weixin_account}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="微信号">
        <template slot-scope="scope">
          <span>{{scope.row.product_weixin.weixin_account}}</span>
          <el-tag type="success">{{scope.row.product_weixin.info}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="客服" width="100">
        <template slot-scope="scope">
          <span style="color: black">{{scope.row.support_user_account.nickname}}</span><br/>
          <span >{{scope.row.support_user_account.user_account_group.group_name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="计划名称">
        <template slot-scope="scope">
          <span>{{scope.row.track_time_range.title}}</span>
          <el-tag v-if="scope.row.track_time_range.is_after_sale == 1" type="danger">{{scope.row.track_time_range.is_after_sale | statusWeixinFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="截至日期" >
        <template slot-scope="scope">
          <span>{{scope.row.min_date}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusWeixinFilter3">{{scope.row.status | statusWeixinFilter2}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="300px">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handlespeech(scope.row)">话术提示</el-button>
          <el-button type="success" size="mini" @click="handleCustomerile(scope.row)">客户档案</el-button>
          <el-button type="primary" size="mini" v-if="$store.state.user.roles === 'administrator' && scope.row.status != 0"  @click="switchTrackPlanStatus(scope.row, 0)">待跟进</el-button>
          <el-button type="success" size="mini" v-if="scope.row.status == 0"  @click="switchTrackPlanStatus(scope.row, 1)">已跟进</el-button>
          <el-button type="info" size="mini" v-if="scope.row.status == 0"  @click="switchTrackPlanStatus(scope.row, 3)">客户不存在</el-button>
          <el-button type="danger" size="mini" v-if="$store.state.user.roles === 'administrator'" @click="deleteTrackPlanStatus(scope.row)">删除计划</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog  title="话术" :visible.sync="dialogFormVisibleUpdate4" width="60%" class="previewspeech">
      <!--<el-table :key='tableKey1'-->
                <!--:data="speechList"-->
                <!--v-loading="speechListLoading"-->
                <!--element-loading-text="给我一点时间"-->
                <!--border-->
                <!--fit-->
                <!--highlight-current-row-->
                <!--style="width: 100%"-->
                <!--stripe>-->
        <!--<el-table-column align="center" label="序号" width="65" style="font-size: 10px">-->
          <!--<template slot-scope="scope">-->
            <!--<span style="">{{scope.row.id}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column align="center" label="话术标题" min-width="200px"  style="font-size: 10px">-->
          <!--<template slot-scope="scope">-->
            <!--<el-tag v-if="scope.row.is_perfect == 1" type="danger" style="background: #f78989;color: white;">精</el-tag>&nbsp<span class="link-type" @click="handleOpenSpeech(scope.row)">{{scope.row.speech_title}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column align="center" label="点赞数" style="font-size: 10px">-->
          <!--<template slot-scope="scope">-->
            <!--<span style="">{{scope.row.prise_account.length}}</span><br/>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column align="center" label="上传" width="200" style="font-size: 10px">-->
          <!--<template slot-scope="scope">-->
            <!--<span style="">{{scope.row.author.nickname}}</span><br/>-->
            <!--<span style="">{{scope.row.updated_at}}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
      <!--</el-table>-->

      <!--<div v-show="!speechListLoading" class="pagination-container">-->
        <!--<el-pagination background @size-change="handleInnerSizeChange" @current-change="handleInnerCurrentChange" :current-page.sync="innerlistQuery.page"-->
                       <!--:page-sizes="[5,10,15,20]" :page-size="innerlistQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innertotal">-->
        <!--</el-pagination>-->
      <!--</div>-->

      <div style="max-height: 500px;overflow: auto;">
        <template v-for="(item,index) in speechList">
          <el-card style="margin-bottom: 30px;background: #99a9bf73;min-height:300px; ">
            <h1 style="text-align: center;padding: 10px 0;margin: 0;" class="innerh1">{{item.speech_title}}<el-tag v-if="item.is_perfect == 1" style="background: #f78989;color: white;">精</el-tag></h1>
            <p style="text-align: left;font-weight: 600;margin:0 0 20px 0;padding: 0 2%;">
              <span >{{item.author.nickname}}&nbsp&nbsp&nbsp{{item.updated_at}}</span>
            </p>
            <div style="font-size: 16px;padding: 20px 2%;" v-html="item.speech_content"></div>
          </el-card>

          <el-button v-if="index === (innerlistQuery.page*innerlistQuery.page_size)-1" @click="handlespeech2" type="primary" style="margin: 0;padding: 0;width: 100%;height: 40px;">查看更多</el-button>
        </template>
      </div>



    </el-dialog>

    <el-dialog :visible.sync="imageDialogVisible2" width="60%" class="innerspeech">
      <h1 style="text-align: center;margin: 10px 0 ;" v-html="previewdata.speech_title"></h1>
      <p style="text-align: center">{{previewdata.updated_at}}更新</p>
      <p style="text-align: center">{{previewdata.author.nickname}}</p>
      <div style="font-size: 20px;padding: 0 10px;margin: 40px 0" v-html="previewdata.speech_content"></div>
    </el-dialog>


    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogcustomerFileVisible" width="65%">
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogcustomerFileVisible = false">取 消</el-button>
        <el-button type="primary">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script >
  import { switchTrackPlanStatus, getTrackTimeRangeList, getTrackPlanList, deleteTrackPlanStatus } from '@/api/track'
  import { getTagTree } from '@/api/tag'
  import { getSpeechList } from '@/api/speech'
  import { getSupportMemberList } from '@/api/support_member'
  import { getProductWeixinList } from '@/api/product_weixin'
  import { getProductWeixinFansPivotList } from '@/api/product_weixin'
  import { wangEditor } from '@/utils/wang'
  export default {
    name: 'support_track',
    data() {
      return {
        filesData: [
          {
            date: '2018-08-11',
            return_visit: '客户不想买',
            describe: '客户买了一堆',
            name: '驴驴'
          },
          {
            date: '2018-08-11',
            return_visit: '客户不想买',
            describe: '客户买了一堆',
            name: '驴驴'
          },
          {
            date: '2018-08-11',
            return_visit: '客户不想买',
            describe: '客户买了一堆',
            name: '驴驴'
          },
          {
            date: '2018-08-11',
            return_visit: '客户不想买',
            describe: '客户买了一堆客户买了一堆客户买了一堆客户买了一堆客户买了一堆客户买了一堆客户买了一堆客户买了一堆客户买了一堆客户买了一堆客户买了一堆客户买了一堆',
            name: '驴驴'
          }
        ],
        wangeditor2: wangEditor('#editorElem2'),
        wangeditor1: wangEditor('#editorElem1'),
        speech: undefined,
        tableKey1: 1,
        speechList: [],
        speechListLoading: false,
        editorContent: '',
        tableKey: 0,
        total: undefined,
        innertotal: undefined,
        listLoading: false,
        imageDialogVisible2: false,
        list: [],
        previewdata: {
          author: {
            nickname: undefined
          },
          speech_title: undefined,
          speech_content: undefined
        },
        dialogFormVisibleUpdate4: false,
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          status: '',
          support_user_account_id: this.$store.state.user.roles === 'support' ? this.$store.state.user.user_account_id : undefined,
          product_weixin_id: undefined,
          product_weixin_fans_id: undefined,
          track_time_range_id: undefined,
          tag_id: undefined
        },
        innerlistQuery: {
          tag_id: undefined,
          page: 0,
          page_size: 5,
          sort: '-is_perfect'
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
        dialogcustomerFileVisible: false,
        dialogFormVisibleUpdate: false,
        dialogFormVisibleUpdate2: false,
        textMap: {
          update: '编辑',
          create: '创建',
          tag: '编辑标签',
          customerFile: '客户档案'
        },
        statusOptions: [
          { label: '待跟进', key: 0 },
          { label: '已跟进', key: 1 },
          { label: '已过期', key: 2 },
          { label: '客户不存在', key: 3 }
        ],
        filteroptions: [
          { id: 1, label: '强制' },
          { id: 0, label: '非强制' }
        ],
        filteroptions2: [
          { id: '-max_date', label: '结束时间' },
          { id: '-id', label: 'ID' }
        ],
        rules: {
          title: [{ required: true, message: '回访时间段标题', trigger: 'change' }],
          product_id: [{ required: true, message: '选择产品', trigger: 'change' }]
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
        tempUpdate: {
          speech_id: undefined,
          speech_title: undefined,
          speech_content: undefined
        },
        tempSpeech: {
          speech_title: undefined,
          speech_content: this.editorContent
        },
        defaultProps: {
          children: 'child',
          label: 'tag_name'
        },
        productListLoading: false,
        productListOptions: [],
        supportMemberListLoading: false,
        supportMemberListOptions: [],
        productWeixinListLoading: false,
        productWeixinListOptions: [],
        productWeixinFansLoading: false,
        productWeixinFansOptions: [],
        trackTimeRangeLoading: false,
        trackTimeRangeOptions: [],
        temptagtype: []
      }
    },
    watch: {
      dialogFormVisibleUpdate4(val) {
        if (val === false) {
          this.innerlistQuery.page = 0
          this.speechList = []
        }
      }
    },
    filters: {
      statusWeixinFilter(status) {
        const statusMap = {
          0: '售前',
          1: '售后'
        }
        return statusMap[status]
      },
      statusWeixinFilter2(status) {
        const statusMap1 = {
          0: '待跟进',
          1: '已跟进 ',
          2: '已过期',
          3: '客户不存在'
        }
        return statusMap1[status]
      },
      statusWeixinFilter3(status) {
        const statusMap3 = {
          0: 'pirmary',
          1: 'success',
          2: 'danger',
          3: 'info'
        }
        return statusMap3[status]
      }
    },
    methods: {
      handleCustomerile(row) {
        this.dialogcustomerFileVisible = true
        this.dialogStatus = 'customerFile'
      },
      handlespeech(row) {
        for (const v in row.track_time_range.tag) {
          if (row.track_time_range.tag[v].tag_type.type_code === 'tract') {
            var temptagtype = row.track_time_range.tag[v].id
          }
        }
        this.innerlistQuery.page += 1
        this.innerlistQuery.page_size = 5
        this.innerlistQuery.tag_id = temptagtype
        getSpeechList(this.innerlistQuery).then(response => {
          this.speechList.push(...response.data.data)
          this.innertotal = response.data.total
        })
        this.dialogFormVisibleUpdate4 = true
      },
      handlespeech2() {
        this.innerlistQuery.page += 1
        getSpeechList(this.innerlistQuery).then(response => {
          this.speechList.push(...response.data.data)
        })
      },
      getInnerSpeechList() {
        getSpeechList(this.innerlistQuery).then(response => {
          this.speechList = response.data.data
          this.innertotal = response.data.total
          this.speechListLoading = false
        })
      },
      deleteTrackPlanStatus(row) {
        this.$confirm('删除该计划是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteTrackPlanStatus({ track_plan_id: row.id }).then(response => {
            this.$notify({
              title: '成功',
              message: '成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
      },
      handleOpenSpeech(row) {
        this.imageDialogVisible2 = true
        this.previewdata = row
      },
      switchTrackPlanStatus(row, status) {
        this.$confirm('是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          switchTrackPlanStatus({ track_plan_id: row.id, status: status }).then(response => {
            this.$notify({
              title: '成功',
              message: '成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
      },
      getList() {
        this.listLoading = true
        getTrackPlanList(this.listQuery).then(res => {
          this.list = res.data.data
          this.total = res.data.total
          this.listLoading = false
        })
      },
      getSupportMemberList(query) {
        if (query !== '') {
          this.supportMemberListLoading = true
          getSupportMemberList({ nickname: query, status: 1 }).then(response => {
            this.supportMemberListOptions = response.data.data
            this.supportMemberListLoading = false
          })
        }
      },
      getProductWeixinList(query) {
        if (query !== '') {
          this.productWeixinListLoading = true
          getProductWeixinList({
            weixin_account: query,
            status: 1,
            support_user_account_id: this.listQuery.support_user_account_id
          }).then(response => {
            this.productWeixinListOptions = response.data.data
            this.productWeixinListLoading = false
          })
        }
      },
      getProductWeixinFansPivotList(query) {
        if (query !== '') {
          this.productWeixinFansLoading = true
          getProductWeixinFansPivotList({
            status: 1,
            fans_weixin_account: query,
            product_weixin_id: this.listQuery.product_weixin_id,
            support_user_account_id: this.listQuery.support_user_account_id
          }).then(response => {
            this.productWeixinFansOptions = response.data.data
            this.productWeixinFansLoading = false
          })
        }
      },
      getTrackTimeRangeList(query) {
        if (query !== '') {
          this.trackTimeRangeLoading = true
          getTrackTimeRangeList({
            title: query
          }).then(response => {
            this.trackTimeRangeOptions = response.data.data
            this.trackTimeRangeLoading = false
          })
        }
      },
      handleeditSpeechTag(row) {
        const tagArray = []
        for (const v in row.tag) {
          tagArray.push(row.tag[v].id)
        }
        this.dialogFormVisible2 = true
        this.tempSpeechTag.speech_id = row.id
        this.dialogStatus = 'tag'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(tagArray)
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleFilter1() {
        this.productWeixinListOptions = []
        this.productWeixinFansOptions = []
        this.listQuery.product_weixin_id = undefined
        this.listQuery.product_weixin_fans_id = undefined
        this.listQuery.page = 1
        this.getList()
      },
      handleSizeChange(val) {
        this.listQuery.page_size = val
        this.getList()
      },
      handleInnerSizeChange(val) {
        this.innerlistQuery.page_size = val
        this.getInnerSpeechList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      handleInnerCurrentChange(val) {
        this.listQuery.page = val
        this.getInnerSpeechList()
      },
      // switchPerfectSpeech(row, data) {
      //   switchPerfectSpeech({
      //     speech_id: row.id,
      //     is_perfect: data
      //   }).then(res => {
      //     this.getList()
      //   })
      // },
      // handledeleteSpeech(row) {
      //   this.$confirm('此操作将永久删除该话术, 是否继续?', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     deleteSpeech({ speech_id: row.id }).then(response => {
      //       this.$notify({
      //         title: '成功',
      //         message: '删除成功',
      //         type: 'success',
      //         duration: 2000
      //       })
      //       this.getList()
      //     })
      //   }).catch(() => {
      //     this.$message({
      //       type: 'info',
      //       message: '已取消删除'
      //     })
      //   })
      // },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['DataForm'].clearValidate()
        })
      },
      // createSpeech() {
      //   this.$refs['DataForm'].validate((valid) => {
      //     if (valid) {
      //       this.tempSpeech.speech_content = this.wangeditor1.txt.html()
      //       createSpeech(this.tempSpeech).then(() => {
      //         this.getList()
      //         this.dialogFormVisible = false
      //       })
      //     }
      //   })
      // },
      handleUpdatespeech(row) {
        this.dialogFormVisibleUpdate = true
        this.dialogFormVisibleUpdate2 = true
        this.wangeditor2.txt.html(row.speech_content)
        this.tempUpdate.speech_id = row.id
        this.tempUpdate.speech_title = row.speech_title
      },
      getTagTree() {
        getTagTree({ tag_type_code: 'tract', is_customized: 0 }).then(res => {
          this.tagTree = res.data
        })
      }
      // editSpeechTag() {
      //   this.tempSpeechTag.tag_ids = this.$refs.tree.getCheckedKeys()
      //   editSpeechTag(this.tempSpeechTag).then(res => {
      //     this.$message({
      //       message: '操作成功',
      //       type: 'success'
      //     })
      //     this.dialogFormVisible = false
      //     this.getList()
      //   })
      // },
      // updateData() {
      //   this.$refs['DataFormUpdate'].validate((valid) => {
      //     if (valid) {
      //       updateSpeech(this.tempUpdate).then(() => {
      //         console.log(this.tempUpdate)
      //         this.getList()
      //         this.dialogFormVisibleUpdate = false
      //       })
      //     }
      //   })
      // }
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
  .innerh1{
    height: 60px;line-height: 40px;
  }
  .innerh1 >>> .el-tag{
    height:30px; line-height: 30px;font-size: 20px;margin-left: 5px;
  }
  .previewspeech >>> .el-dialog{
    margin-top: 2vh!important;
  }
  .previewspeech >>> .el-dialog__body{
    padding-top: 0px;
  }
  .innerspeech >>> .el-dialog {
    min-height: 700px;
  }
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

  /*.el-dialog__body {*/
    /*text-align: center;*/
  /*}*/
</style>
