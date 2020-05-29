<template>
  <div class="app-container calendar-list-container">
    <sticky :sticky-top="74">
      <div class="filter-container">
      <div class="filter-item">
        <div class="filter-label">素材库</div>
        <el-select
          @change='getCopywriteMediaBankCategoryTree'
          style="width:150px;"
          size="small"
          @focus="queryCopywriteMediaBankList(' ')"
          v-model="listQuery.media_bank_id"
          filterable
          clearable
          remote
          placeholder="请选择"
          :remote-method="queryCopywriteMediaBankList"
          :loading="filterMediaBankLoading">
          <el-option
            v-for="item in filterMediaBankOptions"
            :key="item.id"
            :label="item.media_bank_name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">品牌</div>
        <el-select
          @change='getCopywriteMediaBankCategoryTree'
          style="width:150px;"
          size="small"
          @focus="queryBrandList(' ')"
          v-model="listQuery.brand_id"
          filterable
          clearable
          remote
          placeholder="请选择"
          :remote-method="queryBrandList"
          :loading="filterBrandLoading">
          <el-option
            v-for="item in filterBrandOptions"
            :key="item.id"
            :label="item.brand_name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="filter-item">
        <div class="filter-label">分类</div>
        <el-cascader
          placeholder="选择"
          size="small"
          style="width: 250px"
          clearable
          :options="mediaBankCategoryOptions"
          change-on-select
          :props="defaultPropsCategory"
          v-model="mediaBankCategoryTree"
          @change="handleFilterCategory">
        </el-cascader>
      </div>
      <div class="filter-float">
        <el-button class="filter-item" type="primary" size="small" v-waves icon="el-icon-search" @click="refreshList">搜索</el-button>
      </div>
    </div>
    </sticky>
    <div>
      <ul class="ul-column">
        <li v-for="(item, index) in flueList0" :key="item">
          <img v-if="item.media_type === 1"
               :id="'viewerPreview' + item.id"
               :src="item.media_url" class="image"/>
          <video v-if="item.media_type === 2" style="cursor: pointer;" @click="handlePictureCardPreview_video2(item.media_url)">
            <source :src="item.media_url" type="video/mp4">
          </video>
        </li>
      </ul>
      <ul class="ul-column">
        <li v-for="(item, index) in flueList1" :key="item">
          <img v-if="item.media_type === 1"
               :id="'viewerPreview' + item.id"
               :src="item.media_url" class="image"/>
          <video v-if="item.media_type === 2" style="cursor: pointer;" @click="handlePictureCardPreview_video2(item.media_url)">
            <source :src="item.media_url" type="video/mp4">
          </video>
        </li>
      </ul>
      <ul class="ul-column">
        <li v-for="(item, index) in flueList2" :key="item">
          <img v-if="item.media_type === 1"
               :id="'viewerPreview' + item.id"
               :src="item.media_url" class="image"/>
          <video v-if="item.media_type === 2" style="cursor: pointer;" @click="handlePictureCardPreview_video2(item.media_url)">
            <source :src="item.media_url" type="video/mp4">
          </video>
        </li>
      </ul>
      <ul class="ul-column">
        <li v-for="(item, index) in flueList3" :key="item">
          <img v-if="item.media_type === 1"
               :id="'viewerPreview' + item.id"
               :src="item.media_url" class="image"/>
          <video v-if="item.media_type === 2" style="cursor: pointer;" @click="handlePictureCardPreview_video2(item.media_url)">
            <source :src="item.media_url" type="video/mp4">
          </video>
        </li>
      </ul>
      <ul class="ul-column">
        <li v-for="(item, index) in flueList4" :key="item">
          <img v-if="item.media_type === 1"
               :id="'viewerPreview' + item.id"
               :src="item.media_url" class="image"/>
          <video v-if="item.media_type === 2" style="cursor: pointer;" @click="handlePictureCardPreview_video2(item.media_url)">
            <source :src="item.media_url" type="video/mp4">
          </video>
        </li>
      </ul>
    </div>
    <el-dialog title="预览视频" :visible.sync="dialogFormVisiblePreview" width="40%">
      <video v-if="dialogFormVisiblePreview" width="100%" height="360" autoplay controls="controls">
        <source :src="publicVideoUrl" type="video/mp4">
      </video>
    </el-dialog>
  </div>
</template>

