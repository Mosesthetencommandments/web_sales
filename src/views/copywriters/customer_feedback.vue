<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-cascader
        class="filter-item"
        clearable
        :options="userGroupTree"
        change-on-select
        placeholder="客服组"
        :props="defaultPropsGroup"
        v-model="userGroupOptions"
        @change="handleFilterGrounp">
      </el-cascader>
      <el-select
        class="filter-item"
        style="width: 150px"
        @focus="getSupportUserAccountList(' ')"
        @change='handleFilter'
        v-model="listQuery.support_user_account_id"
        multiple
        filterable
        remote
        placeholder="客服"
        :remote-method="getSupportUserAccountList"
        :loading="supportUserAccountLoading">
        <el-option
          v-for="item in supportUserAccountOptions"
          :key="item.id"
          :label="item.nickname"
          :value="item.id">
        </el-option>
      </el-select>
      <el-select
        @change='handleFilter'
        clearable
        filterable
        placeholder="客服微信账号"
        class="filter-item"
        style="width:150px"
        @focus="getProductWeixinList(' ')"
        remote
        :remote-method="getProductWeixinList"
        :loading="productWeixinListLoading"
        v-model="listQuery.weixin_id">
        <el-option v-for="item in productWeixinListOptions" :key="item.id" :label="item.info" :value="item.id">
        </el-option>
      </el-select>
      <el-select
        @change='handleFilter'
        clearable
        filterable
        placeholder="粉丝微信账号"
        class="filter-item"
        @focus="getProductWeixinFansPivotList(' ')"
        style="width:150px"
        remote
        :remote-method="getProductWeixinFansPivotList"
        :loading="productWeixinFansLoading"
        v-model="listQuery.weixin_fans_id">
        <el-option v-for="item in productWeixinFansOptions" :key="item.id" :label="item.product_weixin_fans.weixin_account" :value="item.id">
        </el-option>
      </el-select>
      <el-input v-model="listQuery.title" clearable @keyup.enter.native="handleFilter" @change="handleFilter" style="width: 200px;" class="filter-item" placeholder="请输入反馈标题" >
      </el-input>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加</el-button>
    </div>

    <el-table :data="list"
              v-loading="listLoading"
              element-loading-text="给我一点时间"
              border
              fit
              highlight-current-row
              style="width: 100%"
              stripe>
      <el-table-column align="center" label="ID" width="70px">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span><br/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="审核" width="90px">
        <template slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.is_verified == 0">未通过</el-tag>
          <el-tag type="success" v-else>通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="标题" min-width="260px">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdateFeedback(scope.row)">{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="知识树标签" >
        <template slot-scope="scope">
          <el-tag type="primary" v-if="item.tag_type.type_code === 'feedback'" v-for="item in scope.row.tag" :key="item.tag_name" style="margin-right: 5px">{{item.tag_name}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="作者" width="100px">
        <template slot-scope="scope">
          <span>{{scope.row.author.nickname}}</span><br/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="300px">
        <template slot-scope="scope">
          <el-button v-if="scope.row.is_verified == 0" type="success" size="mini" @click="handleVerified(scope.row)">审核</el-button>
          <el-button type="primary" size="mini" @click="handleUpdateFeedback(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="handleEditTag(scope.row)">标签设置</el-button>
          <el-button type="danger" size="mini" @click="handledelete(scope.row)"><i class="el-icon-delete"></i></el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="65%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="100px" style='width: 837px;'>
        <el-form-item label="标题" prop="title">
          <el-input style="width: 400px" placeholder="请输入标题" v-model="temp.title"></el-input>
        </el-form-item>
        <el-form-item label="微信号" >
          <el-select
            @change='handleCustomerFansChange'
            clearable
            filterable
            placeholder="选择客服微信"
            remote
            :remote-method="getProductWeixinList"
            :loading="productWeixinListLoading"
            v-model="temp.weixin_id">
            <el-option v-for="item in productWeixinListOptions" :key="item.id" :label="item.info" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户微信号" >
          <el-select
            clearable
            filterable
            @focus="getProductWeixinFansPivotList2(' ')"
            placeholder="选择客户微信账号"
            remote
            :remote-method="getProductWeixinFansPivotList2"
            :loading="productWeixinFansLoading"
            v-model="temp.weixin_fans_id">
            <el-option v-for="item in productWeixinFansOptions2" :key="item.id" :label="item.product_weixin_fans.weixin_account" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="反馈图片" prop="">
          <el-row style="margin-bottom: 15px;">
            <el-col :span="24">
              <el-col :span="4">
                <div class="upload_box">
                  <el-upload
                    list-type="picture-card"
                    :action="baseUrl_img"
                    :file-list="fileList_img"
                    :on-preview="handlePictureCardPreview_img"
                    :on-remove="handlePictureCardRemove_img"
                    :on-success="handlePictureCardSuccess_img"
                    :before-upload="beforeUpload_img"
                    name="image"
                    >
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </div>
              </el-col>
              <el-col :span="20">
                <div class="textarea_box">
                  <el-input v-for="(item, index) in temp.images" :key="item.uid" v-model="temp.images[index].info" type="textarea" style="margin-bottom: 23px" :autosize="{ minRows: 6, maxRows: 4}" placeholder="请输入图片对应文案" ></el-input>
                </div>
              </el-col>
            </el-col>
          </el-row>
          <div >只能上传jpg/png文件,图片大小不能超过5M</div>
        </el-form-item>
        <el-form-item label="反馈视频" prop="">
          <el-row style="margin-bottom: 15px;" >
            <el-col :span="24">
              <el-col :span="4">
                <div class="upload_box">
                  <el-upload
                              list-type="picture-card"
                             :action="baseUrl_video"
                             :file-list="fileList_video"
                             :on-preview="handlePictureCardPreview_video"
                             :on-remove="handlePictureCardRemove_video"
                             :on-success="handlePictureCardSuccess_video"
                             :before-upload="beforeUpload_video"
                             name="video">
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </div>
              </el-col>
              <el-col :span="20">
                <div class="textarea_box">
                  <el-input v-for="item in temp.videos" :key="item.uid" v-model="item.info" type="textarea" style="margin-bottom: 23px" :autosize="{ minRows: 6, maxRows: 4}" placeholder="请输入视频对应文案">
                  </el-input>
                </div>
              </el-col>
            </el-col>
          </el-row>
          <div >只能上传mp4文件，大小不超过10M</div>
        </el-form-item>
        <el-form-item label="开放素材">
          <el-radio-group v-model="temp.is_public">
            <el-radio-button v-for="item in typeOptions" :key="item.key" :label="item.key">
              {{item.label}}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30,50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="图片预览" :visible.sync="imageDialogVisible">
      <img width="100%" :src="publicImageUrl">
    </el-dialog>

    <el-dialog title="视频预览" :visible.sync="dialogFormVisible_video" width="30%">
      <video v-if="dialogFormVisible_video" width="100%" height="240" controls="controls">
        <source :src="publicVideoUrl" type="video/mp4">
      </video>
    </el-dialog>

    <el-dialog class="dialog_tag" :visible.sync="dialogFormVisibleTag" width="40%">
      <div slot="title" class="clearfix">
        反馈标签
      </div>
      <el-tree :data="tagTree"
               :props="defaultProps"
               default-expand-all
               ref="tree"
               node-key="id"
               check-strictly
               show-checkbox
               @node-click="">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleTag = false">取 消</el-button>
        <el-button type="primary" @click="editSpeechTag">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { getSupportGroupList } from '@/api/support_member'
  import { getSupportMemberList } from '@/api/support_member'
  import { getUserAccountDepartmentGroupTree } from '@/api/user_department'
  import { getProductWeixinList, getProductWeixinFansPivotList } from '@/api/product_weixin'
  import { getCopywriteFeedbackList, createCopywriteFeedback, deleteCopywriteFeedback, updateCopywriteFeedback, editCopywriteFeedbackTag, checkCopywriteFeedback } from '@/api/copywrite'
  import { getTagTree } from '@/api/tag'
  export default {
    name: 'customer_feedback',
    data() {
      return {
        scrollTop: 0,
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        userGroupOptions:[],
        userGroupTree: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        temp: {
          title: undefined,
          weixin_id: undefined,
          weixin_fans_id: undefined,
          is_public: 0,
          images: [],
          videos: []
        },
        defaultProps: {
          children: 'child',
          label: 'tag_name'
        },
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          status: '',
          title: undefined,
          support_user_account_id: undefined,
          support_user_account_group_id: undefined,
          author_id: undefined,
          weixin_id: undefined,
          weixin_fans_id: undefined,
          track_time_range_id: undefined,
          tag_id: undefined
        },
        rules: {
          title: [{ required: true, trigger: 'change', message: '必填' }]
        },
        departmentOptions: [],
        departmentLoading: false,
        tagTree: undefined,
        fileList_img: [],
        fileList_video: [],
        baseUrl_img: process.env.BASE_API + '/api/document/uploadImage',
        baseUrl_video: process.env.BASE_API + '/api/document/uploadVideo',
        publicImageUrl: undefined,
        publicVideoUrl: undefined,
        support_user_account_id: undefined,
        tempUpdateId: undefined,
        weixin_id: undefined,
        dialogFormVisible: false,
        dialogFormVisible_video: false,
        dialogFormVisibleTag: false,
        imageDialogVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        typeOptions: [{ label: '否', key: 0 }, { label: '是', key: 1 }],
        supportMemberListLoading: false,
        supportMemberListOptions: [],
        productWeixinListLoading: false,
        productWeixinListOptions: [],
        productWeixinFansLoading: false,
        productWeixinFansOptions: [],
        productWeixinFansOptions2: []
      }
    },
    watch: {
      dialogFormVisible(value) {
        if (value === false) {
          this.resetTemp()
          this.fileList_img = []
          this.fileList_video = []
        }
      }
    },
    created() {
      this.getList()
      this.getUserGroupTree()
      this.getTagTree()
    },
    methods: {
      getUserGroupTree() {
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
      handleFilterGrounp(val) {
        this.listQuery.support_user_account_group_id = val[val.length - 1]
        this.handleFilter()
      },
      handlePictureCardPreview_img(file) {
        this.publicImageUrl = file.url
        this.imageDialogVisible = true
      },
      handleVerified(row) {
        this.$confirm('审核通过?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          checkCopywriteFeedback({ feedback_id: row.id, is_verified: 1 }).then(response => {
            this.$notify({
              title: '审核通过',
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
      getSupportUserAccountList(query) {
        if (query !== '') {
          this.supportUserAccountLoading = true
          getSupportMemberList({ nickname: query, status: 1 }).then(response => {
            this.supportUserAccountOptions = response.data.data
            this.supportUserAccountLoading = false
          })
        }
      },
      handlePictureCardRemove_img(file, fileList) {
        this.temp.images.forEach((item, index) => {
          if (item.uid === file.uid) {
            this.temp.images.splice(index, 1)
          }
        })
      },
      handlePictureCardSuccess_img(response, file, fileList) {
        this.temp.images.push({
          name: file.name,
          url: file.response.data.url,
          info: '',
          uid: file.uid
        })
      },
      handlePictureCardPreview_video(file) {
        this.publicVideoUrl = file.url
        this.dialogFormVisible_video = true
      },
      handlePictureCardRemove_video(file, fileList) {
        this.temp.videos.forEach((item, index) => {
          if (item.uid === file.uid) {
            this.temp.videos.splice(index, 1)
          }
        })
      },
      handlePictureCardSuccess_video(response, file, fileList) {
        this.temp.videos.push({
          name: file.name,
          url: process.env.BASE_API + file.response.data.url,
          info: '',
          uid: file.uid
        })
      },
      beforeUpload_img(file) {
        const isLt5M = file.size / 1024 / 1024 < 5
        if (['image/png'].indexOf(file.type) === -1 && ['image/jpeg'].indexOf(file.type) === -1) {
          this.$message.error('请上传正确的图片格式')
          return false
        }
        if (!isLt5M) {
          this.$message.error('上传图片大小不能超过5MB')
          return false
        }
      },
      beforeUpload_video(file) {
        const isLt5M = file.size / 1024 / 1024 < 10
        if (['video/mp4'].indexOf(file.type) === -1) {
          this.$message.error('请上传正确的视频格式')
          return false
        }
        if (!isLt5M) {
          this.$message.error('上传视频大小不能超过10MB')
          return false
        }
      },
      getTagTree() {
        getTagTree({ tag_type_code: 'feedback', is_customized: 0, sort: '+id' }).then(res => {
          this.tagTree = res.data
        })
      },
      resetTemp() {
        this.temp = {
          title: undefined,
          weixin_id: undefined,
          weixin_fans_id: undefined,
          is_public: 0,
          images: [],
          videos: []
        }
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.getProductWeixinList(' ')
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createCopywriteFeedback(this.temp).then(response => {
              this.getList()
              this.dialogFormVisible = false
              // this.total++
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
      handleUpdateFeedback(row) {
        this.dialogStatus = 'update'
        this.temp = JSON.parse(JSON.stringify(row))
        if (!this.temp.weixin_fans_id) {
          this.temp.weixin_fans_id = undefined
        } else {
          this.getProductWeixinList(' ')
        }
        if (!this.temp.weixin_id) {
          this.temp.weixin_id = undefined
        } else {
          this.getProductWeixinFansPivotList2(' ')
        }
        this.fileList_img = row.images
        this.fileList_video = row.videos
        this.tempUpdateId = row.id
        this.dialogFormVisible = true
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const parm = Object.assign({ feedback_id: this.tempUpdateId }, this.temp)
            updateCopywriteFeedback(parm).then(response => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '修改成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handledelete(row) {
        this.$confirm('此操作将删除该文案, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCopywriteFeedback({ feedback_id: row.id }).then(res => {
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
      handleEditTag(row) {
        const tagArray = []
        for (const v in row.tag) {
          tagArray.push(row.tag[v].id)
        }
        this.tempUpdateId = row.id
        this.dialogFormVisibleTag = true
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(tagArray)
        })
      },
      editSpeechTag() {
        // if (this.temptagarray2.length > 0) {
        //   this.tempSpeechTag.tag_ids.push(...this.temptagarray2)
        // }
        const tag_ids = this.$refs.tree.getCheckedKeys()
        const parm = {
          tag_ids: tag_ids,
          feedback_id: this.tempUpdateId
        }
        editCopywriteFeedbackTag(parm).then(res => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.dialogFormVisibleTag = false
          this.getList()
        })
      },
      handleFilter2() {
        this.productWeixinListOptions = []
        this.productWeixinFansOptions = []
        this.listQuery.weixin_id = undefined
        this.listQuery.weixin_fans_id = undefined
        this.listQuery.author_id = undefined
        this.listQuery.page = 1
        this.getList()
      },
      handleFilter1() {
        this.productWeixinListOptions = []
        this.productWeixinFansOptions = []
        this.listQuery.weixin_id = undefined
        this.listQuery.weixin_fans_id = undefined
        this.listQuery.page = 1
        this.getList()
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      getList() {
        this.listLoading = true
        getCopywriteFeedbackList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
      },
      addFeedbackList(keyword) {
        if (keyword === 'image') {
          this.temp.feedbackImglist.push({
            img_path: '',
            info: ''
          })
        } else if (keyword === 'video') {
          this.temp.feedbackVideolist.push({
            video_path: '',
            info: ''
          })
        }
      },
      handleCustomerFansChange() {
        this.productWeixinFansOptions = []
        this.temp.weixin_fans_id = undefined
      },
      getSupportMemberList(query) {
        if (query !== '') {
          this.supportMemberListLoading = true
          getSupportMemberList({ nickname: query, status: 1, page_size: 0 }).then(response => {
            this.supportMemberListOptions = response.data
            this.supportMemberListLoading = false
          })
        }
      },
      getProductWeixinList(query) {
        if (query !== '') {
          this.productWeixinListLoading = true
          getProductWeixinList({
            status: 1,
            info: query,
            page_size: 0
          }).then(response => {
            this.productWeixinListOptions = response.data
            this.productWeixinListLoading = false
          })
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
      getProductWeixinFansPivotList(query) {
        if (!this.listQuery.weixin_id) {
          this.$message.error('选择客服微信')
          return
        }
        if (query !== '') {
          this.productWeixinFansLoading = true
          getProductWeixinFansPivotList({
            status: 1,
            fans_weixin_account: query,
            product_weixin_id: this.listQuery.weixin_id
          }).then(response => {
            this.productWeixinFansOptions = response.data.data
            this.productWeixinFansLoading = false
          })
        }
      },
      getProductWeixinFansPivotList2(query) {
        if (!this.temp.weixin_id) {
          this.$message.error('选择客服微信')
          return
        }
        if (query !== '') {
          this.productWeixinFansLoading = true
          getProductWeixinFansPivotList({
            status: 1,
            fans_weixin_account: query,
            product_weixin_id: this.temp.weixin_id
          }).then(response => {
            this.productWeixinFansOptions2 = response.data.data
            this.productWeixinFansLoading = false
          })
        }
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
<style scoped>
  .textarea_box {
    margin-left: -20px;
  }
  .el-textarea >>> .el-textarea__inner{
    height: 100px!important;
    min-height: 100px!important;
    max-height: 100px!important;
  }
  .upload_box >>> .el-upload--picture-card {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }
  .upload_box >>> .is-success {
    width: 100px;
    height: 100px;
  }
  .upload_box >>> .is-ready {
    width: 100px;
    height: 100px;
  }
</style>
