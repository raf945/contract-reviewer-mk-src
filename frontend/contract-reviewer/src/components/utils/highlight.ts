// Claude Generated this
export const LABEL_CLASSES = [
  'clause',
  'section_headings',
  'sub_headings',
  'preamble_and_parties',
  'recitals',
  'definitions',
  'other',
] as const;

export type Label = (typeof LABEL_CLASSES)[number];

const isLabel = (label: string): label is Label =>
  (LABEL_CLASSES as readonly string[]).includes(label);

// Normalise string
const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();


export type HighlightResult = {
  matched: Record<Label, number>;
  missed: Array<{ segment: string; label: Label }>;
  spans: Array<{ span: HTMLElement; label: Label; segmentIndex: number; id: string; }>;
};

const emptyCounts = (): Record<Label, number> =>
  Object.fromEntries(LABEL_CLASSES.map((l) => [l, 0])) as Record<Label, number>;

export function clearHighlights() {
  document.querySelectorAll<HTMLElement>('.azure-highlight').forEach((el) => {
    el.classList.remove('azure-highlight');
    LABEL_CLASSES.forEach((l) =>
      el.classList.remove(`azure-highlight--${l}`)
    );
    delete el.dataset.label;
  });
}

export function applyHighlights(
  segments: string[],
  predictions: string[]
): HighlightResult {
  const matched = emptyCounts();
  const missed: HighlightResult['missed'] = [];
  const spans: HighlightResult['spans'] = [];

  const textLayer = document.querySelector<HTMLElement>(
    '.react-pdf__Page__textContent'
  );
  if (!textLayer) return { matched, missed, spans };

  clearHighlights();

  const domSpans = Array.from(textLayer.querySelectorAll<HTMLElement>('span'));

  
  let flat = '';
  const charToSpan: HTMLElement[] = [];
  for (const span of domSpans) {
    if (span.querySelector('span')) continue;
    const text = norm(span.textContent ?? '');
    for (let i = 0; i < text.length; i++) charToSpan.push(span);
    flat += text;
  }

  segments.forEach((seg, i) => {
    const raw = predictions[i] ?? 'other';
    const label: Label = isLabel(raw) ? raw : 'other';

    const needle = norm(seg);
    if (!needle) return;

    const start = flat.indexOf(needle);
    if (start === -1) {
      missed.push({ segment: seg, label });
      return;
    }

    const toMark = new Set<HTMLElement>();
    for (let j = start; j < start + needle.length; j++) {
      const s = charToSpan[j];
      if (s) toMark.add(s);
    }
    toMark.forEach((s) => {
      s.classList.add('azure-highlight', `azure-highlight--${label}`);
      s.dataset.label = label;
    });

    const markedSpans = Array.from(toMark);

    const rightMostSpan = markedSpans.sort(
      (a, b) =>
        b.getBoundingClientRect().right - a.getBoundingClientRect().right
    )[0];

    if (rightMostSpan) {
      const id = `highlight-segment-${i}`;

      rightMostSpan.id = id;

      spans.push({
        span: rightMostSpan,
        label,
        segmentIndex: i,
        id,
      });
      console.log(`Span array is ${spans}`)
    }
    matched[label]++;
  });

  return { matched, missed, spans };
}