<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <!--<el-date-picker class="filter-item"-->
      <!--v-model="listQuery.date_range"-->
      <!--type="daterange"-->
      <!--format="yyyy-MM-dd"-->
      <!--value-format="yyyy-MM-dd"-->
      <!--align="right"-->
      <!--unlink-panels-->
      <!--range-separator="~"-->
      <!--start-placeholder="开始日期"-->
      <!--end-placeholder="结束日期"-->
      <!--:picker-options="pickerOptions"-->
      <!--@change='handleFilter'>-->
      <!--</el-date-picker>-->
      <!--<el-select  class="filter-item"-->
      <!--style="width:200px;"-->
      <!--@change='handleFilter'-->
      <!--v-model="listQuery.product_id"-->
      <!--placeholder="状态">-->
      <!--<el-option  v-for="item in stateOptions"-->
      <!--:key="item.id"-->
      <!--:label="item.label"-->
      <!--:value="item.id">-->
      <!--</el-option>-->
      <!--</el-select>-->
      <!--<el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="客户名称" v-model="listQuery.name"></el-input>-->
      <!--<el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" icon="el-icon-search">搜索</el-button>-->
      <el-button class="filter-item" @click="handleCreate" type="primary" icon="el-icon-edit">创建发货库</el-button>

      <el-table :key='tableKey'
                :data="list"
                v-loading="listLoading"
                element-loading-text="给我一点时间"
                border
                fit
                highlight-current-row
                style="width: 100%"
                stripe>
        <el-table-column align="center" label="ID" width="60">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="发货信息模板名称" min-width="300">
          <template slot-scope="scope">
            <span>{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="150">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleUpdate(scope.row)" type="primary">编辑</el-button>
            <!--<el-button @click="handleDelete" type="danger">删除</el-button>-->
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!listLoading" class="pagination-container">
        <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
                       :current-page.sync="listQuery.page"
                       :page-sizes="[10,20,30]" :page-size="listQuery.page_size"
                       layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>

      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="80%">
        <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="150px"
                 style='width: 100%;'>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="库名称" prop="name">
                <el-input size="mini" v-model="temp.name"></el-input>
              </el-form-item>
              <el-form-item label="寄件地（省）" prop="delivery_province">
                <el-input size="mini" v-model="temp.delivery_province"></el-input>
              </el-form-item>
              <el-form-item label="寄件地（市）" prop="delivery_city">
                <el-input size="mini" v-model="temp.delivery_city"></el-input>
              </el-form-item>
              <el-form-item label="寄件地（区）" prop="delivery_district">
                <el-input size="mini" v-model="temp.delivery_district"></el-input>
              </el-form-item>
              <el-form-item label="寄件邮编" prop="delivery_post_code">
                <el-input size="mini" v-model="temp.delivery_post_code"></el-input>
              </el-form-item>
              <el-form-item label="发货地址（详细）" prop="delivery_address">
                <el-input size="mini" v-model="temp.delivery_address"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发货产品" prop="product_ids">
                <el-select v-model="temp.product_ids"
                           filterable
                           style="width: 100%"
                           size="mini"
                           clearable
                           multiple
                           remote
                           placeholder="请选择产品"
                           :remote-method="getProductList"
                           :loading="productLoading">
                  <el-option v-for="item in productOptions"
                             :key="item.id"
                             :label="item.product_name"
                             :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="物流公司" prop="order_logistics_type_id">
                <el-select v-model="temp.order_logistics_type_ids"
                           filterable
                           style="width: 100%"
                           size="mini"
                           clearable
                           multiple
                           remote
                           placeholder="请选择物流公司"
                           :remote-method="queryLogisticsTypeList"
                           :loading="logisticsTypeLoading">
                  <el-option v-for="item in logisticsTypeOptions"
                             :key="item.id"
                             :label="item.name"
                             :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="顺丰额外信息" prop="product_deliver_extra_sf"
                            v-show="temp.order_logistics_type_ids.indexOf(1) > -1">
                <el-select v-model="temp.product_deliver_extra_sf"
                           filterable
                           style="width: 100%"
                           size="mini"
                           clearable
                           remote
                           placeholder="请选择额外信息"
                           :remote-method="getProductDeliverExtrasf"
                           :loading="logisticsTypeLoading_sf">
                  <el-option v-for="item in logisticsTypeOptions_sf"
                             :key="item.id"
                             :label="item.description"
                             :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="圆通额外信息" prop="product_deliver_extra_yt"
                            v-show="temp.order_logistics_type_ids.indexOf(6) > -1">
                <el-select v-model="temp.product_deliver_extra_yt"
                           filterable
                           style="width: 100%"
                           size="mini"
                           clearable
                           remote
                           placeholder="请选择额外信息"
                           :remote-method="getProductDeliverExtrayt"
                           :loading="logisticsTypeLoading_yt">
                  <el-option v-for="item in logisticsTypeOptions_yt"
                             :key="item.id"
                             :label="item.description"
                             :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button v-if="dialogStatus === 'create'" type="primary" @click="createData">确 定</el-button>
          <el-button v-else type="primary" @click="updateData">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import waves from '@/directive/waves'
  import {
    updateProductDeliver,
    getProductDeliverList,
    createProductDeliver,
    getProductList,
    getProductDeliverExtraList
  } from '@/api/product'
  import { getOrdersLogisticsTypeList } from '@/api/orders'

  export default {
    components: {},
    name: 'deliverAddressSetting',
    directives: {
      waves
    },
    data() {
      return {
        temp_id: undefined,
        tableKey: 0,
        scrollTop: 0,
        list: null,
        total: null,
        listLoading: false,
        textMap: {
          update: '编辑',
          create: '创建'
        },
        dialogStatus: undefined,
        dialogFormVisible: false,
        logisticsTypeOptions: [],
        logisticsTypeOptions_sf: [],
        logisticsTypeOptions_yt: [],
        logisticsTypeLoading: false,
        logisticsTypeLoading_sf: false,
        logisticsTypeLoading_yt: false,
        productOptions: [],
        productLoading: false,
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id'
        },
        stateOptions: [
          { id: 0, label: '有效操作' },
          { id: 1, label: '无效操作' }
        ],
        causeOptions: [
          { id: 0, label: '系统原因' },
          { id: 1, label: '发货错误' }
        ],
        temp: {
          name: undefined,
          delivery_province: undefined,
          delivery_city: undefined,
          delivery_district: undefined,
          delivery_address: undefined,
          delivery_post_code: undefined,
          product_deliver_extra_ids: [],
          product_ids: [],
          order_logistics_type_ids: [],
          product_deliver_extra_sf: undefined,
          product_deliver_extra_yt: undefined
        },
        rules: {
          name: [{ required: true, message: '填写名称', trigger: 'change' }],
          delivery_province: [{ required: true, message: '填写省份', trigger: 'change' }],
          delivery_city: [{ required: true, message: '填写城市', trigger: 'change' }],
          delivery_district: [{ required: true, message: '填写区县', trigger: 'change' }],
          delivery_post_code: [{ required: true, message: '填写邮编', trigger: 'change' }],
          delivery_product_name: [{ required: true, message: '填写发货产品名称', trigger: 'change' }],
          delivery_address: [{ required: true, message: '填写详细发货地址', trigger: 'change' }],
          sf_monthly_account: [{ required: true, message: '顺丰月结账户', trigger: 'change' }]
        },
        pickerOptions: {
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
    methods: {
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      getList() {
        this.listLoading = true
        getProductDeliverList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        console.log(this.temp)
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            if (this.temp.product_deliver_extra_sf !== undefined) {
              this.temp.product_deliver_extra_ids.push(this.temp.product_deliver_extra_sf)
            }
            if (this.temp.product_deliver_extra_yt !== undefined) {
              this.temp.product_deliver_extra_ids.push(this.temp.product_deliver_extra_yt)
            }
            createProductDeliver(this.temp).then(res => {
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.dialogFormVisible = false
              this.getList()
            })
          }
        })
      },
      handleUpdate(row) {
        this.temp_id = row.id
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.temp.name = row.name
        this.temp.delivery_province = row.delivery_province
        this.temp.delivery_city = row.delivery_city
        this.temp.delivery_district = row.delivery_district
        this.temp.delivery_post_code = row.delivery_post_code
        this.temp.delivery_address = row.delivery_address
        row.product.forEach(d => this.temp.product_ids.push(d.id))
        row.order_logistics_type.forEach(d => this.temp.order_logistics_type_ids.push(d.id))
        this.temp.product_deliver_extra_sf = row.product_deliver_extra.find(d => d.order_logistics_type_id === 1).id
        this.temp.product_deliver_extra_yt = row.product_deliver_extra.find(d => d.order_logistics_type_id === 6).id
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            if (this.temp.product_deliver_extra_sf !== undefined) {
              this.temp.product_deliver_extra_ids.push(this.temp.product_deliver_extra_sf)
            }
            if (this.temp.product_deliver_extra_yt !== undefined) {
              this.temp.product_deliver_extra_ids.push(this.temp.product_deliver_extra_yt)
            }
            const tempparm = Object.assign({ id: this.temp_id }, this.temp)
            updateProductDeliver(tempparm).then(res => {
              this.$message({
                title: '成功',
                message: '修改成功',
                type: 'success',
                duration: 2000
              })
              this.dialogFormVisible = false
              this.getList()
            })
          }
        })
      },
      queryLogisticsTypeList(query) {
        if (query !== '') {
          this.logisticsTypeLoading = true
          getOrdersLogisticsTypeList({ logistics_name: query }).then(response => {
            this.logisticsTypeOptions = response.data.data
            this.logisticsTypeLoading = false
          })
        }
      },
      getProductDeliverExtrasf() {
        this.logisticsTypeLoading_sf = true
        getProductDeliverExtraList({ order_logistics_type_id: 1 }).then(response => {
          this.logisticsTypeOptions_sf = response.data.data
          this.logisticsTypeLoading_sf = false
        })
      },
      getProductDeliverExtrayt() {
        this.logisticsTypeLoading_yt = true
        getProductDeliverExtraList({ order_logistics_type_id: 6 }).then(response => {
          this.logisticsTypeOptions_yt = response.data.data
          this.logisticsTypeLoading_yt = false
        })
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
      handleSizeChange(val) {
        this.listQuery.page_size = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      }
    },
    watch: {
      dialogFormVisible(val) {
        if (!val) {
          this.$refs['dataForm'].resetFields()
          this.temp = {
            name: undefined,
            delivery_province: undefined,
            delivery_city: undefined,
            delivery_district: undefined,
            delivery_address: undefined,
            delivery_post_code: undefined,
            product_deliver_extra_ids: [],
            product_ids: [],
            order_logistics_type_ids: [],
            product_deliver_extra_sf: undefined,
            product_deliver_extra_yt: undefined
          }
        }
      }
    },
    created() {
      this.getList()
      this.getProductList(' ')
      this.queryLogisticsTypeList(' ')
      this.getProductDeliverExtrasf()
      this.getProductDeliverExtrayt()
    }
  }
</script>
<style scoped>
  .el-form >>> .el-form-item {
    margin-bottom: 5px;
  }

</style>
