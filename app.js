// app.js — main page: unit/chapter/section browser, character search, and the
// random Pop Quiz configuration panel.

async function loadData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error('Failed to load data.json');
  return res.json();
}

function renderSection(unit, chapter, section) {
  const row = el('div', { class: 'section-row' });
  row.appendChild(el('span', { text: section.title + (section.sentence ? '  —  ' + section.sentence : '') }));

  const btn = el('button', { text: 'Start' });
  btn.addEventListener('click', () => {
    const params = new URLSearchParams({ unit: unit.id, chapter: chapter.id, section: section.id });
    window.location.href = 'learn.html?' + params.toString();
  });
  row.appendChild(btn);
  return row;
}

function renderChapter(unit, chapter) {
  const wrap = el('div', { class: 'chapter' });
  wrap.appendChild(el('h3', { text: chapter.title }));
  chapter.sections.forEach(section => wrap.appendChild(renderSection(unit, chapter, section)));
  return wrap;
}

function renderUnit(unit) {
  const wrap = el('div', { class: 'unit' });
  wrap.appendChild(el('h2', { text: unit.title }));
  unit.chapters.forEach(chapter => wrap.appendChild(renderChapter(unit, chapter)));
  return wrap;
}

// ---------- search ----------
function renderSearchResults(container, matches, query) {
  container.innerHTML = '';
  if (!query) return;

  if (matches.length === 0) {
    container.appendChild(el('p', { text: 'No matches in your data.' }));
  }

  matches.slice(0, 20).forEach(item => {
    const row = el('div', { class: 'section-row' });
    row.appendChild(el('span', {
      text: `${item.char}   ${item.pinyin || ''}   —   ${item.meaning || ''}   (${item.unit.title} / ${item.chapter.title})`
    }));
    const btn = el('button', { text: 'Practice' });
    btn.addEventListener('click', () => {
      const params = new URLSearchParams({ char: item.char, pinyin: item.pinyin || '', meaning: item.meaning || '' });
      window.location.href = 'practice.html?' + params.toString();
    });
    row.appendChild(btn);
    container.appendChild(row);
  });

  // A Chinese character that isn't in the data yet can still be practiced directly.
  const isChineseText = /[\u4e00-\u9fff]/.test(query);
  const exactCharMatch = matches.some(m => m.char === query);
  if (isChineseText && !exactCharMatch) {
    const row = el('div', { class: 'section-row' });
    row.appendChild(el('span', { text: `"${query}" isn't in your data — practice it anyway?` }));
    const btn = el('button', { text: 'Practice' });
    btn.addEventListener('click', () => {
      const params = new URLSearchParams({ char: query });
      window.location.href = 'practice.html?' + params.toString();
    });
    row.appendChild(btn);
    container.appendChild(row);
  }
}

function setupSearch(data) {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const all = flattenCharacters(data, { includeContext: true });

  input.addEventListener('input', () => {
    const q = input.value.trim();
    const qLower = q.toLowerCase();
    const matches = q
      ? all.filter(item =>
          (item.char && item.char.includes(q)) ||
          (item.pinyin && item.pinyin.toLowerCase().includes(qLower)) ||
          (item.meaning && item.meaning.toLowerCase().includes(qLower))
        )
      : [];
    renderSearchResults(results, matches, q);
  });
}

// ---------- random pop quiz config ----------
function setupRandomQuiz(data) {
  const unitSelect = document.getElementById('quiz-unit-select');
  const chapterSelect = document.getElementById('quiz-chapter-select');
  const countInput = document.getElementById('quiz-count');
  const countValue = document.getElementById('quiz-count-value');
  const note = document.getElementById('quiz-config-note');
  const startBtn = document.getElementById('start-random-quiz');

  unitSelect.appendChild(el('option', { value: 'all', text: 'All units' }));
  data.units.forEach(unit => unitSelect.appendChild(el('option', { value: unit.id, text: unit.title })));

  function refreshChapterOptions() {
    chapterSelect.innerHTML = '';
    chapterSelect.appendChild(el('option', { value: 'all', text: 'All chapters' }));
    if (unitSelect.value !== 'all') {
      const unit = data.units.find(u => u.id === unitSelect.value);
      unit.chapters.forEach(ch => chapterSelect.appendChild(el('option', { value: ch.id, text: ch.title })));
    }
  }

  function updateNote() {
    const scope = {
      unitId: unitSelect.value === 'all' ? null : unitSelect.value,
      chapterId: chapterSelect.value === 'all' ? null : chapterSelect.value
    };
    const pool = flattenCharacters(data, scope);
    note.textContent = pool.length
      ? `${pool.length} characters/words available in this scope.`
      : 'No characters found in this scope yet.';
  }

  refreshChapterOptions();
  updateNote();

  unitSelect.addEventListener('change', () => { refreshChapterOptions(); updateNote(); });
  chapterSelect.addEventListener('change', updateNote);
  countInput.addEventListener('input', () => { countValue.textContent = countInput.value; });

  startBtn.addEventListener('click', () => {
    const params = new URLSearchParams({
      unit: unitSelect.value,
      chapter: chapterSelect.value,
      count: countInput.value
    });
    window.location.href = 'random-quiz.html?' + params.toString();
  });
}

async function init() {
  const container = document.getElementById('units');
  try {
    const data = await loadData();
    data.units.forEach(unit => container.appendChild(renderUnit(unit)));
    setupSearch(data);
    setupRandomQuiz(data);
  } catch (err) {
    container.appendChild(el('p', { text: 'Error loading data: ' + err.message }));
    container.appendChild(el('p', { text: 'If you opened this file directly (file://), run a local server instead, e.g. "python3 -m http.server" then open http://localhost:8000' }));
  }
}

init();
