import { ParsedHand } from './handHistory';

export interface FlopSpr { spr: number; pot: number; effective: number }

/** Stack-to-pot ratio on the flop for the hero, or null if the hero did not see a flop. */
export function flopSpr(h: ParsedHand): FlopSpr | null {
  if (h.board.length < 3) return null;
  const pre = h.actions.filter((a) => a.street === 'preflop');
  const folded = new Set(pre.filter((a) => a.type === 'fold').map((a) => a.player));
  if (folded.has(h.hero)) return null;
  const put: Record<string, number> = {};
  for (const a of pre) put[a.player] = (put[a.player] ?? 0) + a.amount;
  const pot = Object.values(put).reduce((s, x) => s + x, 0);
  const left = (name: string) => (h.players.find((p) => p.name === name)?.stack ?? 0) - (put[name] ?? 0);
  const others = h.players.filter((p) => p.name !== h.hero && !folded.has(p.name) && p.name in put).map((p) => left(p.name));
  if (!others.length || pot <= 0) return null;
  const effective = Math.min(left(h.hero), Math.max(...others));
  return { spr: effective / pot, pot, effective };
}

export function sprAdvice(spr: number): string {
  if (spr < 4) return 'Low SPR: top pair good kicker and overpairs can stack off.';
  if (spr <= 10) return 'Medium SPR: you want two pair or better to stack off; top pair is a tough spot.';
  return 'High SPR: stack off with sets, straights, flushes or big combo draws; keep one pair small.';
}
