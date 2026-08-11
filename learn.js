// learn.js — per-section learning view: Character Learning (preview + quiz) and Pop Quiz.

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return { unit: p.get('unit'), chapter: p.get('chapter'), section: p.get('section') };
}

async function loadSection() {
  const res = await fetch('data.json');
  const data = await res.json();
  const { unit: unitId, chapter: chapterId, section: sectionId } = getParams();
  const unit = data.units.find(u => u.id === unitId);
  if (!unit) throw new Error('Unit not found: ' + unitId);
  const chapter = unit.chapters.find(c => c.id === chapterId);
  if (!chapter) throw new Error('Chapter not found: ' + chapterId);
  const section = chapter.sections.find(s => s.id === sectionId);
  if (!section) throw new Error('Section not found: ' + sectionId);
  return { unit, chapter, section };
}

const root = document.getElementById('app-root');
const breadcrumbEl = document.getElementById('breadcrumb-info');
const modeSelectEl = document.getElementById('mode-select');
const progressInner = document.getElementById('progress-bar-inner');
const progressLabel = document.getElementById('progress-label');

function clearRoot() { root.innerHTML = ''; }

function setProgress(current, total, label) {
  const pct = total > 0 ? Math.min(100, Math.max(0, Math.round((current / total) * 100))) : 0;
  progressInner.style.width = pct + '%';
  progressLabel.textContent = label ? `${label} (${pct}%)` : `${pct}%`;
}

function resetProgress() {
  progressInner.style.width = '0%';
  progressLabel.textContent = '';
}

const ctx = { root, clearRoot, setProgress };

function startCharacterLearning(section) {
  const items = section.characters;
  const total = items.length * 2; // N preview steps + N quiz steps
  runLearnPhase(ctx, items, 0, total, () => {
    runQuizPhase(ctx, items, 0, { correct: 0, total: items.length }, items.length, total, LEARNING_QUIZ_OPTIONS, (tally) => {
      setProgress(total, total, 'Complete');
      showQuizResults(ctx, tally, 'Character learning complete', [
        { label: 'Retry', onClick: () => startCharacterLearning(section) },
        { label: 'Back to mode select', onClick: showModeSelect }
      ]);
    });
  });
}

function startPopQuiz(section) {
  const items = section.characters;
  const total = items.length;
  runQuizPhase(ctx, items, 0, { correct: 0, total: items.length }, 0, total, POP_QUIZ_WRITER_OPTIONS, (tally) => {
    setProgress(total, total, 'Complete');
    showQuizResults(ctx, tally, 'Pop quiz complete', [
      { label: 'Retry', onClick: () => startPopQuiz(section) },
      { label: 'Back to mode select', onClick: showModeSelect }
    ]);
  });
}

function showModeSelect() {
  clearRoot();
  resetProgress();
  modeSelectEl.classList.remove('hidden');
}

async function init() {
  try {
    const { unit, chapter, section } = await loadSection();
    const sentenceSuffix = section.sentence ? ` — ${section.sentence}` : '';
    breadcrumbEl.textContent = `${unit.title} / ${chapter.title} / ${section.title}${sentenceSuffix}`;

    document.getElementById('mode-character').addEventListener('click', () => {
      modeSelectEl.classList.add('hidden');
      startCharacterLearning(section);
    });
    document.getElementById('mode-popquiz').addEventListener('click', () => {
      modeSelectEl.classList.add('hidden');
      startPopQuiz(section);
    });

    showModeSelect();
  } catch (err) {
    breadcrumbEl.textContent = 'Error: ' + err.message;
    root.appendChild(el('p', { text: 'Make sure you reached this page via a unit/chapter/section link, and that you are running a local server (not file://).' }));
  }
}

init();
