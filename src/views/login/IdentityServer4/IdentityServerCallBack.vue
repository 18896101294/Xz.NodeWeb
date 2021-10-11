<template></template>

<script>
import Oidc from "oidc-client";
import { getUserModulesTree, getCaptcha } from '@/api/login';
import router from "@/router";
import { resetRouter, filterAsyncRouter, constantRoutes } from "@/router/index";
import { getToken, setToken, removeToken } from '@/utils/auth'

var config = {
  authority: "https://id4.xznode.club:12796",//"https://id4.xznode.club:12796",http://localhost:12796
  client_id: "XzNode.AdminWeb",
  redirect_uri: "https://xznode.club/#/IdentityServerCallBack?",
  // silent_redirect_uri:"http://xznode.club/#/IdentityServerRefreshToken",
  response_type: "token",
  scope: "xznodeapi",
  post_logout_redirect_uri: "https://xznode.club",
  accessTokenExpiringNotificationTime: 5,
  automaticSilentRenew: true,
  filterProtocolClaims: true
};
var mgr = new Oidc.UserManager(config);
mgr.events.addAccessTokenExpiring(function () {
  console.log("token expiring");
});

mgr.events.addAccessTokenExpired(function () {
  console.log("token expired");
});

mgr.events.addSilentRenewError(function (e) {
  console.log("silent renew error", e.message);
});

mgr.events.addUserLoaded(function (user) {
  console.log("user loaded", user);
  mgr.getUser().then(function(user){
    // util.cookies.set('accessToken', user.access_token)
    // util.cookies.set('refreshToken', user.refresh_token)
  });
});

mgr.events.addUserUnloaded(function (e) {
  console.log("user unloaded");
});

mgr.events.addUserSignedOut(function (e) {
  console.log("user addUserSignedOut");
});

export default {
   data() {
    return {
      accessToken:'',
      refreshToken:'',
      redirect: undefined,
      otherQuery: {},
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },

  mounted() {
    new Oidc.UserManager({ response_mode: "query" }).signinRedirectCallback().then(function () { }).catch(function (e) { });
    var that = this;
    mgr.getUser().then((user) => {
      // console.log(user);
      that.accessToken=user.access_token;
      // console.log(that.accessToken);
      that.refreshToken=user.refresh_token;
      // util.cookies.set('accessToken', user.access_token)
      // util.cookies.set('refreshToken', user.refresh_token)
      if(that.accessToken) {
        // that.$store.state.user.token = that.accessToken // 直接设置state 来设置vuex
        that.$store.commit('user/SET_TOKEN', that.accessToken) // 这是第二种设置vuex的方式
        // console.log(that.$store)
        setToken(that.accessToken)
        // return
        setTimeout(() => {
          window.localStorage.removeItem('setRouters')
          window.localStorage.removeItem('router')
          that.GetNavigationBar()
          that.$store.dispatch('user/getFunProperties', null) // 获取用户拥有的数据字段
          setTimeout(() => {
            that.$router.push({ path: that.redirect || '/', query: that.otherQuery })
          }, 1000);
        }, 1000);
      } else {
        console.log('error submit!!')
        alert('登录失败！')
        return false
      }
    });
  },
  methods: {
    // 获取路由树
    GetNavigationBar() {
      getUserModulesTree().then((res) => {
        let getRouter = res.data //后台拿到路由
        window.localStorage.router = JSON.stringify(getRouter)
        router.options.routes = []
        let setRouter = constantRoutes
        let changeRouter = filterAsyncRouter(getRouter) //过滤路由
        setRouter = setRouter.concat(changeRouter)
        window.localStorage.setRouters = JSON.stringify(setRouter)
        router.addRoutes(setRouter) //动态添加路由
        this.$router.replace(
          this.$route.query.redirect ? this.$route.query.redirect : "/"
        )
      })
    },

    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },

    CeShiRefreshToken:function() {
      console.log("测试CeShiRefreshToken");
      var that=this;
      var url = "http://localhost:12796/connect/token";
      let param = new URLSearchParams();
      param.append("client_id", 'XzNode.AdminWeb');
      param.append("client_secret", '');
      param.append("grant_type", 'refresh_token');
      param.append("refresh_token", that.refreshToken);
      that.axios({
        method: 'post',
        url: url,
        data: param,
        params: param,
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}//设置header信息
      }).then(function (response) {
        console.log(response);
        that.accessToken=response.access_token;
        that.refreshToken=response.refresh_token;
      }).catch(function (error) {
        console.log(error);
      });
    },
    CeShiApi:function() {
      console.log("测试API");
      var that=this;
        var params = {
        pagesize: 10,
        pageIndex: 1,
        searchName: '',
        searchPwd: ''
      };

      that.$axios({
        method: "post",
        url: "http://localhost:44375/api/User/GetUserList",
        data: params,
        // headers: {'Authorization': 'Bearer ' + that.accessToken}//设置header信息
      }).then(function (response) {
        console.log(response);
      }).catch(function (error) {
        console.log(error);
      });
    },
    SilentCallback:function() {
      new Oidc.UserManager().signinSilentCallback().then(function () {
        console.log("我自己更新了");
        mgr.getUser().then(function(user) {
          console.log(user);
        });
      }).catch(function (e) {
        console.log(e);
      });
    }
  },
}
</script>