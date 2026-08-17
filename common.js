// header/footer

const BOOKS = [
  { id: '1', file: 'data-textbook1.json', label: 'Textbook 1' },
  { id: '2', file: 'data-textbook2.json', label: 'Textbook 2' }
];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  children.forEach(c => node.appendChild(c));
  return node;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


function cyclicSample(pool, count) {
  let out = [];
  while (out.length < count) {
    out = out.concat(shuffle(pool));
  }
  return out.slice(0, count);
}


function flattenCharacters(data, { unitId = null, chapterId = null, includeContext = false } = {}) {
  const out = [];
  data.units.forEach(unit => {
    if (unitId && unit.id !== unitId) return;
    unit.chapters.forEach(chapter => {
      if (chapterId && chapter.id !== chapterId) return;
      chapter.sections.forEach(section => {
        (section.characters || []).forEach(item => {
          if (!item.char) return;
          out.push(includeContext ? { ...item, unit, chapter, section } : item);
        });
      });
    });
  });
  return out;
}

async function loadBook(file) {
  const res = await fetch(file);
  if (!res.ok) throw new Error('Failed to load ' + file);
  return res.json();
}

async function loadAllBooks() {
  const results = await Promise.all(BOOKS.map(async book => ({ book, data: await loadBook(book.file) })));
  return results;
}

function subCharsOf(item) {
  return Array.from(item.char || '');
}

function writerSize(numChars) {
  const vw = Math.min(window.innerWidth, 900);
  let base;
  if (vw < 420) base = 150;
  else if (vw < 640) base = 190;
  else if (vw < 900) base = 230;
  else base = 270;

  if (numChars <= 1) return base;
  if (numChars === 2) return Math.round(base * 0.72);
  return Math.round(base * 0.55); // 3+ character words
}

let _writerIdCounter = 0;

function makeGridSvgTarget(size) {
  const id = 'hw-target-' + (_writerIdCounter++);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('xmlns', ns);
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('id', id);
  svg.setAttribute('class', 'writer-box');
  const lines = [
    [0, 0, size, size],
    [size, 0, 0, size],
    [size / 2, 0, size / 2, size],
    [0, size / 2, size, size / 2]
  ];
  lines.forEach(([x1, y1, x2, y2]) => {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#CCCCCC');
    svg.appendChild(line);
  });
  return { svg, id };
}


function createGridWriter(container, char, size, options) {
  const { svg, id } = makeGridSvgTarget(size);
  container.appendChild(svg);
  return HanziWriter.create(id, char, Object.assign({ width: size, height: size, padding: 5 }, options));
}

// main site header and footer
function buildHeader(activePage) {
  const header = el('header', { class: 'site-header' });
  const inner = el('div', { class: 'site-header-inner' });

  const brand = el('a', { class: 'brand', href: 'index.html' }, [
    el('i', { class: 'fa-solid fa-language', 'aria-hidden': 'true' }),
    el('span', { text: 'Hanzi Learning' })
  ]);

  const navLinks = [
    { href: 'textbook1.html', key: 'textbook1', label: 'Textbook 1' },
    { href: 'textbook2.html', key: 'textbook2', label: 'Textbook 2' },
    { href: 'pop-quiz.html', key: 'popquiz', label: 'Pop Quiz' }
  ];
  const nav = el('nav', { class: 'site-nav', id: 'site-nav' });
  navLinks.forEach(link => {
    const a = el('a', { href: link.href, text: link.label });
    if (link.key === activePage) a.classList.add('active');
    nav.appendChild(a);
  });

  const search = el('div', { class: 'site-search' });
  const searchBox = el('div', { class: 'site-search-box' }, [
    el('i', { class: 'fa-solid fa-magnifying-glass', 'aria-hidden': 'true' }),
    el('input', { type: 'text', id: 'site-search-input', placeholder: 'Search a character…', autocomplete: 'off' })
  ]);
  const searchResults = el('div', { class: 'site-search-results hidden', id: 'site-search-results' });
  search.appendChild(searchBox);
  search.appendChild(searchResults);

  const navToggle = el('button', { class: 'nav-toggle', id: 'nav-toggle', type: 'button', 'aria-label': 'Menu' }, [
    el('i', { class: 'fa-solid fa-bars', 'aria-hidden': 'true' })
  ]);

  inner.appendChild(brand);
  inner.appendChild(nav);
  inner.appendChild(search);
  inner.appendChild(navToggle);
  header.appendChild(inner);

  navToggle.addEventListener('click', () => nav.classList.toggle('open'));

  return header;
}

