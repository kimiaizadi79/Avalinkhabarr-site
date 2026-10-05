/**
 * اولین خبر | Avalin Khabar
 * Client Application Logic & GitHub Pages Ready Engine
 * No Node.js, npm, or build step required.
 */

// Application State
const AppState = {
  theme: localStorage.getItem('avalin_theme') || 'dark',
  fontSize: localStorage.getItem('avalin_font_size') || 'md',
  bookmarks: JSON.parse(localStorage.getItem('avalin_bookmarks') || '[]'),
  likedArticles: JSON.parse(localStorage.getItem('avalin_likes') || '[]'),
  currentAudio: null,
  activeAudioId: null,
  isAudioPlaying: false
};

// Utilities & DOM Helpers
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

// Toast Notification
function showToast(message, type = 'info') {
  let container = $('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';
  if (type === 'bookmark') icon = '🔖';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Global Safe Social Links
function initSocialLinks() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-social], .social-icon-btn, .footer-social-row a');
    if (target) {
      e.preventDefault();
      showToast('لینک این بخش به‌زودی فعال می‌شود.', 'info');
    }
  });
}

// Theme Switcher
function applyTheme(theme) {
  AppState.theme = theme;
  localStorage.setItem('avalin_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);

  const toggleBtns = $$('.theme-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.innerHTML = theme === 'dark' 
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.setAttribute('aria-label', theme === 'dark' ? 'حالت روز' : 'حالت شب');
  });
}

function initTheme() {
  applyTheme(AppState.theme);
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-toggle-btn');
    if (btn) {
      const nextTheme = AppState.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(nextTheme === 'dark' ? 'حالت شب فعال شد' : 'حالت روز فعال شد', 'info');
    }
  });
}

// Font Size Adjuster
function applyFontSize(size) {
  AppState.fontSize = size;
  localStorage.setItem('avalin_font_size', size);
  document.documentElement.setAttribute('data-font-size', size);

  $$('.font-size-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === size);
  });
}

function initFontSize() {
  applyFontSize(AppState.fontSize);
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.font-size-btn');
    if (btn && btn.dataset.size) {
      applyFontSize(btn.dataset.size);
    }
  });
}

// Bookmarking System
function toggleBookmark(articleId) {
  const numericId = parseInt(articleId, 10);
  const index = AppState.bookmarks.indexOf(numericId);
  const article = AVALIN_DATA.articles.find(a => a.id === numericId);

  if (index > -1) {
    AppState.bookmarks.splice(index, 1);
    showToast(`مقاله «${article ? article.title.substring(0, 30) + '...' : ''}» از نشان‌شده‌ها حذف شد.`, 'info');
  } else {
    AppState.bookmarks.push(numericId);
    showToast(`مقاله «${article ? article.title.substring(0, 30) + '...' : ''}» به نشان‌شده‌ها افزوده شد.`, 'bookmark');
  }

  localStorage.setItem('avalin_bookmarks', JSON.stringify(AppState.bookmarks));
  updateBookmarkButtons();
}

function updateBookmarkButtons() {
  $$('[data-bookmark-id]').forEach(btn => {
    const id = parseInt(btn.dataset.bookmarkId, 10);
    const isBookmarked = AppState.bookmarks.includes(id);
    btn.classList.toggle('bookmarked', isBookmarked);
    const icon = btn.querySelector('svg');
    if (icon) {
      icon.setAttribute('fill', isBookmarked ? 'currentColor' : 'none');
    }
  });

  const countBadge = $('#bookmark-count');
  if (countBadge) {
    countBadge.textContent = AppState.bookmarks.length.toLocaleString('fa-IR');
  }
}

// Like System
function toggleLike(articleId) {
  const numericId = parseInt(articleId, 10);
  const index = AppState.likedArticles.indexOf(numericId);
  const article = AVALIN_DATA.articles.find(a => a.id === numericId);
  if (!article) return;

  if (index > -1) {
    AppState.likedArticles.splice(index, 1);
    article.likes = Math.max(0, article.likes - 1);
  } else {
    AppState.likedArticles.push(numericId);
    article.likes += 1;
    showToast('دیدگاه مثبت شما برای این گزارش ثبت گردید.', 'success');
  }

  localStorage.setItem('avalin_likes', JSON.stringify(AppState.likedArticles));

  $$(`[data-like-id="${numericId}"]`).forEach(btn => {
    const isLiked = AppState.likedArticles.includes(numericId);
    btn.classList.toggle('liked', isLiked);
    const counter = btn.querySelector('.like-count');
    if (counter) {
      counter.textContent = article.likes.toLocaleString('fa-IR');
    }
  });
}

