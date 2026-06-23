export function getMyReplies(params) {
  return request({ url: "/chat/my-replies", method: "get", params });
}
