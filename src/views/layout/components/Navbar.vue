<template>
  <div class="navbar-warpper">
    <div class="navbar">
      <div class="gateway-name">
        <router-link to="/">
          <el-button type="text" class="name">{{project_name}}</el-button>
        </router-link>
      </div>
      <!--<hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>-->
      <!--<breadcrumb></breadcrumb>-->
      <el-dropdown class="realtime-container" v-if="$store.state.user.roles == 'support'">
      <!--<el-dropdown class="realtime-container" >-->
        <span class="el-dropdown-link" style="color: white">
          今日业绩
          <i class="el-dropdown-link-i" ref="RealTimeformance">0</i>
        </span>
          <span class="el-dropdown-link" style="color: white;margin-left: 5px">
          排名<i class="el-dropdown-link-i">{{ranking_number}}</i>
        </span>
          <el-dropdown-menu slot="dropdown">
            <router-link class="inlineBlock" to="/support/support_rating/achievement_rating">
              <el-dropdown-item>
                今日销售排名
              </el-dropdown-item>
            </router-link>
          </el-dropdown-menu>
      </el-dropdown>
      <theme-picker @change="pickTheme"/>
      <!--<el-popover style="margin-left: 20px;margin-right: 20px"-->
                  <!--placement="bottom"-->
                  <!--width="300"-->
                  <!--trigger="click">-->
        <!--<div id="message-box" >-->

        <!--</div>-->
        <!--<el-badge slot="reference" :value="(system_notice + important_notice)" :hidden="(system_notice + important_notice) === 0 ? true : false"  class="item">-->
          <!--<i class="el-icon-message" style="color: white"></i>-->
        <!--</el-badge>-->
      <!--</el-popover>-->
      <el-menu class="menu-box" text-color="#fff" background-color="#3f4650" mode="horizontal">
        <el-submenu index="1" class="messageNotification">
          <div slot="title">
            <el-badge :value="$store.getters.notice" :hidden="$store.getters.notice == 0"  class="item">
              <i class="el-icon-message"></i>
            </el-badge>
          </div>
          <div class="message-menu">
            <div v-for="item in noticeList" :key="item.id" class="notices">
              <a target="_blank" :href="$store.state.notice.home_noticedetails_url + '/' + item.id">
                <div style="width: 280px;overflow: hidden;text-overflow: ellipsis;white-space:nowrap;">
                  <span style="margin-right: 10px">[{{item.notice_type.type_name}}]</span>
                  <span>{{item.title}}</span>
                </div>
                <span>{{item.created_at}}</span>
              </a>
            </div>
            <a target="_blank" style="margin-top: 10px" :href="$store.state.notice.home_notice_url">
              查看更多
            </a>
          </div>
        </el-submenu>

        <el-submenu index="2" class="avatar-container">
          <img slot="title" style="cursor: pointer" class="user-img" :src="avatar">
          <div class="message-menu">
            <div class="user-dropdown-top">
              <router-link class="user-dropdown-top-a" to="/user_center/user_center/user_info">
                <img class="user-dropdown-user-img" :src="avatar">
                <span class="link-hover user-dropdown-user-name">{{$store.state.user.name}}</span>
              </router-link>
            </div>
            <router-link to="/user_center/user_center/integral_query" class="link-hover user-dropdown-item">
              <svg-icon icon-class="accumulate_points" class="svg_icon"/>
              积分:<span></span>
            </router-link>
            <router-link to="/user_center/user_center/user_info" class="link-hover user-dropdown-item">
              <svg-icon icon-class="account_setting" class="svg_icon"/>
              账户设置
            </router-link>
            <div class="user-dropdown-bottom">
              <span class="link-hover" @click="selectAccount">切换账号</span>
            </div>
            <div class="user-dropdown-bottom">
              <span @click="logout" class="logout">退出登录</span>
            </div>
          </div>
        </el-submenu>
      </el-menu>
      <!--<div class="logout-box">-->
        <!--<svg-icon class="svg_icon" icon-class="exit" />-->
      <!--</div>-->
    </div>
 </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { countUnreadNotice, getNoticeList } from '@/api/user'
