<template>
  <div class="app-container calendar-list-container">
    <el-card style="width: 600px;">
      <div slot="header" class="clearfix">
        <el-select
          @change='handleFilter'
          filterable
          placeholder="选择类型"
          class="filter-item"
          style="width:200px"
          remote
          :remote-method="getTagTypeList"
          :loading="typeLoading"
          v-model="listQuery.tag_type_code">
          <el-option v-for="item in typeOptions" :key="item.id" :label="item.type_name" :value="item.type_code">
          </el-option>
        </el-select>
        <el-button style="float: right;" type="primary" @click="append(' ')" >新建根标签</el-button>
      </div>
      <el-tree
        :data="data"
        :props="defaultProps"
        node-key="id"
        style="width: 100%"
        @node-drop="handleDrop"
        default-expand-all
        draggable>
        <span class="custom-tree-node" slot-scope="{ node, data }" >
          <span>{{ node.label }}</span>
          <span style="position: absolute;right: 0;top: 0;">
            <el-button
              size="mini"
              type="success"
              style="font-size: 12px;text-align: right;"
              @click.stop="() => append(data)">
              添加内容
            </el-button>
            <el-button
              size="mini"
              style="font-size: 12px;text-align: right;"
              @click.stop="() => edit(node, data)">
              <i class="el-icon-edit"></i>
            </el-button>
            <el-button
              size="mini"
              type="danger"
              style="font-size: 12px;text-align: right;"
              @click.stop="() => deleteTag(data)">
              <i class="el-icon-delete"></i>
            </el-button>
          </span>
        </span>
      </el-tree>
    </el-card>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="innerDataForm1" :model="temp" label-position="left" label-width="80px" style='width: 80%; margin-left:10%;'>
        <el-form-item label="标签名称" prop="auth_name">
          <el-input v-model="temp.tag_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData(currentData)">确 定</el-button>
        <el-button v-else type="primary" @click="updataData(currentData)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getTagTree, getTagTypeList, createTag, updateTag, deleteTag } from '@/api/tag'
  export default {
    data() {
      return {
        listLoading: true,
        dialogFormVisible: false,
        currentData: {},
        data: [],
        typeOptions: [],
        typeLoading: false,
        menunode: undefined,
        listQuery: {
          sort: '+id',
          tag_type_code: undefined,
          is_customized: 0
        },
        temp: {
          tag_id: undefined,
          tag_name: '',
          tag_type_id: undefined,
          pid: undefined,
          is_customized: 0
        },
        defaultProps: {
          children: 'child',
          label: 'tag_name'
        },
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        dragtemp: {
          pid: undefined,
          tag_id: undefined
        },
        draggingNodelist: []
      }
    },
    created() {
      this.getTagTypeList()
    },
    methods: {
      handleFilter() {
        for (const v in this.typeOptions) {
          if (this.typeOptions[v].type_code === this.listQuery.tag_type_code) {
            this.temp.tag_type_id = this.typeOptions[v].id
          }
        }
        if (this.listQuery.tag_type_code) {
          this.getTagTree()
        }
      },
      getTagTree() {
        getTagTree(this.listQuery).then(response => {
          response.data.forEach(item => {
            this.traverseTree(item)
          })
          this.data = response.data
        })
      },
      traverseTree(node) {
        if (node.child && node.child.length > 0) {
          for (let i = 0; i < node.child.length; i++) {
            this.traverseTree(node.child[i])
          }
        } else {
          delete node.child
        }
      },
      mouseenter() {
        console.log('1')
      },
      getTagTypeList(query) {
        getTagTypeList({ type_name: query }).then(response => {
          this.typeOptions = response.data.data
        })
      },
      deleteTag(data) {
        this.$confirm('此操作将永久删除该标签, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const ttempData = {
            tag_id: data.id
          }
          deleteTag(ttempData).then(res => {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.getTagTree()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      edit(node, data) {
        this.menunode = node
        this.temp = JSON.parse(JSON.stringify(data))
        this.temp.tag_id = data.id
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.currentData = data
      },
      updataData(data) {
        const tempData = this.temp
        tempData.tag_id = data.id
        updateTag(tempData).then(res => {
          this.getTagTree()
          this.dialogFormVisible = false
        })
      },
      append(data) {
        this.temp.tag_name = undefined
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.currentData = data
      },
      createData(data) {
        if (data === ' ') {
          this.temp.pid = 0
        } else {
          this.temp.pid = data.id
        }
        createTag(this.temp).then(response => {
          // const newChild = { id: response.data.id, tag_name: this.temp.tag_name, tag_type_id: this.temp.id, child: [] }
          // if (data === ' ') {
          //   this.data.push(newChild)
          //   this.dialogFormVisible = false
          // } else {
          //   if (!data.child) {
          //     this.$set(data, 'child', [])
          //   }
          //   data.child.push(newChild)
          // }
          this.dialogFormVisible = false
          this.getTagTree()
        })
      },
      handleDrop(draggingNode, dropNode, dropType, ev) {
        this.dragtemp.tag_id = draggingNode.data.id
        if (dropType === 'inner') {
          this.dragtemp.pid = dropNode.data.id
        } else if (dropNode.data.pid === 0) {
          this.dragtemp.pid = 0
        } else {
          this.dragtemp.pid = dropNode.data.pid
        }
        updateTag(this.dragtemp).then(response => {
          draggingNode.data.pid = response.data.pid
        })
      }
    }
  }
</script>

<style scoped>
  .el-tree >>> .el-tree-node__content{
    position: relative;
    height: 32px;
  }
  .el-tree .el-button {
    height: 26px;
    margin-top: 3px;
    padding: 0 6px;
  }
  .el-tree >>> .el-tree-node__content:hover {
    background-color: rgba(205, 213, 230, 0.59);
  }
  .el-tree >>> .el-tree-node__expand-icon {
    color: black;
  }
  .el-tree >>> .is-leaf {
    color: transparent;
  }
</style>
