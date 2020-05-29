<template>
  <div class="app-container calendar-list-container">
    <el-table :key='tableKey' :data="list" border fit highlight-current-row
              style="width: 100%" stripe>
      <el-table-column align="center" label="序号" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="缓存名称">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.redis_cache_name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" :loading="loading_button === scope.row.id" @click="handleUpdate(scope.row)">更新</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { updateDomainRedis, updateProductWeixinRedis, updateProductTemplateRedis, updatePromotionProductRedis, updateSupportScheduleRedis, updatePromotionProductExtraCodeTypeRedis } from '@/api/system_redis_setting'

import waves from '@/directive/waves' // 水波纹指令
import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css

export default {
  name: 'RedisSetting',
  components: { Multiselect },
  directives: {
    waves
  },
  data() {
    return {
      scrollTop: 0,
      loading_button: 0,
      tableKey: 0,
      list: [{
        id: 1,
        redis_cache_name: '域名'
      }, {
        id: 2,
        redis_cache_name: '网站'
      }, {
        id: 3,
        redis_cache_name: '网站模板'
      }, {
        id: 4,
        redis_cache_name: '微信'
      }, {
        id: 5,
        redis_cache_name: '客服排班'
      }, {
        id: 6,
        redis_cache_name: '推广附加代码类型'
      }]
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
  },
  methods: {
    handleUpdate(row) {
      const rowid = row.id
      this.loading_button = rowid
      if (rowid === 1) {
        updateDomainRedis({}).then(() => {

        })
      } else if (rowid === 2) {
        updatePromotionProductRedis({}).then(() => {

        })
      } else if (rowid === 3) {
        updateProductTemplateRedis({}).then(() => {

        })
      } else if (rowid === 4) {
        updateProductWeixinRedis({}).then(() => {

        })
      } else if (rowid === 5) {
        updateSupportScheduleRedis({}).then(() => {

        })
      } else if (rowid === 6) {
        updatePromotionProductExtraCodeTypeRedis({}).then(() => {

        })
      }
      setTimeout(() => {
        this.loading_button = 0
      }, 2000)
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
