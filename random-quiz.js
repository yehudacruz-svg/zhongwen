// random-quiz.js — the random Pop Quiz: pulls `count` characters/words at random from
// the chosen scope (all data / one unit / one chapter) and runs them through the exact
// same no-hints-up-front Pop Quiz flow as the per-section Pop Quiz (POP_QUIZ_WRITER_OPTIONS).

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    unit: p.get('unit') || 'all',
    chapter: p.get('chapter') || 'all',
    count: Math.min(100, Math.max(10, parseInt(p.get('count'), 10) || 20))
  };
}

const root = document.getElementById('app-root');
const breadcrumbEl = document.getElementById('breadcrumb-info');
const progressInner = document.getElementById('progress-bar-inner');
const progressLabel = document.getElementById('progress-label');

function clearRoot() { root.innerHTML = ''; }

function setProgress(current, total, label) {
  const pct = total > 0 ? Math.min(100, Math.max(0, Math.round((current / total) * 100))) : 0;
  progressInner.style.width = pct + '%';
  progressLabel.textContent = label ? `${label} (${pct}%)` : `${pct}%`;
}

const ctx = { root, clearRoot, setProgress };

function startRandomQuiz(pool, count) {
  const items = cyclicSample(pool, count);
  const total = items.length;
  runQuizPhase(ctx, items, 0, { correct: 0, total: items.length }, 0, total, POP_QUIZ_WRITER_OPTIONS, (tally) => {
    setProgress(total, total, 'Complete');
    showQuizResults(ctx, tally, 'Pop quiz complete', [
      { label: 'New random set', onClick: () => startRandomQuiz(pool, count) },
      { label: 'Back to main page', onClick: () => { window.location.href = 'index.html'; } }
    ]);
  });
}

async function init() {
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    const { unit, chapter, count } = getParams();
    const scope = { unitId: unit === 'all' ? null : unit, chapterId: chapter === 'all' ? null : chapter };
    const pool = flattenCharacters(data, scope);

    const unitObj = data.units.find(u => u.id === unit);
    const chapterObj = unitObj ? unitObj.chapters.find(c => c.id === chapter) : null;
    const scopeLabel = chapterObj ? chapterObj.title : (unitObj ? unitObj.title : 'All units');
    breadcrumbEl.textContent = `Pop Quiz — ${scopeLabel} — ${count} random characters`;

    if (pool.length === 0) {
      root.appendChild(el('p', { text: 'No characters found in this scope yet — go back and pick a different scope.' }));
      return;
    }

    startRandomQuiz(pool, count);
  } catch (err) {
    breadcrumbEl.textContent = 'Error: ' + err.message;
  }
}

init();
