<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <error-log class="errLog-container right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip :content="$t('navbar.size')" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <lang-select class="right-menu-item hover-effect" />

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/profile/index">
            <el-dropdown-item>
              {{ $t('navbar.profile') }}
            </el-dropdown-item>
          </router-link>
          <router-link to="/">
            <el-dropdown-item>
              {{ $t('navbar.dashboard') }}
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="https://github.com/18896101294">
            <el-dropdown-item>
              {{ $t('navbar.github') }}
            </el-dropdown-item>
          </a>
          <a target="_blank" href="http://xznode.club:8700">
            <el-dropdown-item>
              {{ $t('navbar.consulUrl') }}
            </el-dropdown-item>
          </a>
          <!-- <a target="_blank" href="https://github.com/18896101294/Xz.NodeWeb">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a> -->
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">{{ $t('navbar.logOut') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import LangSelect from '@/components/LangSelect'
import Search from '@/components/HeaderSearch'
import { resetRouter } from "@/router/index";
import * as signalR from "@aspnet/signalr";
import {map as pMap} from 'bluebird';
import {fromEvent, Observable} from "rxjs";

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    LangSelect,
    Search
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      'account',
    ])
  },

  appHub: '',

  created() {
    // this.openSystemNotify()
    this.init();
    console.log('**********subscribe**********');
    if (this.appHub) {
      this.resetEvent()
    }
    // this.userService.userChange.subscribe(name => {
    //   if (name) {
    //     this.GetBdcMessageIp().then((setCode) => {
    //       console.log('用户登录', name, setCode)
    //       this.hubBdc.setCode = setCode;
    //       this.hubBdc.hub.stop();
    //       console.log(this.hubBdc.hub)
    //     });
    //   }
    // });
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      resetRouter()
      await this.$store.dispatch('user/logout')
      window.localStorage.removeItem('setRouters')
      window.localStorage.removeItem('router')
      this.$router.push(`/login`)
      // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    openSystemNotify() {
      this.$notify({
        title: '系统即将更新提醒',
        message: '<font style="color: #f37b1d;">系统将在20点23分后进行停机维护，请提前保存当前工作内容！预计停机10分钟！</font>',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        duration: 0
      });
    },

    init() {
      try {
        console.log('hub-init')
        this.appHub =  {
          name: 'hub',
          signalRUrl: 'https://admin52788.xznode.club:52600',//http://localhost:52600 https://admin52788.xznode.club:52600
          hub: null,
          setCode: 'adminApi',
          source: Object.assign({
            GetHubTime: '',// 推送时间
          })
        }
        //连接初始化 signalR
        this.appHub.hub = this.createConnect(this.appHub.signalRUrl);
        this.appHub.serverTimeoutInMilliseconds =  5000;
        this.appHub.hub.onclose((err) => {
          this.oncloseEvent(err, this.appHub)
        });
        this.connection(this.appHub);
      } catch (e) {
        console.log(e)
      }
    },
    
    createConnect(signalRUrl = '') {
      let hub = new signalR.HubConnectionBuilder().withUrl(signalRUrl + '/hubs?clientProtocol=2.0').build();
      return hub;
    },

    oncloseEvent(err, item) {
      console.log('连接断开-开始重启', err, item)
      this.onlineStatus = false;
      this.connection(item).then(() => {
        console.log('连接成功', item.hub.status)
        this.resetEvent()
      }).catch(e => {
        console.log('连接失败-重试', item.hub.status)
      })
    },

    connection(item) {
      // 如果加入点为空，就不开始连接
      return item.hub.start()
        .then(async () => {
          if (item.setCode instanceof Array && size(item.setCode)) {
            await pMap(item.setCode, async (setCode) => {
              console.log('setCode', setCode)
              await item.hub.invoke('AddToGroup', setCode);
            })
          }
          await pMap(Object.keys(item.source), eventName => {
            console.log('**********setCode**********', eventName)
            item.source[eventName] = fromEvent(item.hub, eventName);
          });
          return Promise.resolve('success');
      })
      .catch(e => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log('**********setCode**********', 'setTimeout 5000');
            this.connection(item).then(resolve).catch(reject);
          }, 5000)
        })
      });
    },

    resetEvent() {
      this.onlineStatusEvent();
      this.noticeEvent();
    },
    
    // 在线状态推送
    onlineStatusEvent() {
      this.appHub.hub.on("GetHubTime", function(message) {
        // console.log(message);
      });
    },

    // 系统通知推送
    noticeEvent() {
      console.log(this.account)
      this.appHub.hub.on("SendUserNotice_" + this.account, function(message) {
        console.log(message)
      })
    }

  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
