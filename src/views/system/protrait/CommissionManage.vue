<template>
  <div class="app-container">
    <div style="margin-bottom: 10px;display: flex;align-items: center">
      <el-button type="danger" v-waves @click="handleBack" size="small">返回</el-button>
      <span style="flex: 1;text-align: center">{{productTableTitle}}--进度指标</span>
      <el-button type="primary" v-waves icon="el-icon-search" @click="handleFilter" size="small">搜索</el-button>
    </div>
    <!--产品指标列表-->
    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border>
      <el-table-column prop="specDetails" label="产品" min-width="300" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.product_name}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="originalPrice" label="指标性价比" align="center" min-width="150">
        <template slot-scope="scope">
          <span>{{scope.row.performance}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="actual_price" label="指标业绩" align="center" min-width="200">
        <template slot-scope="scope">
          <span>{{scope.row.achievement_start_money}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column prop="assemble_price" label="指标最高月业绩" align="center" min-width="200">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{scope.row.achievement_end_money}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column prop="operation" label="编辑" align="center" min-width="200">
        <template slot-scope="scope">
          <el-button v-if="scope.row.id" type="primary"　size="mini" @click="handleEditSet(scope.row)">提成设置</el-button>
          <el-button v-if="scope.row.id" type="warning"　size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-else type="success"　size="mini" @click="handleCreate(scope.row)">添加</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--产品编辑创建-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogProduct" width="60%">
      <el-form :rules="rule" ref="dateForm" :model="temp" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="指标性价比" label-width="20%" prop="performance">
          <el-input type="text" v-model="temp.performance"></el-input>
        </el-form-item>
        <el-form-item label="指标业绩" label-width="20%" prop="achievement_start_money">
          <el-input type="text" v-model="temp.achievement_start_money"></el-input>
        </el-form-item>
        <!--<el-form-item label="指标最高月业绩" label-width="20%" prop="achievement_end_money">-->
          <!--<el-input type="text" v-model="temp.achievement_end_money"></el-input>-->
        <!--</el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogProduct = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" :loading="btnLoading" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
    <!--弹出提成列表-->
    <el-dialog :title="royaltyTableTitle" :visible.sync="dialogRoyalty1" width="80%">
      <div class="filter-container">
        <div style="float: right;">
          <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter1" size="medium">搜索</el-button>
          <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate1" type="primary" icon="el-icon-edit" size="medium">添加</el-button>
        </div>
      </div>
      <template>
        <el-table :key='tableKey1' :data="list1" v-loading="listLoading1" element-loading-text="给我一点时间" border fit highlight-current-row
                  style="width: 100%" stripe>
          <el-table-column align="center" label="ID" min-width="100">
            <template slot-scope="scope">
              <span>{{scope.row.id}}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="500" align="center" label="月业绩区间">
            <template slot-scope="scope">
              <span>{{scope.row.profit_start_condition}}</span>~<span>{{scope.row.profit_end_condition}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="提成点" min-width="200">
            <template slot-scope="scope">
              <span>{{scope.row.profit}}</span>%
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="200" class-name="small-padding">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleUpdate1(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>
    <!--提成创建-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogRoyalty">
      <el-form :rules="rule1" ref="dataForm1" :model="temp1" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="月业绩区间" label-width="20%" prop="profit_start_condition">
          <el-input type="text" v-model="temp1.profit_start_condition" style="width: 45%;"></el-input>
          <span style="margin: 0 10px;"> ～</span>
          <el-input type="text" style="width: 45%;" v-model="temp1.profit_end_condition"></el-input>
        </el-form-item>
        <el-form-item label="提成点" label-width="20%" prop="profit">
          <el-input type="text" v-model="temp1.profit" style="width: 90%;"></el-input>
          <span style="margin-left: 10px;">%</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogRoyalty = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" :loading="btnLoading1" type="primary" @click="createData1">确 定</el-button>
        <el-button v-else type="primary" @click="updateData1">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { updateSupportProductProfitConfig, getSupportProductProfitConfigInfo, updateSupportProductAchievementConfig, createSupportProductAchievementConfig, getSupportProductAchievementConfigList, getSupportProductProfitConfigList, createSupportProductProfitConfig, getSupportProductAchievementConfigInfo } from '@/api/sales'
  import waves from '@/directive/waves' // 水波纹指令
  export default {
    name: 'CommissionManage',
    directives: {
      waves
    },
    data() {
      return {
        royaltyTableTitle: '',
        btnLoading: false,
        dialogProduct: false,
        rule: {
          performance: [{ required: true, message: '请正确填写指标性价比', trigger: 'change' }],
          achievement_start_money: [{ required: true, message: '请正确填写指标最低业绩', trigger: 'change' }]
          // achievement_end_money: [{ required: true, message: '请正确填写指标最高业绩', trigger: 'change' }]
        },
        temp: {
          performance: undefined,
          achievement_start_money: undefined,
          // achievement_end_money: undefined,
          support_product_achievement_config_id: undefined,
          support_level_id: undefined,
          product_id: undefined
        },
        tableKey: 0,
        list: [],
        listLoading: false,
        listQuery: {
          support_level_id: undefined,
          page: 1
        },
        productTableTitle: undefined,
        dialogRoyalty1: false,
        tableKey1: 0,
        list1: [],
        listLoading1: false,
        listQuery1: {
          page: 1,
          support_product_achievement_config_id: undefined,
          support_level_id: undefined,
          product_id: undefined
        },
        temp1: {
          profit_start_condition: undefined,
          profit_end_condition: undefined,
          profit: undefined,
          support_product_achievement_config_id: undefined,
          support_level_id: undefined,
          product_id: undefined
        },
        dialogStatus: '',
        textMap: {
          create: '创建',
          update: '编辑'
        },
        dialogRoyalty: false,
        rule1: {
          profit: [{ required: true, message: '请正确填写提成点', trigger: 'change' }],
          profit_start_condition: [{ required: true, message: '请正确填写月业绩区间', trigger: 'change' }]
        },
        btnLoading1: false
      }
    },
    created() {
      this.listQuery.support_level_id = this.$route.query.support_level_id
      this.productTableTitle = this.$route.query.productTableTitle
      this.getList()
    },
    activated() {
      this.listQuery.support_level_id = this.$route.query.support_level_id
      this.productTableTitle = this.$route.query.productTableTitle
      this.getList()
    },
    methods: {
      // 产品列表
      getList() {
        this.listLoading = true
        getSupportProductAchievementConfigList(this.listQuery).then(response => {
          this.list = response.data
          this.listLoading = false
        })
      },
      // 产品创建
      handleCreate(row) {
        this.dialogStatus = 'create'
        this.resetemp()
        this.temp.product_id = row.product_id
        this.dialogProduct = true
        this.$nextTick(() => {
          this.$refs['dateForm'].clearValidate()
        })
      },
      // 产品创建确定
      createData() {
        this.$refs['dateForm'].validate((valid) => {
          if (valid) {
            this.btnLoading = true
            this.temp.support_level_id = this.listQuery.support_level_id
            createSupportProductAchievementConfig(this.temp).then(response => {
              console.log(this.temp)
              this.dialogProduct = false
              this.getList()
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.btnLoading = false
            }).catch(() => {
              this.btnLoading = false
            })
          }
        })
      },
      // 打开产品编辑
      handleUpdate(row) {
        this.dialogStatus = 'update'
        this.dialogProduct = true
        this.support_product_achievement_config_id = row.id
        getSupportProductAchievementConfigInfo({ support_product_achievement_config_id: row.id }).then(response => {
          this.temp = response.data
          this.dialogProduct = true
          this.$nextTick(() => {
            this.$refs['dateForm'].clearValidate()
          })
        })
      },
      // 产品编辑确定
      updateData() {
        this.$refs['dateForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            tempData.support_product_achievement_config_id = this.support_product_achievement_config_id
            updateSupportProductAchievementConfig(tempData).then(response => {
              this.getList()
              this.dialogProduct = false
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
      // 产品列表筛选
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      // 产品清除
      resetemp() {
        this.temp = {
          performance: undefined,
          achievement_start_money: undefined,
          // achievement_end_money: undefined,
          support_product_achievement_config_id: undefined,
          support_level_id: undefined,
          product_id: undefined
        }
      },
      // 提成设置列表
      getListSet() {
        this.listLoading1 = true
        getSupportProductProfitConfigList(this.listQuery1).then(response => {
          this.list1 = response.data
          this.listLoading1 = false
        })
      },
      // 打开提成设置列表
      handleEditSet(row) {
        this.dialogRoyalty1 = true
        this.temp1.support_product_achievement_config_id = row.id
        this.temp1.support_level_id = this.listQuery.support_level_id
        this.temp1.product_id = row.product_id
        this.listQuery1.support_product_achievement_config_id = this.temp1.support_product_achievement_config_id
        this.listQuery1.support_level_id = this.temp1.support_level_id
        this.listQuery1.product_id = this.temp1.product_id
        this.royaltyTableTitle = this.productTableTitle + ' -- ' + row.product_name + ' -- 提成设置'
        this.getListSet()
      },
      // 提成创建
      handleCreate1() {
        this.temp1.profit_start_condition = undefined
        this.temp1.profit_end_condition = undefined
        this.temp1.profit = undefined
        this.dialogStatus = 'create'
        this.dialogRoyalty = true
        this.$nextTick(() => {
          this.$refs['dataForm1'].clearValidate()
        })
      },
      // 提成创建确定
      createData1() {
        this.$refs['dataForm1'].validate((valid) => {
          if (valid) {
            this.btnLoading1 = true
            createSupportProductProfitConfig(this.temp1).then(response => {
              this.getListSet()
              this.dialogRoyalty = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.btnLoading1 = false
            }).catch(() => {
              this.btnLoading1 = false
            })
          }
        })
      },
      // 打开提成编辑
      handleUpdate1(row) {
        this.dialogStatus = 'update'
        this.dialogRoyalty = true
        this.id = row.id
        getSupportProductProfitConfigInfo({ id: row.id }).then(response => {
          this.temp1 = response.data
          this.dialogRoyalty = true
          this.$nextTick(() => {
            this.$refs['dataForm1'].clearValidate()
          })
        })
      },
      // 提成编辑确定
      updateData1() {
        this.$refs['dataForm1'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp1)
            tempData.id = this.id
            updateSupportProductProfitConfig(tempData).then(response => {
              this.getListSet()
              this.dialogRoyalty = false
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
      // 提成清除
      resetTemp1() {
        this.temp1 = {
          profit_start_condition: undefined,
          profit_end_condition: undefined,
          profit: undefined,
          support_product_achievement_config_id: undefined,
          support_level_id: undefined,
          product_id: undefined
        }
      },
      // 提成列表删选
      handleFilter1() {
        this.listQuery1.page = 1
        this.getListSet()
      },
      // 返回上一页
      handleBack() {
        this.$router.back()
      }
    }
  }
</script>

<style scoped>

</style>
