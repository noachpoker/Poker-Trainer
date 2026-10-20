import { Card, classCombos, fullDeck } from './cards';
import { evaluate } from './evaluator';

export interface EquityResult { equity: number; win: number; tie: number; samples: number }

/** A player is either two known cards or a range of hand classes. */
export type Holding = Card[] | Set<string>;

function comboList(h: Holding): [Card, Card][] {
  if (Array.isArray(h)) return [[h[0], h[1]]];
  return [...h].flatMap(classCombos);
}

/** Monte Carlo equity for player A against player B. */
export function equity(a: Holding, b: Holding, board: Card[] = [], iterations = 20000): EquityResult {
  const aCombos = comboList(a);
  const bCombos = comboList(b);
  const deck = fullDeck();
  let win = 0, tie = 0, n = 0;
  for (let it = 0; it < iterations * 3 && n < iterations; it++) {
    const ha = aCombos[Math.floor(Math.random() * aCombos.length)];
    const hb = bCombos[Math.floor(Math.random() * bCombos.length)];
    const dead = new Set<Card>([...board, ...ha]);
    if (dead.has(hb[0]) || dead.has(hb[1]) || dead.size !== board.length + 2) continue;
    dead.add(hb[0]); dead.add(hb[1]);
    const runout = board.slice();
    while (runout.length < 5) {
      const c = deck[Math.floor(Math.random() * 52)];
      if (!dead.has(c)) { dead.add(c); runout.push(c); }
    }
    const sa = evaluate([...ha, ...runout]);
    const sb = evaluate([...hb, ...runout]);
    if (sa > sb) win++;
    else if (sa === sb) tie++;
    n++;
  }
  if (!n) throw new Error('Those hands share cards, so no matchups are possible');
  return { equity: (win + tie / 2) / n, win: win / n, tie: tie / n, samples: n };
}

/** Chance of hitting one of `outs` cards: by the river from the flop, or on the next card. */
export function outsEquity(outs: number, street: 'flop' | 'turn', toRiver: boolean): number {
  if (street === 'turn' || !toRiver) return outs / (street === 'flop' ? 47 : 46);
  const miss = ((47 - outs) * (46 - outs)) / (47 * 46);
  return 1 - miss;
}

/** Equity you need to call `bet` into `pot` (pot is before the bet). */
export function requiredEquity(pot: number, bet: number): number {
  return bet / (pot + 2 * bet);
}
