// Question generators for the concept drills that go with the study guide.
// Everything here is plain data so it can be tested without React.
import { Card, classCombos, fullDeck, pick, rankValue, RANKS, shuffle } from './cards';
import { requiredEquity } from './equity';

export interface Question {
  /** Short label for the mistakes log. */
  spot: string;
  prompt: string;
  options: string[];
  answer: string;
  explain: string;
  hand?: Card[];
  board?: Card[];
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const r1 = (x: number) => Math.round(x * 10) / 10;

/** Four numeric options, the right one plus distractors far enough apart to tell apart. */
export function spreadOptions(correct: number, candidates: number[], fmt: (v: number) => string, minGap: number): string[] {
  const set = [correct];
  for (const v of candidates) {
    if (set.length >= 4) break;
    if (set.every((x) => Math.abs(x - v) >= minGap) && fmt(v) !== fmt(correct)) set.push(v);
  }
  let step = 1;
  while (set.length < 4) {
    const v = correct + minGap * step * (step % 2 ? 1 : -1) * 1.5;
    if (set.every((x) => Math.abs(x - v) >= minGap)) set.push(v);
    step++;
  }
  return shuffle(set).map(fmt);
}

const chips = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(Math.round(v))}`;
const num = (v: number) => `${Math.round(v)}`;
const percent = (v: number) => `${Math.round(v)}%`;

// ---------- 1. Expected value of a call ----------

const TURN_DRAWS: { outs: number; name: string; hand: Card[]; board: Card[] }[] = [
  { outs: 9, name: 'nut flush draw', hand: ['Ah', '5h'], board: ['Kh', '8h', '2c', '3s'] },
  { outs: 8, name: 'open-ended straight draw', hand: ['9c', '8d'], board: ['7s', '6h', '2c', 'Kd'] },
  { outs: 4, name: 'gutshot', hand: ['9s', '8s'], board: ['Jd', '7c', '2h', '3d'] },
  { outs: 15, name: 'flush draw plus open-ended straight draw', hand: ['Qh', 'Jh'], board: ['Th', '9h', '3c', '2d'] },
  { outs: 12, name: 'flush draw plus gutshot', hand: ['Ks', 'Js'], board: ['Qs', '9d', '3s', '4c'] },
];

export function evCall(): Question {
  const d = pick(TURN_DRAWS);
  const pot = 10 * (6 + Math.floor(Math.random() * 15));
  const bet = Math.round((pot * pick([0.33, 0.5, 0.75, 1])) / 5) * 5;
  const e = d.outs / 46;
  const ev = e * (pot + bet) - (1 - e) * bet;
  const options = spreadOptions(
    ev,
    shuffle([e * pot - (1 - e) * bet, e * (pot + bet) - bet, -ev, e * (pot + 2 * bet) - (1 - e) * bet, ev + bet / 2, ev - bet / 2]),
    chips,
    Math.max(4, bet / 6),
  );
  return {
    spot: `EV of calling ${bet} into ${pot}, ${d.name}`,
    prompt: `Turn. The pot is ${pot}, villain bets ${bet}. You have a ${d.name} (${d.outs} outs) and villain shoves the river, so count only one card. What is the EV of calling, in chips?`,
    options,
    answer: chips(ev),
    hand: d.hand,
    board: d.board,
    explain: `You hit ${d.outs} of 46 cards, ${pct(e)}. When you hit you win the ${pot + bet} already in the middle; when you miss you lose your ${bet}. EV = ${r1(e * 100)}% × ${pot + bet} − ${r1((1 - e) * 100)}% × ${bet} = ${chips(ev)}. Folding is 0, so ${ev >= 0 ? 'calling is better' : 'folding is better unless implied odds make up the gap'}.`,
  };
}

// ---------- 2. Implied odds ----------

export function impliedOdds(): Question {
  const d = pick(TURN_DRAWS.filter((x) => x.outs <= 9));
  const before = 10 * (4 + Math.floor(Math.random() * 12));
  const call = Math.round((before * pick([0.5, 0.75, 1])) / 5) * 5;
  const potAfterBet = before + call;
  const e = d.outs / 46;
  const x = call / e - (potAfterBet + call);
  const answer = Math.max(0, x);
  return {
    spot: `Implied odds, ${call} into ${potAfterBet}, ${d.name}`,
    prompt: `Turn. Villain bets ${call} into ${before}, so the pot is now ${potAfterBet}. You have a ${d.name} (${d.outs} outs, ${pct(e)}). How much more must you win on the river, on average when you hit, to make the call break even?`,
    options: spreadOptions(answer, shuffle([answer * 0.5, answer * 1.6, call / e, answer + potAfterBet, answer * 0.25]), num, Math.max(10, answer / 5)),
    answer: num(answer),
    hand: d.hand,
    board: d.board,
    explain: `Needed = Call ÷ Equity − (Pot + Call) = ${call} ÷ ${e.toFixed(3)} − (${potAfterBet} + ${call}) = ${Math.round(call / e)} − ${potAfterBet + call} = ${num(answer)}. Only call if villain's stack and style make winning that much realistic. Disguised draws, deep stacks and players who pay off make it easier; obvious draws and short stacks make it harder.`,
  };
}

