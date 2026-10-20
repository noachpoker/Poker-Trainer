import { describe, expect, it } from 'vitest';
import { classCombos, handClass } from '../src/poker/cards';
import { evaluate, handName } from '../src/poker/evaluator';
import { equity, outsEquity, requiredEquity } from '../src/poker/equity';
import { parseRange, rangePercent } from '../src/poker/ranges';
import { CASH_RFI, BB_VS_BTN } from '../src/poker/charts';
import { heroFirstIn, parseHands, SAMPLE_HANDS } from '../src/poker/handHistory';

const ev = (s: string) => evaluate(s.split(' '));

describe('cards', () => {
  it('names hand classes', () => {
    expect(handClass('Kh', 'Ah')).toBe('AKs');
    expect(handClass('7c', '7d')).toBe('77');
    expect(handClass('9s', 'Td')).toBe('T9o');
  });
  it('counts combos', () => {
    expect(classCombos('AA')).toHaveLength(6);
    expect(classCombos('AKs')).toHaveLength(4);
    expect(classCombos('AKo')).toHaveLength(12);
  });
});

describe('ranges', () => {
  it('expands shorthand', () => {
    expect([...parseRange('TT+')].sort()).toEqual(['AA', 'JJ', 'KK', 'QQ', 'TT']);
    expect(parseRange('K9s+')).toEqual(new Set(['K9s', 'KTs', 'KJs', 'KQs']));
    expect(parseRange('A5s-A2s')).toEqual(new Set(['A2s', 'A3s', 'A4s', 'A5s']));
    expect(parseRange('AK')).toEqual(new Set(['AKs', 'AKo']));
  });
  it('has sensible chart sizes', () => {
    expect(rangePercent(parseRange('22+'))).toBeCloseTo(5.88, 1);
    const sizes = (['UTG', 'HJ', 'CO', 'BTN'] as const).map((p) => rangePercent(CASH_RFI[p]));
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
    for (const c of BB_VS_BTN.threebet) expect(BB_VS_BTN.call.has(c)).toBe(false);
  });
});

describe('evaluator', () => {
  it('orders hand categories', () => {
    const hands = [
      'As Kd 9c 7h 2s 3d 4c', // high card
      'As Ad 9c 7h 2s 3d Jc', // pair
      'As Ad 9c 9h 2s 3d Jc', // two pair
      'As Ad Ac 9h 2s 3d Jc', // trips
      'As 2d 3c 4h 5s Kd Jc', // wheel straight
      'As Ks 9s 7s 2s 3d Jc', // flush
      'As Ad Ac 9h 9s 3d Jc', // full house
      'As Ad Ac Ah 9s 3d Jc', // quads
      '5s 6s 7s 8s 9s Ad Ac', // straight flush
    ];
    const scores = hands.map(ev);
    for (let i = 1; i < scores.length; i++) expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    expect(handName('Ts Js Qs Ks As 2d 3c'.split(' '))).toBe('Straight flush');
  });
  it('uses kickers and spots ties', () => {
    expect(ev('As Ad Kc 7h 2s 3d 4c')).toBeGreaterThan(ev('As Ad Qc 7h 2s 3d 4c'));
    expect(ev('Ks Kd 2c 2h 9s 9d 4c')).toBe(ev('Ks Kd 9c 9h 2s 4d 3c'));
    expect(ev('6s 2d 3c 4h 5s Kd Jc')).toBeGreaterThan(ev('As 2d 3c 4h 5s Kd Jc'));
  });
});

describe('equity', () => {
  it('matches well known matchups', () => {
    expect(equity(['As', 'Ad'], ['Kh', 'Kd']).equity).toBeCloseTo(0.82, 1);
    expect(equity(['Qs', 'Qd'], ['Ah', 'Kc']).equity).toBeCloseTo(0.57, 1);
  });
  it('does pot odds and outs', () => {
    expect(requiredEquity(100, 50)).toBeCloseTo(0.25);
    expect(requiredEquity(100, 100)).toBeCloseTo(1 / 3);
    expect(outsEquity(9, 'flop', true)).toBeCloseTo(0.35, 2);
    expect(outsEquity(9, 'turn', false)).toBeCloseTo(0.196, 2);
  });
});

describe('hand history', () => {
  const { hands, failed } = parseHands(SAMPLE_HANDS);
  it('parses both sample hands', () => {
    expect(failed).toBe(0);
    expect(hands).toHaveLength(2);
  });
  it('reads the first hand correctly', () => {
    const h = hands[0];
    expect(h.hero).toBe('Hero');
    expect(h.heroCards).toEqual(['Ah', 'Jh']);
    expect(h.heroPosition).toBe('CO');
    expect(h.bigBlind).toBe(0.5);
    expect(h.board).toEqual(['Kh', '7h', '2c', '9s', '3h']);
    expect(h.heroNet).toBeCloseTo(69.5 - 35.5, 2);
    const flopRaise = h.actions.find((a) => a.street === 'flop' && a.type === 'raise')!;
    expect(flopRaise.amount).toBeCloseTo(4.5);
    const heroCall = h.actions.find((a) => a.street === 'flop' && a.isHero && a.type === 'call')!;
    expect(heroCall.toCall).toBeCloseTo(3);
    expect(heroCall.potBefore).toBeCloseTo(2.75 + 6);
  });
  it('reads a pot won uncontested', () => {
    const h = hands[1];
    expect(h.heroPosition).toBe('HJ');
    expect(h.heroNet).toBeCloseTo(1 - 0.5, 2);
    expect(heroFirstIn(h)?.type).toBe('raise');
  });
});
