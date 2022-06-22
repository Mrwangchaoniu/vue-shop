import Vue from 'vue'
import VueRouter from 'vue-router'

import Order from '@/components/order/Order.vue'
// const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
import Report from '@/components/report/Report.vue'
// const Report = () => import(/* webpackChunkName: "goodsList_AddGoods" */ '../components/report/Report.vue')

import GoodList from '@/components/goods/list.vue'
// const GoodList = () => import(/* webpackChunkName: "goodsList_AddGoods" */ '../components/goods/list.vue')
import AddGoods from '@/components/goods/AddGoods.vue'
// const AddGoods = () => import(/* webpackChunkName: "goodsList_AddGoods" */ '../components/goods/AddGoods.vue')

import Cate from '@/components/goods/Cate.vue'
// const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate.vue')
import Params from '@/components/goods/Params.vue'
// const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Params.vue')
import Users from '@/components/users/Users.vue'
// const Users = () => import(/* webpackChunkName: "users_right_roles" */ '../components/users/Users.vue')

import Right from '@/components/power/rights.vue'
// const Right = () => import(/* webpackChunkName: "login_home_weCome" */ '../components/power/rights.vue')

import Roles from '@/components/power/roles.vue'
// const Roles = () => import(/* webpackChunkName: "login_home_weCome" */ '../components/power/roles.vue')

import WeCome from '@/components/weCome/WeCome.vue'
// const WeCome = () => import(/* webpackChunkName: "login_home_weCome" */ '../components/weCome/WeCome.vue')

import Home from '@/components//home/Home.vue'
// const Home = () => import(/* webpackChunkName: "login_home_weCome" */ '../components//home/Home.vue')

import Login from '@/components/login/Login.vue'
// const Login = () => import(/* webpackChunkName: "login_home_weCome" */ '../components/login/Login.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    // redirect: '/weCome',
    children: [
      { path: '/home', redirect: 'weCome' },
      { path: 'weCome', component: WeCome },
      { path: 'users', component: Users },
      { path: 'rights', component: Right },
      { path: 'roles', component: Roles },
      { path: 'categories', component: Cate },
      { path: 'params', component: Params },
      { path: 'goods', component: GoodList },
      { path: '/goods/addgoods', component: AddGoods },
      { path: 'orders', component: Order },
      { path: 'reports', component: Report }
    ]
  }

]

const router = new VueRouter({
  routes
})

// 定义导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
