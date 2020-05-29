<template>
  <div class="" style="padding: 40px 0">
    <div style="width: 95%;margin: 0 auto;">
      <el-row :gutter="40">
        <el-col :span="5">
          <el-card shadow class="container_left" style="min-height: 600px">
            <h3 style="text-align: center;color: black">追访标签</h3>
            <el-tree
              :data="data"
              :props="defaultProps"
              node-key="id"
              @node-click="handleNodeClick"
            >
            </el-tree>
          </el-card>
        </el-col>
        <el-col :span="19">
          <el-tabs v-model="activeName2" type="border-card" >
            <el-tab-pane label="相关话术" name="fourth">
              <el-table :key='tableKey'
                        :data="speechList"
                        v-loading="speechListLoading"
                        element-loading-text="给我一点时间"
                        border
                        fit
                        highlight-current-row
                        style="width: 100%"
                        stripe>
                <el-table-column align="center" label="序号" width="65" style="font-size: 10px">
                  <template slot-scope="scope">
                    <span style="">{{scope.row.id}}</span>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="话术标题" min-width="200px"  style="font-size: 10px">
                  <template slot-scope="scope">
                    <el-tag v-if="scope.row.is_perfect == 1" type="danger" style="background: #f78989;color: white;">精</el-tag>&nbsp<span class="link-type" @click="handlPreview(scope.row)">{{scope.row.speech_title}}</span>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="点赞数" style="font-size: 10px">
                  <template slot-scope="scope">
                    <span style="">{{scope.row.prise_account.length}}</span><br/>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="文案标签" style="font-size: 10px">
                  <template slot-scope="scope" >
                    <template >
                      <el-tag type="primary" v-for="item in scope.row.tag" :key="item.tag_name" v-if="item.tag_type.type_code === 'copywrite'">{{item.tag_name}}</el-tag>
                    </template>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="上传" width="200" style="font-size: 10px">
                  <template slot-scope="scope">
                    <span style="">{{scope.row.author.nickname}}</span><br/>
                    <span style="">{{scope.row.updated_at}}</span>
                  </template>
                </el-table-column>
              </el-table>
              <div class="bottom_pagination" style="position: absolute;bottom: 0;margin-bottom: 5px;">
                <div class="pagination-container" v-if="!videoListLoading" >
                  <el-pagination background @size-change="handleSizeChange3" @current-change="handleCurrentChange3" :current-page.sync="listQuery3.page"
                                 :page-sizes="[5,10,20,30]" :page-size="listQuery3.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total3">
                  </el-pagination>
                </div>
              </div>
              <el-dialog :visible.sync="speechDialogVisible" width="60%">
              </el-dialog>
            </el-tab-pane>

            <el-tab-pane label="相关回访计划" name="first">
              <el-table :key='tableKey1'
                        :data="trackTimeRangeList"
                        v-loading="speechListLoading"
                        element-loading-text="给我一点时间"
                        border
                        fit
                        highlight-current-row
                        style="width: 100%"
                        stripe>
                <el-table-column align="center" label="序号" width="65" style="font-size: 10px">
                  <template slot-scope="scope">
                    <span style="">{{scope.row.id}}</span>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="计划标题" min-width="200px">
                  <template slot-scope="scope">
                    <span class="link-type">{{scope.row.title}}</span>
                    <el-tag v-if="scope.row.is_after_sale == 1" type="danger">售后</el-tag>
                    <el-tag v-if="scope.row.is_after_sale == 0" type="success">售前</el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="追訪时间" >
                  <template slot-scope="scope">
                    <span>第{{scope.row.min_date}}天~第{{scope.row.max_date}}天</span>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="客户标签" style="font-size: 10px">
                  <template slot-scope="scope" >
                      <el-tag type="primary" v-for="item in scope.row.tag" :key="item.tag_name" v-if="item.tag_type.type_code === 'custom'">{{item.tag_name}}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="相关产品" style="font-size: 10px">
                  <template slot-scope="scope" >
                    <el-tag type="primary">{{scope.row.product.product_name}}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-dialog :visible.sync="friendCircleDialogVisible"  width="60%">
              </el-dialog>
            </el-tab-pane>

          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <el-dialog :visible.sync="imageDialogVisible" width="70%">
        <img width="48%;"   :src="publicImageUrl">
        <img width="48%;"   :src="publicImageUrl1">
    </el-dialog>
    <el-dialog :visible.sync="imageDialogVisible3" width="40%">
        <img width="100%;"  :src="publicImageUrl3">
    </el-dialog>
    <el-dialog :visible.sync="imageDialogVisible2" width="60%" class="previewDialog">
      <h1 style="text-align: center" v-html="previewdata.speech_title"></h1>
      <p style="text-align: left;font-weight: 600;margin-bottom: 40px">
        <span >{{previewdata.author.nickname}}&nbsp&nbsp&nbsp{{previewdata.updated_at}}</span>
      </p>
      <div style="font-size: 16px;margin-top: 20px" v-html="previewdata.speech_content"></div>
    </el-dialog>
  </div>
