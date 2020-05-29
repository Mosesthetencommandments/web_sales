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
        @focus="getProductList(' ')"
        v-model="listQuery.product_id"
        filterable
        clearable
        remote
        placeholder="请选择产品"
        :remote-method="getProductList"
        :loading="productLoading">
        <el-option
          v-for="item in productOptions"
          :key="item.product_name"
          :label="item.product_name"
          :value="item.id">
        </el-option>
      </el-select>
      <!--<el-select-->
        <!--class="filter-item"-->
        <!--style="width:200px;"-->
        <!--@change='handleFilter'-->
        <!--@focus="getSupportMemberList(' ')"-->
        <!--v-model="listQuery.support_user_account_id"-->
        <!--filterable-->
        <!--clearable-->
        <!--remote-->
        <!--placeholder="请选客服"-->
        <!--:remote-method="getSupportMemberList"-->
        <!--:loading="supportMemberLoading">-->
      <!--<el-option-->
        <!--v-for="item in supportMemberOptions"-->
        <!--:key="item.id"-->
        <!--:label="item.nickname"-->
        <!--:value="item.id">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <!--<el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="粉丝微信号" v-model="listQuery.fans_weixin_account">-->
      <!--</el-input>-->
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>
    <el-table :span-method="objectSpanMethod" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column width="100px" align="center" label="客服">
        <template slot-scope="scope">
          <span>{{scope.row.SupportMember.nickname}}</span><br>
        </template>
      </el-table-column>
      <!--<el-table-column min-width="80px" align="center" label="产品">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{scope.row.Product.product_name}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column min-width="80px" align="center" label="微信号">
        <template slot-scope="scope">
          <span>{{scope.row.ProductWeixin.weixin_account}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="加粉数">
        <template slot-scope="scope">
          <span>{{scope.row.add_count}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="咨询数">
        <template slot-scope="scope">
          <span>{{scope.row.consult_count}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" :label="item.column_name" v-for="item in columnList" :key="item" :prop="item.key">
      </el-table-column>
    </el-table>

    <!--<div v-show="!listLoading" class="pagination-container">-->
      <!--<el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"-->
                     <!--:page-sizes="[10,20,30,50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">-->
      <!--</el-pagination>-->
    <!--</div>-->

    <!--<el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">-->
      <!--<el-form :rules="rules" ref="innerDataForm1" :model="temp" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>-->
        <!--<el-form-item v-for="item in protraitItemArray" :label="item.script" v-if="item.is_close === 0">-->
          <!--<el-radio-group v-if="item.type === 0" v-model="item.checked" size="small">-->
            <!--<el-radio-button v-for="item2 in item.product_weixin_fans_protrait_item_section" v-if="item2.is_close !== 1" :label="item2.key" >{{item2.script}}</el-radio-button>-->
          <!--</el-radio-group>-->
          <!--<el-checkbox-group v-if="item.type === 1" v-model="item.checked" size="small">-->
            <!--<el-checkbox-button v-for="item2 in item.product_weixin_fans_protrait_item_section" v-if="item2.is_close !== 1" :label="item2.key" >{{item2.script}}</el-checkbox-button>-->
          <!--</el-checkbox-group>-->
        <!--</el-form-item>-->
      <!--</el-form>-->
      <!--<div slot="footer" class="dialog-footer">-->
        <!--<el-button @click="dialogFormVisible = false">取 消</el-button>-->
        <!--<el-button type="primary" @click="editFansPortrait">确 定</el-button>-->
      <!--</div>-->
    <!--</el-dialog>-->

  </div>
</template>

<script>
  import { getProductWeixinFansPivotList } from '@/api/product_weixin'
  import { parseTime } from '@/utils/index'
  import { getSupportMemberList } from '@/api/support_member'
  import { editFansPortrait, getProductWenxinFansStatics, getProductWeixinFansStaticsColumn } from '@/api/fans_protrait'
  import { getProductList } from '@/api/product'
  import { getProductWeixinList } from '@/api/product_weixin'
  import { getProductWeixinFansProtraitItemList } from '@/api/fans_protrait'
  import waves from '@/directive/waves'
  // 水波纹指令

  export default {
    components: { },
    name: 'fansPortrayalStatistics',
    directives: {
      waves
    },
    data() {
      return {
        scrollTop: 0,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: false,
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          product_id: undefined,
          date_range: [
            parseTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 30), '{y}-{m}-{d}'),
            parseTime(new Date(), '{y}-{m}-{d}')
          ]
        },
        columnList: [],
        spanMethodArray: [],
        protraitItemArray: [],
        supportMemberOptions: [],
        supportMemberLoading: false,
        userAccountWeixinOptions: [],
        productWeixinLoading: false,
        productOptions: [],
        productLoading: false,
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        rules: {
          domain_name: [{ required: true, message: '请正确填写域名名称', trigger: 'change' }]
        },
        temp: {
          product_weixin_fans_id: undefined,
          protrait: {}
        },
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
      ifconsultFilter(status) {
        const statusMap = {
          0: 'gray',
          1: 'success'
        }
        return statusMap[status]
      },
      ifconsultTranslator(status) {
        const statusMap = {
          0: '未咨询',
          1: '已咨询'
        }
        return statusMap[status]
      },
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
      // this.getList()
    },
    methods: {
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      getProductList(query) {
        if (query !== '') {
          this.productLoading = true
          getProductList({ product_name: query, is_promote: 1 }).then(response => {
            this.productOptions = response.data.data
            this.productLoading = false
          })
        }
      },
      getList() {
        if (this.listQuery.product_id == null || this.listQuery.product_id === '' || this.listQuery.product_id === undefined) {
          return this.$message.error('选择产品')
        }
        getProductWeixinFansStaticsColumn({ product_id: this.listQuery.product_id })
          .then(res => {
            this.columnList = []
            this.columnList.push(...res.data)
            return getProductWenxinFansStatics(this.listQuery)
          }).then(response => {
            this.list = []
            for (const i in response.data) {
              for (const j in response.data[i]) {
                this.list.push(response.data[i][j])
              }
            }
            this.getspanMethodArray()
            this.total = response.data.total
            this.listLoading = false
          })
        // this.listLoading = true
        // getProductWenxinFansStatics(this.listQuery)
      },
      getSupportMemberList(query) {
        if (query !== '') {
          this.supportMemberLoading = true
          getSupportMemberList({ nickname: query, status: 1 }).then(response => {
            this.supportMemberOptions = response.data.data
            this.supportMemberLoading = false
          })
        }
      },
      getspanMethodArray() {
        const temparray = []
        let contactDot = 0
        this.list.forEach((item, index) => {
          if (index === 0) {
            temparray.push(1)
          } else {
            if (item.SupportMember.id === this.list[index - 1].SupportMember.id) {
              temparray[contactDot] += 1
              temparray.push(0)
            } else {
              temparray.push(1)
              contactDot = index
            }
          }
        })
        this.spanMethodArray = temparray
      },
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0 && this.spanMethodArray[rowIndex] !== undefined) {
          const _row = this.spanMethodArray[rowIndex]
          const _col = _row > 0 ? 1 : 0
          return {
            rowspan: _row,
            colspan: _col
          }
        }
      },
      handleEditFansPortrait(row) {
        this.temp.product_weixin_fans_id = row.product_weixin_fans.id
        getProductWeixinFansProtraitItemList({ product_id: row.product_id }).then(res => {
          this.protraitItemArray = res.data.map(item => {
            if (item.type === 1) {
              return Object.assign({ checked: [] }, item)
            }
            if (item.type === 0) {
              return Object.assign({ checked: '' }, item)
            }
          })
          if (row.product_weixin_fans.product_weixin_fans_protrait) {
            const protrait = row.product_weixin_fans.product_weixin_fans_protrait.protrait
            for (const v in protrait) {
              if (protrait[v]) {
                for (const i of this.protraitItemArray) {
                  for (const j of i.product_weixin_fans_protrait_item_section) {
                    if (j.key === v) {
                      if (i.type === 0) {
                        i.checked = v
                      }
                      if (i.type === 1) {
                        i.checked.push(v)
                      }
                    }
                  }
                }
              }
            }
          }
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['innerDataForm1'].clearValidate()
          })
        })
      },
      editFansPortrait() {
        for (const i of this.protraitItemArray) {
          for (const j of i.product_weixin_fans_protrait_item_section) {
            if (Array.isArray(i.checked)) {
              if (j.is_close !== 1) {
                i.checked.indexOf(j.key) !== -1 ? this.temp.protrait[j.key] = 1 : this.temp.protrait[j.key] = 0
              }
            } else {
              if (j.is_close !== 1) {
                i.checked === j.key ? this.temp.protrait[j.key] = 1 : this.temp.protrait[j.key] = 0
              }
            }
          }
        }
        editFansPortrait(this.temp).then(res => {
          this.dialogFormVisible = false
          this.getList()
          this.$notify({
            title: '成功',
            message: '录入成功',
            type: 'success',
            duration: 2000
          })
        })
      },
      getProductWeixinList(query) {
        if (query !== '') {
          this.productWeixinLoading = true
          getProductWeixinList({ info: query, support_user_account_id: this.listQuery.support_user_account_id }).then(response => {
            this.userAccountWeixinOptions = response.data.data
            this.productWeixinLoading = false
          })
        }
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
      this.getList()
    }
  }
</script>
<style scoped lang="scss">
  .el-tag {
    padding: 0 4px;
    font-size: 14px;
    line-height: 26px;
    height: 26px;
  }
  .el-form-item {
    margin-bottom: 10px;
  }
</style>
