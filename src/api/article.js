import request from "./request";

// 1. 获取文章列表 (公开)
export const getArticleList = (params) => {
  return request.get("/article", { params });
};

// 2. 获取单篇文章详情 (公开)
export const getArticleById = (id) => {
  return request.get(`/article/${id}`);
};

// 3. 创建文章 (受保护)
export const createArticle = (data) => {
  return request.post("/article", data);
};

// 4. 更新文章 (受保护)
export const updateArticle = (id, data) => {
  return request.put(`/article/${id}`, data);
};

// 5. 删除文章 (受保护)
export const deleteArticle = (id) => {
  return request.delete(`/article/${id}`);
};

// 6. 图片上传 (受保护，需传输 FormData)
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return request.post("/article/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 7. 搜索文章 (公开)
export const searchArticles = (keyword) => {
  return request.get("/article/search", { params: { keyword } });
};

// 获取热门文章
export const getHotArticles = (limit = 6) => {
  return request.get("/article/hot", { params: { limit } });
};

// 获取最新文章
export const getLatestArticles = (limit = 6) => {
  return request.get("/article/latest", { params: { limit } });
};

// 点赞/取消点赞
export const toggleLike = (articleId) => {
  return request.post(`/article/${articleId}/like`);
};

// 获取点赞状态
export const getLikeStatus = (articleId) => {
  return request.get(`/article/${articleId}/like`);
};

// 获取推荐文章
export function getRecommendArticles(limit = 5) {
  return request({
    url: "/article/recommend",
    params: { limit },
    method: "get",
  });
}
