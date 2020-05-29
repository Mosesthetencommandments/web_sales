<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" @change="handleFilter" style="width: 300px;" clearable class="filter-item" placeholder="活动名称" v-model="listQuery.activity_name">
      </el-input>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加活动</el-button>
    </div>
    <el-table :stripe="true"
              :data="list"
              v-loading="listLoading"
              element-loading-text="给我一点时间"
              border
              fit
              :key='tableKey'
              highlight-current-row
              style="width: 100%">
      <el-table-column align="center" label="序号" width="60">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="70px" align="center" label="活动名称">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.activity_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="日期">
        <template slot-scope="scope">
          <span style="font-size: 16px;font-weight: 600">{{scope.row.start_at}} ~ {{scope.row.terminal_at}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column width="180px" align="center" label="更新时间">-->
        <!--<template slot-scope="scope">-->
          <!--<span >{{scope.row.updated_at}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column align="center" label="操作" width="250" class-name="small-padding">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleInnerSizeChange1" @current-change="handleInnerCurrentChange1" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,50,100]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog
      :title="dialogTitle[dialogStatus]"
      :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="innerDataForm1" :model="temp" label-position="left" label-width="100px" style='width: 90%; margin-left:5%;'>
        <el-form-item label="活动名称" prop="activity_name">
          <el-input v-model="temp.activity_name"></el-input>
        </el-form-item>
        <el-form-item label="活动日期" prop="date_range">
          <el-date-picker
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            v-model="temp.date_range"
            type="daterange"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" v-if="dialogStatus === 'create'"  @click="createAuth">创 建</el-button>
        <el-button type="primary" v-if="dialogStatus === 'update'"  @click="updateAuth">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { getSystemActivityList, deleteSystemActivity, updateSystemActivity, createSystemActivity } from '@/api/system'
  export default {
    name: 'PortSetting',
    data() {
      return {
        list: [],
        data: [],
        total: null,
        menuArry: [],
        listLoading: false,
        dialogFormVisible: false,
        tableKey: 0,
        dialogStatus: '',
        dialogTitle: {
          update: '编辑',
          create: '创建'
        },
        defaultProps: {
          children: 'children',
          label: 'menu_name'
        },
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          activity_name: undefined
        },
        temp: {
          activity_name: undefined,
          date_range: []
        },
        tempData: {
          user_account_auth_id: undefined,
          menu_list: []
        },
        rules: {
          activity_name: [{ required: true, message: '活动名称', trigger: 'change' }],
          date_range: [{ required: true, message: '活动日期', trigger: 'change' }]
        },
        updataData: undefined
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        getSystemActivityList(this.listQuery).then(response => {
          this.list = response.data.data.map(item => {
            item.date_range = [item.start_at, item.terminal_at]
            return item
          })
          this.total = response.data.total
          this.listLoading = false
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleInnerSizeChange1(val) {
        this.listQuery.page_size = val
        this.getList()
      },
      handleInnerCurrentChange1(val) {
        this.listQuery.page = val
        this.getList()
      },
      resetTemp() {
        this.temp = {
          activity_name: undefined,
          date_range: []
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      createAuth() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            createSystemActivity(this.temp).then(respone => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(row) {
        this.temp.system_activity_id = row.id
        this.temp.activity_name = row.activity_name
        this.temp.date_range = row.date_range
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['innerDataForm1'].clearValidate()
        })
      },
      updateAuth() {
        this.$refs['innerDataForm1'].validate((valid) => {
          if (valid) {
            updateSystemActivity(this.temp).then(response => {
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
      },
      handleDelete(row) {
        this.$confirm('此操作将永久删除该接口, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteSystemActivity({ system_activity_id: row.id }).then(response => {
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
    }
  }
</script>