// ---------- 2. Combos ----------

function dealBoard(n: number, avoid: Card[] = []): Card[] {
  return shuffle(fullDeck().filter((c) => !avoid.includes(c))).slice(0, n);
}

export function countCombos(cls: string, dead: Card[]): number {
  return classCombos(cls).filter(([a, b]) => !dead.includes(a) && !dead.includes(b)).length;
}

export function combosQuestion(): Question {
  for (;;) {
    const board = dealBoard(3);
    const ranks = board.map((c) => c[0]);
    if (new Set(ranks).size < 3) continue;
    const kind = pick(['set', 'pair', 'unpaired', 'suited', 'allsets'] as const);
    const hero = Math.random() < 0.5 ? dealBoard(2, board) : [];
    const dead = [...board, ...hero];
    let cls = '', ask = '', answer = 0, why = '';
    if (kind === 'allsets') {
      answer = ranks.reduce((s, r) => s + countCombos(r + r, dead), 0);
      ask = 'How many set combos can villain have in total?';
      why = 'Each board rank leaves 3 combos of its set (one of the four cards is on the board), minus any you block.';
    } else {
      if (kind === 'set') { const r = pick(ranks); cls = r + r; }
      else if (kind === 'pair') { const r = pick(RANKS.split('').filter((x) => !ranks.includes(x))); cls = r + r; }
      else {
        const top = ranks.slice().sort((a, b) => rankValue(b) - rankValue(a))[0];
        const others = RANKS.split('').filter((x) => x !== top);
        const k = pick(others);
        const [hi, lo] = rankValue(top) > rankValue(k) ? [top, k] : [k, top];
        cls = hi + lo + (kind === 'suited' ? 's' : '');
      }
      const list = cls.length === 3 ? [cls] : cls[0] === cls[1] ? [cls] : [cls + 's', cls + 'o'];
      answer = list.reduce((s, c) => s + countCombos(c, dead), 0);
      const label = cls.length === 3 ? `${cls.slice(0, 2)} suited` : cls[0] === cls[1] ? cls : `${cls} (suited and offsuit)`;
      ask = `How many combos of ${label} can villain have?`;
      const full = list.reduce((s, c) => s + classCombos(c).length, 0);
      why = `With no cards visible there are ${full}. Every copy of one of its ranks on the board${hero.length ? ' or in your hand' : ''} removes the combos that use it, leaving ${answer}.`;
    }
    return {
      spot: ask.replace('How many ', '').replace(' can villain have', ''),
      prompt: `${hero.length ? 'You hold the cards shown. ' : ''}${ask}`,
      options: spreadOptions(answer, shuffle([answer + 3, answer - 3, answer + 6, answer * 2, answer + 1, answer - 1].filter((v) => v >= 0)), num, 1),
      answer: num(answer),
      hand: hero.length ? hero : undefined,
      board,
      explain: `${answer} combos. ${why} Quick counts: a pair has 6, an unpaired hand 16 (4 suited, 12 offsuit).`,
    };
  }
}

