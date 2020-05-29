<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="推广人" v-model="listQuery.nickname">
      </el-input>
      <el-select @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.sort" placeholder="排序">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="用户组">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.user_account_group.group_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="推广人">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{scope.row.updated_at}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">渠道管理</el-button>
          <el-button type="success" size="mini" @click="handleUpdate(scope.row)">微信管理</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible">
      <el-transfer
        v-model="memberPromotionChannel"

        :titles="['所有渠道', '已选渠道']"
        :button-texts="['移 除', '添 加']"
        :format="{
          noChecked: '${total}',
          hasChecked: '${checked}/${total}'
        }"
        @change="handleChange"
        :data="allData">
      </el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">返 回</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getPromotionMemberList, getPromotionMemberPromotionChannelRelation, changePromotionMemberPromotionChannel } from '@/api/promotion_member'
import waves from '@/directive/waves' // 水波纹指令

export default {
  name: 'promotionMemberManage',
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
        nickname: undefined,
        status: 1,
        sort: '-id'
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showAuditor: false,
      temp: {
        id: undefined,
        user_account_id: undefined,
        user_account: {
          id: undefined,
          nickname: undefined
        }
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogTitle: '',
      rules: {
        channel_name: [{ required: true, message: '请正确填写渠道名称', trigger: 'change' }]
      },
      allData: [],
      memberPromotionChannel: []
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
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getPromotionMemberList(this.listQuery).then(response => {
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
        channel_name: ''
      }
    },
    handleUpdate(row) {
      this.allData = []
      this.memberPromotionChannel = []
      this.temp = Object.assign({}, row) // copy obj
      this.dialogTitle = this.temp.nickname + '--' + '渠道管理'
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      const tempdata = { promotion_member_id: this.temp.id }
      getPromotionMemberPromotionChannelRelation(tempdata).then(response => {
        const all = response.data.all
        const list = response.data.list
        for (const v of all) {
          this.allData.push({
            key: v.id,
            label: v.channel_name
          })
        }
        for (const v of list) {
          this.memberPromotionChannel.push(v.id)
        }
        this.listLoading = false
      })
    },
    handleChange(value, direction, movedKeys) {
      const tempdata = {
        promotion_member_id: this.temp.id,
        operation: direction,
        promotion_channel_ids: movedKeys
      }
      changePromotionMemberPromotionChannel(tempdata).then(response => {
        return
      })
      console.log(value, direction, movedKeys)
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
