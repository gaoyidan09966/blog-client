import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Index",
    component: () => import("../views/index/index.vue"), // 路由懒加载首页
  },
  {
    path: "/article/:id", // 动态路由传参：精准捕获文章 ID
    name: "ArticleDetail",
    component: () => import("../views/article/index.vue"),
  },
  {
    path: "/login",
    name: "UserLogin",
    component: () => import("../views/login/index.vue"),
  },
  // ====== 下面是刚刚追加的 5 大极简高奢页面路由 ======
  {
    path: "/articles",
    name: "Articles",
    component: () => import("../views/articles/index.vue"),
  },
  {
    path: "/categories",
    name: "Categories",
    component: () => import("../views/categories/index.vue"),
  },
  {
    path: "/tags",
    name: "Tags",
    component: () => import("../views/tags/index.vue"),
  },
  {
    path: "/archives",
    name: "Archives",
    component: () => import("../views/archives/index.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/about/index.vue"),
  },
  {
    path: "/tag/:id",
    name: "TagArticles",
    component: () => import("../views/tag-articles/index.vue"),
  },
  {
    path: "/login",
    name: "ClientLogin",
    component: () => import("../views/login/index.vue"),
  },
  {
    path: "/register",
    name: "ClientRegister",
    component: () => import("../views/register/index.vue"),
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/profile/index.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/search",
    name: "Search",
    component: () => import("../views/search/index.vue"),
  },
  {
    path: "/publish",
    name: "Publish",
    component: () => import("../views/publish/index.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/article/edit/:id",
    name: "EditArticle",
    component: () => import("../views/publish/index.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/messages",
    name: "Messages",
    component: () => import("../views/messages/index.vue"),
  },
  {
    path: "/products",
    name: "Products",
    component: () => import("../views/products/index.vue"),
  },
  {
    path: "/products/:id",
    name: "ProductDetail",
    component: () => import("../views/products/detail.vue"),
  },
  {
    path: "/cart",
    name: "Cart",
    component: () => import("../views/cart/index.vue"),
  },
  {
    path: "/checkout",
    component: () => import("../views/front/Checkout.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    component: () => import("../views/front/Orders.vue"),
    meta: { requiresAuth: true },
  },
  // 这个必须放在所有路由的最后面
  {
    path: "/404",
    name: "NotFound",
    component: () => import("../views/404.vue"),
  },

  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