// Share Modal & Copy Link
function openShareModal(title, url) {
  const targetUrl = url || window.location.href;
  const targetTitle = title || document.title;

  if (navigator.share) {
    navigator.share({
      title: targetTitle,
      url: targetUrl
    }).catch(() => {});
    return;
  }

  const modalHtml = `
    <div class="modal-backdrop active" id="share-modal">
      <div class="modal-container" style="max-width: 480px;">
        <div class="modal-header">
          <h3>اشتراک‌گذاری گزارش</h3>
          <button class="modal-close-btn" onclick="closeModal('share-modal')" aria-label="بستن">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.95rem; font-weight: 600; margin-bottom: 1rem;">${targetTitle}</p>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem;">
            <input type="text" id="share-url-input" value="${targetUrl}" readonly style="flex: 1; background: var(--bg-surface-2); border: 1px solid var(--border-subtle); padding: 0.6rem; border-radius: var(--radius-sm); font-size: 0.85rem;" />
            <button class="btn btn-primary" onclick="copyShareLink()">کپی پیوند</button>
          </div>
          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <button class="social-icon-btn" data-social aria-label="اشتراک در تلگرام">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            </button>
            <button class="social-icon-btn" data-social aria-label="اشتراک در واتساپ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
            </button>
            <button class="social-icon-btn" data-social aria-label="اشتراک در توییتر/ایکس">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function copyShareLink() {
  const input = $('#share-url-input');
  if (input) {
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
      showToast('پیوند خبر با موفقیت در حافظه کپی شد!', 'success');
      closeModal('share-modal');
    }).catch(() => {
      showToast('خطا در کپی پیوند. لطفا متن را دستی کپی نمایید.', 'error');
    });
  }
}

// Modal Manager
function closeModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 250);
  }
}

// Global Ctrl+K / Search Modal
function initSearchModal() {
  const searchModalHtml = `
    <div class="modal-backdrop" id="search-modal">
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="global-search-input" placeholder="عبارت مورد نظر خود را برای جستجو تایپ کنید..." style="width: 100%; font-size: 1rem; color: var(--text-primary);" />
          </div>
          <button class="modal-close-btn" onclick="closeModal('search-modal')" aria-label="بستن جستجو">✕</button>
        </div>
        <div class="modal-body" style="padding: 1rem 1.5rem;">
          <div id="search-instant-results" style="max-height: 380px; overflow-y: auto;">
            <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1.5rem 0;">
              برای شروع جستجو حداقل ۲ حرف تایپ کنید یا کلید اینتر را بزنید.
            </p>
          </div>
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.75rem; display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted);">
            <span>ناوبری با کلیدهای جهت‌نما</span>
            <span>کلید Esc برای خروج</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', searchModalHtml);

  const modal = $('#search-modal');
  const input = $('#global-search-input');
  const resultsContainer = $('#search-instant-results');

  const openSearch = () => {
    modal.classList.add('active');
    setTimeout(() => input.focus(), 100);
  };

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal('search-modal');
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.search-trigger-box')) {
      openSearch();
    }
    if (e.target === modal) {
      closeModal('search-modal');
    }
  });

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      resultsContainer.innerHTML = `
        <p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1.5rem 0;">
          برای جستجو حداقل ۲ حرف تایپ نمایید.
        </p>
      `;
      return;
    }

    const matches = AVALIN_DATA.articles.filter(a => 
      a.title.toLowerCase().includes(query) || 
      a.lead.toLowerCase().includes(query) ||
      (a.tags && a.tags.some(t => t.toLowerCase().includes(query)))
    );

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem 0; color: var(--text-muted);">
          <p>نتیجه‌ای برای «<strong>${query}</strong>» یافت نشد.</p>
          <a href="search.html?q=${encodeURIComponent(query)}" class="btn btn-outline" style="margin-top: 1rem; font-size: 0.85rem;">مشاهده صفحه جستجوی پیشرفته</a>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = matches.slice(0, 6).map(a => `
      <a href="news-detail.html?id=${a.id}" class="ranked-item" style="margin-bottom: 0.5rem; text-decoration: none; display: flex;">
        <div style="width: 50px; height: 50px; border-radius: 4px; overflow: hidden; margin-inline-end: 0.75rem; flex-shrink: 0;">
          <img src="${a.image}" alt="${a.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1;">
          <div style="font-size: 0.75rem; color: ${a.categoryColor}; font-weight: 700;">${a.categoryTitle}</div>
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); line-height: 1.4;">${a.title}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">${a.timeAgo} · زمان مطالعه: ${a.readTime}</div>
        </div>
      </a>
    `).join('') + `
      <div style="text-align: center; margin-top: 1rem;">
        <a href="search.html?q=${encodeURIComponent(query)}" class="btn btn-primary" style="width: 100%; font-size: 0.85rem;">مشاهده همه ${matches.length} نتیجه در صفحه جستجو</a>
      </div>
    `;
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) {
        window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      }
    }
  });
}

