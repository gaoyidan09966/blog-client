import request from "./request";

// 获取最新评论
export function getLatestComments(limit = 8) {
  return request.get("/comment/latest", { params: { limit } });
}
