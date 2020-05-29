<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-button class="filter-item" style="float:right;" @click="getList" type="primary">刷新</el-button>
    </div>

    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column
        align="center"
        type="index"
        width="50">
      </el-table-column>
      <el-table-column min-width="130px" align="center" label="告警类型">
        <template slot-scope="scope">
          <span style="color:red;">{{scope.row.promotion_warning_type.warning_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="推广人">
        <template slot-scope="scope">
          <span class="link-type" v-if="scope.row.promotion_product">{{scope.row.promotion_product.promotion_member.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="推广渠道">
        <template slot-scope="scope">
          <span class="link-type" v-if="scope.row.promotion_product">{{scope.row.promotion_product.promotion_channel.channel_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="产品">
        <template slot-scope="scope">
          <span class="link-type" v-if="scope.row.promotion_product">{{scope.row.promotion_product.product.product_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="链接">
        <template slot-scope="scope">
          <span class="link-type" v-if="scope.row.promotion_product"><a :href="'http://' + scope.row.promotion_product.url" target="_blank">{{scope.row.promotion_product.url}}</a></span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="80px" class-name="small-padding">
        <template slot-scope="scope">
          <el-button type="warning" size="mini" @click="handleOpenInner1(scope.row)">微信号列表</el-button>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="报警时间">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.created_at}}</span>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,50, 100]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="域名名称" prop="domain_prefix">
          <el-col :span="6">
            <el-input v-model="temp.domain_prefix"></el-input>
          </el-col>
          <el-col class="line" :span="1" style="text-align:center;">.</el-col>
          <el-col :span="17">
            <multiselect v-model="temp.domain" :options="domainOptions" @search-change="queryDomainList" placeholder="搜索域名" selectLabel="选择"
                         deselectLabel="删除" track-by="domain_name" :internalSearch="false" label="domain_name">
              <span slot='noResult'>无结果</span>
            </multiselect>
          </el-col>
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容" v-model="temp.info">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="innerTableTitle1" :visible.sync="innerTableVisible1" width="90%" >
      <div class="filter-container" align="right">
        <el-button align="right" class="filter-item" style="margin-left: 10px;" @click="handleInnerCreate1" type="primary" icon="el-icon-edit">添加</el-button>
      </div>

      <el-table :stripe="true" :key='innerTableKey1' :data="innerList1" v-loading="innerListLoading1" element-loading-text="给我一点时间" border fit highlight-current-row
                style="width: 100%">
        <el-table-column align="center" label="序号" width="65">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="客服">
          <template slot-scope="scope">
            <el-tag class="smalltag" :type="info">{{scope.row.support_member.user_account_group.group_name}}</el-tag>
            <span class="link-type">{{scope.row.support_member.nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="微信昵称">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.weixin_nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="微信号">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.weixin_account}}</span>
            <el-tag :type="scope.row.time_interval_type | timeIntervalFilter">{{scope.row.time_interval_type|timeIntervalTranslator}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="备注名">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.info}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="今日展示量">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.visit}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="今日复制量">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.copy}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="今日咨询/加粉">
          <template slot-scope="scope">
            <span class="link-type">{{scope.row.consult_count}} / {{scope.row.add_count}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="100px" align="center" label="状态">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusWeixinFilter">{{scope.row.status|statusWeixinTranslator}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="180px" align="center" label="添加时间">
          <template slot-scope="scope">
            <span>{{scope.row.created_at | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!innerListLoading1" class="pagination-container">
        <el-pagination background @size-change="handleInnerSizeChange1" @current-change="handleInnerCurrentChange1" :current-page.sync="innerListQuery1.page"
                       :page-sizes="[5,10,50, 100]" :page-size="innerListQuery1.page_size" layout="total, sizes, prev, pager, next, jumper" :total="innerTotal1">
        </el-pagination>
      </div>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="innerDialogFormVisible1">
      <el-form :rules="innerRules1" ref="innerDataForm1" :model="innerTemp1" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="名称" prop="name">
          <el-input v-model="innerTemp1.name"></el-input>
        </el-form-item>
        <el-form-item label="附加代码">
          <el-input type="textarea" :autosize="{ minRows: 10, maxRows: 100}" placeholder="请输入内容" v-model="innerTemp1.code">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerDialogFormVisible1 = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createInnerData1">确 定</el-button>
        <el-button v-else type="primary" @click="updateInnerData1">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createDomainSub, updateDomainSub, deleteDomainSub, createDomainSubExtraCode, updateDomainSubExtraCode, deleteDomainSubExtraCode } from '@/api/domain_sub'
import { getPromotionWarningList } from '@/api/promotion_warning'
import { getPromotionProductWeixinList } from '@/api/promotion_product'
import waves from '@/directive/waves' // 水波纹指令
import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css
export default {
  name: 'wxWarnManagement',
  components: { Multiselect },
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
        page_size: 50,
        domain_prefix: undefined,
        domain_name: undefined,
        ip: undefined,
        sort: '-id'
      },
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showAuditor: false,
      temp: {
        id: undefined,
        domain_id: undefined,
        domain: { id: undefined, domain_name: undefined },
        domain_prefix: '',
        info: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        domain_prefix: [{ required: true, message: '请正确填写域名名称', trigger: 'change' }]
      },

      innerList1: null,
      innerTotal1: null,
      innerTableKey1: 1,
      innerTableTitle1: '',
      innerListQuery1: {
        page: 1,
        page_size: 5,
        domain_sub_id: undefined,
        sort: '-id'
      },
      innerTemp1: {
        id: undefined,
        domain_id: undefined,
        name: '',
        code: '',
        domain_sub_id: undefined
      },
      innerListLoading1: false,
      innerTableVisible1: false,
      innerDialogFormVisible1: false,
      innerRules1: {
        name: [{ required: true, message: '请正确填写名称', trigger: 'change' }]
      },
      domainOptions: []
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'gray',
        1: 'success'
      }
      return statusMap[status]
    },
    statusTranslator(status) {
      const statusTransMap = {
        0: '关闭',
        1: '开启'
      }
      return statusTransMap[status]
    },
    statusWeixinFilter(status) {
      const statusMap = {
        0: 'gray',
        1: 'success',
        2: 'danger',
        3: 'danger'
      }
      return statusMap[status]
    },
    statusWeixinTranslator(status) {
      const statusTransMap = {
        0: '冻结',
        1: '开启',
        2: '告警',
        3: '关闭'
      }
      return statusTransMap[status]
    },
    timeIntervalFilter(status) {
      const statusMap = {
        'none': 'info',
        'day': 'warning',
        'night': 'primary'
      }
      return statusMap[status]
    },
    timeIntervalTranslator(status) {
      const statusTransMap = {
        'none': '休',
        'day': '白',
        'night': '晚'
      }
      return statusTransMap[status]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    queryDomainList(query) {

    },
    getList() {
      this.listLoading = true
      getPromotionWarningList(this.listQuery).then(response => {
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
      const tempData = {}
      tempData.domain_sub_id = row.id
      tempData.status = status
      row.status = status
      updateDomainSub(tempData).then(() => {
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        domain_id: undefined,
        domain: { id: undefined, domain_name: undefined },
        domain_prefix: '',
        info: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.domain_id = this.temp.domain.id
          if ((this.temp.domain_id === undefined)) {
            this.$message({
              type: 'info',
              message: '请先填写域名信息'
            })
            return
          }
          createDomainSub(this.temp).then(response => {
            this.temp.id = response.data.id
            this.temp.status = response.data.status
            this.temp.updated_at = response.data.updated_at
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
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.domain_sub_id = this.temp.id
          tempData.domain_id = this.temp.domain.id
          updateDomainSub(tempData).then(() => {
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
      this.$confirm('此操作将永久删除该域名, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          domain_sub_id: row.id
        }
        deleteDomainSub(ttempData).then(response => {
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
    },
    handleOpenInner1(row) {
      this.innerTableVisible1 = true
      this.innerTableTitle1 = row.promotion_product.url + ' -- 微信号详情'
      this.temp = Object.assign({}, row) // copy obj
      this.getInnerList1()
    },
    getInnerList1() {
      this.innerListQuery1.promotion_product_id = this.temp.promotion_product_id
      this.innerListLoading1 = true
      getPromotionProductWeixinList(this.innerListQuery1).then(response => {
        this.innerList1 = response.data.data
        this.innerTotal1 = response.data.total
        this.innerListLoading1 = false
      })
    },
    handleInnerFilter1() {
      this.innerListQuery1.page = 1
      this.getInnerList1()
    },
    handleInnerSizeChange1(val) {
      this.innerListQuery1.page_size = val
      this.getInnerList1()
    },
    handleInnerCurrentChange1(val) {
      this.innerListQuery1.page = val
      this.getInnerList1()
    },
    resetInnerTemp1() {
      this.innerTemp1 = {
        id: undefined,
        domain_sub_id: this.temp.id,
        name: '',
        code: ''
      }
    },
    handleInnerCreate1() {
      this.resetInnerTemp1()
      this.dialogStatus = 'create'
      this.innerDialogFormVisible1 = true
      this.$nextTick(() => {
        this.$refs['innerDataForm1'].clearValidate()
      })
    },
    createInnerData1() {
      this.$refs['innerDataForm1'].validate((valid) => {
        if (valid) {
          this.innerTemp1.domain_sub_id = this.temp.promotion_product.domain_sub_id
          createDomainSubExtraCode(this.innerTemp1).then(response => {
            this.innerTotal1++
            this.innerTemp1 = response.data
            this.innerList1.unshift(this.innerTemp1)
            this.innerDialogFormVisible1 = false
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
    handleInnerUpdate1(row) {
      this.innerTemp1 = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.innerDialogFormVisible1 = true
      this.$nextTick(() => {
        this.$refs['innerDataForm1'].clearValidate()
      })
    },
    updateInnerData1() {
      this.$refs['innerDataForm1'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.innerTemp1)
          tempData.domain_sub_extra_code_id = this.innerTemp1.id
          updateDomainSubExtraCode(tempData).then(() => {
            for (const v of this.innerList1) {
              if (v.id === this.innerTemp1.id) {
                const index = this.list.indexOf(v)
                this.innerList1.splice(index, 1, this.innerTemp1)
                break
              }
            }
            this.innerDialogFormVisible1 = false
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
    handleInnerDelete1(row) {
      this.$confirm('此操作将永久删除该附加代码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ttempData = {
          domain_sub_extra_code_id: row.id
        }
        deleteDomainSubExtraCode(ttempData).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.innerList1.indexOf(row)
          this.innerList1.splice(index, 1)
          this.innerTotal1--
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