// Mobile Menu Drawer
function initMobileMenu() {
  const drawerHtml = `
    <div class="mobile-drawer" id="mobile-menu-drawer">
      <div class="drawer-panel">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div class="brand-wrapper">
            <div class="brand-emblem" style="width: 34px; height: 34px; font-size: 1rem;">۱خ</div>
            <div class="brand-text">
              <h2 style="font-size: 1.1rem; font-weight: 800;">اولین خبر</h2>
            </div>
          </div>
          <button class="modal-close-btn" id="close-drawer-btn" aria-label="بستن منو">✕</button>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem;">
          <button class="btn btn-crimson" style="flex: 1; font-size: 0.8rem; padding: 0.4rem;" onclick="showToast('سیگنال پخش زنده در حال اتصال است...', 'info')">
            <span class="pulse-dot"></span> پخش زنده
          </button>
          <a href="archive.html" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem;">آرشیو</a>
        </div>

        <h4 style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">دسته‌بندی‌ها</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1.5rem;">
          <li><a href="index.html" style="display: block; padding: 0.5rem 0.75rem; border-radius: 4px; font-weight: 600;">صفحه نخست</a></li>
          ${AVALIN_DATA.categories.map(cat => `
            <li>
              <a href="${cat.slug}.html" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-radius: 4px; color: var(--text-secondary);">
                <span>${cat.title}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${cat.count}</span>
              </a>
            </li>
          `).join('')}
          <li><a href="multimedia.html" style="display: block; padding: 0.5rem 0.75rem; border-radius: 4px; color: var(--text-secondary);">چندرسانه‌ای و پادکست</a></li>
          <li><a href="reporters.html" style="display: block; padding: 0.5rem 0.75rem; border-radius: 4px; color: var(--text-secondary);">شورای سردبیری و خبرنگاران</a></li>
        </ul>

        <div style="margin-top: auto; border-top: 1px solid var(--border-subtle); padding-top: 1rem; font-size: 0.82rem; color: var(--text-muted);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>دلار بازار مبادله‌ای:</span>
            <span style="font-weight: 700; color: var(--text-primary);">۵۱,۱۴۰ تومان</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>شاخص بورس:</span>
            <span style="font-weight: 700; color: var(--brand-success);">۲,۱۸۶,۳۱۰ ▲</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', drawerHtml);

  const drawer = $('#mobile-menu-drawer');
  const openBtn = $('#mobile-menu-trigger');
  const closeBtn = $('#close-drawer-btn');

  if (openBtn) {
    openBtn.addEventListener('click', () => drawer.classList.add('active'));
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => drawer.classList.remove('active'));
  }
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) drawer.classList.remove('active');
  });
}

// Audio Player Engine for Podcasts
function playPodcast(podcastId) {
  const podcast = AVALIN_DATA.podcasts.find(p => p.id === podcastId);
  if (!podcast) return;

  let playerBar = $('#global-audio-bar');
  if (!playerBar) {
    const barHtml = `
      <div id="global-audio-bar" class="audio-player-bar" style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 900; border-radius: 0; margin: 0; background: var(--bg-surface-1); box-shadow: 0 -4px 20px rgba(0,0,0,0.5);">
        <button id="audio-play-pause-btn" class="btn btn-primary" style="width: 40px; height: 40px; border-radius: 50%; padding: 0;" aria-label="پخش / توقف">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
        <div style="flex: 1;">
          <div id="audio-title-display" style="font-size: 0.88rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 4px;">
            <div id="audio-progress-wrap" class="audio-progress-bar">
              <div id="audio-progress-fill" class="audio-progress-fill"></div>
            </div>
            <span id="audio-time-display" style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">00:00 / ${podcast.duration}</span>
          </div>
        </div>
        <button class="modal-close-btn" onclick="$('#global-audio-bar').style.display='none'; if(AppState.currentAudio) AppState.currentAudio.pause();" aria-label="بستن پخش‌کننده">✕</button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', barHtml);
    playerBar = $('#global-audio-bar');
  }

  playerBar.style.display = 'flex';
  $('#audio-title-display').textContent = podcast.title;

  if (AppState.currentAudio) {
    AppState.currentAudio.pause();
  }

  const audio = new Audio(podcast.audioUrl);
  AppState.currentAudio = audio;
  AppState.activeAudioId = podcastId;
  AppState.isAudioPlaying = true;

  const playBtn = $('#audio-play-pause-btn');
  playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

  audio.play().catch(() => {
    // Browser audio autoplay policy fallback
    showToast('برای شروع پخش صوتی، کلیک نمایید.', 'info');
  });

  audio.ontimeupdate = () => {
    const current = Math.floor(audio.currentTime);
    const total = Math.floor(audio.duration) || 100;
    const pct = (current / total) * 100;
    const fill = $('#audio-progress-fill');
    if (fill) fill.style.width = `${pct}%`;

    const mins = Math.floor(current / 60).toString().padStart(2, '0');
    const secs = (current % 60).toString().padStart(2, '0');
    const timeDisplay = $('#audio-time-display');
    if (timeDisplay) timeDisplay.textContent = `${mins}:${secs} / ${podcast.duration}`;
  };

  playBtn.onclick = () => {
    if (audio.paused) {
      audio.play();
      AppState.isAudioPlaying = true;
      playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    } else {
      audio.pause();
      AppState.isAudioPlaying = false;
      playBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    }
  };

  showToast(`در حال پخش: ${podcast.title}`, 'info');
}

