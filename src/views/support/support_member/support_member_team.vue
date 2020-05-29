<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <!--<el-select clearable @change='handleGroupFilter' style="width: 120px" class="filter-item" v-model="listQuery.user_account_group_id" placeholder="客服部门">-->
        <!--<el-option v-for="item in userGroupOptions" :key="item.group_name" :label="item.group_name" :value="item.id">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <el-select @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.sort" placeholder="排序">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加</el-button>
    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="300px" align="center" label="组名称">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.team_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="客服部">
        <template slot-scope="scope">
          <span class="link-type">
            {{scope.row.user_account_group.group_name}}
          </span>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="时间">
        <template slot-scope="scope">
          <span>{{scope.row.updated_at}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="所属部门" prop="user_account_group_id" :ifeditable="editable">
          <el-select  v-model="temp.user_account_group_id" placeholder="所属部门">
            <el-option v-for="item in userGroupOptions" :key="item.group_name" :label="item.group_name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组名称" prop="team_name">
          <el-input v-model="temp.team_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserAccountGroupList } from '@/api/user_group'
import { getUserAccountGroupTeamList, createUserAccountGroupTeam, updateUserAccountGroupTeam, deleteUserAccountGroupTeam } from '@/api/user_group_team'
import waves from '@/directive/waves' // 水波纹指令

export default {
  name: 'customerGroupManagement',
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
        user_account_group_id: undefined,
        user_account_type_id: 2,
        sort: '-id'
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showAuditor: false,
      temp: {
        id: undefined,
        team_name: '',
        user_account_group_id: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        domain_name: [{ required: true, message: '请正确填写域名名称', trigger: 'change' }]
      },
      userGroupOptions: [],
      editable: false
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'gray',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status]
    },
    statusTranslator(status) {
      const statusTransMap = {
        0: '冻结',
        1: '开启',
        2: '告警'
      }
      return statusTransMap[status]
    }
  },
  created() {
    this.getGroupList()
    this.getList()
  },
  methods: {
    getGroupList() {
      getUserAccountGroupList({ user_account_type_id: 2 }).then(response => {
        if (response.data.data) {
          this.userGroupOptions = response.data.data
        }
      })
    },
    getGroupTeamList() {
      const params = {}
      params.user_account_group_id = this.listQuery.user_account_group_id
      if (!params.user_account_group_id) {
        return
      }
      getUserAccountGroupTeamList(params).then(response => {
        if (response.data.data) {
          this.userGroupTeamOptions = response.data.data
        }
      })
    },
    getList() {
      this.listLoading = true
      getUserAccountGroupTeamList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleGroupFilter() {
      this.listQuery.user_account_group_team_id = undefined
      this.getList()
    },
    handleGroupTeamFilter() {
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
        domain_name: '',
        ip: '',
        copyright: '',
        info: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.editable = true
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUserAccountGroupTeam(this.temp).then(response => {
            this.temp = response.data
            this.list.unshift(this.temp)
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.editable = false
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.user_account_group_team_id = this.temp.id
          updateUserAccountGroupTeam(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
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
    handleDelete(row) {
      this.$confirm('此操作将永久删除该组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          user_account_group_team_id: row.id
        }
        deleteUserAccountGroupTeam(ttempData).then(response => {
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
  },
  activated() {
    window.scrollTo(0, this.scrollTop)
  }
}
</script>
