const converter = new showdown.Converter({
  tables: true,
  tasklists: true,
  ghCodeBlocks: true,
  openLinksInNewWindow: false,
  simplifiedAutoLink: true,
  tablesHeaderId: true
});

let wikiData = {};
let isDark = true;
let menuOpen = false;

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
    return { ui: {}, categories: [] };
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
    contentDiv.innerHTML = `<h1>${wikiData[lang].ui.articleNotFound}</h1><p>${wikiData[lang].ui.articleNotFoundMessage}</p><a href="#" onclick="loadDefaultArticle(); return false;" style="background: rgba(var(--accent-dark-rgb), 0.2); color: var(--accent-dark); padding: 10px 20px; text-decoration: none; border-radius: 4px;">${wikiData[lang].ui.backToHome}</a>`;
    titleDiv.textContent = wikiData[lang].ui.articleNotFound;
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

function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.body.classList.toggle('rtl', lang === 'fa');

  
  document.getElementById('sidebarTitle').textContent = wikiData[lang].ui.sidebarTitle;
  document.getElementById('tocTitle').textContent = wikiData[lang].ui.tocTitle;

  loadSidebarLinks(lang);
  loadDefaultArticle(lang);
}

function handleScroll() {
  const scrollY = window.scrollY;
  const navbar = document.querySelector('.navbar');

  if (scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const langSelector = document.getElementById('languageSelector');

  
  await loadWikiIndex('en');
  await loadWikiIndex('fa');

  
  langSelector.querySelector('option[value="en"]').textContent = wikiData.en.ui.languageName;
  langSelector.querySelector('option[value="fa"]').textContent = wikiData.fa.ui.languageName;

  let lang = window.location.pathname.includes('/fa') ? 'fa' : 'en';
  langSelector.value = lang;
  setLanguage(lang);

  langSelector.addEventListener('change', (e) => {
    const newLang = e.target.value;
    window.history.pushState({}, '', `/${newLang}/`);
    setLanguage(newLang);
  });

  
  const savedTheme = localStorage.getItem('theme') || 'dark';
  isDark = savedTheme === 'dark';
  document.body.setAttribute('data-theme', savedTheme);

  const themeIcon = document.getElementById('themeIcon');
  themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';

  
  document.querySelector('.navbar').classList.add('active');

  
  window.addEventListener('scroll', handleScroll);
});