<script>
  import { getBrandList, getCopywriteMediaBankItemsInfo, getCopywriteMediaBankList, updateCopywriteMediaBankItems, deleteCopywriteMediaBankItemsBatch, getCopywriteMediaBankCategoryTree, getCopywriteMediaBankItemsList, deleteCopywriteMediaBankItems, createCopywriteMediaBankItems } from '@/api/media_bank'
  import waves from '@/directive/waves' // 水波纹指令
  import Viewer from 'viewerjs'
  import 'viewerjs/dist/viewer.css'
  import Sticky from '@/components/Sticky'

  export default {
    name: 'mediaBankItemsList',
    components: {
      Sticky
    },
    directives: {
      waves
    },
    data() {
      return {
        percentage: 0,
        viewer: null,
        scrollTop: 0,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          page_size: 20,
          brand_id: undefined,
          media_bank_id: undefined,
          media_bank_category_id: undefined,
          sort: '-id'
        },
        publicVideoUrl: undefined,
        dialogFormVisiblePreview: false,
        dialogFormVisibleProgress: false,
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showAuditor: false,
        temp: {
          brand_id: undefined,
          media_bank_id: undefined,
          media_bank_category_id: undefined,
          selectTree: [],
          video_url: undefined,
          image_array: [],
          media_type: 1,
        },
        tempUpdate: {
          media_bank_items_id: undefined,
          media_bank_category_id: undefined,
          selectTree: []
        },
        dialogFormVisible: false,
        dialogFormVisible2: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        rules: {
          selectTree: [{ type: 'array', required: true, message: '请选择分类', trigger: 'change' }]
        },
        rules2: {
          selectTree: [{ type: 'array', required: true, message: '请选择分类', trigger: 'change' }]
        },
        filterMediaBankLoading: false,
        filterMediaBankOptions: [],
        filterBrandLoading: false,
        filterBrandOptions: [],
        mediaBankCategoryTree: [],
        mediaBankCategoryTree2: [],
        defaultPropsCategory: {
          children: 'child',
          label: 'category_name',
          value: 'id'
        },
        mediaBankCategoryOptions: [],
        mediaBankCategoryOptions2: [],
        baseUrl: process.env.BASE_API + '/api/document/uploadImage',
        baseUrl2: process.env.BASE_API + '/api/document/uploadVideo',
        fileList: [],
        fileList2: [],
        selectTable:[],
        flueList0: [],
        flueList1: [],
        flueList2: [],
        flueList3: [],
        flueList4: [],
        flueList5: [],
        flueListHeight0: 0,
        flueListHeight1: 0,
        flueListHeight2: 0,
        flueListHeight3: 0,
        flueListHeight4: 0,
        flueListHeight5: 0
      }
    },
    computed:{
      disabledCategory() {
        let disabled = false
        if (this.listQuery.media_bank_id == undefined || this.listQuery.media_bank_id == '' || this.listQuery.media_bank_id == null) {
          disabled = true
        }
        if (this.listQuery.brand_id == undefined || this.listQuery.brand_id == '' || this.listQuery.brand_id == null) {
          disabled = true
        }
        return disabled
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'info',
          deleted: 'danger'
        }
        return statusMap[status]
      }
    },
    created() {
      // this.getList()
      this.initScroll()
    },
    methods: {
      initScroll() {
        window.onscroll = () => {
          if (document.documentElement.scrollTop + window.innerHeight === document.body.scrollHeight) {
            this.getMore()
          }
          // console.log(document.documentElement.scrollTop)
          // console.log(window.innerHeight)
          // console.log(document.body.scrollHeight)
        }
      },
      handleCreateCategory(val) {
        this.temp.media_bank_category_id = val[val.length - 1]
      },
      handleUpdateCategory(val) {
        this.tempUpdate.media_bank_category_id = val[val.length - 1]
      },
      handleFilterCategory(val) {
        this.listQuery.media_bank_category_id = val[val.length - 1]
      },
      handleRemove(file, fileList) {
        this.temp.image_array = fileList.map(item => {
          return item.response.data.url
        })
      },
      handlePictureSuccess(response, file, fileList) {
        this.temp.image_array = fileList.map(item => {
          return {
            url: item.response.data.url,
            width: item.response.data.width,
            height: item.response.data.height
          }
        })
      },
      changeTable(selection) {
        this.selectTable = selection.map(item => {
          return item.id
        })
      },
      handlelimit(files, fileList) {
        this.$message.error('最多上传1张图片')
      },
      beforeImgUpload(file) {
        const isLt5M = file.size / 1024 / 1024 < 5
        if (['image/png', 'image/jpeg'].indexOf(file.type) === -1) {
          this.$message.error('请上传正确的图片格式')
          return false
        }
        if (!isLt5M) {
          this.$message.error('上传图片大小不能超过5MB')
          return false
        }
      },
      getCopywriteMediaBankCategoryTree() {
        if (this.listQuery.brand_id !== undefined && this.listQuery.brand_id && this.listQuery.media_bank_id !== undefined && this.listQuery.media_bank_id) {
          const queryData = {}
          queryData.brand_id = this.listQuery.brand_id
          queryData.media_bank_id = this.listQuery.media_bank_id
          getCopywriteMediaBankCategoryTree(queryData).then(response => {
            if (response.data) {
              this.mediaBankCategoryOptions = this.formatUserGroupTree(response.data)
            }
          })
        }
      },
      handlePictureCardPreview_video(file) {
        this.publicVideoUrl = file.url
        this.dialogFormVisiblePreview = true
      },
      handlePictureCardPreview_video2(url) {
        this.publicVideoUrl = url
        this.dialogFormVisiblePreview = true
      },
      handleRemove_video(file, fileList) {
        this.temp.video_url = undefined
      },
      beforeVideoUpload(file) {
        const isLt10M = file.size / 1024 / 1024 < 20
        if (['video/mp4'].indexOf(file.type) === -1) {
          this.$message.error('上传正确的视频格式')
          return false
        }
        if (!isLt10M) {
          this.$message.error('上传视频大小不能超过20MB')
          return false
        }
      },
      handlePictureSuccess_video(response, file, fileList) {
        this.temp.video_url = fileList[0].response.data.url
      },
      handleExceed() {
        this.$message.warning(`限制上传1个视频`)
      },
      getCopywriteMediaBankCategoryTree2() {
        if (this.temp.brand_id !== undefined && this.temp.media_bank_id !== undefined && this.temp.brand_id !== '' && this.temp.media_bank_id !== '' ) {
          const queryData = {}
          queryData.brand_id = this.temp.brand_id
          queryData.media_bank_id = this.temp.media_bank_id
          getCopywriteMediaBankCategoryTree(queryData).then(response => {
            if (response.data) {
              this.mediaBankCategoryOptions2 = this.formatUserGroupTree(response.data)
            }
          })
        }
      },
      getCopywriteMediaBankCategoryTree3() {
        const queryData = {
          brand_id: 1,
          media_bank_id: this.tempUpdate.media_bank_id
        }
        getCopywriteMediaBankCategoryTree(queryData).then(response => {
          if (response.data) {
            this.mediaBankCategoryOptions2 = this.formatUserGroupTree(response.data)
          }
        })
        getCopywriteMediaBankItemsInfo({
          bank_items_id: this.tempUpdate.media_bank_items_id
        }).then(res => {
          this.tempUpdate.selectTree = res.data.category_ids.split(',').reverse().map(item => parseInt(item))
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
      queryCopywriteMediaBankList(query) {
        this.filterMediaBankLoading = true
        getCopywriteMediaBankList({ channel_name: query }).then(response => {
          this.filterMediaBankLoading = false
          if (!response.data.data) return
          this.filterMediaBankOptions = response.data.data.map(v => ({
            id: v.id,
            media_bank_name: v.media_bank_name
          }))
        })
      },
      queryBrandList(query) {
        this.filterBrandLoading = true
        getBrandList({ brand_name: query }).then(response => {
          this.filterBrandLoading = false
          if (!response.data) return
          this.filterBrandOptions = response.data.map(v => ({
            id: v.id,
            brand_name: v.brand_name
          }))
        })
      },
      handleMoreList() {
        for (const v of this.list) {
          if (v.media_type === 1) {
            const img = new Image()
            img.src = v.media_url
            img.width = 100
            img.onload = () => {
              let flueCase = 0
              let minHeight = this.flueListHeight0
              if (this.flueListHeight1 < minHeight) {
                minHeight = this.flueListHeight1
                flueCase = 1
              }
              if (this.flueListHeight2 < minHeight) {
                minHeight = this.flueListHeight2
                flueCase = 2
              }
              if (this.flueListHeight3 < minHeight) {
                minHeight = this.flueListHeight3
                flueCase = 3
              }
              if (this.flueListHeight4 < minHeight) {
                minHeight = this.flueListHeight4
                flueCase = 4
              }

              switch (flueCase) {
                case 0:
                  this.flueListHeight0 += img.height
                  this.flueList0.push(v)
                  break
                case 1:
                  this.flueListHeight1 += img.height
                  this.flueList1.push(v)
                  break
                case 2:
                  this.flueListHeight2 += img.height
                  this.flueList2.push(v)
                  break
                case 3:
                  this.flueListHeight3 += img.height
                  this.flueList3.push(v)
                  break
                case 4:
                  this.flueListHeight4 += img.height
                  this.flueList4.push(v)
                  break
              }
            }
          }
        }
        this.$nextTick(() => {
          this.list.forEach(item => {
            if (item.media_type === 1) {
              item.viewer = new Viewer(document.getElementById('viewerPreview' + item.id), {
                'transition': false
              })
            }
          })
        })
      },
      getMore() {
        this.listLoading = true
        this.listQuery.page += 1
        getCopywriteMediaBankItemsList(this.listQuery).then(response => {
          this.list = response.data.data
          this.listLoading = false
          this.handleMoreList()
        })
      },
      refreshList() {
        this.flueList0 = []
        this.flueList1 = []
        this.flueList2 = []
        this.flueList3 = []
        this.flueList4 = []
        this.flueList5 = []
        this.flueListHeight0 = 0
        this.flueListHeight1 = 0
        this.flueListHeight2 = 0
        this.flueListHeight3 = 0
        this.flueListHeight4 = 0
        this.flueListHeight5 = 0
        this.getList()
      },
      getList() {
        this.listLoading = true
        if (this.listQuery.media_bank_id === undefined) {
          this.$message({
            type: 'info',
            message: '请先选择素材库'
          })
          return
        }
        getCopywriteMediaBankItemsList(this.listQuery).then(response => {
          this.list = response.data.data
          this.tableKey++
          this.total = response.data.total
          this.handleMoreList()
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
          brand_id: undefined,
          media_bank_id: undefined,
          media_bank_category_id: undefined,
          selectTree: [],
          media_url: undefined,
          media_type: 1,
          image_array: [],
          video_url: undefined
        }
        this.tempUpdate = {
          media_bank_items_id: undefined,
          media_bank_category_id: undefined,
          selectTree: []
        },
        this.mediaBankCategoryOptions2 = []
        this.fileList = []
        this.fileList2 = []
      },
      handleCreate() {
        this.resetTemp()
        this.mediaBankCategoryTree2 = []
        this.fileList = []
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            createCopywriteMediaBankItems(this.temp).then(response => {
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
        this.dialogFormVisible2 = true
        this.tempUpdate.media_bank_items_id = row.id
        this.tempUpdate.media_bank_id = row.media_bank_id
        this.getCopywriteMediaBankCategoryTree3()
        this.$nextTick(() => {
          this.$refs['dataForm2'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm2'].validate((valid) => {
          if (valid) {
            updateCopywriteMediaBankItems(this.tempUpdate).then(() => {
              this.getList()
              this.dialogFormVisible2 = false
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
      handleAllDelete() {
        let loading = null
        this.$confirm('批量永久删除选中素材, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          loading = this.$loading({
            lock: true,
            text: `0/${this.selectTable.length}`,
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
          for (let i of this.selectTable) {
            const index = this.selectTable.indexOf(i) + 1
            await deleteCopywriteMediaBankItems({media_bank_items_id: i }).then(res => {
              loading.text = index + '/' + this.selectTable.length
              console.log(res, this.percentage)
            }).catch(rej => {
              loading.text = index + '/' + this.selectTable.length
              console.log(rej, this.percentage)
            })
          }
        }).then(() => {
          console.log('全部完成')
          loading.close();
          this.getList()
          this.selectTable = []
        }).catch(() => {
          console.log('点击取消')
        })
        //  旧批量删除逻辑
        // this.$confirm('批量永久删除选中素材, 是否继续?', '提示', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning'
        // }).then(() => {
        //   deleteCopywriteMediaBankItemsBatch({
        //     media_bank_items_ids: this.selectTable
        //   }).then(() => {
        //     this.$notify({
        //       title: '成功',
        //       message: '批量删除成功',
        //       type: 'success',
        //       duration: 2000
        //     })
        //     this.selectTable = []
        //     this.getList()
        //   })
        // }).catch(() => {
        //   this.$message({
        //     type: 'info',
        //     message: '已取消删除'
        //   })
        // })
      },
      handleDelete(row) {
        this.$confirm('此操作将永久删除该素材, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCopywriteMediaBankItems({
            media_bank_items_id: row.id
          }).then(() => {
            this.$notify({
              title: '成功',
              message: '批量删除成功',
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
  .time {
    font-size: 13px;
    color: #999;
  }

  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
    margin-bottom:20px;
    -webkit-box-shadow: 1px 1px 8px #999;
    -moz-box-shadow: 1px 1px 8px #999;
    box-shadow: 1px 1px 8px #999;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
  .ul-column {
    width:20%;
    float: left;
    list-style: none;
    display:block;
    margin: 0;
    padding: 10px;
  }
</style>
