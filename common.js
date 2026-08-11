// common.js — shared DOM + data + HanziWriter helpers used across every page.

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

// Repeatedly shuffles `pool` and concatenates until there are at least `count` items,
// then trims to length. Avoids back-to-back repeats when count <= pool.length, while
// still letting a small pool support a large requested count by cycling through it
// again with a fresh shuffle.
function cyclicSample(pool, count) {
  let out = [];
  while (out.length < count) {
    out = out.concat(shuffle(pool));
  }
  return out.slice(0, count);
}

// Flatten every vocab item across units/chapters/sections.
// includeContext=true tags each item with its parent unit/chapter/section (for search results).
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

// individual hanzi that make up a (possibly multi-character) word, e.g. "老师" -> ["老","师"]
function subCharsOf(item) {
  return Array.from(item.char || '');
}

function writerSize(numChars) {
  if (numChars <= 1) return 200;
  if (numChars === 2) return 140;
  return 105; // 3+ character words — keeps the row from overflowing
}

let _writerIdCounter = 0;

// Draws a simple reference grid (cross + diagonals, like a 米字格 writing square) behind
// the character. Per HanziWriter's "custom background" pattern, we render into an <svg>
// with the grid lines already inside it instead of a plain <div>.
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
    line.setAttribute('stroke', '#DDD');
    svg.appendChild(line);
  });
  return { svg, id };
}

// Creates a HanziWriter instance rendered onto a fresh grid-background SVG target,
// appended into `container`. Returns the HanziWriter instance.
function createGridWriter(container, char, size, options) {
  const { svg, id } = makeGridSvgTarget(size);
  container.appendChild(svg);
  return HanziWriter.create(id, char, Object.assign({ width: size, height: size, padding: 5 }, options));
}