// ---------- 2. Outs discounting ----------

interface OutsSpot { hand: Card[]; board: Card[]; villain: string; villainCards: Card[]; answer: number; explain: string }

export const OUTS_SPOTS: OutsSpot[] = [
  {
    hand: ['Ah', 'Qh'], board: ['Kh', '8h', '3c', '2s'], villain: 'a set of eights', villainCards: ['8d', '8c'],
    answer: 7, explain: '9 hearts are left, but the 3♥ and 2♥ pair the board and give villain a full house. That leaves 7 clean outs.',
  },
  {
    hand: ['Ah', 'Kd'], board: ['Qs', '9c', '4h', '2d'], villain: 'a set of nines', villainCards: ['9s', '9d'],
    answer: 0, explain: 'An ace or king only gives you one pair, which still loses to a set. Against this hand your overcards are not outs at all.',
  },
  {
    hand: ['Ad', 'Jd'], board: ['Kc', '8s', '3d', '5h'], villain: 'KQ', villainCards: ['Ks', 'Qh'],
    answer: 3, explain: 'An ace gives you a pair of aces, which beats kings: 3 outs. A jack only makes a pair of jacks, still behind the kings.',
  },
  {
    hand: ['7c', '6c'], board: ['9h', '8d', '2s', 'Qc'], villain: 'QJ (top pair)', villainCards: ['Qs', 'Jd'],
    answer: 4, explain: 'A five gives you the 5 to 9 straight. A ten gives you a straight but gives villain the bigger Q-J-T-9-8 straight, and pairing a 7 or 6 still loses to top pair, so only the 4 fives count.',
  },
  {
    hand: ['8h', '7h'], board: ['9h', '6c', '2h', 'Kd'], villain: 'top pair, king with a good kicker', villainCards: ['Ks', 'Ac'],
    answer: 15, explain: '9 hearts plus 8 straight cards (any 5 or 10), but the 5♥ and 10♥ are already counted as hearts. 9 + 6 = 15. Counting them twice gives the wrong 17.',
  },
];

export function outsDiscount(): Question {
  const s = pick(OUTS_SPOTS);
  return {
    spot: `Clean outs vs ${s.villain}`,
    prompt: `Turn, one card to come. Villain shows you ${s.villain}. How many clean outs do you have?`,
    options: spreadOptions(s.answer, shuffle([s.answer + 2, s.answer + 3, s.answer - 3, s.answer + 6, 9, 6, 8].filter((v) => v >= 0)), num, 1),
    answer: num(s.answer),
    hand: s.hand,
    board: s.board,
    explain: `${s.explain} At the table, when you only suspect a hand, count tainted outs as half.`,
  };
}

// ---------- 3. Fold equity ----------

export function foldEquityEV(pot: number, bet: number, fold: number, eq: number): number {
  return fold * pot + (1 - fold) * (eq * (pot + 2 * bet) - bet);
}

