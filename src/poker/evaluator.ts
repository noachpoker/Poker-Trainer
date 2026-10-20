import { Card, rankValue } from './cards';

export const HAND_NAMES = [
  'High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight',
  'Flush', 'Full house', 'Four of a kind', 'Straight flush',
];

function straightHigh(mask: number): number {
  for (let h = 14; h >= 5; h--) {
    let ok = true;
    for (let k = 0; k < 5; k++) {
      const v = h - k === 1 ? 14 : h - k;
      if (!(mask & (1 << v))) { ok = false; break; }
    }
    if (ok) return h;
  }
  return 0;
}

function score(cat: number, kickers: number[]): number {
  let s = cat;
  for (let i = 0; i < 5; i++) s = s * 16 + (kickers[i] ?? 0);
  return s;
}

/** Best-hand strength of 5 to 7 cards. Higher is better; equal means a tie. */
export function evaluate(cards: Card[]): number {
  const counts = new Array(15).fill(0);
  const bySuit: Record<string, number[]> = { s: [], h: [], d: [], c: [] };
  let mask = 0;
  for (const c of cards) {
    const v = rankValue(c[0]);
    counts[v]++;
    bySuit[c[1]].push(v);
    mask |= 1 << v;
  }

  let flush: number | undefined;
  for (const s in bySuit) {
    const vals = bySuit[s];
    if (vals.length >= 5) {
      let fmask = 0;
      for (const v of vals) fmask |= 1 << v;
      const sf = straightHigh(fmask);
      if (sf) return score(8, [sf]);
      vals.sort((a, b) => b - a);
      flush = score(5, vals.slice(0, 5));
    }
  }

  const quads: number[] = [], trips: number[] = [], pairs: number[] = [], singles: number[] = [];
  for (let v = 14; v >= 2; v--) {
    if (counts[v] === 4) quads.push(v);
    else if (counts[v] === 3) trips.push(v);
    else if (counts[v] === 2) pairs.push(v);
    else if (counts[v] === 1) singles.push(v);
  }
  const highestExcept = (...skip: number[]) => {
    for (let v = 14; v >= 2; v--) if (counts[v] && !skip.includes(v)) return v;
    return 0;
  };

  if (quads.length) return score(7, [quads[0], highestExcept(quads[0])]);
  if (trips.length && (trips.length > 1 || pairs.length)) {
    const pairPart = Math.max(trips[1] ?? 0, pairs[0] ?? 0);
    return score(6, [trips[0], pairPart]);
  }
  if (flush !== undefined) return flush;
  const st = straightHigh(mask);
  if (st) return score(4, [st]);
  if (trips.length) {
    const k = [...pairs, ...singles].sort((a, b) => b - a).slice(0, 2);
    return score(3, [trips[0], ...k]);
  }
  if (pairs.length >= 2) return score(2, [pairs[0], pairs[1], highestExcept(pairs[0], pairs[1])]);
  if (pairs.length) return score(1, [pairs[0], ...singles.slice(0, 3)]);
  return score(0, singles.slice(0, 5));
}

export function handName(cards: Card[]): string {
  return HAND_NAMES[Math.floor(evaluate(cards) / 16 ** 5)];
}