</template>

<script >
  import { getTagTree } from '@/api/tag'
  import { createSpeechPrise, deleteSpeechPrise } from '@/api/speech'
  import { getTrackTimeRangeList } from '@/api/track'
  import { getSpeechList, getSpeechCommentBySpeech } from '@/api/speech'
  import { createCopywriteVideo, getCopywriteFriendCircleCommentList } from '@/api/copywrite'
  export default {
    name: 'tractTag',
    data() {
      return {
        data: [],
        total: null,
        tableKey: 0,
        total3: undefined,
        total4: undefined,
        previewdata: {
          author: {
            nickname: undefined
          },
          speech_title: undefined,
          speech_content: undefined
        },
        tableKey1: 1,
        tableKey2: 2,
        videoList: null,
        speechList: null,
        trackTimeRangeList: null,
        feedBackList: null,
        contrastPicList: null,
        friendCircleList: null,
        speechData: null,
        friendCircleData: null,
        comment: [],
        type: 0,
        status: '',
        oldComment: null,
        chosedIndex: -1,
        publicImageUrl: '',
        publicImageUrl1: '',
        publicImageUrl3: '',
        imageDialogVisible: false,
        imageDialogVisible3: false,
        contrastPicListLoading: false,
        feedBackListLoading: false,
        videoListLoading: false,
        speechListLoading: false,
        friendCircleLoading: false,
        baseUrl: process.env.BASE_API + '/api/document/uploadVideo',
        publicVideoUrl: '',
        defaultProps: {
          children: 'child',
          label: 'tag_name'
        },
        listQuery: {
          page: 1,
          page_size: 5,
          sort: '-id'
        },
        friendCircle_id: undefined,
        speechCommentTemp: {
          content: '',
          speech_id: undefined,
          reply_user_account_id: undefined,
          pid: 0
        },
        commentTemp: {
          content: '',
          reply_user_account_id: undefined,
          pid: 0
        },
        friendCircleTemp: {
          content: '',
          copywrite_friends_circle_id: undefined,
          reply_user_account_id: undefined,
          pid: 0
        },
        tempspeechid: undefined,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        imageDialogVisible2: false,
        rules: {},
        listQuery3: {
          page: 1,
          tag_id: undefined,
          page_size: 5,
          sort: '-id'
        },
        listQuery4: {
          page: 1,
          tag_id: undefined,
          page_size: 5,
          sort: '-id'
        },
        temp: {
          video_url: undefined,
          description: ''
        },
        temptagid: undefined,
        prise: false,
        headimg: [],
        dialogFormVisible: false,
        speechDialogVisible: false,
        friendCircleDialogVisible: false,
        activeName2: 'fourth'
      }
    },
    created() {
      this.getTagTree()
    },
    watch: {
      speechDialogVisible(val) {
        if (val === false) {
          this.listQuery.page = 1
        }
      },
      friendCircleDialogVisible(val) {
        if (val === false) {
          this.listQuery.page = 1
        }
      }
    },
    methods: {
      isPrise(data) {
        for (const v in data) {
          if (data[v].id === this.$store.state.user.user_account_id) {
            this.prise = true
          }
        }
      },
      handlPreview(row) {
        this.imageDialogVisible2 = true
        this.previewdata = row
      },
      handleSizeChange3(val) {
        this.listQuery3.page_size = val
        this.getSpeechList()
      },
      handleSizeChange4(val) {
        this.listQuery4.page_size = val
        this.getTrackTimeRangeList()
      },
      handleCurrentChange3(val) {
        this.listQuery4.page = val
        this.getSpeechList()
      },
      handleCurrentChange4(val) {
        this.listQuery4.page = val
        this.getTrackTimeRangeList()
      },
      speechPrise() {
        if (this.prise) {
          deleteSpeechPrise({ speech_id: this.tempspeechid }).then(() => {
            this.prise = false
            getSpeechList({ tag_id: this.temptagid }).then(response => {
              this.speechList = response.data.data
              this.speechListLoading = false
            })
          })
        } else {
          createSpeechPrise({ speech_id: this.tempspeechid }).then(() => {
            this.$message({
              message: '点赞成功',
              type: 'success'
            })
            this.prise = true
            // this.headimg.push({ nickname: this.$store.state.user.name, head_img: this.$store.state.user.avatar })
            getSpeechList({ tag_id: this.temptagid }).then(response => {
              this.speechList = response.data.data
              this.speechListLoading = false
            })
          })
        }
      },
      handleSizeChange(val) {
        this.listQuery.page_size = val
        if (this.status === 'Speech') {
          getSpeechCommentBySpeech(Object.assign({ speech_id: this.tempspeechid }, this.listQuery)).then(response => {
            this.comment = response.data.data
            this.total = response.data.total
          })
        }
        if (this.status === 'FriendCircle') {
          getCopywriteFriendCircleCommentList(Object.assign({ copywrite_friends_circle_id: this.tempspeechid }, this.listQuery)).then(response => {
            this.comment = response.data.data
            this.total = response.data.total
          })
        }
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        if (this.status === 'Speech') {
          const tempparm = Object.assign({ speech_id: this.tempspeechid }, this.listQuery)
          getSpeechCommentBySpeech(tempparm).then(response => {
            this.comment = response.data.data
            this.total = response.data.total
          })
        }
        if (this.status === 'FriendCircle') {
          getCopywriteFriendCircleCommentList(Object.assign({ copywrite_friends_circle_id: this.tempspeechid }, this.listQuery)).then(response => {
            this.comment = response.data.data
            this.total = response.data.total
          })
        }
      },
      handleOpenImage(imageUrl, imageUrl1) {
        this.publicImageUrl = imageUrl
        this.publicImageUrl1 = imageUrl1
        this.imageDialogVisible = true
      },
      handleOpenImage3(imageUrl) {
        this.publicImageUrl3 = imageUrl
        this.imageDialogVisible3 = true
      },
      handleOpenSpeech(row) {
        this.status = 'Speech'
        this.tempspeechid = row.id
        this.headimg = row.prise_account
        this.prise = false
        this.isPrise(row.prise_account)
        this.speechDialogVisible = true
        this.commentTemp.speech_id = row.id
        this.speechData = row
        getSpeechCommentBySpeech({ speech_id: row.id, page_size: this.listQuery.page_size }).then(response => {
          this.comment = response.data.data
          this.total = response.data.total
        })
      },
      handleOpenFriendCircle(row) {
        this.status = 'FriendCircle'
        this.tempspeechid = row.id
        this.friendCircleDialogVisible = true
        this.commentTemp.copywrite_friends_circle_id = row.id
        this.friendCircleData = row
        getCopywriteFriendCircleCommentList({ copywrite_friends_circle_id: row.id, page_size: this.listQuery.page_size }).then(response => {
          this.comment = response.data.data
          this.total = response.data.total
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createCopywriteVideo(this.temp).then(response => {
              this.list.unshift(response.data)
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
      handlePictureCardPreview(file) {
        this.publicVideoUrl = file.url
      },
      handleRemove(file, fileList) {
        console.log(file, fileList)
      },
      handlePictureSuccess(response, file, fileList) {
        this.temp.video_url = process.env.BASE_API + response.data.url
      },
      getTagTree() {
        getTagTree({ tag_type_code: 'tract', is_customized: 0, sort: '+id' }).then(response => {
          this.data = response.data
        })
      },
      getSpeechList() {
        this.speechListLoading = true
        getSpeechList(this.listQuery3).then(response => {
          this.speechList = response.data.data
          this.total3 = response.data.total
          this.speechListLoading = false
        })
      },
      getTrackTimeRangeList() {
        this.speechListLoading = true
        getTrackTimeRangeList(this.listQuery4).then(response => {
          this.trackTimeRangeList = response.data.data
          this.total4 = response.data.total
          this.speechListLoading = false
        })
      },
      handleNodeClick(obj) {
        this.listQuery3.tag_id = obj.id
        this.listQuery4.tag_id = obj.id
        this.getSpeechList()
        this.getTrackTimeRangeList()
      },
      changeCommeter(name, pid, reply, index) {
        this.oldComment = name
        this.chosedIndex = index
        this.commentTemp.pid = pid
        this.commentTemp.reply_user_account_id = reply
        this.type = 1
      },
      canelCommit() {
        this.commentTemp.pid = 0
        this.type = 0
      }
    }
  }
</script>

<style scoped>
  .el-card{
    box-shadow: 0px 2px 12px 0 rgba(0,0,0,.5)!important;
  }
  .el-tabs >>> .el-tabs__content{
    min-height: 400px;
    padding-bottom: 40px;
  }
  .el-tabs{
    box-shadow: 0px 2px 12px 0 rgba(0,0,0,.5)!important;
  }
  .el-tree {
    color: black;
  }
  .el-tree >>> .el-tree-node__content{
    height: 30px!important;
  }
  .el-tree >>> .el-tree-node__expand-icon{
    font-size: 25px;
  }
  .el-tree >>> .el-tree-node__label{
    font-size: 20px;
  }
  .el-tree >>> .el-tree-node__content{
    /*background-color: #42485b!important;*/
  }
  .el-tree >>> .el-tree-node:focus >.el-tree-node__content {
    /*background-color: #00c1de !important;*/
  }
  .el-tabs >>> .el-tabs__nav .is-active{
    color: black!important;
    font-weight: 600;
  }
  .el-tabs >>> .el-tabs__content{
    min-height: 600px;
  }
  .el-tabs >>>.el-tabs__header{
    margin-bottom: 0;
  }
  .el-popover--plain {
    padding: 0px!important;
  }
  .bottom_pagination{
    width: 100%;
  }
  .bottom_pagination >>> .pagination-container{
    width: 100%;
  }
  .bottom_pagination >>> .el-pagination{
    text-align: center;
  }
</style>