export function foldEquity(): Question {
  const pot = 10 * (6 + Math.floor(Math.random() * 15));
  const bet = Math.round((pot * pick([0.5, 0.66, 0.75, 1])) / 5) * 5;
  const f = pick([0.2, 0.3, 0.4, 0.5, 0.6]);
  const e = pick([0.2, 0.25, 0.3, 0.35]);
  const ev = foldEquityEV(pot, bet, f, e);
  return {
    spot: `Semi-bluff EV, bet ${bet} into ${pot}`,
    prompt: `Flop, pot ${pot}. You bet ${bet} with a draw. Villain folds ${pct(f)} of the time; when called you win ${pct(e)} of the time (all-in on this street). What is the EV of betting?`,
    options: spreadOptions(ev, shuffle([f * pot, (1 - f) * (e * (pot + 2 * bet) - bet), ev + pot * 0.3, ev - pot * 0.3, -ev]), chips, Math.max(5, pot / 10)),
    answer: chips(ev),
    explain: `EV = F × Pot + (1 − F) × [E × (Pot + 2B) − B] = ${f} × ${pot} + ${r1(1 - f)} × [${e} × ${pot + 2 * bet} − ${bet}] = ${r1(f * pot)} + ${r1((1 - f) * (e * (pot + 2 * bet) - bet))} = ${chips(ev)}. The fold part is free money that a call can never win.`,
  };
}

// ---------- 2/3/9. Bet-size numbers ----------

const SIZES: { label: string; f: number }[] = [
  { label: '1/4 pot', f: 0.25 }, { label: '1/3 pot', f: 1 / 3 }, { label: '1/2 pot', f: 0.5 }, { label: '2/3 pot', f: 2 / 3 },
  { label: '3/4 pot', f: 0.75 }, { label: 'pot', f: 1 }, { label: '1.5× pot', f: 1.5 }, { label: '2× pot', f: 2 },
];

export const mdf = (f: number) => 1 / (1 + f);
export const bluffBreakEven = (f: number) => f / (1 + f);
export const riverBluffShare = (f: number) => f / (1 + 2 * f);

export function betSizeQuestion(kind: 'mdf' | 'bluffbe' | 'bluffshare'): Question {
  const s = pick(SIZES);
  const v = kind === 'mdf' ? mdf(s.f) : kind === 'bluffbe' ? bluffBreakEven(s.f) : riverBluffShare(s.f);
  const others = [mdf(s.f), bluffBreakEven(s.f), riverBluffShare(s.f), requiredEquity(1, s.f)].map((x) => x * 100);
  const text = {
    mdf: [`Villain bets ${s.label}. What share of your range must you continue with (minimum defense frequency)?`, `MDF = Pot ÷ (Pot + Bet) = 1 ÷ (1 + ${r1(s.f)}) = ${pct(v)}. Use it against balanced or bluff-heavy players; against players who never bluff big, fold more.`],
    bluffbe: [`You bluff ${s.label} with a hand that can never win. How often must villain fold for it to break even?`, `Bluff break-even = Bet ÷ (Pot + Bet) = ${r1(s.f)} ÷ ${r1(1 + s.f)} = ${pct(v)}.`],
    bluffshare: [`On the river you bet ${s.label}. In a balanced betting range, what share should be bluffs?`, `Bluffs ÷ (Value + Bluffs) = Bet ÷ (Pot + 2 × Bet) = ${pct(v)}. It is the same number as the pot odds the caller gets, so their bluff-catchers break even.`],
  }[kind];
  return {
    spot: `${kind === 'mdf' ? 'MDF' : kind === 'bluffbe' ? 'Bluff break-even' : 'River bluff share'}, ${s.label}`,
    prompt: text[0],
    options: spreadOptions(v * 100, shuffle([...others, v * 100 + 10, v * 100 - 10]), percent, 4),
    answer: percent(v * 100),
    explain: text[1],
  };
}

// ---------- 7. SPR and commitment ----------

export type SprZone = 'low' | 'medium' | 'high';
export const sprZone = (spr: number): SprZone => (spr < 4 ? 'low' : spr <= 10 ? 'medium' : 'high');

const POT_TYPES = [
  { name: 'single-raised pot', pot: [5, 7], stackLoss: [2, 3] },
  { name: '3-bet pot', pot: [18, 24], stackLoss: [8, 11] },
  { name: '4-bet pot', pot: [44, 50], stackLoss: [21, 24] },
];

