import request from "./request";

// 获取留言列表
export function getActiveMessages() {
  return request({ url: "/message/active", method: "get" });
}

// 发表留言
export function createMessage(data) {
  return request({ url: "/message", method: "post", data });
}

// 点赞留言
export function likeMessage(id) {
  return request({ url: `/message/${id}/like`, method: "post" });
}

// 回复留言
export function replyMessage(id, data) {
  return request({ url: `/message/${id}/reply`, method: "post", data });
}

// 上传图片
export function uploadMessageImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  return request({
    url: "/message/upload",
    method: "post",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// 获取用户点赞状态
export function getLikedStatus() {
  return request({ url: "/message/liked", method: "get" });
}

export function getImageFullUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `http://localhost:3001${url}`; // 上线后改成你的域名
}
