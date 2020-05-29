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
      <el-input @keyup.enter.native="handleFilter" style="width: 300px;" class="filter-item" placeholder="标题" v-model="listQuery.title">
      </el-input>
      <!--<el-select @change='handleFilter' clearable style="width: 120px" class="filter-item" v-model="listQuery.is_perfect" placeholder="是否加精">-->
        <!--<el-option v-for="item in perfectOptions" :key="item.key" :label="item.label" :value="item.key">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <el-button class="filter-item" type="primary" @click="handleFilter" icon="el-icon-search">搜索</el-button>
      <el-button class="filter-item" type="primary" @click="handleCreate"  icon="el-icon-edit">添加</el-button>
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
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="审核" width="90px">
        <template slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.is_verified == 0">未通过</el-tag>
          <el-tag type="success" v-else>通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="标题" min-width="250px">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdateSpeech(scope.row)">{{scope.row.title}}</span>&nbsp<el-tag v-if="scope.row.is_perfect == 1" style="background: #f78989;color: white;">精</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="知识树标签" min-width="150px">
        <template slot-scope="scope">
          <el-tag size="mini" type="primary" v-for="item in scope.row.tag" :key="item.tag_name" style="margin-right: 5px">{{item.tag_name}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="作者" width="100px">
        <template slot-scope="scope">
          <span v-if="scope.row.author">{{scope.row.author.nickname}}</span><br/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="300px">
        <template slot-scope="scope">
          <el-button v-if="scope.row.is_verified == 0" type="success" size="mini" @click="handleVerified(scope.row)">审核</el-button>
          <el-button type="primary" size="mini" @click="handleUpdateSpeech(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="handleeditSpeechTag(scope.row)">标签设置</el-button>
          <el-button type="danger" size="mini" v-if="$store.state.user.roles === 'supportManager'||$store.state.user.roles === 'administrator'" @click="handledeleteSpeech(scope.row)"><i class="el-icon-delete"></i></el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="60%">
        <el-form :rules="speechRules" ref="DataForm" :model="tempSpeech" label-position="left" label-width="100px" style='margin-left:5%;'>
          <el-form-item label="话术问题" prop="title">
            <el-input v-model="tempSpeech.title"></el-input>
          </el-form-item>
          <el-form-item label="回复内容" prop="content">
            <div class="content" v-for="(item, index) in tempSpeech.content">
              <el-input type="textarea" style="margin-bottom: 10px;display: inline-block;max-height: 100px" :autosize="{ minRows: 4, maxRows: 80}" placeholder="请输入内容" v-model="tempSpeech.content[index]">
              </el-input>
              <span style="text-align: center;width: 8%;display: inline-block;">
                <i class="el-icon-remove" @click="tempSpeech.content.splice(index, 1)"></i>
              </span>
            </div>
          </el-form-item>
          <div style="text-align:right;padding-right:20px;">
            <el-button @click="addSpeech" type="primary">新增回复条目</el-button>
          </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button v-if="dialogStatus === 'create'" type="primary" @click="createSpeech">确 定</el-button>
          <el-button v-else type="primary" @click="updateData">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog class="dialog_tag" title="话术标签" :visible.sync="dialogFormVisibleTag" width="40%" >
        <el-tree :data="tagTree"
                 :props="defaultProps"
                 default-expand-all
                 ref="tree"
                 node-key="id"
                 check-strictly
                 show-checkbox
                 @node-click="">
        </el-tree>
        <div slot="footer">
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisibleTag = false">取 消</el-button>
            <el-button type="primary" @click="editSpeechTag">确 定</el-button>
          </div>
        </div>
      </el-dialog>

      <el-dialog :visible.sync="imageDialogVisible2" width="60%" class="previewDialog">
        <h1 style="text-align: center" v-html="previewdata.title"></h1>
        <p style="text-align: left;font-weight: 600;margin-bottom: 40px">
          <span >{{previewdata.author.nickname}}&nbsp&nbsp&nbsp{{previewdata.updated_at}}</span>
        </p>
        <div style="font-size: 16px;margin-top: 20px" v-html="previewdata.content"></div>
      </el-dialog>
    </div>
</template>

<script >
  import { getSpeechList, editSpeechTag, updateSpeech, createSpeech, switchPerfectSpeech, deleteSpeech, checkSpeech } from '@/api/speech'
  import { getTagTree } from '@/api/tag'
  import { getSupportGroupList } from '@/api/support_member'
  import { getUserAccountList } from '@/api/user'
  import { getSupportMemberList } from '@/api/support_member'
  export default {
    name: 'speech',
    data() {
      return {
        contentList: [
          {
            content: ''
          }
        ],
        userGroupOptions: [],
        speech: undefined,
        editorContent: '',
        tableKey: 0,
        previewdata: {
          author: {
            nickname: undefined
          },
          title: undefined,
          content: undefined
        },
        userGroupOptions:[],
        userGroupTree: [],
        supportUserAccountLoading: false,
        supportUserAccountOptions: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        total: undefined,
        listLoading: false,
        imageDialogVisible2: false,
        list: [],
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          is_perfect: undefined,
          title: undefined,
          support_user_account_grounp_id: undefined,
          support_user_account_id: undefined,
          tag_id: undefined
        },
        userAccountGroupOptions:[],
        userAccountGroupTree: [],
        defaultProps3: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        departmentOptions: [],
        departmentLoading: false,
        userAccountLoading: false,
        userAccountOptions: [],
        dialogStatus: '',
        dialogFormVisible: false,
        dialogFormVisibleTag: false,
        dialogFormVisibleUpdate2: false,
        textMap: {
          update: '编辑',
          create: '创建'
        },
        perfectOptions: [{ label: '是', key: 1 }, { label: '否', key: 0 }],
        filteroptions: [
          { id: 1, label: '强制' },
          { id: 0, label: '非强制' }
        ],
        filteroptions2: [
          { id: 1, label: '过审' },
          { id: 0, label: '未通过' }
        ],
        speechRules: {
          title: [{ required: true, message: '填写标题', trigger: 'change' }]
        },
        tagTree: undefined,
        tagTree2: undefined,
        tempSpeechTag: {
          speech_id: undefined,
          tag_ids: []
        },
        tempUpdate: {
          speech_id: undefined,
          title: undefined,
          content: undefined
        },
        tempUpdateId: undefined,
        tempSpeech: {
          title: undefined,
          content: ['']
        },
        temptagarray: [],
        temptagarray2: [],
        defaultProps: {
          children: 'child',
          label: 'tag_name'
        }
      }
    },
    created() {
      this.getList()
      this.getTagTree()
      this.getUserGroupTree()
    },
    methods: {
      getSupportUserAccountList(query) {
        if (query !== '') {
          this.supportUserAccountLoading = true
          getSupportMemberList({ nickname: query, status: 1 }).then(response => {
            this.supportUserAccountOptions = response.data.data
            this.supportUserAccountLoading = false
          })
        }
      },
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
      addSpeech() {
        this.tempSpeech.content.push('')
      },
      getUserAccountList(query) {
        if (query !== '') {
          this.userAccountLoading = true
          getUserAccountList({ user_account_type_code: process.env.API_TYPE_CODE, nickname: query }).then(response => {
            this.userAccountOptions = response.data.data
            this.userAccountLoading = false
          })
        }
      },
      handlPreview(row) {
        this.imageDialogVisible2 = true
        this.previewdata = row
      },
      getList() {
        this.listLoading = true
        getSpeechList(this.listQuery).then(res => {
          this.list = res.data.data
          this.total = res.data.total
          this.listLoading = false
        })
      },
      handleeditSpeechTag(row) {
        const tagArray = []
        for (const v in row.tag) {
          tagArray.push(row.tag[v].id)
        }
        this.tempSpeechTag.speech_id = row.id
        this.dialogFormVisibleTag = true
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(tagArray)
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
      switchPerfectSpeech(row, data) {
        switchPerfectSpeech({
          speech_id: row.id,
          is_perfect: data
        }).then(res => {
          row.is_perfect = data
        })
      },
      handledeleteSpeech(row) {
        this.$confirm('此操作将永久删除该话术, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteSpeech({ speech_id: row.id }).then(response => {
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
        this.dialogStatus = 'create'
        this.tempSpeech.title = undefined
        this.tempSpeech.content = ['']
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['DataForm'].clearValidate()
        })
      },
      createSpeech() {
        this.$refs['DataForm'].validate((valid) => {
          if (valid) {
            createSpeech(this.tempSpeech).then(() => {
              this.getList()
              this.dialogFormVisible = false
            })
          }
        })
      },
      handleUpdateSpeech(row) {
        this.dialogStatus = 'update'
        this.tempUpdateId = row.id
        this.tempSpeech = JSON.parse(JSON.stringify(row))
        this.dialogFormVisible = true
      },
      handleVerified(row) {
        this.$confirm('审核通过?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          checkSpeech({ speech_id: row.id, is_verified: 1 }).then(response => {
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
      getTagTree() {
        getTagTree({ tag_type_code: 'speech', is_customized: 0, sort: '+id' }).then(res => {
          this.tagTree = res.data
        })
      },
      editSpeechTag() {
        this.temptagarray = this.$refs.tree.getCheckedKeys()
        this.tempSpeechTag.tag_ids = []
        if (this.temptagarray.length > 0) {
          this.tempSpeechTag.tag_ids.push(...this.temptagarray)
        }
        editSpeechTag(this.tempSpeechTag).then(res => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.dialogFormVisibleTag = false
          this.getList()
        })
      },
      updateData() {
        this.$refs['DataForm'].validate((valid) => {
          if (valid) {
            const parm = Object.assign({ speech_id: this.tempUpdateId}, this.tempSpeech)
            updateSpeech(parm).then(() => {
              this.getList()
              this.$notify({
                title: '成功',
                message: '编辑成功',
                type: 'success',
                duration: 2000
              })
              this.dialogFormVisible = false
            })
          }
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .content {
    height: 100px;
    line-height: 100px;
    /deep/ .el-textarea__inner {
      background: #9df3478f;
    }
    i {
      color: red;
      font-size: 20px;
      cursor: pointer;
    }
  }
  .el-textarea {
    width: 90%;
    /deep/ textarea {
      max-height: 96px;
    }
  }
  .el-tag {
    padding: 0 4px;
    font-size: 14px;
    line-height: 26px;
    height: 26px;
  }
  .el-tree >>> .el-tree-node{
    margin: 8px 0;
  }
  .el-tree >>> .el-tree-node__expand-icon{
    font-size: 16px;
  }
  .el-tree >>> .el-tree-node__label{
    font-size: 16px;
  }
  .dialog_tag >>> .el-dialog__body{
    padding-top: 0;
  }
</style>