const SPR_HANDS: { name: string; min: SprZone }[] = [
  { name: 'top pair, good kicker', min: 'low' },
  { name: 'an overpair (QQ)', min: 'low' },
  { name: 'top two pair', min: 'medium' },
  { name: 'a set', min: 'high' },
  { name: 'the nut flush', min: 'high' },
];

export function sprQuestion(): Question {
  for (;;) {
    const t = pick(POT_TYPES);
    const depth = pick([60, 100, 100, 150, 200]);
    const pot = t.pot[0] + Math.round(Math.random() * (t.pot[1] - t.pot[0]));
    const stack = depth - (t.stackLoss[0] + Math.round(Math.random() * (t.stackLoss[1] - t.stackLoss[0])));
    const spr = stack / pot;
    if ([4, 10].some((b) => Math.abs(spr - b) < 0.6)) continue;
    const zone = sprZone(spr);
    const h = pick(SPR_HANDS.filter((x) => !(zone === 'high' && x.name === 'top two pair')));
    const order: SprZone[] = ['low', 'medium', 'high'];
    const commit = order.indexOf(h.min) >= order.indexOf(zone) || h.min === 'high';
    const answer = commit ? 'Stack off' : 'Control the pot';
    return {
      spot: `SPR ${r1(spr)}, ${h.name}`,
      prompt: `${depth}bb deep, ${t.name}. The flop pot is ${pot}bb and the effective stack behind is ${stack}bb. You flop ${h.name} and face heavy action. Is this a hand to get all the money in with?`,
      options: ['Stack off', 'Control the pot'],
      answer,
      explain: `SPR = ${stack} ÷ ${pot} = ${r1(spr)}, a ${zone} SPR. ${
        zone === 'low' ? 'Under 4, top pair good kicker and overpairs are happy to stack off.'
          : zone === 'medium' ? 'Between 4 and 10 you want two pair or better; one pair is a tough spot.'
            : 'Over 10 you want sets, straights, flushes or big combo draws; one pair should keep the pot small.'
      } So: ${answer.toLowerCase()}.`,
    };
  }
}

// ---------- 8. Board texture ----------

export type Texture = 'Dry, high' | 'Paired' | 'Wet, connected' | 'Low, connected' | 'Monotone';
export const TEXTURE_PLAN: Record<Texture, string> = {
  'Dry, high': 'C-bet often, small',
  Paired: 'C-bet often, small',
  'Wet, connected': 'Bet less often, larger; check more',
  'Low, connected': 'Check much more',
  Monotone: 'Bet small and rarely',
};

/** Classifies a flop into one of the guide's five textures, or null when it sits between them. */
export function classifyFlop(board: Card[]): Texture | null {
  const vals = board.map((c) => rankValue(c[0])).sort((a, b) => b - a);
  const suits = new Set(board.map((c) => c[1]));
  if (suits.size === 1) return 'Monotone';
  if (new Set(vals).size < 3) return 'Paired';
  const span = vals[0] - vals[2];
  if (span <= 4 && vals[0] <= 8) return 'Low, connected';
  if (span <= 4 && vals[0] >= 9 && vals[0] <= 11) return 'Wet, connected';
  if (suits.size === 3 && vals[0] >= 13 && vals[1] <= 9 && vals[1] - vals[2] >= 3 && vals[0] - vals[1] >= 4) return 'Dry, high';
  return null;
}

export function textureQuestion(): Question {
  for (;;) {
    const board = dealBoard(3);
    const t = classifyFlop(board);
    if (!t) continue;
    const plans = [...new Set(Object.values(TEXTURE_PLAN))];
    const who = {
      'Dry, high': 'the preflop raiser, who has more strong high cards',
      Paired: 'usually the raiser, since few hands hit',
      'Wet, connected': 'the caller, who has more sets, two pair and straights',
      'Low, connected': 'the big blind or caller',
      Monotone: 'whoever holds the big flush card',
    }[t];
    return {
      spot: `C-bet plan on ${board.join(' ')}`,
      prompt: 'You raised preflop and the big blind called. What is your default c-bet plan on this flop?',
      options: shuffle(plans),
      answer: TEXTURE_PLAN[t],
      board,
      explain: `This is a ${t.toLowerCase()} board, which favors ${who}. Plan: ${TEXTURE_PLAN[t].toLowerCase()}.`,
    };
  }
}

