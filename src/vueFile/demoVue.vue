<!--
 * @Author: 王宏伟
 * @Email: wanghongwei@hualala.com
 * @Date: 2021-05-06 10:53:45
 * @Description:跳房子首页
 * @FilePath: /mis-h5-fe/src/views/home/index.vue
-->
<template>
    <div class="pg-home">
      <div class="tab-conent">
        <McpTabIndex
          v-show="active==='index'"
          v-if="init.includes('index')"
        />
        <McpTabApply
          v-if="init.includes('apply')"
          v-show="active==='apply'"
        />
        <McpTabContact
          v-if="init.includes('contact')"
          v-show="active==='contact'"
        />
        <McpTabMine
          v-if="init.includes('mine')"
          v-show="active==='mine'"
          :is-exists-new-update="updateInfo.isExistsNewUpdate"
          @update="showUpdate"
        />
      </div>
      <van-tabbar
        v-model="active"
        class="safe-bottom"
        :before-change="tabBeforeChange"
        :fixed="false"
        @change="tabChange"
      >
        <van-tabbar-item
          v-if="showHome"
          name="index"
          :icon="active==='index'?'wap-home':'wap-home-o'"
        >
          首页
        </van-tabbar-item>
        <van-tabbar-item
          name="apply"
        >
          应用
          <template #icon="props">
            <i :class="['iconfont', props.active ?'icon-yingyong2':'icon-yingyong1']" />
          </template>
        </van-tabbar-item>
        <van-tabbar-item
          name="message"
          :badge="im.num"
          :badge-props="{max:99,showZero:false}"
          :icon="active==='message'?'chat':'chat-o'"
        >
          消息
        </van-tabbar-item>
        <van-tabbar-item
          name="contact"
          :icon="active==='contact'?'friends':'friends-o'"
        >
          通信录
        </van-tabbar-item>
        <van-tabbar-item
          :badge="updateInfo.isExistsNewUpdate==='1'?1:''"
          name="mine"
          :icon="active==='mine'?'manager':'manager-o'"
          class="mine"
        >
          我
        </van-tabbar-item>
      </van-tabbar>
      <!-- 更新弹窗-->
      <van-popup
        v-model:show="isUpdateShow"
        :close-on-click-overlay="false"
        class="popup-update"
      >
        <div class="title">
          版本更新<span>{{ updateInfo.versionNo }}</span>
          <van-icon
            v-if="updateInfo.isMustUpdate !== '1'"
            name="cross"
            @click="updateClose"
          />
        </div>
        <div class="content">
          <p
            v-for="(item,index) of updateInfo.updateRemarkArray"
            :key="index"
          >
            {{ item }}
          </p>
        </div>
        <div class="bottom">
          <van-button
            block
            type="primary"
            @click="download"
          >
            前往更新
          </van-button>
        </div>
      </van-popup>
    </div>
  </template>
  
  <script>
  import McpTabIndex from './mcp/tab-index.vue'
  import McpTabApply from './mcp/tab-apply.vue'
  import McpTabContact from './mcp/tab-contact.vue'
  import McpTabMine from './mcp/tab-mine.vue'
  
  export default {
    components: {
      McpTabIndex, // 首页
      McpTabApply, // 应用
      McpTabContact, // 通信录
      McpTabMine, // 我
    },
    data () {
      return{
        active: '', // 当前激活tab的name值
        init: [], // 已初始话的tab列表
        showHome: this.$utils.checkAuth('basicSetting.jibenshezhi.appIndex'),
        isUpdateShow: false,
        updateInfo: { }, // 版本更新信息
        hasShown: false, // 是否展示过版本信息
        im: { // im消息
          num: 0, // im消息数量
          list: [], // im消息列表
          id: '', // im用户ID
          teams: {}, // im的群组teams
        },
        versionNo: this.$route.query.versionNo || this.$store.state.user.basicInfo.appVersion, // 版本号，后者主要用于直接访问h5
      }
    },
  
    created () {
      this.active = this.showHome ? 'index' : 'apply'
      this.init = [ this.active ]
      this.checkVersionUpdate()
      this.$utils.postMessage({
        type: 'eventAdd',
        key: this.$events.updateIM,
        windowName: 'homeIndex',
      })
      this.$utils.onMessage({
        func: this.rnToH5,
        windowName: 'homeIndex',
      })
      // window.localStorage.setItem('version', '')
    },
    methods: {
      // 接收返回的信息
      rnToH5 (data) {
        console.log('接收返回的信息')
        console.log(data)
        if(data.key === this.$events.updateIM) {
          this.im = data.params
        }
      },
      // 获取版本更新
      checkVersionUpdate () {
        this.$ajax.common.checkVersionUpdate({
          clientType: this.$utils.deviceType.ios ? '8889' : '8888', //  iOS: 8889，安卓: 8888
          versionNo: this.versionNo,
          currentOrgId: this.$store.state.user.basicInfo.orgID,
        }).then(res => {
          if(res.data && res.data.records && res.data.records.length > 0) {
            res.data.records[0].updateRemarkArray = res.data.records[0].updateRemark ? res.data.records[0].updateRemark.split('\n').filter(item => item.length > 0) : []
            this.updateInfo = res.data.records[0]
            const versionPrev = window.localStorage.getItem('version') // 上一次关闭过的版本区间
            const versionCurrent = `${ this.versionNo }-${ this.updateInfo.versionNo }` // 这一次更新的版本区间
            this.hasShown = versionPrev === versionCurrent // 是否展示过版本信息，非强制更新使用
            this.isUpdateShow = this.updateInfo.isExistsNewUpdate === '1' && (this.updateInfo.isMustUpdate === '1' || !this.hasShown)// 有更新，并且是强更或者没展示过版本信息
          }
        })
      },
      // tab切换标签前的回调函数
      tabBeforeChange (val) {
        if(val === 'message') {
          return this.$utils.postMessage({
            type: 'route',
            path: 'Session',
          })
        }
        // if(val === 'contact') {
        //   return this.$utils.postMessage({
        //     type: 'route',
        //     path: 'Contact',
        //   })
        // }
        return true
      },
      // tab切换
      tabChange (val) {
        if(!this.init.includes(val)) {
          this.init.push(val)
        }
        this.active = val
      },
      // 更新弹窗关闭
      updateClose () {
        let version = `${ this.$store.state.user.basicInfo.appVersion }-${ this.updateInfo.versionNo }`
        window.localStorage.setItem('version', version)
        this.isUpdateShow = false
      },
      // 更新弹窗展示
      showUpdate () {
        this.isUpdateShow = true
      },
      // 下载安装包
      download () {
        this.$utils.postMessage({
          type: 'downloadUpdate',
          val: this.updateInfo.downloadUrl,
        })
      },
    },
  }
  </script>
  <style lang="scss">
  .pg-home {
    .tab-conent {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
  
      >div {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
      }
    }
  
    .van-tabbar {
      .iconfont {
        font-size: 22px;
      }
  
      .mine {
        .van-badge {
          width: 10px;
          min-width: 10px;
          height: 10px;
          padding: 0;
          text-indent: -9999px;
        }
      }
    }
  
    .popup-update {
      z-index: 9999 !important;
      width: 90%;
      border-radius: 10px;
  
      .van-popup__close-icon {
        color: $T-C-F;
      }
  
      .title {
        position: relative;
        margin-bottom: 10px;
        font-size: 16px;
        line-height: 50px;
        color: $T-C-F;
        text-align: center;
        background: $T-C-E url('https://tiaofangzi.oss-cn-beijing.aliyuncs.com/app/prd/20220606/home-bg.png') no-repeat;
        background-size: 100% auto;
  
        span {
          padding-left: 10px;
        }
  
        .van-icon {
          position: absolute;
          top: 50%;
          right: 10px;
          font-size: 22px;
          transform: translateY(-50%);
        }
      }
  
      .content {
        min-height: 20vh;
        max-height: 60vh;
        padding: 0 10px;
        overflow-x: hidden;
        overflow-y: auto;
  
        p {
          padding: 3px 0;
        }
      }
  
      .bottom {
        padding: 10px;
      }
    }
  }
  </style>