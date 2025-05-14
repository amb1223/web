let isDark = true;
let menuOpen = false;
let wikiData = {};

function simulateLoading() {
  const progressBar = document.getElementById('progressBar');
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingLogo = document.getElementById('loadingLogo');
  
  loadingLogo.src = isDark ? '/assets/img/zenora-logo-dark.svg' : '/assets/img/zenora-logo-light.svg';
  
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress > 100) progress = 100;
    progressBar.style.width = `${progress}%`;
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        document.querySelector('.navbar').classList.add('active');
      }, 500);
    }
  }, 200);
}

function toggleTheme() {
  isDark = !isDark;
  const theme = isDark ? 'dark' : 'light';
  document.body.setAttribute('data-theme', theme);
  
  localStorage.setItem('theme', theme);
  
  const themeIcon = document.getElementById('themeIcon');
  themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
  
  const logo = document.querySelector('.navbar img');
  const loadingLogo = document.getElementById('loadingLogo');
  logo.src = isDark ? '/assets/img/zenora-logo-dark.svg' : '/assets/img/zenora-logo-light.svg';
  loadingLogo.src = isDark ? '/assets/img/zenora-logo-dark.svg' : '/assets/img/zenora-logo-light.svg';
  
  logo.style.transition = 'opacity 0.3s ease';
  logo.style.opacity = 0;
  setTimeout(() => { 
    logo.style.opacity = 1;
    setTimeout(() => { logo.style.transition = ''; }, 300);
  }, 150);
  
  document.body.classList.add('theme-transition');
  setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 500);
}

function toggleMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  const body = document.body;
  
  menuOpen = !menuOpen;
  
  if (menuOpen) {
    hamburgerBtn.classList.add('open');
    mobileMenu.classList.add('open');
    overlay.classList.add('active');
    body.classList.add('menu-open');
    
    const links = document.querySelectorAll('.mobile-link');
    links.forEach((link, index) => {
      link.style.opacity = '1';
      link.style.transform = 'translateX(0)';
      link.style.transition = `all 0.5s ease ${index * 0.1}s`;
    });
  } else {
    hamburgerBtn.classList.remove('open');
    mobileMenu.classList.remove('open');
    overlay.classList.remove('active');
    body.classList.remove('menu-open');
    
    const links = document.querySelectorAll('.mobile-link');
    links.forEach(link => {
      link.style.opacity = '0';
      link.style.transform = 'translateX(30px)';
      link.style.transition = 'all 0.3s ease';
    });
  }
}

function toggleLanguage() {
  const currentLang = window.location.pathname.includes('/fa') ? 'fa' : 'en';
  const newLang = currentLang === 'fa' ? 'en' : 'fa';
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page') || 'home';
  window.location.href = `/${newLang}/?page=${page}`;
}

window.addEventListener('popstate', function(event) {
  if (event.state && event.state.page) {
    loadContent(event.state.page);
  } else {
    loadContent('home');
  }
});

function loadContent(page) {
  const lang = window.location.pathname.includes('/fa') ? 'fa' : 'en';
  fetch(`/${lang}/${page}.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      initializeDynamicContent();
      
      if (page === 'wiki') {
        initializeWikiContent(lang);
      }
      
      history.pushState({ page: page }, '', `?page=${page}`);
      updateNavActive(page);
      
      if (menuOpen) {
        toggleMenu();
      }
    })
    .catch(error => console.error(`خطا در بارگذاری ${page}.html:`, error));
}

function updateNavActive(currentPage) {
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === currentPage) {
      link.classList.add('active');
    }
  });
}

function initializeDynamicContent() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.feature-card, .download-card').forEach(card => {
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

window.scrollToSection = function(selector) {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  const navbarHeight = navbar.offsetHeight;
  const element = document.querySelector(selector);
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: elementPosition - navbarHeight,
      behavior: 'smooth'
    });
  }
};

window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  isDark = savedTheme === 'dark';
  document.body.setAttribute('data-theme', savedTheme);

  const themeIcon = document.getElementById('themeIcon');
  themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';

  simulateLoading();
  
  window.addEventListener('scroll', handleScroll);

  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page') || 'home';
  loadContent(page);
});

function handleScroll() {
  const scrollY = window.scrollY;
  const navbar = document.querySelector('.navbar');
  
  if (scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  document.querySelectorAll('.parallax-bg').forEach(bg => {
    bg.style.transform = `translateZ(-1px) scale(1.5) translateY(${scrollY * 0.5}px)`;
  });
}

// Wiki-specific functionality
const converter = new showdown.Converter({
  tables: true,
  tasklists: true,
  ghCodeBlocks: true,
  openLinksInNewWindow: false,
  simplifiedAutoLink: true,
  tablesHeaderId: true
});

async function loadWikiIndex(lang) {
  try {
    const baseUrl = 'https://raw.githubusercontent.com/amb1223/JustRepo/refs/heads/main';
    const url = `${baseUrl}/json/articles-${lang}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load wiki index');
    wikiData[lang] = await response.json();
    return wikiData[lang];
  } catch (error) {
    console.error('Error loading wiki index from GitHub:', error);
    wikiData[lang] = { ui: {}, categories: [] };
    return wikiData[lang];
  }
}

