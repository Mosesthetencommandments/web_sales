<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.date_range"
        class="filter-item"
        type="daterange"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        align="right"
        unlink-panels
        range-separator="~"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions2"
        @change="handleFilter"
      >
      </el-date-picker>
      <el-select
        class="filter-item"
        style="width:200px;"
        @change='handleFilter'
        v-model="listQuery.user_account_id"
        filterable
        clearable
        remote
        placeholder="请选择操作人"
        :remote-method="getuserAccountList"
        :loading="userAccountLoading">
        <el-option
          v-for="item in userAccountOptions"
          :key="item.id"
          :label="item.nickname"
          :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.user_account_type_id" placeholder="用户类型">
        <el-option v-for="item in userTypeOptions" :key="item.id" :label="item.type_name" :value="item.id">
        </el-option>
      </el-select>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="具体操作" v-model="listQuery.action">
      </el-input>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="参数" v-model="listQuery.params">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>
    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作人" min-width="100px">
        <template slot-scope="scope">
          <span>{{scope.row.user_account.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="具体操作" min-width="200px">
        <template slot-scope="scope">
          <span>{{scope.row.action}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="参数" min-width="150px">
        <template slot-scope="scope">
          <span>{{scope.row.params}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="时间" min-width="120px">
        <template slot-scope="scope">
          <span>{{scope.row.created_at}}</span>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import { getLogsList } from '@/api/system'
  import { getUserAccountList } from '@/api/user'
  import { getUserAccountTypeList } from '@/api/user_role'
  import waves from '@/directive/waves'
  // 水波纹指令

  export default {
    components: { },
    name: 'logOperation',
    directives: {
      waves
    },
    data() {
      return {
        scrollTop: 0,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          user_account_id: undefined,
          user_account_group_id: undefined,
          action: '',
          params: '',
          date_range: undefined
        },
        userAccountLoading: false,
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        userTypeOptions: [],
        userAccountOptions: [],
        showAuditor: false,
        temp: {
          id: undefined,
          nickname: '',
          user: {
            id: '',
            phone: ''
          },
          user_account_type: {
            id: undefined,
            type_name: ''
          },
          user_account_group: {
            id: undefined,
            group_name: ''
          },
          user_account_role: {
            id: undefined,
            role_name: ''
          }
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

        innerList1: null,
        innerTotal1: null,
        innerTableKey1: 1,
        innerTableTitle1: '',
        innerListQuery1: {
          page: 1,
          page_size: 5,
          domain_id: undefined,
          sort: '-id'
        },
        innerTemp1: {
          id: undefined,
          password: '',
          phone: ''
        },
        innerListLoading1: false,
        innerTableVisible1: false,
        innerDialogFormVisible1: false,
        innerRules1: {
          name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
        },
        colSpanRegular: [],
        countNumber: [],
        countIndex: [],
        typeOptions: [],
        typeDisable: false,
        groupOptions: [],
        roleOptions: [],
        inputDisable: false,
        typeBackground: 'danger',
        roleBackground: 'info',
        groupBackground: 'info',
        phoneDisabled: true,
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
        }
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
          2: '已删除'
        }
        return statusTransMap[status]
      }
    },
    created() {
      this.getList()
      this.getuserAccountList(' ')
      this.getUserTypeList()
    },
    methods: {
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      getList() {
        this.listLoading = true
        getLogsList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
      },
      getuserAccountList(query) {
        if (query !== '') {
          this.userAccountLoading = true
          getUserAccountList({ nickname: query, status: 1 }).then(response => {
            this.userAccountOptions = response.data.data
            this.userAccountLoading = false
          })
        }
      },
      getUserTypeList() {
        getUserAccountTypeList({}).then(response => {
          if (response.data.data) {
            this.userTypeOptions = response.data.data
          }
        })
      },
      handleSizeChange(val) {
        this.listQuery.page_size = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
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
