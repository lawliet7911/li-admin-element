import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
} from "vue-router"
import { Guard } from "./routerGuard"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    alias: "/home",
    component: () => import("~/pages/Home/index.vue"),
    children: [
      {
        path: "/",
        redirect: "dashboard",
      },
      {
        path: "/dashboard",
        name: "DashBoard",
        component: () => import("~/pages/home/dashboard.vue"),
        meta: { title: "面板" },
      },
      {
        path: "/demo1",
        name: "列表",
        component: () => import("~/pages/demo/demo1.vue"),
        meta: { title: "列表demo" },
      },
      {
        path: "/demo2",
        name: "qrExport",
        component: () => import("~/pages/demo/exportQR.vue"),
        meta: { title: "生码工具" },
      },
      {
        path: "/customExport",
        name: "customExport",
        component: () => import("~/pages/demo/exportQRByCustomize.vue"),
        meta: { title: "自定义批量生码" },
      },
      {
        path: "/:all(.*)*",
        name: "PageNotFound",
        component: () => import("~/pages/error-page/[...all].vue"),
        meta: {
          title: "找不到页面",
        },
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    meta: {
      title: "登录",
    },
    component: () => import("~/pages/login/index.vue"),
  },
]

let router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(Guard)

export default router