// Video Documentary Modal
function openVideoModal(videoId) {
  const article = AVALIN_DATA.articles.find(a => a.id === videoId) || AVALIN_DATA.articles[18];

  const modalHtml = `
    <div class="modal-backdrop active" id="video-modal">
      <div class="modal-container" style="max-width: 800px;">
        <div class="modal-header">
          <h3>${article.title}</h3>
          <button class="modal-close-btn" onclick="closeModal('video-modal')" aria-label="بستن ویدیو">✕</button>
        </div>
        <div class="modal-body" style="padding: 0;">
          <div style="aspect-ratio: 16/9; background: #000; position: relative;">
            <video controls autoplay style="width: 100%; height: 100%;" poster="${article.image}">
              <source src="${article.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}" type="video/mp4">
              مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
            </video>
          </div>
          <div style="padding: 1.25rem;">
            <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.7;">${article.lead}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Citizen Journalism Modal
function openCitizenModal() {
  const modalHtml = `
    <div class="modal-backdrop active" id="citizen-modal">
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <h3>ارسال سوژه، گزارش و ویدیوی شهروندی</h3>
          <button class="modal-close-btn" onclick="closeModal('citizen-modal')" aria-label="بستن">✕</button>
        </div>
        <div class="modal-body">
          <form id="citizen-form" onsubmit="handleCitizenSubmit(event)">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem;">عنوان رویداد یا گزارش *</label>
              <input type="text" id="citizen-title" required placeholder="مثال: قطعی آب در منطقه ۶ و عدم پاسخگویی مسئولان" style="width: 100%; background: var(--bg-surface-2); border: 1px solid var(--border-subtle); padding: 0.65rem; border-radius: var(--radius-sm); font-size: 0.9rem;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem;">دسته‌بندی موضوعی *</label>
                <select id="citizen-category" required style="width: 100%; background: var(--bg-surface-2); border: 1px solid var(--border-subtle); padding: 0.65rem; border-radius: var(--radius-sm); font-size: 0.9rem;">
                  <option value="social">مسائل شهری و اجتماعی</option>
                  <option value="economy">اقتصادی و صنفی</option>
                  <option value="health">بهداشت و درمان</option>
                  <option value="environment">محیط‌زیست و بحران‌های طبیعی</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem;">شماره تماس یا ایمیل *</label>
                <input type="text" id="citizen-contact" required placeholder="جهت راستی‌آزمایی توسط تحریریه" style="width: 100%; background: var(--bg-surface-2); border: 1px solid var(--border-subtle); padding: 0.65rem; border-radius: var(--radius-sm); font-size: 0.9rem;" />
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem;">شرح کامل ماجرا و جزئیات مکانی *</label>
              <textarea id="citizen-desc" rows="4" required placeholder="زمان دقیق، نشانی محل رویداد و توضیحات مستند..." style="width: 100%; background: var(--bg-surface-2); border: 1px solid var(--border-subtle); padding: 0.65rem; border-radius: var(--radius-sm); font-size: 0.9rem; resize: vertical;"></textarea>
            </div>

            <div style="margin-bottom: 1.5rem; background: var(--bg-surface-2); border: 1px dashed var(--border-subtle); padding: 1rem; border-radius: var(--radius-sm); text-align: center;">
              <input type="file" id="citizen-file" accept="image/*,video/*" style="display: none;" onchange="updateCitizenFileName(this)" />
              <button type="button" class="btn btn-outline" onclick="$('#citizen-file').click()" style="font-size: 0.85rem;">
                📎 انتخاب عکس یا فیلم مستند
              </button>
              <p id="citizen-file-label" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.5rem;">حداکثر حجم مجاز: ۵۰ مگابایت (فرمت‌های JPG, MP4)</p>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button type="button" class="btn btn-outline" onclick="closeModal('citizen-modal')">انصراف</button>
              <button type="submit" class="btn btn-primary">ثبت و ارسال گزارش</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function updateCitizenFileName(input) {
  const label = $('#citizen-file-label');
  if (label && input.files && input.files[0]) {
    label.textContent = `فایل انتخاب شد: ${input.files[0].name} (${(input.files[0].size / 1024 / 1024).toFixed(1)} MB)`;
    label.style.color = 'var(--brand-success)';
  }
}

function handleCitizenSubmit(e) {
  e.preventDefault();
  const title = $('#citizen-title').value;
  const trackingCode = 'AK-' + Math.floor(100000 + Math.random() * 900000);

  closeModal('citizen-modal');

  const successHtml = `
    <div class="modal-backdrop active" id="citizen-success-modal">
      <div class="modal-container" style="max-width: 460px; text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.75rem;">گزارش با موفقیت ثبت شد</h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
          سوژه ارسالی شما با عنوان «<strong>${title}</strong>» در صف بررسی واحد راستی‌آزمایی و هیئت تحریریه قرار گرفت.
        </p>
        <div style="background: var(--bg-surface-2); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; margin-bottom: 1.5rem;">
          کد پیگیری شهروندخبرنگار: <strong style="color: var(--brand-primary); font-family: monospace;">${trackingCode}</strong>
        </div>
        <button class="btn btn-primary" onclick="closeModal('citizen-success-modal')">متوجه شدم</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', successHtml);
}

// Fact-checking Policy Modal
function openFactCheckModal() {
  const modalHtml = `
    <div class="modal-backdrop active" id="factcheck-modal">
      <div class="modal-container" style="max-width: 580px;">
        <div class="modal-header">
          <h3>شیوه‌نامه راستی‌آزمایی اولین خبر</h3>
          <button class="modal-close-btn" onclick="closeModal('factcheck-modal')" aria-label="بستن">✕</button>
        </div>
        <div class="modal-body" style="font-size: 0.92rem; line-height: 1.8;">
          <h4 style="color: var(--brand-primary); margin-bottom: 0.5rem;">پروتکل پنج‌مرحله‌ای سنجش صحت اخبار:</h4>
          <ol style="padding-right: 1.25rem; margin-bottom: 1.25rem;">
            <li><strong>تطبیق چندمنبعی:</strong> هیچ گزارشی بدون تأیید حداقل ۲ منبع مستقل منتشر نخواهد شد.</li>
            <li><strong>راستی‌آزمایی تصویری:</strong> تصاویر و ویدیوهای ارسالی با الگوریتم‌های تحلیل متادیتا و جستجوی معکوس پایش می‌شوند.</li>
            <li><strong>تفکیک ادعا از واقعیت:</strong> تمایز قطعی میان بیانیه‌های رسمی، گمانه‌زنی‌ها و شواهد عینی رعایت می‌شود.</li>
            <li><strong>پاسخگویی به خطاهای محتوایی:</strong> هرگونه اصلاحیه با برچسب زمان‌دار شفاف اعلام خواهد شد.</li>
            <li><strong>محرمانگی منابع:</strong> هویت شهروندخبرنگاران در صورت درخواست مطابق پروتکل‌های امنیتی محافظت می‌شود.</li>
          </ol>
          <button class="btn btn-primary" style="width: 100%;" onclick="closeModal('factcheck-modal')">بستن شیوه‌نامه</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Newsletter Subscription Handler
function handleNewsletter(form) {
  const input = form.querySelector('input[type="email"]');
  if (!input) return false;
  const email = input.value.trim();

  // Basic regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('لطفا یک آدرس ایمیل معتبر وارد فرمایید.', 'error');
    input.focus();
    return false;
  }

  showToast('عضویت شما در بولتن تحلیلی تحریریه با موفقیت ثبت شد!', 'success');
  input.value = '';
  return false;
}

// Interactive Comments Handler
function handleCommentSubmit(event, articleId) {
  event.preventDefault();
  const nameInput = $('#comment-name');
  const textInput = $('#comment-text');

  if (!nameInput || !textInput) return;
  const name = nameInput.value.trim();
  const text = textInput.value.trim();

  if (!name || !text) {
    showToast('لطفا نام و متن دیدگاه را تکمیل نمایید.', 'error');
    return;
  }

  const article = AVALIN_DATA.articles.find(a => a.id === parseInt(articleId, 10));
  if (article) {
    if (!article.comments) article.comments = [];
    article.comments.unshift({
      id: 'c_' + Date.now(),
      author: name,
      date: 'لحظاتی پیش',
      text: text,
      likes: 0
    });
  }

  const list = $('#comments-list');
  if (list) {
    const newCommentHtml = `
      <div class="comment-card" style="animation: toastSlide 0.3s ease forwards;">
        <div class="comment-header">
          <strong>${name}</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">لحظاتی پیش</span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">${text}</p>
      </div>
    `;
    list.insertAdjacentHTML('afterbegin', newCommentHtml);
  }

  nameInput.value = '';
  textInput.value = '';
  showToast('دیدگاه شما با موفقیت ثبت گردید و پس از بازبینی منتشر می‌شود.', 'success');
}

// Page Initializers
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFontSize();
  initSocialLinks();
  initSearchModal();
  initMobileMenu();
  updateBookmarkButtons();

  // Event listener for bookmarks and likes across the app
  document.addEventListener('click', (e) => {
    const bookmarkBtn = e.target.closest('[data-bookmark-id]');
    if (bookmarkBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleBookmark(bookmarkBtn.dataset.bookmarkId);
      return;
    }

    const likeBtn = e.target.closest('[data-like-id]');
    if (likeBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleLike(likeBtn.dataset.likeId);
      return;
    }

    const shareBtn = e.target.closest('[data-share-btn]');
    if (shareBtn) {
      e.preventDefault();
      e.stopPropagation();
      openShareModal(shareBtn.dataset.shareTitle, shareBtn.dataset.shareUrl);
      return;
    }

    const videoTrigger = e.target.closest('[data-video-id]');
    if (videoTrigger) {
      e.preventDefault();
      openVideoModal(parseInt(videoTrigger.dataset.videoId, 10));
      return;
    }

    const podcastTrigger = e.target.closest('[data-podcast-id]');
    if (podcastTrigger) {
      e.preventDefault();
      playPodcast(podcastTrigger.dataset.podcastId);
      return;
    }
  });
});
