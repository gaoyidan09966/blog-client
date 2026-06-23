import request from "./request";

// 创建订单
export const createOrder = (data) => {
  return request.post("/order", data);
};

// 获取我的订单列表
export const getMyOrders = () => {
  return request.get("/order");
};

// 获取订单详情
export const getOrderDetail = (id) => {
  return request.get(`/order/${id}`);
};

// 模拟支付
export const payOrder = (id) => {
  return request.put(`/order/${id}/pay`);
};

// 取消订单
export const cancelOrder = (id) => {
  return request.put(`/order/${id}/cancel`);
};

// 删除订单
export const deleteOrder = (id) => {
  return request.delete(`/order/${id}`);
};
