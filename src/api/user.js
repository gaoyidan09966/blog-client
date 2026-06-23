import request from "./request";

// 用户注册
export function register(data) {
  return request({ url: "/user/register", method: "post", data });
}

// 用户登录
export function login(data) {
  return request({ url: "/user/login", method: "post", data });
}

// 获取当前登录用户信息
export function getUserInfo() {
  return request({ url: "/user/info", method: "get" });
}

// 获取个人主页信息
export function getUserProfile() {
  return request({ url: "/user/profile", method: "get" });
}

// 获取用户发布的文章
export function getUserArticles(params) {
  return request({ url: "/user/articles", method: "get", params });
}

// 获取用户的评论
export function getUserComments() {
  return request({ url: "/user/comments", method: "get" });
}

// 修改个人资料
export function updateProfile(data) {
  return request({ url: "/user/profile", method: "put", data });
}

// 获取管理员信息
export function getAdminInfo() {
  return request({ url: "/user/admin", method: "get" });
}
// 上传头像
export const uploadAvatar = (formData) => {
  return request.post("/user/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 修改密码
export const changePassword = (data) => {
  return request.put("/user/password", data);
};
