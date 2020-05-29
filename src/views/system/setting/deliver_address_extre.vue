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
      <el-button class="filter-item" @click="handleCreate" type="primary" icon="el-icon-edit">添加物流额外信息</el-button>

      <el-table :key='tableKey'
                :data="list"
                v-loading="listLoading"
                element-loading-text="给我一点时间"
                border
                fit
                highlight-current-row
                style="width: 100%"
                stripe>
        <el-table-column align="center" label="ID" width="60" >
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="物流" min-width="100">
          <template slot-scope="scope">
            <el-tag type="primary">{{logisticsTypeOptions[logisticsTypeOptions.findIndex( d => d.id == scope.row.order_logistics_type_id)].name}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="名称" min-width="300">
          <template slot-scope="scope">
            <span>{{scope.row.description}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="200" >
          <template slot-scope="scope">
            <el-button size="mini" @click="handleUpdate(scope.row)" type="primary">编辑</el-button>
            <!--<el-button @click="handleDelete" type="danger">删除</el-button>-->
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!listLoading" class="pagination-container">
        <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
                       :page-sizes="[10,20,30]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>

      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
        <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="150px" style='width: 80%;margin-left: 10%'>
          <el-form-item label="额外信息名称" prop="name">
            <el-input size="mini" v-model="temp.description"></el-input>
          </el-form-item>
          <el-form-item label="物流公司" prop="order_logistics_type_id">
            <el-select
                       v-model="temp.order_logistics_type_id"
                       filterable
                       style="width: 100%"
                       size="mini"
                       clearable
                       :disabled="disabled_order_logistics_type_id"
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
          <el-form-item v-if="this.temp.order_logistics_type_id === 1" label="月结账号" prop="configs.sf_monthly_account">
            <el-input size="mini" v-model="temp.configs.sf_monthly_account"></el-input>
          </el-form-item>
          <el-form-item v-if="this.temp.order_logistics_type_id === 1 || this.temp.order_logistics_type_id === 6" label="发货产品名称" prop="configs.delivery_product_name">
            <el-input size="mini" v-model="temp.configs.delivery_product_name"></el-input>
          </el-form-item>
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
  import { updateProductDeliverExtra, getProductDeliverExtraList, createProductDeliverExtra } from '@/api/product'
  import { getOrdersLogisticsTypeList } from '@/api/orders'
  export default {
    components: { },
    name: 'deliverAddressExtre',
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
        disabled_order_logistics_type_id: false,
        dialogStatus: undefined,
        dialogFormVisible: false,
        logisticsTypeOptions: [],
        logisticsTypeLoading: false,
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
          description: undefined,
          order_logistics_type_id: undefined,
          configs: {
            sf_monthly_account: undefined,
            delivery_product_name: undefined
          }
        },
        rules: {
          description: [{ required: true, message: '填写名称', trigger: 'change' }],
          order_logistics_type_id: [{ required: true, message: '选择物流', trigger: 'change' }],
          configs: {
            sf_monthly_account: [{ required: true, message: '填写月结账户', trigger: 'change' }],
            delivery_product_name: [{ required: true, message: '填写发货产品名称', trigger: 'change' }]
          }
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
      queryLogisticsTypeList(query) {
        if (query !== '') {
          this.logisticsTypeLoading = true
          getOrdersLogisticsTypeList({ logistics_name: query }).then(response => {
            this.logisticsTypeOptions = response.data.data
            this.logisticsTypeLoading = false
          })
        }
      },
      getList() {
        this.listLoading = true
        getProductDeliverExtraList(this.listQuery).then(response => {
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
            createProductDeliverExtra(this.temp).then(res => {
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
        this.disabled_order_logistics_type_id = true
        this.temp_id = row.id
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.temp.description = row.description
        this.temp.order_logistics_type_id = row.order_logistics_type_id
        this.temp.configs.delivery_product_name = row.configs.delivery_product_name
        this.temp.configs.sf_monthly_account = row.configs.sf_monthly_account
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempparm = Object.assign({ id: this.temp_id }, this.temp)
            updateProductDeliverExtra(tempparm).then(res => {
              this.$notify({
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
          this.disabled_order_logistics_type_id = false
          this.temp = {
            description: undefined,
            order_logistics_type_id: undefined,
            configs: {
              sf_monthly_account: undefined,
              delivery_product_name: undefined
            }
          }
        }
      }
    },
    created() {
      this.getList()
      this.queryLogisticsTypeList()
    }
  }
</script>
