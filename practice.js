// practice.js — single-item practice view reached from the main page's search bar.
// Same preview -> quiz flow as Character Learning, just for one searched item
// (which may or may not exist in data.json).

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return { char: p.get('char') || '', pinyin: p.get('pinyin') || '', meaning: p.get('meaning') || '' };
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

function startPractice(item) {
  const items = [item];
  const total = 2; // 1 preview step + 1 quiz step
  runLearnPhase(ctx, items, 0, total, () => {
    runQuizPhase(ctx, items, 0, { correct: 0, total: 1 }, 1, total, LEARNING_QUIZ_OPTIONS, (tally) => {
      setProgress(total, total, 'Complete');
      showQuizResults(ctx, tally, 'Practice complete', [
        { label: 'Practice again', onClick: () => startPractice(item) },
        { label: 'Back to search', onClick: () => { window.location.href = 'index.html'; } }
      ]);
    });
  });
}

function init() {
  const { char, pinyin, meaning } = getParams();
  if (!char) {
    breadcrumbEl.textContent = 'No character given.';
    root.appendChild(el('p', { text: 'Go back and search for a character to practice.' }));
    return;
  }
  breadcrumbEl.textContent = `Practicing: ${char}${pinyin ? '   ' + pinyin : ''}${meaning ? '   —   ' + meaning : ''}`;
  startPractice({ char, pinyin, meaning });
}

init();
