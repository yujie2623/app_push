import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

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
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes =
  [
    {
      path: '/login',
      component: () => import('@/views/login/index'),
      hidden: true
    },
    {
      path: '/404',
      component: () => import('@/views/404'),
      hidden: true
    }
  ]

export const asyncRouterMap = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { roles: ['true'] },
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard', roles: ['true'] }
    }]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/guide',
    meta: { roles: ['false'] },
    hidden: true,
    children: [{
      path: 'guide',
      name: 'Guide',
      component: () => import('@/views/guide/index'),
      meta: { title: 'guide', icon: 'guide', roles: ['false'] }
    }]
  },
  {
    path: '/server',
    component: Layout,
    meta: { roles: ['true'] },
    children: [{
      path: 'server',
      name: 'Server',
      component: () => import('@/views/server/index'),
      meta: { title: 'Server', icon: 'server', roles: ['true'] }
    }]
  },
  {
    path: '/application',
    component: Layout,
    meta: { roles: ['true'] },
    children: [{
      path: 'application',
      name: 'Application',
      component: () => import('@/views/application/index'),
      meta: { title: 'Application', icon: 'application', roles: ['true'] }
    }]
  },
  {
    path: '/user',
    component: Layout,
    meta: { roles: ['true'] },
    children: [{
      path: 'user',
      name: 'User',
      component: () => import('@/views/user/index'),
      meta: { title: 'User', icon: 'user', roles: ['true'] }
    }]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/log',
    name: 'System',
    meta: { title: 'System', icon: 'system', roles: ['true'] },
    children: [
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/system/settings/index'),
        meta: { title: 'Settings', icon: 'settings' }
      },
      {
        path: 'log',
        name: 'Log',
        component: () => import('@/views/system/log/index'),
        meta: { title: 'Log', icon: 'log' }
      },
      // {
      //   path: 'upgrade',
      //   name: 'Upgrade',
      //   component: () => import('@/views/system/upgrade/index'),
      //   meta: { title: 'Upgrade', icon: 'upgrade' }
      // },
      {
        path: 'authorize',
        name: 'Authorize',
        component: () => import('@/views/system/authorize/index'),
        meta: { title: 'Authorize', icon: 'authorize' }
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

export default router
