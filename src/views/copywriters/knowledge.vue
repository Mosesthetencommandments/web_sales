<template>
  <div>
    <el-card shadow style="margin: 10px">
      <el-input placeholder="请输入内容" v-model="listQuery.title" @keyup.enter.native="getList" class="input-with-select">
        <el-select @change="getTagTreeData" v-model="select" slot="prepend" placeholder="请选择">
          <el-option label="文章知识" :value="1"></el-option>
          <el-option label="话术" :value="2"></el-option>
          <el-option label="客户反馈" :value="3"></el-option>
        </el-select>
        <el-cascader
          class="filter-item"
          clearable
          style="width: 210px"
          slot="prepend"
          :options="userGroupTree"
          change-on-select
          placeholder="客服组"
          :props="defaultPropsGroup"
          v-model="userGroupOptions"
          @change="getList">
        </el-cascader>
        <el-button slot="append" icon="el-icon-search" @click="getList">搜索</el-button>
      </el-input>
      <el-row style="height: calc(100vh - 150px)">
        <el-col :span="isHide ? 0 : 4" style="height:100%;position: relative;" class="tree_warpper">
          <el-card style="height: 100%;overflow: auto;background-color: #d0d3d6;border: #d0d3d6;">
            <el-tree
              :data="treeData"
              style="margin: 10px"
              default-expand-all
              show-checkbox
              check-strictly
              ref="tree"
              :props="defaultProps"
              node-key="id"
              @check="handlecheck">
            </el-tree>
            <div class="scale" @click="isHide = !isHide">
              <div class="trigon"></div>
              <div class="rectangle" :class="{rotate: isHide}">
                <i class="el-icon-d-arrow-left" style="color: black"></i>
              </div>
              <div class="trigon1"></div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="isHide ? 24 : 20" style="position: relative;height:100%;" class="result_warpper" v-loading="listLoading">
          <!--文案内容-->
          <div class="copyWrites" v-loading="listLoading">
            <nullresult style="height: 100%" v-if="copyWritesList.length == 0"></nullresult>
            <!--文章-->
            <div class="artical" v-if="select === 1" v-for="(item, index) in copyWritesList" :key="index">
              <a v-html="keyWordFilter(item.title)" @click="handleArtical(item)"></a>
              <time>{{item.author.nickname}} {{item.created_at}}</time>
            </div>
            <!--话术-->
            <div class="speech" v-if="select === 2" v-for="(item, index) in copyWritesList" :key="index">
              <div style="overflow: hidden;position: relative;height: auto">
                <div class="quest">
                  <img :src="head" alt="" style="border-radius: 50%">
                  <div v-html="keyWordFilter(item.title)"></div>
                </div>
                <div class="answer" v-for="(item2, index) in item.content" v-if="item.checkAll || index === 0" :key="index">
                  <img :src="head" alt="" style="border-radius: 50%">
                  <div>{{item2}}</div>
                </div>
                <div class="check-all" v-if="!item.checkAll && item.content.length > 1">
                  <span @click="item.checkAll = 1" >点击展开全部</span>
                </div>
              </div>
              <time>{{item.author.nickname}} {{item.created_at}}</time>
            </div>
            <!--反馈-->
            <div class="feedback" v-if="select === 3" v-for="(item, index) in copyWritesList">
              <ul :id="'viewerPreview' + index">
                <li class="img-warpper" v-for="(item2, index2) in item.images">
                  <img :src="item2.url" :alt="item2.info || ' '">
                  <p>{{item2.info}}</p>
                  <div>{{index2 + 1}}</div>
                </li>
                <li class="video-warpper" v-for="(item2, index2) in item.videos">
                  <video width="100%" height="150px" controls="controls">
                    <source :src="item2.url" type="video/mp4">
                  </video>
                  <p>{{item2.info}}</p>
                </li>
              </ul>
              <time> {{ item.title }} {{ item.author.nickname}} {{item.created_at}}</time>
            </div>

          </div>
          <div v-show="!listLoading" style="text-align: center;position: absolute;bottom: 0;left:0;width: 100%">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                           :page-sizes="[5,10,20,50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-dialog :visible.sync="dialogFormVisibleArtical" width="60%" class="artical-content">
      <h2>{{tempArtical.title}}</h2>
      <p v-html="tempArtical.content"></p>
    </el-dialog>
  </div>
</template>

