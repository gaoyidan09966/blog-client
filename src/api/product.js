import request from "./request";

// 获取商品列表
export function getProductList(params) {
  return request({ url: "/product/list", method: "get", params });
}

// 获取商品分类
export function getProductCategories() {
  return request({ url: "/product/categories", method: "get" });
}

// 获取商品详情
export function getProductById(id) {
  return request({ url: `/product/${id}`, method: "get" });
}
// 获取购买须知
export function getActiveNotices() {
  return request({ url: "/notice/active", method: "get" });
}
