<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-radio-group v-model="listQuery.only_new_fans"
                      @change="handleFilter"
                      class="filter-item"
                      size="small">
        <el-radio-button :label="0">全部排行</el-radio-button>
        <el-radio-button :label="1">新粉排行</el-radio-button>
      </el-radio-group>
      <div class="filter-item">
        <div class="filter-label">月份</div>
        <el-date-picker
          format="yyyy-MM"
          value-format="yyyy-MM"
          v-model="listQuery.date_time"
          align="bottom"
          placeholder="选择"
          size="small"
          type="month"
          @change='handleFilter'>
        </el-date-picker>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服部门</div>
        <el-cascader
          clearable
          size="small"
          :options="userGroupTree"
          change-on-select
          placeholder="选择"
          :props="defaultPropsGroup"
          v-model="userGroupOptions"
          @change="handleFilterGrounp">
        </el-cascader>
      </div>
      <div class="filter-float">
        <el-button class="filter-item" @click="getList" size="small" type="primary">刷新</el-button>
      </div>

    </div>
    <!--图片上传预览-->
    <el-dialog :visible.sync="dialogVisible" size="tiny">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column align="center" type="index" width="50"></el-table-column>
      <el-table-column min-width="100px" align="center" label="头像">
        <template slot-scope="scope">
          <span class="link-type">
            <div style="position: relative;" v-if="scope.row.is_top_three">
              <img style="height:120px;width: 120px;" :src="scope.row.head_img" @click="handlePicture(scope.row.head_img)"/>
              <p class="link-type pos_img" v-if="scope.row.support_user_account_level_relations">{{scope.row.support_user_account_level_relations.support_level.level_name}}</p>
            </div>
            <div style="position: relative;" v-else>
              <img style="height:80px;width: 80px;" :src="scope.row.head_img" @click="handlePicture(scope.row.head_img)"/>
              <p class="link-type small_img" v-if="scope.row.support_user_account_level_relations">{{scope.row.support_user_account_level_relations.support_level.level_name}}</p>
            </div>
          </span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="姓名">
        <template slot-scope="scope">
          <span class="link-type_top_three" v-if="scope.row.is_top_three">{{scope.row.nickname}}</span>
          <span class="link-type" v-else>{{scope.row.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="业绩">
        <template slot-scope="scope">
          <span class="link-type_top_three" v-if="scope.row.is_top_three">￥{{scope.row.total_all_product_sales}}</span>
          <span class="link-type" v-else>￥{{scope.row.total_all_product_sales}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="提成" v-if="listQuery.only_new_fans == 0">
        <template slot-scope="scope">
          <span class="link-type_top_three" v-if="scope.row.is_top_three">￥{{scope.row.current_profit_all}}</span>
          <span class="link-type" v-else>￥{{scope.row.current_profit_all}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="性价比/指标性价比" min-width="150" v-if="listQuery.only_new_fans == 1">
        <template slot-scope="scope">
          <span>{{scope.row.current_all_product_cost_performance}}</span>
          /
          <span v-for="item in scope.row.support_product">{{item.achievement_config.performance}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="在售产品">
        <template slot-scope="scope">
          <el-tag v-for="item in scope.row.support_product">{{item.product.product_name}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="入职时间">
        <template slot-scope="scope">
          <span >{{scope.row.created_at.slice(0,10)}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="200" align="center" label="销售额进度">
        <template slot-scope="scope">
          <span class="link-type">
            <!--<el-progress :text-inside="true" :stroke-width="18" :percentage="70"></el-progress>-->
            <div style="color: #e51c23;font-size: 12px;">
              <span>{{scope.row.total_all_product_sales}}</span>
              <span>({{scope.row.current_progress_all}}%)</span>
            </div>
            <div class="outer_progress">
              <div class="quota inner_progress" :style="{ width: scope.row.current_progress_all >= 100? '100%': scope.row.current_progress_all + '%',backgroundColor: scope.row.current_progress_all >= 100? 'orange': '#66b1ff'}" ></div>
            </div>
            <div style="color: #000;font-size: 12px;clear: both;">
              <span style="float: left;">0</span>
              <span style="float: right;">{{scope.row.current_achievement_money_all}}</span>
            </div>
          </span>
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
  import waves from '@/directive/waves' // 水波纹指令
  // import { getMonthlyRanking } from '@/api/support_rating'
  import { getSupportGroupList } from '@/api/support_member'
  import { parseTime } from '@/utils/index'
  import { getMonthlyRanking } from '@/api/sales'
  export default {
    name: 'monthlySalesRank',
    components: { },
    directives: {
      waves
    },
    data() {
      return {
        dialogImageUrl: '',
        dialogVisible: undefined,
        scrollTop: 0,
        rowKey: 0,
        tableKey: 0,
        list: null,
        total: null,
        listLoading: false,
        listQuery: {
          date_time: parseTime(new Date(), '{y}-{m}'),
          support_user_account_group_id: undefined,
          page: 1,
          only_new_fans: 0,
          page_size: 50
        },
        userGroupOptions:[],
        userGroupTree: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        max: 10000,
        pickerOptions1: {
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date())
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          }, {
            text: '一周前',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }]
        }
      }
    },
    filters: {

    },
    created() {
      this.getUserGroupTree()
    },
    methods: {
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
      handleGroupFilter() {
        this.getList()
      },
      handlePicture(head_img) {
        this.dialogImageUrl = head_img
        this.dialogVisible = true
      },
      getList() {
        if (!this.listQuery.support_user_account_group_id) {
          this.$message.warning('先选择客服部门')
          return false
        }
        this.listLoading = true
        getMonthlyRanking(this.listQuery).then(response => {
          this.list = response.data.data
          if (this.list.length > 0) {
            if (this.list[0].total_all_product_sales > 0) {
              this.max = this.list[0].total_all_product_sales
            }
          }
          for (const v of this.list) {
            const index = this.list.indexOf(v)
            if (index < 3) {
              v.is_top_three = true
            } else {
              v.is_top_three = false
            }
            this.list.splice(index, 1, v)
          }
          this.total = response.data.total
          ++this.tableKey
          this.listLoading = false
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
  .outer_progress {
    height: 18px;
    width: 100%;
    padding: 1px;
    overflow: hidden;
    background-color: #fff;
    border: 1px solid #000;
  }
  .inner_progress {
    height: 15px;
    margin: 0;
    background-color: #66b1ff;
    /*width: 10%;*/
    color: #e51c23;
    font-size: 12px;
  }
  .link-type {
    font-size: 16px;
  }
  .link-type_top_three {
    font-size: 22px;
    font-weight: 600;
    color: #ff4d51;
    line-height: 30px;
  }
  .inner_progress {
    height: 15px;
    margin: 0;
    background-color: #66b1ff;
    /*width: 10%;*/
    color: #e51c23;
    font-size: 12px;
  }
  .quota {
    display: inline-block;
    float:left;
  }
  .quotaChild {
    width: 100%;
    background-color: #ff9800;
    height: 15px;
    margin: 0;
    font-size: 12px;
  }
  .pos_img {
    position: absolute;
    top: -14px;
    right: -6px;
    margin: 0;
    color: #fff;
     font-size: 14px;
    background-color: #ff9800;
    padding: 2px 4px;
    font-weight: bold;
    /* vertical-align: bottom; */
    margin-top: 3px;
    border-radius: 12%;
  }
  .small_img {
    position: absolute;
    top: -14px;
    right: 14px;
    margin: 0;
    color: #fff;
    font-size: 12px;
    background-color: #ff9800;
    padding: 0 4px;
    font-weight: bold;
    /* vertical-align: bottom; */
    margin-top: 4px;
    border-radius: 12%;
  }
  .el-table .cell {
    overflow: visible;
  }
</style>
