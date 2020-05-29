<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-select @change='handleFilter'-->
                 <!--@focus="getProductList(' ')"-->
                 <!--class="filter-item"-->
                 <!--style="width: 200px"-->
                 <!--clearable-->
                 <!--v-model="listQuery.product_id"-->
                 <!--placeholder="产品">-->
        <!--<el-option v-for="item in productOptions" :key="item.id" :label="item.product_name" :value="item.id">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <div class="filter-float">
        <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter" size="small">搜索</el-button>
        <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit" size="small">添加</el-button>
      </div>
    </div>
    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%" stripe>
      <el-table-column align="center" label="ID" min-width="100">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="300" align="center" label="等级名称">
        <template slot-scope="scope">
          <span>{{scope.row.level_name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="status-col" label="开启状态" min-width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.level_status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="2"
            @change="handleSwitch(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="handleProductIndicators(scope.row)">产品指标</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--编辑-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogCreate" width="60%">
      <el-form :rules="rule" ref="dateForm" :model="temp" label-position="left" label-width="20%" style='width: 80%; margin-left:10%;'>
        <el-form-item label="等级名称" label-width="20%" prop="level_name">
          <el-input type="text" v-model="temp.level_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCreate = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" :loading="btnLoading" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getSupportLevelList, createSupportLevel, updateSupportLevel, getSupportLevelInfo } from '@/api/sales'
  import waves from '@/directive/waves' // 水波纹指令
  export default {
    name: 'salesLevelManage',
    directives: {
      waves
    },
    data() {
      return {
        dialogRoyalty1: false,
        rule: {
          level_name: [{ required: true, message: '请正确填写等级名称', trigger: 'change' }]
        },
        btnLoading: false,
        dialogStatus: '',
        dialogCreate: false,
        textMap: {
          create: '创建',
          update: '编辑'
        },
        tableKey: 0,
        listLoading: false,
        list: [],
        total: null,
        listQuery: {
          page: 1,
          page_size: 10
        },
        dialogProductIndicators: false,
        temp: {
          level_name: undefined
        },
        productTableTitle: ''
      }
    },
    created() {
      this.getList()
    },
    activated() {
      // this.dialogProductIndicators = true
    },
    methods: {
      getList() {
        this.listLoading = true
        getSupportLevelList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      handleSwitch(row) {
        updateSupportLevel({ level_id: row.id, level_status: row.level_status }).then(res => {
          this.$message.success('修改成功')
        })
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.dialogCreate = true
        this.resetemp()
        this.$nextTick(() => {
          this.$refs['dateForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dateForm'].validate((valid) => {
          if (valid) {
            this.btnLoading = true
            createSupportLevel(this.temp).then(response => {
              this.getList()
              this.dialogCreate = false
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
      handleUpdate(row) {
        this.dialogStatus = 'update'
        this.dialogCreate = true
        this.level_id = row.id
        getSupportLevelInfo({ level_id: row.id }).then(response => {
          this.temp = response.data
          this.dialogCreate = true
          this.$nextTick(() => {
            this.$refs['dateForm'].clearValidate()
          })
        })
      },
      updateData() {
        this.$refs['dateForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            tempData.level_id = this.level_id
            updateSupportLevel(tempData).then(response => {
              this.getList()
              this.dialogCreate = false
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
      resetemp() {
        this.temp = {
          level_name: undefined
        }
      },
      // 产品指标
      handleProductIndicators(row) {
        this.$router.push({
          path: 'CommissionManage',
          query: {
            support_level_id: row.id,
            productTableTitle: row.level_name
          }
        })
      }
    }
  }
</script>

<style scoped>
  .el-dialog {
    width: 80%!important;
  }
</style>
