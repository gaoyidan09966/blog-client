import axios from "axios";
import { ElMessage } from "element-plus";

const service = axios.create({
  baseURL: "http://localhost:3001/api", // 精准指向我们的后端 3001 集群
  timeout: 5000,
});

// 请求拦截器：柔性携带读者 Token
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("client_token");
    if (token) {
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：只报基础错，绝不强行踢回登录页（因为首页对全网公开）
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200 && res.code !== 201) {
      ElMessage.error(res.message || "系统异常");
      return Promise.reject(new Error(res.message || "Error"));
    }
    return res;
  },
  (error) => {
    ElMessage.error(error.response?.data?.message || "网络或服务器异常");
    return Promise.reject(error);
  },
);

export default service;
