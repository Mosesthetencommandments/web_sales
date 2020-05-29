<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="用户名" v-model="listQuery.nickname">
      </el-input>
      <!--<el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="用户名" v-model="listQuery.nickname">-->
      <!--</el-input>-->
      <el-select @change='handleFilter' style="width: 120px" class="filter-item" v-model="listQuery.sort" placeholder="排序">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
      <!--<el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加</el-button>-->
    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名" min-width="100px">
        <template slot-scope="scope">
          <span>{{scope.row.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="460" >
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="editCopywriteAuth(scope.row)">负责部门产品</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30,50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="clerkName + ' - 负责部门'" :visible.sync="dialogAuth" width="40%" >
      <el-form ref="innerDataForm1" :model="temp" label-position="left" label-width="130px" style='width: 90%; margin-left:5%;'>
        <template v-for="item in temp.support_department_product">
          <el-form-item :label="item.group_name">
            <el-select v-model="item.product_id"
                       multiple
                       style="width: 100%">
              <el-option v-for="item2 in productOptions"
                         v-if="productOptions.length > 0"
                         :label="item2.product_name"
                          :key="item2.id"
                          :value="item2.id">
              </el-option>
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <div  slot="footer" class="dialog-footer">
        <el-button @click="dialogAuth = false">取 消</el-button>
        <el-button type="primary" @click="editDate">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import waves from '@/directive/waves'
  import ElFormItem from 'element-ui/packages/form/src/form-item' // 水波纹指令
  import { editCopywriteMemberManageDepartmentProduct, getCopywriteMemberManageDepartmentProduct } from '@/api/copywrite'
  import { getProductList } from '@/api/product'
  import { getUserAccountList } from '@/api/user'
  import { getUserAccountGroupTree } from '@/api/user_group'

  export default {
    components: { ElFormItem },
    name: 'copywriterManagement',
    directives: {
      waves
    },
    data() {
      return {
        tempData: {
          user_account_id: undefined,
          permission_list: []
        },
        active: '',
        roleArry: [],
        accountArry: [],
        disabledCheck: [],
        checkedList: [],
        checkedList2: [],
        checkList: [],
        checkedId: [],
        authList: [],
        accountAuthList: [],
        tempAuthData: {
          user_account_id: undefined
        },
        productOptions: [],
        dialogAuth: false,
        isdisable: false,
        importanceOptions: [1, 2, 3],
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showAuditor: false,
        temp: {
          copywrite_user_account_id: undefined,
          support_department_product: []
        },
        dialogFormVisible: false,
        dialogStatus: '',
        rules: {
          user: {
            phone: [{ required: true, message: '请正确填写账号', trigger: 'change' }]
          },
          nickname: [{ required: true, message: '请正确填写用户名', trigger: 'change' }],
          user_account_type: {
            id: [{ required: true, message: '请选择', trigger: 'change' }]
          },
          user_account_role: {
            id: [{ required: true, message: '选择权限', trigger: 'change' }]
          }
        },
        textMap: {
          update: '编辑',
          create: '创建'
        },
        PermissionByMenuList: [],
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
        departOptions: [],
        getDepartLoading: false,
        roleOptions: [],
        inputDisable: false,
        typeBackground: 'danger',
        roleBackground: 'info',
        groupBackground: 'info',
        phoneDisabled: true,
        clerkName: undefined,
        scrollTop: 0,
        tableKey: 0,
        list: [],
        data: [],
        menudata: undefined,
        total: null,
        userAccountGroupOptions: [],
        listLoading: true,
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          nickname: undefined,
          user_account_type_code: 'clerk'
        },
        defaultProps: {
          children: 'children',
          label: (data, node) => {
            return data.group_name ? data.group_name : data.department_name
          }
        },
        groupIds: []
      }
    },
    watch: {
      dialogAuth(val) {
        if (val === false) {
          this.temp.support_department_product.forEach(item => {
            item.product_id = []
          })
        }
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: 'warning',
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
      this.getProductList()
      this.getUserAccountGroupTree()
    },
    methods: {
      getUserAccountGroupTree() {
        getUserAccountGroupTree({ type_code: "support", pid: 0, sort: '+id'}).then(res=> {
          this.temp.support_department_product = res.data.map(item => {
            return Object.assign(item,{product_id: []})
          })
          this.temp.support_department_product = this.temp.support_department_product.reverse()
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
      getList() {
        this.listLoading = true
        getUserAccountList(this.listQuery).then(res => {
          this.list = res.data.data
          this.total = res.data.total
          this.listLoading = false
        })
      },
      getProductList() {
        getProductList({ is_promote: 1 }).then(res => {
          this.productOptions = res.data
        })
      },
      editCopywriteAuth(row) {
        this.groupIds = []
        this.temp.copywrite_user_account_id = row.id
        getCopywriteMemberManageDepartmentProduct({ copywrite_user_account_id: row.id }).then(res => {
          res.data.forEach(item => {
            const index = this.temp.support_department_product.findIndex(item2 => {
              return item2.id === item.support_user_account_department_id
            })
            if (index >= 0 ) {
              this.temp.support_department_product[index].product_id.push(item.product_id)
            }
          })
        })
        this.clerkName = row.nickname
        this.dialogAuth = true
      },
      editDate() {
        const parm = []
        this.temp.support_department_product.forEach(item => {
          if (item.product_id.length > 0) {
            item.product_id.forEach(item2 => {
              parm.push({
                product_id: item2,
                support_department_id: item.id
              })
            })
          }
        })
        editCopywriteMemberManageDepartmentProduct({
          copywrite_user_account_id: this.temp.copywrite_user_account_id,
          support_department_product: parm
        }).then(() => {
          this.getList()
          this.dialogAuth = false
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
<style>
</style>
