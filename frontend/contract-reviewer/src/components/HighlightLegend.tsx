import { LABEL_CLASSES, type Label } from '@/components/utils/highlight';

const LABEL_TITLES: Record<Label, string> = {
  clause: 'Clause',
  section_headings: 'Section heading',
  sub_headings: 'Sub-heading',
  preamble_and_parties: 'Preamble & parties',
  recitals: 'Recitals',
  definitions: 'Definitions',
  other: 'Other',
};

interface Props {
  counts?: Record<Label, number> | null;
}

export function HighlightLegend({ counts }: Props) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card text-sm w-56">
      <div className="font-medium text-muted-foreground mb-1">Legend</div>
      {LABEL_CLASSES.map((label) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={`inline-block w-4 h-4 rounded azure-highlight--${label}`}
          />
          <span className="flex-1">{LABEL_TITLES[label]}</span>
          {counts && (
            <span className="text-muted-foreground tabular-nums">
              {counts[label]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}