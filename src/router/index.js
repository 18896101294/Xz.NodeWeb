import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import tableRouter from './modules/table'
import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  // {
  //   path: '/404',
  //   component: () => import('@/views/error-page/404'),
  //   hidden: true
  // },
  // {
  //   path: '/401',
  //   component: () => import('@/views/error-page/401'),
  //   hidden: true
  // },
  {
    path: '/404',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/404',
        component: () => import('@/views/error-page/404'),
        name: 'page404',
        meta: { title: 'page404', noCache: true }
      }
    ]
  },
  {
    path: '/401',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/401',
        component: () => import('@/views/error-page/401'),
        name: 'page401',
        meta: { title: 'page401', noCache: true }
      }
    ]
  },
  {
    path: '/500',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/500',
        component: () => import('@/views/error-page/500'),
        name: 'page500',
        meta: { title: 'page500', noCache: true }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/index'),
        name: 'Guide',
        meta: { title: 'guide', icon: 'guide', noCache: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'profile', icon: 'user', noCache: true }
      }
    ]
  },
  {
    path: '/IdentityServerCallBack',
    component: () => import('@/views/login/IdentityServer4/IdentityServerCallBack'),
    hidden: true
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
 export const asyncRoutes = []

export const asyncRoutes1 = [
  {
    path: '/adminInterface',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/admin-interface/index'),
        name: 'AdminInterface',
        meta: { title: 'adminInterface', icon: 'documentation'}
      }
    ]
  },
  {
    path: '/basics',
    component: Layout,
    redirect: '/basics/basics-page',
    alwaysShow: true, // will always show the root menu
    name: 'basicsManager',
    meta: {
      title: '基础配置',
      icon: 'education',
      // keepAlive: false,
      roles: ['admin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'module-table',
        component: () => import('@/views/basics/module/module-table'),
        name: 'ModuleTable',
        meta: {
          title: 'ModuleTable',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/system-page',
    alwaysShow: true, // will always show the root menu
    name: 'systemManager',
    meta: {
      title: '系统管理',
      icon: 'education',
      // keepAlive: false,
      roles: ['admin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'test-table',
        component: () => import('@/views/system/test-table'),
        name: 'TestTable',
        meta: {
          title: 'TestTable',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'configuration-table',
        component: () => import('@/views/system/configuration/configuration-table'),
        name: 'ConfigurationTable',
        meta: {
          title: 'ConfigurationTable',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'consul-table',
        component: () => import('@/views/system/consul/consul-table'),
        name: 'ConsulTable',
        meta: {
          title: 'ConsulTable',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: 'permission',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'page',
        component: () => import('@/views/permission/page'),
        name: 'PagePermission',
        meta: {
          title: 'pagePermission',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'directive',
        component: () => import('@/views/permission/directive'),
        name: 'DirectivePermission',
        meta: {
          title: 'directivePermission'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'RolePermission',
        meta: {
          title: 'rolePermission',
          roles: ['admin']
        }
      }
    ]
  },

  {
    path: '/icon',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/icons/index'),
        name: 'Icons',
        meta: { title: 'icons', icon: 'icon', noCache: true }
      }
    ]
  },

  /** when your routing map is too long, you can split it into small modules **/
  componentsRouter,
  chartsRouter,
  nestedRouter,
  tableRouter,

  {
    path: '/example',
    component: Layout,
    redirect: '/example/list',
    name: 'Example',
    meta: {
      title: 'example',
      icon: 'el-icon-s-help'
    },
    children: [
      {
        path: 'create',
        component: () => import('@/views/example/create'),
        name: 'CreateArticle',
        meta: { title: 'createArticle', icon: 'edit' }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/example/edit'),
        name: 'EditArticle',
        meta: { title: 'editArticle', noCache: true, activeMenu: '/example/list' },
        hidden: true
      },
      {
        path: 'list',
        component: () => import('@/views/example/list'),
        name: 'ArticleList',
        meta: { title: 'articleList', icon: 'list' }
      }
    ]
  },

  {
    path: '/tab',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/tab/index'),
        name: 'Tab',
        meta: { title: 'tab', icon: 'tab' }
      }
    ]
  },

  {
    path: '/error',
    component: Layout,
    redirect: 'noRedirect',
    name: 'ErrorPages',
    meta: {
      title: 'errorPages',
      icon: '404'
    },
    children: [
      {
        path: '401',
        component: () => import('@/views/error-page/401'),
        name: 'Page401',
        meta: { title: 'page401', noCache: true }
      },
      {
        path: '404',
        component: () => import('@/views/error-page/404'),
        name: 'Page404',
        meta: { title: 'page404', noCache: true }
      }
    ]
  },

  {
    path: '/error-log',
    component: Layout,
    children: [
      {
        path: 'log',
        component: () => import('@/views/error-log/index'),
        name: 'ErrorLog',
        meta: { title: 'errorLog', icon: 'bug' }
      }
    ]
  },

  {
    path: '/excel',
    component: Layout,
    redirect: '/excel/export-excel',
    name: 'Excel',
    meta: {
      title: 'excel',
      icon: 'excel'
    },
    children: [
      {
        path: 'export-excel',
        component: () => import('@/views/excel/export-excel'),
        name: 'ExportExcel',
        meta: { title: 'exportExcel' }
      },
      {
        path: 'export-selected-excel',
        component: () => import('@/views/excel/select-excel'),
        name: 'SelectExcel',
        meta: { title: 'selectExcel' }
      },
      {
        path: 'export-merge-header',
        component: () => import('@/views/excel/merge-header'),
        name: 'MergeHeader',
        meta: { title: 'mergeHeader' }
      },
      {
        path: 'upload-excel',
        component: () => import('@/views/excel/upload-excel'),
        name: 'UploadExcel',
        meta: { title: 'uploadExcel' }
      }
    ]
  },

  {
    path: '/zip',
    component: Layout,
    redirect: '/zip/download',
    alwaysShow: true,
    name: 'Zip',
    meta: { title: 'zip', icon: 'zip' },
    children: [
      {
        path: 'download',
        component: () => import('@/views/zip/index'),
        name: 'ExportZip',
        meta: { title: 'exportZip' }
      }
    ]
  },

  {
    path: '/pdf',
    component: Layout,
    redirect: '/pdf/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/pdf/index'),
        name: 'PDF',
        meta: { title: 'pdf', icon: 'pdf' }
      }
    ]
  },
  {
    path: '/pdf/download',
    component: () => import('@/views/pdf/download'),
    hidden: true
  },

  {
    path: '/theme',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/theme/index'),
        name: 'Theme',
        meta: { title: 'theme', icon: 'theme' }
      }
    ]
  },

  {
    path: '/clipboard',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/clipboard/index'),
        name: 'ClipboardDemo',
        meta: { title: 'clipboardDemo', icon: 'clipboard' }
      }
    ]
  },

  {
    path: '/i18n',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/i18n-demo/index'),
        name: 'I18n',
        meta: { title: 'i18n', icon: 'international' }
      }
    ]
  },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://github.com/PanJiaChen/vue-element-admin',
        meta: { title: 'externalLink', icon: 'link' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export function filterAsyncRouter(asyncRouterMap) {
  let routerDatas = []
  asyncRouterMap.filter(route => {
    let routeItem = route.item;
    if (route.children && route.children.length > 0) {
      let routerData = {
        path: routeItem.url,
        component: Layout,
        alwaysShow: true, // 总是显示根菜单
        name: routeItem.code,
        meta: {
          title: routeItem.code,
          icon: routeItem.iconName,
          roles: routeItem.roles
        },
        children: []
      }
      route.children.forEach((routeChildren, index) => {
        let routeChildrenItem = routeChildren.item
        let addChildren = {
          path: routeChildrenItem.url,
          // component: () => import('@/views' + routeChildrenItem.url.replace('/:id','')),
          component: (resolve) => require(['@/views'+ routeChildrenItem.url + '.vue'], resolve),
          // component: function component(resolve) {
          //   require(["@/views" + routeChildrenItem.url], resolve);
          // },
          name: routeChildrenItem.code,
          meta: {
            title: routeChildrenItem.code,
            icon: routeChildrenItem.iconName,
            roles: routeChildrenItem.roles
          }
        }
        routerData.children.push(addChildren)
      })
      if(routerDatas.findIndex(item => item.path === routeItem.url) < 0) {
        routerDatas.push(routerData)
      }
    } else {
      if(routerDatas.findIndex(item => item.path === routeItem.url) < 0) {
        routerDatas.push({
          path: routeItem.url,
          component: Layout,
          children: [{
            path: routeItem.url,
            // component: () => import('@/views' + routeItem.url.replace('/:id','')),
            component: (resolve) => require(['@/views'+ routeItem.url + '.vue'], resolve),
            // component: function component(resolve) {
            //   require(["@/views" + routeItem.url], resolve);
            // },
            name: routeItem.code,
            meta: { title: routeItem.code, icon: routeItem.iconName}
          }]
        })
      }
    }
  })
  // routerDatas = routerDatas.concat(constantRoutes)
  // window.localStorage.router = JSON.stringify(routerDatas)
  // this.$store.dispatch('setRouters')
  return routerDatas
}

export default router
