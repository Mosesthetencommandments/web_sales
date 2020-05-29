<template>
  <div class="app-container calendar-list-container">
    <el-form ref="innerDataForm3" label-position="left" label-width="130px" style='width: 400px; margin-left:50px;display:inline-block;'>
      <el-form-item v-for="item in FormData" :label="item.title" :key="item.id" prop="FormData.key_name" >
        <el-row>
          <el-col :span="20"><el-input  v-model="item.key_value"></el-input></el-col>
          <el-col :span="4"><el-button style="margin-left: 5px;" type="primary" v-waves @click="updateInput(item.id)">更改</el-button></el-col>
        </el-row>
      </el-form-item>
    </el-form>

  </div>
</template>
<script>
import { getSystemGlobalSettingList, updateSystemGlobalSetting } from '@/api/system_global_setting'
import waves from '@/directive/waves' // 水波纹指令
import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css

export default {
  name: 'globalSetting',
  components: { Multiselect },
  directives: {
    waves
  },
  data() {
    return {
      scrollTop: 0,
      temp: {
        id: undefined,
        title: '',
        key_name: '',
        key_value: ''
      },
      FormData: [],
      title: '',
      rules: {
        domain_name: [{ required: true, message: '请正确填写域名名称', trigger: 'change' }]
      }
    }
  },
  filters: {
  },
  created() {
    this.getGlobalSettingList()
  },
  methods: {
    getGlobalSettingList() {
      getSystemGlobalSettingList(this.temp).then(response => {
        this.FormData = response.data
      })
    },
    updateInput(id) {
      const tempData = {}
      for (const v of this.FormData) {
        if (v.id === id) {
          tempData.key_name = v.key_name
          tempData.key_value = v.key_value
        }
      }
      updateSystemGlobalSetting(tempData).then(response => {
        this.$notify({
          title: '成功',
          message: '更改成功',
          type: 'success',
          duration: 2000
        })
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
