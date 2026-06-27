<template>
  <footer class="blog-footer">
    <div class="footer-container">
      <!-- 三栏 / 移动端压缩布局 -->
      <div class="footer-grid">
        <!-- 品牌区 -->
        <div class="footer-brand">
          <h3 class="brand-name">
            <span class="brand-icon">📝</span>
            <span>拾光笔记</span>
          </h3>
          <p class="brand-desc">用代码记录时光，用文字书写人生。</p>
          <div class="brand-social">
            <a class="social-link" v-for="s in socials" :key="s.title" :title="s.title" href="#">
              <span>{{ s.icon }}</span>
            </a>
          </div>
        </div>

        <!-- 快速导航 -->
        <div class="footer-col">
          <h4 class="footer-title">快速导航</h4>
          <ul class="nav-list">
            <li v-for="link in navLinks" :key="link.to">
              <router-link :to="link.to">{{ link.label }}</router-link>
            </li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div class="footer-col">
          <h4 class="footer-title">联系方式</h4>
          <ul class="nav-list">
            <li v-for="c in contacts" :key="c.text">
              <span class="contact-icon">{{ c.icon }}</span>
              <span class="contact-text">{{ c.text }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="footer-divider"></div>

      <!-- 底部 -->
      <div class="footer-bottom">
        <p class="copyright">© 2026 拾光笔记 · All Rights Reserved</p>
        <p class="powered">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="icp-link">
            陕ICP备2024027143号
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const socials = ref([
  { icon: '🐙', title: 'GitHub' },
  { icon: '📧', title: '邮箱' },
  { icon: '💬', title: '微信' }
])

const navLinks = ref([
  { to: '/', label: '首页' },
  { to: '/products', label: '周边好物' },
  { to: '/messages', label: '留言墙' },
  { to: '/about', label: '关于我' }
])

const contacts = ref([
  { icon: '邮箱📧', text: 'sivp888ws@foxmail.com' },
  { icon: '微信🐙', text: '13080983262' },
  { icon: '留言💬', text: '留言墙联系' }
])
</script>

<style scoped>
.blog-footer {
  width: 100%;
  flex-shrink: 0;
  margin-top: auto;
  background: linear-gradient(180deg, #f8f9fb 0%, #f0f1f3 100%);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 40px 28px;
}

/* ==================== 三栏 ==================== */
.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 32px;
}

/* ==================== 品牌区 ==================== */
.footer-brand {
  padding-right: 12px;
}

.brand-name {
  font-size: 20px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  font-size: 22px;
  display: inline-flex;
}

.brand-desc {
  font-size: 13px;
  color: #888;
  line-height: 1.7;
  margin: 0 0 18px;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.06);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.social-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

/* ==================== 标题 ==================== */
.footer-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 16px;
  padding-left: 12px;
  position: relative;
}

.footer-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 1px;
  bottom: 1px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, #667eea, #764ba2);
}

/* ==================== 列表 ==================== */
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-list li {
  display: flex;
  align-items: center;
}

.nav-list a {
  font-size: 13px;
  color: #666;
  text-decoration: none;
  display: block;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.25s ease;
}

.nav-list a:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.06);
  transform: translateX(4px);
}

.nav-list a.router-link-active {
  color: #667eea;
  font-weight: 600;
}

.contact-icon {
  font-size: 14px;
  margin-right: 8px;
  flex-shrink: 0;
}

.contact-text {
  font-size: 13px;
  color: #666;
  word-break: break-all;
}

/* ==================== 分割线 ==================== */
.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
  margin-bottom: 18px;
}

/* ==================== 底部 ==================== */
.footer-bottom {
  text-align: center;
}

.copyright {
  font-size: 13px;
  color: #888;
  margin: 0 0 6px;
}

.powered {
  font-size: 12px;
  color: #bbb;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.icp-link {
  font-size: 12px;
  color: #bbb;
  text-decoration: none;
  transition: color 0.25s ease;
}

.icp-link:hover {
  color: #667eea;
}

.tech-tag {
  display: inline-block;
  padding: 1px 8px;
  background: rgba(102, 126, 234, 0.07);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  font-size: 11px;
  color: #8a8a9a;
}

/* ================================================
   移动端：品牌在上（极简），导航 + 联系左右并排
   ================================================ */
@media (max-width: 768px) {
  .footer-container {
    padding: 28px 16px 18px;
  }

  .footer-grid {
    /* 品牌独占一行，导航和联系方式左右并排 */
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 16px 24px;
    margin-bottom: 20px;
  }

  /* 品牌区横跨两列，压缩高度 */
  .footer-brand {
    grid-column: 1 / -1;
    padding-right: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .brand-name {
    font-size: 16px;
    margin: 0;
  }

  .brand-desc {
    display: none;
    /* 移动端隐藏描述文字，节省空间 */
  }

  .brand-social {
    gap: 8px;
    margin-left: auto;
  }

  .social-link {
    width: 32px;
    height: 32px;
    font-size: 14px;
    border-radius: 8px;
  }

  /* 导航 & 联系 左右并排 */
  .footer-col {
    min-width: 0;
  }

  .footer-title {
    font-size: 13px;
    margin-bottom: 10px;
    padding-left: 10px;
  }

  .footer-title::before {
    width: 2.5px;
  }

  .nav-list {
    gap: 0;
  }

  .nav-list a {
    font-size: 12.5px;
    padding: 5px 6px;
  }

  .contact-icon {
    font-size: 13px;
    margin-right: 6px;
  }

  .contact-text {
    font-size: 12.5px;
  }
}

/* ==================== 小屏手机 ==================== */
@media (max-width: 380px) {
  .footer-container {
    padding: 24px 12px 14px;
  }

  .footer-grid {
    gap: 12px 16px;
  }

  .brand-name {
    font-size: 15px;
  }

  .social-link {
    width: 30px;
    height: 30px;
    font-size: 13px;
  }

  .nav-list a {
    font-size: 12px;
    padding: 4px 4px;
  }

  .contact-text {
    font-size: 12px;
  }
}
</style>