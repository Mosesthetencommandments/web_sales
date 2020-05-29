<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-select clearable @change='handleFilter' style="width: 150px" class="filter-item" v-model="listQuery.if_consult" placeholder="是否咨询">
        <el-option v-for="item in consultOptions" :key="item.id" :label="item.type_name" :value="item.id">
        </el-option>
      </el-select>
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
        v-model="listQuery.product_weixin_id"
        filterable
        @focus="getProductWeixinList(' ')"
        clearable
        remote
        placeholder="请选择微信"
        :remote-method="getProductWeixinList"
        :loading="productWeixinLoading">
        <el-option
          v-for="item in userAccountWeixinOptions"
          :key="item.id"
          :label="item.info"
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

      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="粉丝微信号" v-model="listQuery.fans_weixin_account">
      </el-input>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">搜索</el-button>
    </div>
    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="客户微信号">
        <template slot-scope="scope">
          <span>{{scope.row.product_weixin_fans.weixin_account}}</span><br>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="加粉时间">
        <template slot-scope="scope">
          <span>{{scope.row.join_time.slice(0, 10)}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="220px" align="center" label="微信号">
        <template slot-scope="scope">
          <span>{{scope.row.product_weixin.weixin_account}}</span>
          <el-tag>{{scope.row.product_weixin.info}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="录粉客服">
        <template slot-scope="scope">
          <span>{{scope.row.support_user_account.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" align="center" label="渠道">
        <template slot-scope="scope">
          <span>{{scope.row.promotion_channel.channel_name}}</span>
        </template>
      </el-table-column>
      <el-table-column width="40px" align="center" label="咨询">
        <template slot-scope="scope">
          <i class="el-icon-error" v-if="scope.row.if_consult == 0" style="color: red;font-size: 18px"/>
          <i class="el-icon-success" v-else style="color: green;font-size: 18px"/>
        </template>
      </el-table-column>
      <el-table-column width="40px" align="center" label="订购">
        <template slot-scope="scope">
          <i class="el-icon-error" v-if="scope.row.product_weixin_fans.buy_times === 0" style="color: red;font-size: 18px"/>
          <i class="el-icon-success" v-else style="color: green;font-size: 18px"/>
        </template>
      </el-table-column>
      <el-table-column width="40px" align="center" label="复购">
        <template slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.product_weixin_fans.buy_times > 1" style="color: green;font-size: 18px"/>
          <i class="el-icon-error" v-if="scope.row.product_weixin_fans.buy_times < 2" style="color: red;font-size: 18px"/>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEditFansPortrait(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30,50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="编辑粉丝画像" :visible.sync="dialogFormVisible" width="60%">
      <el-form :rules="rules" ref="innerDataForm1" :model="temp" label-position="left" label-width="180px" style='width: 90%; margin-left:5%;'>
        <el-form-item v-for="item in protraitItemArray" :label="item.script" v-if="item.is_close === 0 && item.product_weixin_fans_protrait_item_section.length">
          <el-radio-group v-if="item.type === 0" v-model="item.checked" size="small">
            <el-radio-button v-for="item2 in item.product_weixin_fans_protrait_item_section" :key="item2.created_at" v-if="item2.is_close !== 1" :label="item2.key" >{{item2.script}}</el-radio-button>
          </el-radio-group>
          <el-checkbox-group v-if="item.type === 1" v-model="item.checked" size="small">
            <el-checkbox v-for="item2 in item.product_weixin_fans_protrait_item_section" :key="item2.created_at" v-if="item2.is_close !== 1" :label="item2.key" >{{item2.script}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFansPortrait" :loading="btnLoading">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { getProductWeixinFansPivotList } from '@/api/product_weixin'
  import { getSupportMemberList } from '@/api/support_member'
  import { editFansPortrait } from '@/api/fans_protrait'
  import { getProductWeixinList } from '@/api/product_weixin'
  import { getProductWeixinFansProtraitItemList } from '@/api/fans_protrait'
  import waves from '@/directive/waves'
  // 水波纹指令

  export default {
    components: { },
    name: 'supportPortrayal',
    directives: {
      waves
    },
    data() {
      return {
        btnLoading: false,
        scrollTop: 0,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          support_user_account_id: undefined,
          if_consult: undefined,
          product_weixin_id: undefined,
          action: '',
          params: '',
          date_range: undefined
        },
        protraitItemArray: [],
        supportMemberOptions: [],
        supportMemberLoading: false,
        userAccountWeixinOptions: [],
        productWeixinLoading: false,
        consultOptions: [
          {
            type_name: '已咨询',
            id: 1
          },
          {
            type_name: '未咨询',
            id: 0
          }
        ],
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
    watch: {
      dialogFormVisible(val) {
        if (!val) {
          this.$nextTick(() => {
            this.btnLoading = false
          })
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      getList() {
        this.listLoading = true
        getProductWeixinFansPivotList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
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
        this.btnLoading = true
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
