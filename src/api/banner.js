import request from "./request";

export function getActiveBanners() {
  return request({ url: "/banner/active", method: "get" });
}
