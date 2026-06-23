<template>
  <footer class="blog-footer">
    <div class="footer-container">
      <!-- 上部：三栏内容 -->
      <div class="footer-grid">
        <!-- 品牌区 -->
        <div class="footer-brand">
          <h3 class="brand-name">
            <span class="brand-icon">📝</span> 拾光笔记
          </h3>
          <p class="brand-desc">用代码记录时光，用文字书写人生。一个热爱技术与生活的开发者博客。</p>
          <div class="brand-social">
            <a class="social-link" title="GitHub">🐙</a>
            <a class="social-link" title="邮箱">📧</a>
            <a class="social-link" title="微信">💬</a>
          </div>
        </div>

        <!-- 快速导航 -->
        <div class="footer-nav">
          <h4 class="footer-title">快速导航</h4>
          <ul class="nav-list">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/products">周边好物</router-link></li>
            <li><router-link to="/messages">留言墙</router-link></li>
            <li><router-link to="/about">关于我</router-link></li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div class="footer-contact">
          <h4 class="footer-title">联系方式</h4>
          <ul class="nav-list">
            <li>
              <span class="contact-icon">📧</span>
              <span>admin@example.com</span>
            </li>
            <li>
              <span class="contact-icon">🐙</span>
              <span>github.com</span>
            </li>
            <li>
              <span class="contact-icon">💬</span>
              <span>欢迎通过留言墙联系</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="footer-divider"></div>

      <!-- 下部：版权信息 -->
      <div class="footer-bottom">
        <p class="copyright">© 2026 拾光笔记 · All Rights Reserved</p>
        <p class="powered">Powered by Vue3 + Express + MySQL · Vite & Element Plus</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.blog-footer {
  width: 100%;
  padding: 0;
  margin-top: auto;
  background: linear-gradient(180deg, #f8f9fb 0%, #f0f1f3 100%);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px 28px;
}

/* ==================== 三栏网格 ==================== */
.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 32px;
}

/* 品牌区 */
.brand-name {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  font-size: 22px;
}

.brand-desc {
  font-size: 13px;
  color: #888;
  line-height: 1.7;
  margin: 0 0 20px;
}

.brand-social {
  display: flex;
  gap: 10px;
}

.social-link {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(0, 0, 0, 0.05);
  text-decoration: none;
}

.social-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* 标题 */
.footer-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 16px;
  position: relative;
  padding-left: 12px;
}

.footer-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 3px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 2px;
}

/* 链接列表 */
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-list a {
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}

.nav-list a:hover {
  color: #667eea;
  padding-left: 4px;
}

.contact-icon {
  font-size: 14px;
}

.nav-list span:not(.contact-icon) {
  font-size: 13px;
  color: #666;
}

/* ==================== 分割线 ==================== */
.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
  margin-bottom: 20px;
}

/* ==================== 底部版权 ==================== */
.footer-bottom {
  text-align: center;
}

.copyright {
  font-size: 13px;
  color: #888;
  margin: 0 0 4px;
}

.powered {
  font-size: 12px;
  color: #bbb;
  margin: 0;
  letter-spacing: 0.3px;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-container {
    padding: 36px 20px 24px;
  }
}
</style>