// ---------- 10. Player types ----------

const TYPES = [
  { type: 'Tight-passive (nit)', vpip: [10, 15], pfr: [5, 8], exploit: 'Steal their blinds, fold to their big bets, c-bet often.' },
  { type: 'Loose-passive (station)', vpip: [40, 55], pfr: [3, 9], exploit: 'Value bet thin and big, never bluff, fold to their aggression.' },
  { type: 'Tight-aggressive (regular)', vpip: [18, 25], pfr: [15, 20], exploit: 'Play close to game theory and attack specific stat leaks.' },
  { type: 'Loose-aggressive (maniac)', vpip: [35, 50], pfr: [25, 38], exploit: 'Call down lighter, trap strong hands, let them bluff.' },
];

export function playerTypeQuestion(): Question {
  const t = pick(TYPES);
  const between = (r: number[]) => r[0] + Math.round(Math.random() * (r[1] - r[0]));
  const vpip = between(t.vpip);
  const pfr = Math.min(vpip - 2, between(t.pfr));
  const hands = pick([300, 500, 1200]);
  return {
    spot: `VPIP ${vpip} / PFR ${pfr}`,
    prompt: `After ${hands} hands an opponent shows VPIP ${vpip} / PFR ${pfr}. What is the best default exploit?`,
    options: shuffle(TYPES.map((x) => x.exploit)),
    answer: t.exploit,
    explain: `${vpip} / ${pfr} is a ${t.type.toLowerCase()} player. ${t.exploit} A big gap between VPIP and PFR means a passive caller.`,
  };
}

// ---------- 11. M zones ----------

export const ZONES = [
  { name: 'Green', min: 20, plan: 'Full range of plays, close to cash strategy' },
  { name: 'Yellow', min: 10, plan: 'Fewer speculative hands, more open-shoves and 3-bet shoves' },
  { name: 'Orange', min: 6, plan: 'Raise or shove first in, little postflop play' },
  { name: 'Red', min: 1, plan: 'Push or fold only, wide shoves first in' },
  { name: 'Dead', min: 0, plan: 'Shove the first decent hand' },
];

export const harringtonM = (stack: number, sb: number, bb: number, antes: number) => stack / (sb + bb + antes);
export const mZone = (m: number) => ZONES.find((z) => m >= z.min)!;

export function mQuestion(): Question {
  const levels = [[100, 200, 200], [200, 400, 400], [500, 1000, 1000], [1000, 2000, 2000], [250, 500, 500]];
  for (;;) {
    const [sb, bb, ante] = pick(levels);
    const stack = Math.round((bb * (0.5 + Math.random() * 40)) / 100) * 100;
    const m = harringtonM(stack, sb, bb, ante);
    if (ZONES.some((z) => z.min > 0 && Math.abs(m - z.min) < 0.4)) continue;
    const z = mZone(m);
    return {
      spot: `M ${r1(m)}`,
      prompt: `Blinds ${sb}/${bb} with a ${ante} big-blind ante. Your stack is ${stack.toLocaleString()} (${r1(stack / bb)}bb). Which zone are you in?`,
      options: ZONES.map((x) => x.name),
      answer: z.name,
      explain: `M = stack ÷ (SB + BB + antes) = ${stack} ÷ ${sb + bb + ante} = ${r1(m)}. ${z.name} zone: ${z.plan.toLowerCase()}.`,
    };
  }
}

// ---------- 11. ICM ----------