<script >
  import { getTagTree } from '@/api/tag'
  import { getSupportGroupList } from '@/api/support_member'
  import { getSupportMemberList } from '@/api/support_member'
  import nullresult from '@/components/nullResult'
  import head from '@/assets/portrait.jpg'
  import { getTreeCopywriteArticalList, getTreeCopywriteFeedbackList, getTreeSpeechList } from '@/api/copywrite'
  import Viewer from 'viewerjs'
  import 'viewerjs/dist/viewer.css'
  export default {
    name: 'knowledge',
    data() {
      return {
        head,
        treeData: [],
        select: 1,
        input5: '',
        allData: [],
        isHide: false,
        total: null,
        tableKey: 0,
        tableKey1: 1,
        tableKey2: 2,
        copyWritesList: [],
        speechData: null,
        comment: [],
        type: 0,
        status: '',
        oldComment: null,
        chosedIndex: -1,
        publicImageUrl: '',
        publicImageUrl1: '',
        publicImageUrl3: '',
        userGroupOptions:[],
        userGroupTree: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        imageDialogVisible: false,
        imageDialogVisible3: false,
        departmentOptions: [],
        departmentLoading: false,
        listLoading: false,
        baseUrl: process.env.BASE_API + '/api/document/uploadVideo',
        publicVideoUrl: '',
        defaultProps: {
          children: 'child',
          label: 'tag_name'
        },
        listQuery: {
          support_user_account_group_id: undefined,
          page: 1,
          page_size: 5,
          sort: '-id',
          title: ''
        },
        tempSpeech: {
          title: undefined,
          content: ['']
        },
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        rules: {},
        basicUrl: process.env.BASE_API + '/api/copywrite/downloadImage' + '?token=' + this.$store.state.user.token,
        temp: {
          video_url: undefined,
          description: ''
        },
        viewer: {},
        temptagid: undefined,
        prise: false,
        headimg: [],
        previewimage: [],
        previewdata: undefined,
        previewvideo: undefined,
        dialogFormVisibleArtical: false,
        tempArtical: {
          title: undefined,
          content: undefined
        }
      }
    },
    components: {
      nullresult
    },
    created() {
      this.getUserGroupTree()
      this.getTagTreeData()
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
      keyWordFilter(title) {
        let red_title = title
        if (this.listQuery.title !== '') {
          red_title = title.replace(this.listQuery.title, '<font color="#c00">' + this.listQuery.title + '</font>')
        }
        return red_title
      },
      getList() {
        switch (this.select) {
          case 1: {
            this.getArticalList()
            break
          }
          case 2: {
            this.getTreeSpeechList()
            break
          }
          case 3: {
            this.getTreeCopywriteFeedbackList()
            break
          }
        }
      },
      getArticalList() {
        this.listLoading = true
        getTreeCopywriteArticalList(this.listQuery).then(response => {
          this.copyWritesList = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
      },
      getTreeSpeechList() {
        this.listLoading = true
        getTreeSpeechList(this.listQuery).then(response => {
          this.copyWritesList = response.data.data.map(item => {
            return Object.assign(item, {
              checkAll: 0
            })
          })
          this.total = response.data.total
          this.listLoading = false
        })
      },
      getTreeCopywriteFeedbackList() {
        this.listLoading = true
        getTreeCopywriteFeedbackList(this.listQuery).then(response => {
          this.copyWritesList = response.data.data
          this.total = response.data.total
          this.listLoading = false
          this.$nextTick(() => {
            this.copyWritesList.forEach((item, index) => {
              this.viewer['viewer' + index] = new Viewer(document.getElementById('viewerPreview' + index), {
                'transition': false
              })
            })
          })
        })
      },
      handlecheck(obj) {
        const checked = this.$refs.tree.getCheckedKeys()
        if (checked.length === 1) {
          this.$refs.tree.setCheckedKeys([obj.id])
          this.listQuery.tag_id = obj.id
        } else if (checked.length === 0) {
          this.$refs.tree.setCheckedKeys([])
          this.listQuery.tag_id = undefined
        } else {
          this.$refs.tree.setCheckedKeys([obj.id])
          this.listQuery.tag_id = obj.id
        }
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery1.page = val
        this.getList()
      },
      handleSizeChange(val) {
        this.listQuery.page_size = val
        this.getList()
      },
      handleArtical(row) {
        this.tempArtical = row
        this.dialogFormVisibleArtical = true
      },
      handleOpenImage(imageUrl, imageUrl1) {
        this.publicImageUrl = imageUrl
        this.publicImageUrl1 = imageUrl1
        this.imageDialogVisible = true
      },
      getTagTreeData() {
        switch (this.select) {
          case 1: {
            getTagTree({ tag_type_code: 'artical', is_customized: 0, sort: '+id' }).then(response => {
              this.treeData = response.data
            })
            break
          }
          case 2: {
            getTagTree({ tag_type_code: 'speech', is_customized: 0, sort: '+id' }).then(response => {
              this.treeData = response.data
            })
            break
          }
          case 3: {
            getTagTree({ tag_type_code: 'feedback', is_customized: 0, sort: '+id' }).then(response => {
              this.treeData = response.data
            })
            break
          }
        }
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys([])
          this.listQuery.tag_id = undefined
          this.getList()
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .el-input-group {
    /deep/ .el-input-group__append {
      background-color: #409EFF;
      border: #409EFF;
      color: white;
    }
  }
  .rotate {
    transform: rotateY(180deg);
  }
  .el-tree {
    overflow-x: hidden;
    background: transparent;
    /deep/ .el-tree-node__expand-icon  {
      color: black;
    }
    /deep/ .is-leaf  {
      color: transparent;
    }
  }
  .scale {
    position: absolute;
    cursor:pointer;
    right: -20px;
    margin-top: -50px;
    top: 50%;
    z-index: 233;
  }
  .trigon {
    width: 0;
    height: 0;
    border-color: #d0d3d6 transparent;
    border-width: 0 20px 20px 0;
    border-style: solid;
  }
  .trigon1 {
      width: 0;
      height: 0;
      border-color: #d0d3d6 transparent;
      border-width: 20px 20px 0 0;
      border-style: solid;
      }
  .rectangle {
    width: 20px;
    height: 60px;
    line-height: 60px;
    background: #d0d3d6;
  }
  .tree_warpper,.result_warpper {
    -webkit-transition: all .3s linear;
  }
  .el-col-0 {
    display: block!important;
  }
  .el-card {
    /deep/ .el-card__body{
      padding: 0;
    }
  }
  .content >>> .el-textarea__inner {
    background: #9df3478f;
  }
  .result_warpper {
    .copyWrites {
      height: calc(100% - 32px);
      box-sizing: border-box;
      overflow: auto;
      font-size: 16px;
      padding: 10px 10px 0 30px;
      .artical {
        margin-bottom: 20px;
        a{
          color: blue;
          font-size: 18px;
        }
      }
      .speech {
        width: 100%;
        margin-bottom: 20px;
        .check-all{
          display: block;
          height: 50px;
          color: green;
          text-align: center;
          background-image: linear-gradient(-180deg,rgba(255,255,255,0) 0%,#fff 70%);
          position: absolute;
          bottom: 0px;
          margin: 0;
          width: 100%;
          left: 0;
          span {
            line-height: 50px;
            cursor: pointer;
          }
        }
        >div {
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #d6d9e0;
          >div {
            margin-bottom: 6px;
          }
        }
        .quest {
          overflow: hidden;
          img {
            width: 4%;
            float: left;
          }
          div {
            box-sizing: border-box;
            font-size: 14px;
            padding: 10px;
            max-width: 40%;
            margin-left: 10px;
            border-radius: 4px;
            position: relative;
            background: #d7d8da8a;
            border: 1px solid #d6d9e0;
            float: left;
            display: inline-block;
            &:after {
              width: 0;
              height: 0;
              content: '';
              position: absolute;
              left: -12px;
              top: 10px;
              border: 6px solid transparent;
              border-right-color: #d6d9e0;
            }
          }
        }
        .answer {
          overflow: hidden;
          img {
            float: right;
            width: 4%;
          }
          div {
            font-size: 14px;
            box-sizing: border-box;
            padding: 10px;
            max-width: 40%;
            margin-right: 10px;
            border-radius: 4px;
            position: relative;
            background: #c8f898;
            border: 1px solid #c8f898;
            float: right;
            display: inline-block;
            &:after {
              width: 0;
              height: 0;
              content: '';
              position: absolute;
              right: -12px;
              top: 10px;
              border: 6px solid transparent;
              border-left-color: #c8f898;
            }
          }
        }
      }
      .feedback {
        margin-bottom: 10px;
        overflow: auto;
        >ul {
          overflow-x: scroll;
          overflow-y: hidden;
          white-space:nowrap;
          padding: 10px;
          margin: 0;
          border-radius: 4px;
          border: 1px solid #d6d9e0;
          >li {
            height: 200px;
            list-style: none;
            display: inline-block;
            vertical-align: top;
            margin-right: 10px;
            position: relative
          }
          .img-warpper {
            div {
              position: absolute;left: 0;top: 138px;width: 12px;height: 12px;text-align: center;font-size: 12px;color: white;background-color: black
            }
            width: 100px;
          }
          .video-warpper {
            width: 200px;
          }
        }
        img {
          width: 100%;height: 150px;cursor: pointer
        }
        p {
          margin: 0;
          font-size: 12px;
          max-height: 50px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 4;
          overflow: hidden;cursor: default
        }
      }
    }
    time {
      font-size: 12px;
      margin-top: 6px;
      display: block;
      color: green;
    }
  }
  .artical-content {
    h2{
      margin: 0;
      text-align: center;
    }
    p {
      font-size: 16px;
      letter-spacing: 1px;
      min-height: 350px;
      max-height: 350px;
      overflow: auto;
    }
  }
  .input-with-select {
    color: black;
    /deep/ .el-input-group__prepend {
      width: 350px;
      padding: 0;
      color: black;
      border: none;
      .el-select {
        width: 140px;
        margin: -10px 0;
      }
    }
  }
  .el-cascader {
    /deep/ .el-cascader__label {
      /*background-color: #f5f7fa;*/
    }
  }

</style>