function buildFooter() {
  const footer = el('footer', { class: 'site-footer' });
  const inner = el('div', { class: 'site-footer-inner' });
  inner.appendChild(el('p', { class: 'footer-copy', text: '© ' + new Date().getFullYear() + ' 做康建宁' }));
  const links = el('nav', { class: 'footer-links' }, [
    el('a', { href: 'index.html', text: 'Home' }),
    el('a', { href: 'login.html', text: "Admin Page" }),
    el('a', { href: 'suggestion.html', text: 'Bugs and Suggestions' }),
    el('a', { href: 'terms.html', text: 'Terms and Privacy' })

  ]);
  inner.appendChild(links);
  footer.appendChild(inner);
  return footer;
}

function initHeaderSearch() {
  const input = document.getElementById('site-search-input');
  const results = document.getElementById('site-search-results');
  if (!input || !results) return;

  let allItems = null; 

  async function ensureLoaded() {
    if (allItems) return allItems;
    const loaded = await loadAllBooks();
    allItems = [];
    loaded.forEach(({ book, data }) => {
      flattenCharacters(data, { includeContext: true }).forEach(item => {
        allItems.push({ ...item, book });
      });
    });
    return allItems;
  }

  function renderResults(matches, query) {
    results.innerHTML = '';
    if (!query) { results.classList.add('hidden'); return; }

    if (matches.length === 0) {
      results.appendChild(el('p', { class: 'site-search-empty', text: 'No matches.' }));
    }

    matches.slice(0, 8).forEach(item => {
      const row = el('a', { class: 'site-search-result', href: '#' });
      row.appendChild(el('span', { class: 'site-search-char', text: item.char }));
      row.appendChild(el('span', {
        class: 'site-search-meta',
        text: `${item.pinyin || ''} — ${item.meaning || ''} · ${item.book.label}`
      }));
      row.addEventListener('click', (e) => {
        e.preventDefault();
        const params = new URLSearchParams({ char: item.char, pinyin: item.pinyin || '', meaning: item.meaning || '' });
        window.location.href = 'practice.html?' + params.toString();
      });
      results.appendChild(row);
    });

    const isChineseText = /[\u4e00-\u9fff]/.test(query);
    const exactMatch = matches.some(m => m.char === query);
    if (isChineseText && !exactMatch) {
      const row = el('a', { class: 'site-search-result', href: '#' });
      row.appendChild(el('span', { class: 'site-search-char', text: query }));
      row.appendChild(el('span', { class: 'site-search-meta', text: 'Not in your data — practice it anyway' }));
      row.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'practice.html?' + new URLSearchParams({ char: query }).toString();
      });
      results.appendChild(row);
    }

    results.classList.remove('hidden');
  }

  input.addEventListener('input', async () => {
    const q = input.value.trim();
    if (!q) { results.classList.add('hidden'); results.innerHTML = ''; return; }
    const items = await ensureLoaded();
    const qLower = q.toLowerCase();
    const matches = items.filter(item =>
      (item.char && item.char.includes(q)) ||
      (item.pinyin && item.pinyin.toLowerCase().includes(qLower)) ||
      (item.meaning && item.meaning.toLowerCase().includes(qLower))
    );
    renderResults(matches, q);
  });

  document.addEventListener('click', (e) => {
    if (!search_contains(e.target)) results.classList.add('hidden');
  });
  function search_contains(target) {
    return input.contains(target) || results.contains(target);
  }
}

function mountSiteChrome() {
  const headerMount = document.getElementById('site-header');
  const footerMount = document.getElementById('site-footer');
  const activePage = document.body.getAttribute('data-page') || '';

  if (headerMount) {
    headerMount.appendChild(buildHeader(activePage));
    initHeaderSearch();
  }
  if (footerMount) {
    footerMount.appendChild(buildFooter());
  }
}

document.addEventListener('DOMContentLoaded', mountSiteChrome);
//YC
