import request from "./request";

// 获取归档列表
export function getArchives() {
  return request({
    url: "/archive",
    method: "get",
  });
}
