<template>
  <div class="login-container" id="elecData_father">
    <vue-canvas-nest :config="{ color: '255,255,255', opacity: 1, zIndex: 2, count: 150, }" :el="'#elecData_father'" ></vue-canvas-nest>
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">
      <div class="title-container">
        <h3 class="title">
          {{ $t('login.title') }}
        </h3>
        <lang-select class="set-language" />
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          :placeholder="$t('login.username')"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            :placeholder="$t('login.password')"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-form-item prop="code">
        <div style="display:flex">
          <span class="svg-container">
            <svg-icon icon-class="icon" />
          </span>
          <el-input
            ref="code"
            placeholder="验证码"
            name="code"
            v-model="loginForm.code"
            type="text"
            tabindex="3"
            autocomplete="on"
          >
          </el-input>
          <img style="higth:auto;padding: 10px 10px 10px 10px;" :src="imgData" @click="getCaptcha">
        </div>
      </el-form-item>

      <div v-if="isIdentityServer4" style="display:flex;margin-bottom: 22px;color: #8799a3;font-size: small;align-items: center;">
        <span>当前服务器启用了IdentityServer4认证</span>
        <el-link style="color: #1890ff;margin-left: 5px" @click="identityServerClick">>>这里登录<i class="el-icon-mouse el-icon--right"></i></el-link>
      </div>

      <!-- <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;background-color: #1890ff;" @click.native.prevent="handleLogin">
        {{ $t('login.logIn') }}
      </el-button> -->

      <el-button id="TencentCaptcha" data-appid="2043018754" data-cbfn="callbackName" data-biz-state="data-biz-state"
        :loading="loading" type="primary" style="width:100%;margin-bottom:30px;background-color: #1890ff;">
        {{ $t('login.logIn') }}
      </el-button>
      <remote-js></remote-js>

      <div style="position:relative">
        <!-- <div class="tips">
          <span>{{ $t('login.username') }} : admin</span>
          <span>{{ $t('login.password') }} : {{ $t('login.any') }}</span>
        </div>
        <div class="tips">
          <span style="margin-right:18px;">
            {{ $t('login.username') }} : editor
          </span>
          <span>{{ $t('login.password') }} : {{ $t('login.any') }}</span>
        </div> -->

        <!-- <el-button class="thirdparty-button" type="primary" @click="showDialog=true">
          {{ $t('login.thirdparty') }}
        </el-button> -->
      </div>
    </el-form>

    <el-dialog :title="$t('login.thirdparty')" :visible.sync="showDialog">
      {{ $t('login.thirdpartyTips') }}
      <br>
      <br>
      <br>
      <social-sign />
    </el-dialog>
  </div>
</template>

<script src="https://ssl.captcha.qq.com/TCaptcha.js"></script>
<script>
import { validUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import SocialSign from './components/SocialSignin'
import { getUserModulesTree, getCaptcha, id4LoginWay } from '@/api/login';
import router from "@/router";
import { resetRouter, filterAsyncRouter, constantRoutes } from "@/router/index";
import axios from 'axios/index'
import vueCanvasNest from 'vue-canvas-nest'
import { encrypt, decrypt } from "@/utils/cryptoJS-helper"
import Oidc from "oidc-client";

var config = {
  authority: "https://id4.xznode.club:12796",//"https://id4.xznode.club:12796",http://localhost:12796
  client_id: "XzNode.AdminWeb",
  // redirect_uri: "https://xznode.club/#/IdentityServerCallBack?",
  redirect_uri: "http://192.168.1.111/#/IdentityServerCallBack?",
  // silent_redirect_uri:"http://xznode.club/#/IdentityServerRefreshToken",
  response_type: "token",
  scope: "xznodeapi",
  post_logout_redirect_uri: "https://xznode.club"
};
var mgr = new Oidc.UserManager(config);
export default {
  name: 'Login',
  components: { LangSelect, SocialSign, vueCanvasNest,
    // 这里是引用外部js
    'remote-js': {
      render(createElement) {
        return createElement(
          'script',{
            attrs: {
              type: 'text/javascript',
              src: 'https://ssl.captcha.qq.com/TCaptcha.js',
            },
          }
        )
      }
    }
  },
  data() {
    const validateUsername = (rule, value, callback) => {
      // if (!validUsername(value)) {
      if (value.length == 0) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (value.toLowerCase() != this.code.toLowerCase()) {
        callback(new Error('验证码错误'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        code: '',
        // 防水墙相关字段
        randstr: '',
        ticket: '',
      },
      isEncryption: false,
      isIdentityServer4: true,
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      imgData: '',
      code: ''
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
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    this.id4LoginWay()
    this.getCaptcha()
    // 接入腾讯防水墙，绑定Window回调事件
    let that = this
    window.callbackName = function (res) {
      console.log('callback:', res)
      if (res.ret === 1) {// 验证失败
        console.log('captcha error!!')
        return
      }
      if (res.ret === 0) {//验证成功
        that.loginForm.randstr  = res.randstr
        that.loginForm.ticket  = res.ticket
        that.handleLogin()
      }
    }
    
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          let newPassword = this.loginForm.password
          if(!this.isEncryption) {
            // 加密
            newPassword = encrypt(this.loginForm.password)
            // 解密
            //let originalPwd = decrypt(pwd, this.encryptKey)
          }
          let loginData = {
            username: this.loginForm.username,
            password: newPassword,
            code: this.loginForm.code,
            randstr: this.loginForm.randstr,
            ticket: this.loginForm.ticket
          }
          this.loading = true
          this.$store.dispatch('user/login', loginData)
            .then(() => {
              window.localStorage.removeItem('setRouters')
              window.localStorage.removeItem('router')
              this.GetNavigationBar()
              this.$store.dispatch('user/getFunProperties', null) // 获取用户拥有的数据字段
              setTimeout(() => {
                this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
                this.loading = false
              }, 1000);
            })
            .catch(() => {
              this.loading = false
              this.loginForm.password = ''
              this.loginForm.code = ''
              this.getCaptcha()
            })
        } else {
          console.log('error submit!!')
          return false
        }
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

    // 获取验证码
    getCaptcha() {
      getCaptcha().then((res) => {
        this.imgData = 'data:image/png;base64,' + res.data.imgData
        this.code = res.data.code
      })
    },

    // 获取当前系统是否启用Id4登录方式
    id4LoginWay() {
      id4LoginWay().then((res) => {
        this.isIdentityServer4 = res.data
      })
    },
  
    // identityServer4 登录
    identityServerClick() {
      mgr.signinRedirect();
    },

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
        // if (this.checked) {
        //   let data = {
        //     account: _this.ruleForm2.account,
        //     checkPass: _this.ruleForm2.checkPass,
        //     checked: _this.checked,
        //   }
        //   localStorage.setItem(
        //     "remember",
        //     Base64.encode(JSON.stringify(data))
        //   )
        // } else {
        //   localStorage.removeItem("remember")
        // }
      })
    },
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */
$bg:#283443;
$light_gray:#fff;
$cursor: #fff;
@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}
/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;
      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;
.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;
  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }
  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }
  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>