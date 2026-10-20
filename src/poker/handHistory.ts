import { Card } from './cards';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type ActionType = 'post' | 'fold' | 'check' | 'call' | 'bet' | 'raise';

export interface HandAction {
  street: Street;
  player: string;
  type: ActionType;
  /** Chips this action added to the pot. */
  amount: number;
  /** For raises, the total the player raised to. */
  raiseTo?: number;
  allIn: boolean;
  /** Pot before this action. */
  potBefore: number;
  /** What the player had to call before acting. */
  toCall: number;
  isHero: boolean;
}

export interface Player { seat: number; name: string; stack: number; position: string }

export interface ParsedHand {
  id: string;
  isTournament: boolean;
  bigBlind: number;
  hero: string;
  heroCards: Card[];
  heroPosition: string;
  heroStackBB: number;
  players: Player[];
  board: Card[];
  actions: HandAction[];
  heroNet: number;
  raw: string;
}

const amt = (s: string) => parseFloat(s.replace(/[$€£,]/g, ''));
const AMOUNT = '[$€£]?[\\d,]+(?:\\.\\d+)?';

/** Splits a pasted file into individual hands (PokerStars and GGPoker style). */
export function splitHands(text: string): string[] {
  return text
    .replace(/\r/g, '')
    .split(/\n(?=(?:PokerStars|Poker|GGPoker) Hand #)/)
    .map((h) => h.trim())
    .filter((h) => /Hand #/.test(h));
}

export function parseHands(text: string): { hands: ParsedHand[]; failed: number } {
  const hands: ParsedHand[] = [];
  let failed = 0;
  for (const chunk of splitHands(text)) {
    const h = parseHand(chunk);
    if (h) hands.push(h);
    else failed++;
  }
  return { hands, failed };
}

function positionsFor(seatsFromButton: string[]): Record<string, string> {
  const n = seatsFromButton.length;
  const out: Record<string, string> = {};
  if (n === 2) {
    out[seatsFromButton[0]] = 'SB';
    out[seatsFromButton[1]] = 'BB';
    return out;
  }
  const early: Record<number, string[]> = {
    0: [], 1: ['CO'], 2: ['HJ', 'CO'], 3: ['UTG', 'HJ', 'CO'], 4: ['UTG', 'LJ', 'HJ', 'CO'],
    5: ['UTG', 'UTG+1', 'LJ', 'HJ', 'CO'], 6: ['UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO'],
    7: ['UTG', 'UTG+1', 'UTG+2', 'MP', 'LJ', 'HJ', 'CO'],
  };
  const labels = ['BTN', 'SB', 'BB', ...(early[n - 3] ?? [])];
  seatsFromButton.forEach((name, i) => (out[name] = labels[i] ?? `Seat ${i}`));
  return out;
}

export function parseHand(text: string): ParsedHand | null {
  const lines = text.split('\n').map((l) => l.trim());
  const header = lines[0] ?? '';
  const id = header.match(/Hand #([\w-]+)/)?.[1] ?? '?';
  const blinds = header.match(new RegExp(`\\((${AMOUNT})/(${AMOUNT})`));
  const bigBlind = blinds ? amt(blinds[2]) : 0;
  const isTournament = /Tournament/i.test(header);

  const buttonSeat = Number(text.match(/Seat #(\d+) is the button/)?.[1] ?? 0);
  const players: Player[] = [];
  let hero = '';
  let heroCards: Card[] = [];
  let street: Street = 'preflop';
  const board: Card[] = [];
  const actions: HandAction[] = [];
  const invested: Record<string, number> = {};
  const collected: Record<string, number> = {};
  let committed: Record<string, number> = {};
  let pot = 0;
  let inSetup = true;

  const addChips = (p: string, x: number) => {
    invested[p] = (invested[p] ?? 0) + x;
    pot += x;
  };

  for (const line of lines) {
    if (line.startsWith('*** SUMMARY')) break;
    if (inSetup) {
      const seat = line.match(new RegExp(`^Seat (\\d+): (.+?) \\((${AMOUNT}) in chips`));
      if (seat) {
        players.push({ seat: Number(seat[1]), name: seat[2], stack: amt(seat[3]), position: '' });
        continue;
      }
    }
    if (line.startsWith('***')) inSetup = false;

    const dealt = line.match(/^Dealt to (.+?) \[(.+?)\]/);
    if (dealt && !hero) {
      hero = dealt[1];
      heroCards = dealt[2].split(' ');
      continue;
    }
    const st = line.match(/^\*\*\* (FLOP|TURN|RIVER|FIRST FLOP|FIRST TURN|FIRST RIVER) \*\*\*/);
    if (st) {
      street = st[1].replace('FIRST ', '').toLowerCase() as Street;
      for (const m of line.matchAll(/\[([^\]]+)\]/g))
        for (const c of m[1].split(' ')) if (!board.includes(c)) board.push(c);
      committed = {};
      continue;
    }
    const uncalled = line.match(new RegExp(`^Uncalled bet \\((${AMOUNT})\\) returned to (.+)$`));
    if (uncalled) {
      addChips(uncalled[2], -amt(uncalled[1]));
      continue;
    }
    const won = line.match(new RegExp(`^(.+?) collected (${AMOUNT})`));
    if (won) {
      collected[won[1]] = (collected[won[1]] ?? 0) + amt(won[2]);
      continue;
    }

    const act = line.match(/^(.+?): (posts|folds|checks|calls|bets|raises)\b(.*)$/);
    if (!act) continue;
    const [, player, verb, rest] = act;
    const allIn = /all-in/i.test(rest);
    const nums = [...rest.matchAll(new RegExp(AMOUNT, 'g'))].map((m) => amt(m[0]));
    const already = committed[player] ?? 0;
    const maxCommitted = Math.max(0, ...Object.values(committed));
    const base = {
      street, player, allIn, potBefore: pot, isHero: false,
      toCall: Math.max(0, maxCommitted - already),
    };

    if (verb === 'posts') {
      const x = nums[nums.length - 1] ?? 0;
      addChips(player, x);
      // Antes go in the pot but do not count toward matching a bet.
      if (!/ante/i.test(rest)) committed[player] = already + x;
      actions.push({ ...base, type: 'post', amount: x });
      continue;
    }
    let amount = 0;
    let raiseTo: number | undefined;
    if (verb === 'calls' || verb === 'bets') amount = nums[0] ?? 0;
    if (verb === 'raises') {
      raiseTo = nums[1] ?? nums[0] ?? 0;
      amount = raiseTo - already;
    }
    if (amount) {
      addChips(player, amount);
      committed[player] = already + amount;
    }
    const type = (verb === 'folds' ? 'fold' : verb === 'checks' ? 'check' : verb.slice(0, -1)) as ActionType;
    actions.push({ ...base, type, amount, raiseTo });
  }

  if (!hero || heroCards.length !== 2 || !players.length) return null;

  // Order seats starting from the button to label positions.
  const sorted = players.slice().sort((a, b) => a.seat - b.seat);
  const btnIdx = Math.max(0, sorted.findIndex((p) => p.seat === buttonSeat));
  const active = new Set(actions.map((a) => a.player));
  const fromButton = [...sorted.slice(btnIdx), ...sorted.slice(0, btnIdx)]
    .filter((p) => active.has(p.name) || p.seat === buttonSeat)
    .map((p) => p.name);
  const pos = positionsFor(fromButton);
  for (const p of players) p.position = pos[p.name] ?? '';
  for (const a of actions) a.isHero = a.player === hero;

  const heroPlayer = players.find((p) => p.name === hero);
  return {
    id, isTournament, bigBlind, hero, heroCards,
    heroPosition: pos[hero] ?? '?',
    heroStackBB: heroPlayer && bigBlind ? heroPlayer.stack / bigBlind : 0,
    players, board, actions,
    heroNet: (collected[hero] ?? 0) - (invested[hero] ?? 0),
    raw: text,
  };
}

/** True when the hero's first preflop decision came with nobody having entered the pot. */
export function heroFirstIn(hand: ParsedHand): HandAction | null {
  for (const a of hand.actions) {
    if (a.street !== 'preflop' || a.type === 'post') continue;
    if (a.isHero) return a;
    if (a.type !== 'fold') return null;
  }
  return null;
}

export const SAMPLE_HANDS = `PokerStars Hand #250001: Hold'em No Limit ($0.25/$0.50 USD) - 2026/10/01 20:00:00 ET
Table 'Sample' 6-max Seat #4 is the button
Seat 1: Villain1 ($52.10 in chips)
Seat 2: Villain2 ($48.00 in chips)
Seat 3: Hero ($50.00 in chips)
Seat 4: Villain4 ($61.75 in chips)
Seat 5: Villain5 ($50.00 in chips)
Seat 6: Villain6 ($35.40 in chips)
Villain5: posts small blind $0.25
Villain6: posts big blind $0.50
*** HOLE CARDS ***
Dealt to Hero [Ah Jh]
Villain1: folds
Villain2: folds
Hero: raises $0.75 to $1.25
Villain4: folds
Villain5: folds
Villain6: calls $0.75
*** FLOP *** [Kh 7h 2c]
Villain6: checks
Hero: bets $1.50
Villain6: raises $3 to $4.50
Hero: calls $3
*** TURN *** [Kh 7h 2c] [9s]
Villain6: bets $7
Hero: calls $7
*** RIVER *** [Kh 7h 2c 9s] [3h]
Villain6: bets $10
Hero: raises $12.75 to $22.75
Villain6: calls $12.75
*** SHOW DOWN ***
Hero: shows [Ah Jh] (a flush, Ace high)
Villain6: shows [Kd 9d] (two pair, Kings and Nines)
Hero collected $69.50 from pot
*** SUMMARY ***
Total pot $71.25 | Rake $1.75

PokerStars Hand #250002: Hold'em No Limit ($0.25/$0.50 USD) - 2026/10/01 20:01:10 ET
Table 'Sample' 6-max Seat #5 is the button
Seat 1: Villain1 ($52.10 in chips)
Seat 2: Villain2 ($48.00 in chips)
Seat 3: Hero ($69.50 in chips)
Seat 4: Villain4 ($61.75 in chips)
Seat 5: Villain5 ($50.00 in chips)
Seat 6: Villain6 ($12.65 in chips)
Villain6: posts small blind $0.25
Villain1: posts big blind $0.50
*** HOLE CARDS ***
Dealt to Hero [Kc 9d]
Villain2: folds
Hero: raises $0.75 to $1.25
Villain4: folds
Villain5: folds
Villain6: folds
Villain1: folds
Uncalled bet ($0.75) returned to Hero
Hero collected $1 from pot
*** SUMMARY ***
Total pot $1 | Rake $0
`;
