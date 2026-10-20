// Cards are two-character strings: rank + suit, e.g. "As", "Td", "7c".
export type Card = string;

export const RANKS = 'AKQJT98765432'; // index 0 is the highest rank
export const SUITS = 'shdc';

/** A=14 … 2=2 */
export function rankValue(r: string): number {
  return 14 - RANKS.indexOf(r);
}

export function rankFromValue(v: number): string {
  return RANKS[14 - v];
}

export function fullDeck(): Card[] {
  const deck: Card[] = [];
  for (const r of RANKS) for (const s of SUITS) deck.push(r + s);
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** "AhKh" → "AKs", "7c7d" → "77", "Td9s" → "T9o" */
export function handClass(c1: Card, c2: Card): string {
  const r1 = c1[0];
  const r2 = c2[0];
  if (r1 === r2) return r1 + r2;
  const [hi, lo] = rankValue(r1) > rankValue(r2) ? [r1, r2] : [r2, r1];
  return hi + lo + (c1[1] === c2[1] ? 's' : 'o');
}

/** Class at row i, column j of the standard 13x13 grid (suited above the diagonal). */
export function gridClass(i: number, j: number): string {
  if (i === j) return RANKS[i] + RANKS[j];
  if (j > i) return RANKS[i] + RANKS[j] + 's';
  return RANKS[j] + RANKS[i] + 'o';
}

export const ALL_CLASSES: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < 13; i++) for (let j = 0; j < 13; j++) out.push(gridClass(i, j));
  return out;
})();

/** Every specific two-card combo for a class like "AKs". */
export function classCombos(cls: string): [Card, Card][] {
  const [r1, r2, suf] = [cls[0], cls[1], cls[2]];
  const out: [Card, Card][] = [];
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      if (r1 === r2 && b <= a) continue;
      if (suf === 's' && a !== b) continue;
      if (suf === 'o' && a === b) continue;
      out.push([r1 + SUITS[a], r2 + SUITS[b]]);
    }
  }
  return out;
}

export function parseCards(text: string): Card[] {
  const clean = text.replace(/[\s,]/g, '');
  const out: Card[] = [];
  for (let i = 0; i + 1 < clean.length; i += 2) {
    const r = clean[i].toUpperCase();
    const s = clean[i + 1].toLowerCase();
    if (!RANKS.includes(r) || !SUITS.includes(s)) throw new Error(`"${clean.slice(i, i + 2)}" is not a card`);
    out.push(r + s);
  }
  if (clean.length % 2) throw new Error('Cards are two characters each, like Ah or Td');
  return out;
}