import { getSupportRealTimePerformance } from '@/api/support_rating'
import { setTheme } from '@/utils/auth'
import { removeAccountToken } from '@/utils/auth'
import Breadcrumb from '@/components/Breadcrumb'
import themePicker from '@/components/themePicker'
import Hamburger from '@/components/Hamburger'
import bus from '@/views/layout/bus'
import CountUp from 'countup.js'

class titleWarn {
  constructor(){
    window.onblur = () => {
      this.isWindowFocus = false
    }
    window.onfocus = () => {
      this.isWindowFocus = true
      this.end()
    }
    this.defaultTitle = document.title
    this.handle = null
    this.runing = false
    this.isWindowFocus = true
  }
  start() {
    if ( this.runing) return
    document.title = '【新消息提醒】'
    this.runing = true
    this.handle = setInterval(() => {
      document.title = document.title == '【　　　　　】'? '【新消息提醒】': '【　　　　　】'
    },500)
  }
  end() {
    clearInterval(this.handle)
    this.runing = false
    document.title = this.defaultTitle
  }
}
(function (){
  console.log(window.Notification)
  if (window.Notification) {
    Notification.requestPermission()
  }
})()
export default {
  data() {
    return {
      project_name: process.env.PRO_NAME,
      showIcon: false,
      showName: false,
      performance: 0,
      oldPerformance: 0,
      curperformance: 0,
      ranking_number: '--',
      system_notice: 0,
      important_notice: 0,
      centerDialogVisible: false,
      themeDialogVisible: false,
      original_important_notice: 0,
      numAnim: null,
      noticeList: [],
      titleWarn: new titleWarn()
    }
  },
  components: {
    Breadcrumb,
    Hamburger,
    themePicker
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ]),
    opened() {
      return this.$store.state.app.sidebar.opened
    }
  },
  mounted() {
    bus.$on('upDateRealTimeRanking', () => {
      this.upDateRealTimeformance()
    })
  },
  created() {
    this.refreshMessage()
    this.getCount()
    this.getNoticeList()
    this.upDateRealTimeformance()
  },
  methods: {
    upDateRealTimeformance() {
      if (this.$store.state.user.roles === 'support') {
        getSupportRealTimePerformance().then(res => {
          if (res.data.performance !== this.oldPerformance) {
            this.numAnim = new CountUp(this.$refs.RealTimeformance, this.oldPerformance, res.data.performance)
            this.numAnim.start()
          }
          this.oldPerformance = res.data.performance
          if (res.data.ranking_number === 0) {
            this.ranking_number = '--'
          } else {
            this.ranking_number = res.data.ranking_number
          }
        })
      }
    },
    refreshMessage() {
      setInterval(() => {
        this.getCount()
        this.getNoticeList()
        this.upDateRealTimeformance()
      }, 60000)
    },
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$store.dispatch('FedLogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    },
    selectAccount() {
      removeAccountToken()
      location.reload() // 为了重新实例化vue-router对象 避免bug
    },
    handleChangeTheme() {
      this.themeDialogVisible = true
    },
    pickTheme(color) {
      setTheme(color)
      this.$store.commit('SET_THEME',color)
    },
    getNoticeList() {
      getNoticeList({ status: 0, page:1, page_size: 5 }).then(res => {
        this.noticeList = res.data.data
      })
    },
    getCount() {
      countUnreadNotice().then(res => {
        if (this.$store.getters.notice < res.data[0].number) {
          const number = res.data[0].number - this.$store.getters.notice
          let _this = this
          this.$notify.info({
            title: '系统通知',
            position: 'bottom-right',
            iconClass: "el-icon-bell",
            duration: 5000,
            dangerouslyUseHTMLString: true,
            message: `<div style="min-height: 80px;line-height: 80px;font-size: 18px">
              <span>你有${number}条<a target="_blank" href="${this.$store.state.notice.home_notice_url}" style="color: blue">新消息</a></span>
            </div>`,
            onClick: function() {
              this.close()
              _this.titleWarn.end()
            },
          });
          // title 提醒
          this.titleWarn.start()
          // Notifications 提醒
          if (window.Notification) {
            let data = {
              body: '你有新的系统通知',
              icon: 'https://storage-public.zhaopin.cn/CompanyLogo/20170320/C77AAA82F40D8AAB113C5CB99250E73F.jpg'
            }
            let notify = new Notification('来自 佰芝堂 的消息', data)
            notify.onshow = function() {
              setTimeout(() => {
                notify.close()
              },5000)
            }
            notify.onclick = () => {
              this.titleWarn.end()
              window.open(`${this.$store.state.notice.home_notice_url}`)
              notify.close();
            };
          }
        }
        this.$store.commit('SET_NOTICE', res.data[0].number)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../../../styles/variables.scss";

  .navbar-warpper {
    width: 100%;
    height: 40px;
    position: relative;
    .navbar {
      width: 100%;
      height: 40px;
      box-sizing: border-box;
      position: fixed;
      background-color: $nav-bg;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1002;
      /*.project-opened {*/
         /*width: 80px;*/
       /*}*/
      .home {
        width: 40px;
        height: 100%;
      }
      .gateway-name {
        padding-left: 40px;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        .name {
          color: $color-white;
          user-select:none;
          font-size: 16px;
          letter-spacing: 2px;
          white-space: nowrap;
        }
      }
      .menu-box {
        height: 100%;
        display: flex;
        align-items: stretch;
        justify-content: center;
        border: none;
        margin-left: 20px;
        background: transparent;
        /deep/ .el-submenu__icon-arrow {
          display: none;
        }
        /deep/ .el-submenu{
          margin: 0 10px;
        }
        /deep/ .el-submenu__title{
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          line-height: 100%;
          padding: 0;
          margin: 0;
          &:hover {
            background-color: $nav-bg!important;
          }
        }
        .svg_icon {
          color: $color-gray;
          &:hover {
            color: $color-white;
          }
        }
      }
      .logout-box {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        svg {
          color: white;
          cursor: pointer;
          font-size: 22px;
        }
      }
      .realtime-container{
        text-align: right;
        cursor: default;
        .el-dropdown-link-i {
          color: #E6A23c!important;
          font-size: 28px;
        }
      }
    }
  }
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }

  .messageNotification {
    i {
      font-size: 20px;
      color: $color-gray;
      &:hover {
        color: $color-white;
      }
    }
  }
  .avatar-container {
    .user-img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
    .el-icon-caret-bottom {
      position: absolute;
      right: -20px;
      top: 25px;
      font-size: 12px;
    }
    .avatar-wrapper {
      cursor: pointer;
      position: relative;
    }
  }
  .el-icon-star-on {
    color: #ffe600;
  }
  .el-title{
    .el-dialog__title{
      line-height: 24px;
      font-size: 33px !important;
      color: #303133;
    }
  }
  .message-menu {
    min-height: 60px;
    padding: 10px;
    margin: 0;
    font-size: $text-sm;
    background-color: $nav-bg;
    color: white;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    .notices {
      width: 300px;
      height: 40px;
      padding: 4px;
      margin-bottom: 2px;
      &:hover {
        background: #262c34;
      }
      a {
        display: block;
        height: 100%;
        cursor: pointer;
        display: flex;
        flex-flow: column nowrap;
        align-items: stretch;
        justify-content: space-between;
      }
    }
    .message-a {
      display: flex;
      justify-content: space-between;
      width: 100px;
      margin: 10px 0;
    }
    .message-icon {
      background:#f56c6c;
      border: 1px solid white;
      width: 20px;
      color: #fff;
      height: 20px;
      border-radius: 50%;
      line-height: 20px;
      text-align: center;
    }
    .user-dropdown-top {
      width: 100%;
      font-size: $text-sm;
      padding: 0 0 10px 0;
      border-bottom: 1px solid #9e9e9e;
      .user-dropdown-top-a {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
      }
      .user-dropdown-user-img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      .user-dropdown-user-name {
        padding: 0 4px;
        max-width: 140px;
        flex: 1;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space:nowrap;
      }
    }
    .user-dropdown-item {
      width: 100%;
      margin: 10px 0;
    }
    .user-dropdown-bottom {
      width: 100%;
      text-align: center;
      padding-top: 10px;
      border-top: 1px solid #9e9e9e;
      .logout {
        cursor: pointer;
        &:hover {
          transition: all .3s;
          color: red;
        }
      }
    }
  }


</style>

