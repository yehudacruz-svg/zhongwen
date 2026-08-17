
const PREVIEW_WRITER_OPTIONS = {
  radicalColor: '#168F16',
  showOutline: true,
  strokeAnimationSpeed: 1,
  delayBetweenStrokes: 300
};

const LEARNING_QUIZ_OPTIONS = {
  showHintAfterMisses: 2,
  highlightOnComplete: true
};


const POP_QUIZ_WRITER_OPTIONS = {
  showCharacter: false,
  showOutline: false,
  showHintAfterMisses: 1,
  highlightOnComplete: false
};


function runLearnPhase(ctx, items, index, total, onDone) {
  ctx.clearRoot();
  if (index >= items.length) return onDone();

  ctx.setProgress(index, total, `Preview ${index + 1} of ${items.length}`);

  const item = items[index];
  const subChars = subCharsOf(item);
  const size = writerSize(subChars.length);

  ctx.root.appendChild(el('h2', { text: `Preview: ${item.char}` }));
  ctx.root.appendChild(el('p', { text: `${item.pinyin || ''}  —  ${item.meaning || ''}` }));

  const row = el('div', { class: 'word-writer-row' });
  ctx.root.appendChild(row);

  const writers = subChars.map(ch => createGridWriter(row, ch, size, PREVIEW_WRITER_OPTIONS));
  writers.forEach(w => w.animateCharacter());

  const controls = el('div', { class: 'controls' });
  const replayBtn = el('button', { text: 'Replay animation' });
  const nextBtn = el('button', { text: index === items.length - 1 ? 'Start quiz' : 'Next' });
  replayBtn.addEventListener('click', () => writers.forEach(w => w.animateCharacter()));
  nextBtn.addEventListener('click', () => runLearnPhase(ctx, items, index + 1, total, onDone));
  controls.appendChild(replayBtn);
  controls.appendChild(nextBtn);
  ctx.root.appendChild(controls);
}


function runQuizPhase(ctx, items, index, tally, progressBase, progressTotal, quizOptions, onDone) {
  ctx.clearRoot();
  if (index >= items.length) return onDone(tally);

  ctx.setProgress(progressBase + index, progressTotal, `Quiz ${index + 1} of ${items.length}`);

  const item = items[index];
  const subChars = subCharsOf(item);
  const size = writerSize(subChars.length);


  ctx.root.appendChild(el('h2', { text: `${item.pinyin || ''}  —  ${item.meaning || ''}` }));

  const row = el('div', { class: 'word-writer-row' });
  ctx.root.appendChild(row);

  const feedback = el('p', { id: 'quiz-feedback' });
  const controls = el('div', { class: 'controls' });
  const skipBtn = el('button', { text: 'skip!' });
  controls.appendChild(skipBtn);

  let finishedCount = 0;
  let anyMistake = false;
  let advanced = false;

  function advance() {
    if (advanced) return;
    advanced = true;
    runQuizPhase(ctx, items, index + 1, tally, progressBase, progressTotal, quizOptions, onDone);
  }

  subChars.forEach(ch => {
    const writer = createGridWriter(row, ch, size, quizOptions);
    writer.quiz({
      onMistake: function () {
        anyMistake = true;
        feedback.textContent = 'Not quite — try that stroke again.';
        feedback.className = 'incorrect';
      },
      onCorrectStroke: function () {
        feedback.textContent = 'Good stroke!';
        feedback.className = 'correct';
      },
      onComplete: function (summary) {
        if (summary.totalMistakes > 0) anyMistake = true;
        finishedCount += 1;
        if (finishedCount === subChars.length) {
          const perfect = !anyMistake;
          feedback.textContent = perfect ? 'Correct — nicely done!' : 'Completed with some mistakes.';
          feedback.className = perfect ? 'correct' : 'incorrect';
          if (perfect) tally.correct += 1;
          setTimeout(advance, 900);
        }
      }
    });
  });

  ctx.root.appendChild(feedback);
  ctx.root.appendChild(controls);
  skipBtn.addEventListener('click', advance);
}

function showQuizResults(ctx, tally, title, actions) {
  ctx.clearRoot();
  ctx.root.appendChild(el('h2', { text: title }));
  ctx.root.appendChild(el('div', { id: 'score-summary', text: `Score: ${tally.correct} / ${tally.total} written correctly on first try` }));
  const controls = el('div', { class: 'controls' });
  actions.forEach(a => {
    const btn = el('button', { text: a.label });
    btn.addEventListener('click', a.onClick);
    controls.appendChild(btn);
  });
  ctx.root.appendChild(controls);
}
//YC