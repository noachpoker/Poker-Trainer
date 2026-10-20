import { ALL_CLASSES, rankFromValue, rankValue } from './cards';

/**
 * Parses standard range shorthand into a set of hand classes.
 * Supports "22+", "77", "99-66", "A2s+", "KTo+", "AK", "A5s-A2s".
 */
export function parseRange(text: string): Set<string> {
  const set = new Set<string>();
  for (const raw of text.split(',')) {
    const t = raw.trim();
    if (!t) continue;
    if (t.includes('-')) {
      const [a, b] = t.split('-').map((s) => s.trim());
      expandDash(a, b, set);
      continue;
    }
    const plus = t.endsWith('+');
    const body = plus ? t.slice(0, -1) : t;
    const [r1, r2, suf = ''] = [body[0], body[1], body[2]];
    if (r1 === r2) {
      const v = rankValue(r1);
      for (let x = v; x <= (plus ? 14 : v); x++) set.add(rankFromValue(x).repeat(2));
    } else {
      const lo = rankValue(r2);
      const max = plus ? rankValue(r1) - 1 : lo;
      for (let x = lo; x <= max; x++) addNonPair(r1, rankFromValue(x), suf, set);
    }
  }
  return set;
}

function addNonPair(hi: string, lo: string, suf: string, set: Set<string>) {
  if (suf !== 'o') set.add(hi + lo + 's');
  if (suf !== 's') set.add(hi + lo + 'o');
}

function expandDash(a: string, b: string, set: Set<string>) {
  if (a[0] === a[1]) {
    const [x, y] = [rankValue(a[0]), rankValue(b[0])].sort((m, n) => m - n);
    for (let v = x; v <= y; v++) set.add(rankFromValue(v).repeat(2));
    return;
  }
  const [x, y] = [rankValue(a[1]), rankValue(b[1])].sort((m, n) => m - n);
  for (let v = x; v <= y; v++) addNonPair(a[0], rankFromValue(v), a[2] ?? '', set);
}

/** Share of all 1326 starting combos covered by a set of classes. */
export function rangePercent(set: Set<string>): number {
  let combos = 0;
  for (const c of set) combos += c.length === 2 ? 6 : c[2] === 's' ? 4 : 12;
  return (combos / 1326) * 100;
}

export function rangeMinus(a: Set<string>, b: Set<string>): Set<string> {
  return new Set(ALL_CLASSES.filter((c) => a.has(c) && !b.has(c)));
}
