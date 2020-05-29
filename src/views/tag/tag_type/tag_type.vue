<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-button  type="primary" @click="handleCreate">添加标签类型</el-button>
    </div>
    <el-table :stripe="true" :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
              style="width: 100%">
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="名称">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.type_name}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="标签类code">
        <template slot-scope="scope">
          <span >{{scope.row.type_code}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span >{{scope.row.created_at}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="120">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="80px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="类名称" prop="type_name">
          <el-input v-model="temp.type_name"></el-input>
        </el-form-item>
        <el-form-item label="类code" prop="type_code">
          <el-input v-model="temp.type_code"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData()">确 定</el-button>
        <el-button v-else type="primary" @click="updataData()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getTagTypeList, createTagType, updateTagType } from '@/api/tag'
  export default {
    data() {
      return {
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        dialogFormVisible: false,
        listQuery: {
          page: 1,
          page_size: 20,
          is_used: undefined,
          sort: '-id'
        },
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        temp: {
          type_name: '',
          type_code: ''
        }
      }
    },
    created() {
      this.getTagTypeList()
    },
    methods: {
      getTagTypeList() {
        this.listLoading = true
        getTagTypeList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.total
          this.listLoading = false
        })
      },
      resetTemp() {
        this.temp = {
          type_name: '',
          type_code: ''
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
            createTagType(this.temp).then(response => {
              this.total++
              this.temp = response.data
              this.list.unshift(this.temp)
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
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updataData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            tempData.tag_type_id = this.temp.id
            updateTagType(tempData).then(() => {
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
      }
    }
  }
</script>