async function loadArticleContent(articleId, lang) {
  try {
    const baseUrl = 'https://raw.githubusercontent.com/amb1223/JustRepo/refs/heads/main';
    const url = `${baseUrl}/${lang}/${articleId}.md`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Article not found');
    return await response.text();
  } catch (error) {
    console.error('Error loading article from GitHub:', error);
    return null;
  }
}

function renderMarkdown(markdown) {
  return converter.makeHtml(markdown);
}

function generateTOC(html) {
  const toc = document.getElementById('tocContent');
  toc.innerHTML = '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const headings = Array.from(doc.querySelectorAll('h2, h3'));
  headings.forEach((heading, index) => {
    const level = heading.tagName.toLowerCase();
    const text = heading.textContent;
    const id = `toc-${index}`;
    heading.id = id;
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${id}">${text}</a>`;
    if (level === 'h3') {
      li.style.paddingLeft = '15px';
    }
    toc.appendChild(li);
  });
  return doc.body.firstChild.innerHTML;
}

async function displayArticle(articleId, lang) {
  const contentDiv = document.getElementById('articleContent');
  const titleDiv = document.getElementById('articleTitle');
  contentDiv.innerHTML = '<p>Loading...</p>';
  const markdown = await loadArticleContent(articleId, lang);
  if (!markdown) {
    contentDiv.innerHTML = `<h1>${wikiData[lang].ui.articleNotFound || 'Article Not Found'}</h1><p>${wikiData[lang].ui.articleNotFoundMessage || 'The requested article could not be loaded.'}</p><a href="#" onclick="loadDefaultArticle(); return false;" style="background: rgba(var(--accent-dark-rgb), 0.2); color: var(--accent-dark); padding: 10px 20px; text-decoration: none; border-radius: 4px;">${wikiData[lang].ui.backToHome || 'Back to Home'}</a>`;
    titleDiv.textContent = wikiData[lang].ui.articleNotFound || 'Article Not Found';
    return;
  }
  let html = renderMarkdown(markdown);
  html = generateTOC(html);
  contentDiv.innerHTML = html;
  titleDiv.textContent = markdown.split('\n')[0].replace('# ', '');

  document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
  document.querySelector(`.sidebar a[data-article="${articleId}"]`)?.classList.add('active');

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('a[href].article-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const articleId = link.getAttribute('href');
      displayArticle(articleId, lang);
    });
  });
}

async function loadSidebarLinks(lang) {
  const wikiIndex = await loadWikiIndex(lang);
  const sidebar = document.getElementById('sidebarLinks');
  sidebar.innerHTML = '';
  for (const category of wikiIndex.categories) {
    const li = document.createElement('li');
    li.innerHTML = `<h2>${category.name}</h2><ul></ul>`;
    const ul = li.querySelector('ul');
    category.articles.forEach(article => {
      const a = document.createElement('a');
      a.href = '#';
      a.setAttribute('data-article', article.id);
      a.textContent = article.title;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        displayArticle(article.id, lang);
      });
      ul.appendChild(a);
    });
    sidebar.appendChild(li);
  }
}

async function loadDefaultArticle(lang) {
  const wikiIndex = await loadWikiIndex(lang);
  const firstArticle = wikiIndex.categories[0]?.articles[0]?.id || 'introduction';
  displayArticle(firstArticle, lang);
}

async function initializeWikiContent(lang) {
  await loadWikiIndex(lang);

  function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.body.classList.toggle('rtl', lang === 'fa');
    document.getElementById('sidebarTitle').textContent = wikiData[lang].ui.sidebarTitle || 'Sidebar';
    document.getElementById('tocTitle').textContent = wikiData[lang].ui.tocTitle || 'Table of Contents';
    loadSidebarLinks(lang);
    loadDefaultArticle(lang);
  }

  setLanguage(lang);
}