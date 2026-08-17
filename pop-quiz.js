// pop quiz

async function init() {
  const bookSelect = document.getElementById('quiz-book-select');
  const unitSelect = document.getElementById('quiz-unit-select');
  const chapterSelect = document.getElementById('quiz-chapter-select');
  const countInput = document.getElementById('quiz-count');
  const countValue = document.getElementById('quiz-count-value');
  const note = document.getElementById('quiz-config-note');
  const startBtn = document.getElementById('start-random-quiz');

  bookSelect.appendChild(el('option', { value: 'all', text: 'All textbooks' }));
  BOOKS.forEach(b => bookSelect.appendChild(el('option', { value: b.id, text: b.label })));

  const loadedBooks = {};

  async function getBookData(bookId) {
    if (!loadedBooks[bookId]) {
      const book = BOOKS.find(b => b.id === bookId);
      loadedBooks[bookId] = await loadBook(book.file);
    }
    return loadedBooks[bookId];
  }

  async function refreshUnitOptions() {
    unitSelect.innerHTML = '';
    unitSelect.appendChild(el('option', { value: 'all', text: 'All units' }));
    if (bookSelect.value !== 'all') {
      const data = await getBookData(bookSelect.value);
      data.units.forEach(u => unitSelect.appendChild(el('option', { value: u.id, text: u.title })));
    }
    unitSelect.disabled = bookSelect.value === 'all';
  }

  async function refreshChapterOptions() {
    chapterSelect.innerHTML = '';
    chapterSelect.appendChild(el('option', { value: 'all', text: 'All chapters' }));
    if (bookSelect.value !== 'all' && unitSelect.value !== 'all') {
      const data = await getBookData(bookSelect.value);
      const unit = data.units.find(u => u.id === unitSelect.value);
      if (unit) unit.chapters.forEach(c => chapterSelect.appendChild(el('option', { value: c.id, text: c.title })));
    }
    chapterSelect.disabled = bookSelect.value === 'all' || unitSelect.value === 'all';
  }

  async function updateNote() {
    let pool = [];
    if (bookSelect.value === 'all') {
      for (const b of BOOKS) {
        const data = await getBookData(b.id);
        pool = pool.concat(flattenCharacters(data));
      }
    } else {
      const data = await getBookData(bookSelect.value);
      pool = flattenCharacters(data, {
        unitId: unitSelect.value === 'all' ? null : unitSelect.value,
        chapterId: chapterSelect.value === 'all' ? null : chapterSelect.value
      });
    }
    note.textContent = pool.length
      ? `${pool.length} characters/words available.`
      : 'No characters found :(';
  }

  bookSelect.addEventListener('change', async () => {
    await refreshUnitOptions();
    await refreshChapterOptions();
    await updateNote();
  });
  unitSelect.addEventListener('change', async () => {
    await refreshChapterOptions();
    await updateNote();
  });
  chapterSelect.addEventListener('change', updateNote);
  countInput.addEventListener('input', () => { countValue.textContent = countInput.value; });

  await refreshUnitOptions();
  await refreshChapterOptions();
  await updateNote();

  startBtn.addEventListener('click', () => {
    const params = new URLSearchParams({
      book: bookSelect.value,
      unit: unitSelect.value,
      chapter: chapterSelect.value,
      count: countInput.value
    });
    window.location.href = 'random-quiz.html?' + params.toString();
  });
}

document.addEventListener('DOMContentLoaded', init);
//yc