/**
 * 相对时间格式化
 * @param {string} timeStr - 时间字符串
 * @returns {string} - 比如 "3 分钟前"、"2 天前"
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString();
};

/**
 * 日期格式化
 * @param {string} timeStr - 时间字符串
 * @returns {string} - 比如 "2026-06-23"
 */
export const formatDate = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

/**
 * 加入时间格式化
 * @param {string} timeStr - 时间字符串
 * @returns {string} - 比如 "2026.06"
 */
export const formatJoinDate = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * 价格格式化
 * @param {number} price
 * @returns {string} - 整数不带小数，小数保留两位
 */
export const formatPrice = (price) => {
  const num = Number(price);
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};