/** Malmuth-Harville ICM: each player's expected share of the prize pool. */
export function icm(stacks: number[], payouts: number[]): number[] {
  const out = stacks.map(() => 0);
  const go = (alive: number[], place: number, prob: number) => {
    if (place >= payouts.length || !alive.length) return;
    const sum = alive.reduce((s, i) => s + stacks[i], 0);
    for (const i of alive) {
      const p = prob * (stacks[i] / sum);
      out[i] += p * payouts[place];
      go(alive.filter((j) => j !== i), place + 1, p);
    }
  };
  go(stacks.map((_, i) => i).filter((i) => stacks[i] > 0), 0, 1);
  return out;
}

/** Equity hero needs to call an all-in, in chips and in prize money. */
export function icmCallNeed(stacks: number[], payouts: number[], hero: number, villain: number, dead: number) {
  const risk = Math.min(stacks[hero], stacks[villain]);
  const fold = icm(stacks, payouts)[hero];
  const win = stacks.slice(); win[hero] += risk + dead; win[villain] -= risk;
  const lose = stacks.slice(); lose[hero] -= risk; lose[villain] += risk + dead;
  const w = icm(win, payouts)[hero];
  const l = icm(lose, payouts)[hero];
  return { chip: risk / (2 * risk + dead), icm: (fold - l) / (w - l) };
}

export function icmQuestion(): Question {
  const payouts = [50, 30, 20];
  for (;;) {
    const big = 40 + Math.round(Math.random() * 30);
    const hero = 20 + Math.round(Math.random() * 15);
    const short = 6 + Math.round(Math.random() * 8);
    const other = 20 + Math.round(Math.random() * 10);
    const stacks = [big, hero, short, other];
    const need = icmCallNeed(stacks, payouts, 1, 0, 3);
    const eq = pick([0.45, 0.5, 0.55, 0.6, 0.65]);
    if (Math.abs(eq - need.icm) < 0.03) continue;
    const answer = eq >= need.icm ? 'Call' : 'Fold';
    return {
      spot: `Bubble call, ${pct(eq)} equity`,
      prompt: `Bubble: 4 players left, top 3 paid (50 / 30 / 20). Stacks in bb: big stack ${big}, you ${hero}, short stack ${short}, other ${other}. The big stack shoves, the blinds and antes add 3bb, and you have ${pct(eq)} equity against their range. Call or fold?`,
      options: ['Call', 'Fold'],
      answer,
      explain: `In chips you only need ${pct(need.chip)}. With ICM you need about ${pct(need.icm)}, because busting before the short stack costs you a sure prize. ${pct(eq)} is ${eq >= need.icm ? 'enough' : 'not enough'}: ${answer.toLowerCase()}. Medium stacks must tighten most on the bubble.`,
    };
  }
}

// ---------- 12. Risk of ruin ----------

export const riskOfRuin = (winRate: number, bankroll: number, sd: number) => Math.exp((-2 * winRate * bankroll) / (sd * sd));

export function rorQuestion(): Question {
  const w = pick([2, 3, 5, 8]);
  const sd = pick([80, 100, 120]);
  const buyIns = pick([10, 20, 30, 50]);
  const b = buyIns * 100;
  const v = riskOfRuin(w, b, sd);
  const buckets = ['Under 1%', '1 to 5%', '5 to 15%', '15 to 40%', 'Over 40%'];
  const idx = v < 0.01 ? 0 : v < 0.05 ? 1 : v < 0.15 ? 2 : v < 0.4 ? 3 : 4;
  return {
    spot: `Risk of ruin, ${buyIns} buy-ins at ${w}bb/100`,
    prompt: `You win ${w} bb/100 with a standard deviation of ${sd} bb/100 and keep ${buyIns} buy-ins (${b.toLocaleString()}bb). What is your risk of ruin?`,
    options: buckets,
    answer: buckets[idx],
    explain: `RoR = e^(−2 × W × B ÷ σ²) = e^(−2 × ${w} × ${b} ÷ ${sd * sd}) = ${(v * 100).toFixed(v < 0.01 ? 2 : 1)}%. Keep 30+ buy-ins for cash games and 100+ for tournaments.`,
  };
}
