// main textbook 

function renderSection(unit, chapter, section, bookId) {
  const row = el('div', { class: 'section-row' });
  row.appendChild(el('span', { text: section.title + (section.sentence ? '  —  ' + section.sentence : '') }));
  const btn = el('button', { text: 'Start' });
  btn.addEventListener('click', () => {
    const params = new URLSearchParams({ book: bookId, unit: unit.id, chapter: chapter.id, section: section.id });
    window.location.href = 'learn.html?' + params.toString();
  });
  row.appendChild(btn);
  return row;
}

function renderChapter(unit, chapter, bookId) {
  const wrap = el('div', { class: 'chapter' });
  wrap.appendChild(el('h3', { text: chapter.title }));
  chapter.sections.forEach(section => wrap.appendChild(renderSection(unit, chapter, section, bookId)));
  return wrap;
}

function renderUnit(unit, bookId) {
  const wrap = el('div', { class: 'unit' });
  wrap.appendChild(el('h2', { text: unit.title }));
  unit.chapters.forEach(chapter => wrap.appendChild(renderChapter(unit, chapter, bookId)));
  return wrap;
}

async function initBookPage() {
  const bookId = document.body.getAttribute('data-book');
  const book = BOOKS.find(b => b.id === bookId);
  const container = document.getElementById('units');
  try {
    const data = await loadBook(book.file);
    data.units.forEach(unit => container.appendChild(renderUnit(unit, bookId)));
  } catch (err) {
    container.appendChild(el('p', { text: 'Error loading data: ' + err.message }));
    container.appendChild(el('p', { text: 'please head back to the home page' }));
  }
}

document.addEventListener('DOMContentLoaded', initBookPage);
//YC