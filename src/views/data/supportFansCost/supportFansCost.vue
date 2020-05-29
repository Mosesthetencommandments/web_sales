<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <div>
        <el-select clearable
                   @change='handleFilter2'
                   style="width: 150px"
                   class="filter-item"
                   filterable
                   remote
                   :loading="promotionChannelLoading"
                   :remote-method="getPromotionChannel"
                   v-model="listQuery.promotion_channel_id"
                   placeholder="推广渠道">
          <el-option v-for="item in promotionChannelOptions" :key="item.id" :label="item.channel_name" :value="item.id">
          </el-option>
        </el-select>

        <el-select  class="filter-item"
                    style="width: 150px"
                    @change='handleFilter'
                    v-model="listQuery.product_id"
                    filterable
                    clearable
                    remote
                    placeholder="选择产品"
                    :remote-method="getProductList"
                    :loading="productLoading">
          <el-option v-for="item in productOptions"
                     :key="item.id"
                     :label="item.product_name"
                     :value="item.id">
          </el-option>
        </el-select>
        <el-date-picker
          class="filter-item"
          v-model="listQuery.date_range"
          type="daterange"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          align="bottom"
          unlink-panels
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions2"
          @change='handleFilter'>
        </el-date-picker>


        <el-button type="primary" class="filter-item"
                   @click="handleFilter"
                   v-waves>
                    搜索
        </el-button>

        <!--<el-switch v-model="listQuery.show_terminal"-->
                   <!--@change="handleFilter"-->
                   <!--style="float: right"-->
                   <!--:active-value="1"-->
                   <!--:inactive-value="0"-->
                   <!--active-text="全部消费"-->
                   <!--inactive-text="最新消费">-->
        <!--</el-switch>-->
      </div>
    </div>
    <el-table :key='tableKey'
              id="productMember"
              :data="list"
              v-loading="listLoading"
              element-loading-text="给我一点时间"
              border fit highlight-current-row
              style="width: 100%;" >
      <el-table-column :key="Math.random()" align="center" label="ID" width="60">
        <template slot-scope="scope">
              <span >
                {{scope.row.id}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="渠道" min-width="100">
        <template slot-scope="scope">
              <span class="link-type">
                {{scope.row.promotion_channel.channel_name}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="产品" min-width="100">
        <template slot-scope="scope">
              <span >
                {{scope.row.product.product_name}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="加粉数" min-width="100">
        <template slot-scope="scope">
          <span >
            {{scope.row.fans_count}}
          </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="消费" min-width="100">
        <template slot-scope="scope">
              <span >
                ¥ {{scope.row.cost_count}}
              </span>
        </template>
      </el-table-column>
      <el-table-column :key="Math.random()" align="center" label="时间" min-width="100">
        <template slot-scope="scope">
          <span >
            {{scope.row.date}}
          </span>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                     :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="消费录入" :visible.sync="dialogFormVisible" width="40%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="80px" style='width:90%; margin-left:5%;'>
        <el-form-item label="渠道" prop="promotion_channel_id">
          <el-select clearable
                     style="width: 100%"
                     class="filter-item"
                     filterable
                     remote
                     :loading="promotionChannelLoading"
                     :remote-method="getPromotionChannel"
                     v-model="temp.promotion_channel_id"
                     placeholder="推广渠道">
            <el-option v-for="item in promotionChannelOptions" :key="item.id" :label="item.channel_name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品" prop="product_id">
          <el-select style="width: 100%"
                     v-model="temp.product_id"
                     filterable
                     clearable
                     remote
                     placeholder="产品"
                     :remote-method="getProductList"
                     :loading="productLoading">
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.product_name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消费" prop="money">
          <el-input v-model="temp.money"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="createCost">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { parseTime } from '@/utils/index'
  import { getProductList } from '@/api/product'
  import { getSupportFansCostList, createSupportFansCost } from '@/api/support_statistics'
  import { getPromotionChannelList } from '@/api/product_weixin'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'supportFansCost',
    components: { },
    directives: {
      waves
    },
    data() {
      const validate = (rule, value, callback) => {
        if (!value) {
          callback(new Error('输入消费'))
        }
        if (/^\d+(\.\d+)?$/.test(value)) {
          callback()
        } else {
          callback(new Error('只能输入数字'))
        }
      }
      return {
        arry: [],
        scrollTop: 0,
        tableKey: 0,
        list: [],
        total: null,
        listLoading: true,
        listQuery: {
          product_id: undefined,
          date_range: [
            parseTime(new Date(new Date().getTime() - 3600 * 7 * 24 * 1000), '{y}-{m}-{d}'),
            parseTime(new Date(), '{y}-{m}-{d}')
          ],
          promotion_channel_id: undefined,
          page_size: 20,
          page: 1,
          sort: '-date'
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
        },
        rules: {
          promotion_channel_id: [{ required: true, message: '选择渠道', trigger: 'change' }],
          product_id: [{ required: true, message: '选择产品', trigger: 'change' }],
          money: [
            { validator: validate, trigger: 'change' }
          ]
        },
        sortOptions: [{ label: '按ID升序列', key: '+id' }, { label: '按ID降序', key: '-id' }],
        temp: {
          promotion_channel_id: undefined,
          money: undefined,
          product_id: undefined
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        promotionChannelOptions: [],
        promotionChannelLoading: false,
        productOptions: [],
        productLoading: false
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
      this.getList()
      this.getPromotionChannel(' ')
      this.getProductList(' ')
    },
    methods: {
      handleSizeChange(val) {
        this.listQuery.page_size = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      getPromotionChannel(query) {
        if (query !== '') {
          this.PromotionChannelLoading = true
          getPromotionChannelList({ channel_name: query, page_size: 0 }).then(response => {
            this.promotionChannelOptions = response.data
            this.PromotionChannelLoading = false
          })
        }
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleFilter2() {
        this.productOptions = []
        this.listQuery.product_id = undefined
        this.handleFilter()
      },
      handleQueryTypeChange(type) {
        this.list = []
        this.handleFilter()
      },
      getProductList(query) {
        if (query !== '') {
          this.productLoading = true
          getProductList({ product_name: query, is_promote: 1, page_size: 0 }).then(response => {
            this.productOptions = response.data
            this.productLoading = false
          })
        }
      },
      getList() {
        this.listLoading = true
        getSupportFansCostList(this.listQuery).then(res => {
          this.list = res.data.data
          this.total = res.data.total
          this.listLoading = false
        })
      },
      handleAddCost() {
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createCost() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.temp.money = Number(this.temp.money)
            createSupportFansCost(this.temp).then(response => {
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
      }
    },
    watch: {
      dialogFormVisible(val) {
        if (val === false) {
          this.temp = {
            promotion_channel_id: undefined,
            money: undefined,
            product_id: undefined
          }
        }
      }
    },
    deactivated() {
      this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    },
    activated() {
      this.getList()
      window.scrollTo(0, this.scrollTop)
    }
  }
</script>
<style scoped>
  .el-tabs__item {
    font-size: 16px;
    font-weight: 600;
  }
  .el-table >>> thead{
    font-size: 14px;
  }
  .el-table{
    font-size: 12px;
  }
  .el-table .cell{
    line-height: 16px;
  }

</style>
