import { describe, expect, it } from 'vitest';
import { fullDeck } from '../src/poker/cards';
import { evaluate } from '../src/poker/evaluator';
import * as C from '../src/poker/concepts';
import { CHAPTERS, PLAN } from '../src/learn/guide';
import { CHEAT_SHEET, CONCEPT_QUIZ } from '../src/learn/quiz';
import { flopSpr } from '../src/poker/spr';
import { parseHands, SAMPLE_HANDS } from '../src/poker/handHistory';

describe('study guide formulas', () => {
  it('matches the worked examples', () => {
    expect(C.foldEquityEV(100, 100, 0.4, 0.35)).toBeCloseTo(43);
    expect(C.riskOfRuin(5, 3000, 100)).toBeCloseTo(Math.exp(-3));
    expect(C.riskOfRuin(5, 5000, 100)).toBeCloseTo(0.0067, 3);
    expect(C.mdf(0.5)).toBeCloseTo(2 / 3);
    expect(C.bluffBreakEven(1)).toBe(0.5);
    expect(C.riverBluffShare(1)).toBeCloseTo(1 / 3);
    expect(C.riverBluffShare(0.5)).toBe(0.25);
  });
  it('counts combos with blockers', () => {
    const board = ['Kd', '7c', '2h'];
    expect(C.countCombos('AKs', board) + C.countCombos('AKo', board)).toBe(12);
    expect(C.countCombos('KK', board)).toBe(3);
    expect(C.countCombos('AKs', [...board, 'Ah']) + C.countCombos('AKo', [...board, 'Ah'])).toBe(9);
  });
  it('classifies board textures', () => {
    expect(C.classifyFlop(['As', '8d', '3c'])).toBe('Dry, high');
    expect(C.classifyFlop(['Qs', 'Qd', '5c'])).toBe('Paired');
    expect(C.classifyFlop(['Jh', 'Th', '8c'])).toBe('Wet, connected');
    expect(C.classifyFlop(['6s', '5d', '4c'])).toBe('Low, connected');
    expect(C.classifyFlop(['Kh', '9h', '4h'])).toBe('Monotone');
  });
  it('computes M zones and SPR zones', () => {
    expect(C.harringtonM(10000, 100, 200, 200)).toBe(20);
    expect(C.mZone(20).name).toBe('Green');
    expect(C.mZone(7).name).toBe('Orange');
    expect(C.mZone(0.5).name).toBe('Dead');
    expect(C.sprZone(18)).toBe('high');
    expect(C.sprZone(5)).toBe('medium');
    expect(C.sprZone(1.7)).toBe('low');
  });
  it('ICM splits the prize pool and makes calls tighter', () => {
    const eq = C.icm([50, 30, 20], [50, 30, 20]);
    expect(eq.reduce((a, b) => a + b, 0)).toBeCloseTo(100);
    expect(C.icm([10, 10, 10], [50, 30, 20])[0]).toBeCloseTo(100 / 3);
    const need = C.icmCallNeed([60, 25, 8, 25], [50, 30, 20], 1, 0, 3);
    expect(need.icm).toBeGreaterThan(need.chip);
  });
});

describe('clean outs spots', () => {
  it('match a brute-force count of winning river cards', () => {
    for (const s of C.OUTS_SPOTS) {
      const dead = new Set([...s.hand, ...s.board, ...s.villainCards]);
      const wins = fullDeck().filter((c) => !dead.has(c)).filter((c) => {
        const b = [...s.board, c];
        return evaluate([...s.hand, ...b]) > evaluate([...s.villainCards, ...b]);
      });
      expect(wins.length, s.villain).toBe(s.answer);
    }
  });
});

describe('question generators', () => {
  const gens = [C.evCall, C.impliedOdds, C.combosQuestion, C.outsDiscount, C.foldEquity, C.sprQuestion, C.textureQuestion,
    C.playerTypeQuestion, C.mQuestion, C.icmQuestion, C.rorQuestion,
    () => C.betSizeQuestion('mdf'), () => C.betSizeQuestion('bluffbe'), () => C.betSizeQuestion('bluffshare')];
  it('always include the answer among distinct options', () => {
    for (const g of gens) {
      for (let i = 0; i < 200; i++) {
        const q = g();
        expect(q.options).toContain(q.answer);
        expect(new Set(q.options).size).toBe(q.options.length);
      }
    }
  });
  it('quiz items are well formed', () => {
    for (const q of [...CONCEPT_QUIZ, ...CHEAT_SHEET]) {
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
});

describe('guide content', () => {
  it('has all 13 chapters with working drill links', () => {
    expect(CHAPTERS.map((c) => c.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const routes = /^#\/(math|preflop|equity|review|progress|learn)(\?.*)?$/;
    for (const c of CHAPTERS) for (const [, href] of c.drills) expect(href).toMatch(routes);
    for (const p of PLAN) for (const [, href] of p.drills) expect(href).toMatch(routes);
  });
});

describe('flop SPR', () => {
  it('reads the sample hand', () => {
    const h = parseHands(SAMPLE_HANDS).hands[0];
    const s = flopSpr(h)!;
    expect(s.pot).toBeCloseTo(2.75);
    expect(s.effective).toBeCloseTo(34.15);
    expect(s.spr).toBeCloseTo(12.4, 1);
  });
});
