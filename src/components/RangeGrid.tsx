import { gridClass } from '../poker/cards';

export interface GridLayer { set: Set<string>; className: string; label: string }

/** 13x13 starting-hand chart. Later layers win when a hand is in more than one. */
export function RangeGrid({ layers, highlight }: { layers: GridLayer[]; highlight?: string }) {
  const cells = [];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      const cls = gridClass(i, j);
      const layer = [...layers].reverse().find((l) => l.set.has(cls));
      cells.push(
        <div key={cls} className={`cell ${layer?.className ?? 'fold'}${cls === highlight ? ' hl' : ''}`}>
          {cls}
        </div>,
      );
    }
  }
  return (
    <div>
      <div className="grid13">{cells}</div>
      <div className="legend">
        {layers.map((l) => (
          <span key={l.label}>
            <i className={`swatch ${l.className}`} /> {l.label}
          </span>
        ))}
        <span>
          <i className="swatch fold" /> Fold
        </span>
      </div>
    </div>
  );
}
