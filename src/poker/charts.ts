import { parseRange, rangeMinus } from './ranges';

// Simplified versions of widely used solver-style charts. They are a solid
// starting point, not exact solver output, and can be swapped out later.

export const CASH_POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB'] as const;
export type CashPosition = (typeof CASH_POSITIONS)[number];

/** 6-max, 100bb, first in (everyone before you folded). SB plays raise-or-fold. */
export const CASH_RFI: Record<CashPosition, Set<string>> = {
  UTG: parseRange('22+, A2s+, K9s+, Q9s+, J9s+, T9s, 98s, 87s, 76s, 65s, ATo+, KJo+, QJo'),
  HJ: parseRange('22+, A2s+, K8s+, Q9s+, J9s+, T8s+, 97s+, 86s+, 76s, 65s, 54s, A9o+, KTo+, QTo+, JTo'),
  CO: parseRange('22+, A2s+, K5s+, Q8s+, J8s+, T7s+, 97s+, 86s+, 75s+, 65s, 54s, A7o+, A5o, K9o+, Q9o+, J9o+, T9o'),
  BTN: parseRange('22+, A2s+, K2s+, Q4s+, J6s+, T6s+, 96s+, 85s+, 74s+, 64s+, 53s+, 43s, A2o+, K8o+, Q9o+, J8o+, T8o+, 98o, 87o'),
  SB: parseRange('22+, A2s+, K4s+, Q6s+, J7s+, T7s+, 97s+, 86s+, 75s+, 65s, 54s, A4o+, K9o+, Q9o+, J9o+, T9o'),
};

/** Big blind facing a 2.5bb button open, 100bb deep. */
const BB_3BET = parseRange('TT+, AQs+, AKo, AQo, KQs, A5s-A2s, K9s, Q9s, J9s, T8s, 76s, 65s');
const BB_CONTINUE = parseRange(
  '22+, A2s+, K2s+, Q2s+, J4s+, T6s+, 96s+, 85s+, 74s+, 63s+, 53s+, 42s+, A2o+, K5o+, Q8o+, J8o+, T8o+, 97o+, 87o, 76o, 65o',
);
export const BB_VS_BTN = { threebet: BB_3BET, call: rangeMinus(BB_CONTINUE, BB_3BET) };

/** Tournament shove-or-fold when first in, by effective stack in big blinds (with antes). */
export const PUSH_POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB'] as const;
export type PushPosition = (typeof PUSH_POSITIONS)[number];
export const PUSH_STACKS = [10, 15] as const;
export type PushStack = (typeof PUSH_STACKS)[number];

export const PUSH_FOLD: Record<PushStack, Record<PushPosition, Set<string>>> = {
  10: {
    UTG: parseRange('55+, A8s+, ATo+, KTs+, QJs'),
    MP: parseRange('33+, A5s+, A9o+, K9s+, KJo+, QTs+, JTs'),
    CO: parseRange('22+, A2s+, A7o+, K8s+, KTo+, Q9s+, QJo, J9s+, T9s'),
    BTN: parseRange('22+, A2s+, A2o+, K5s+, K9o+, Q8s+, QTo+, J8s+, JTo, T8s+, 98s'),
    SB: parseRange('22+, A2s+, A2o+, K2s+, K7o+, Q5s+, Q9o+, J7s+, J9o+, T7s+, T9o, 97s+, 86s+, 76s, 65s'),
  },
  15: {
    UTG: parseRange('77+, ATs+, AQo+, KQs'),
    MP: parseRange('66+, A9s+, AJo+, KJs+, QJs'),
    CO: parseRange('44+, A7s+, ATo+, K9s+, KQo, QTs+, JTs'),
    BTN: parseRange('22+, A2s+, A8o+, K8s+, KJo+, Q9s+, J9s+, T9s'),
    SB: parseRange('22+, A2s+, A4o+, K5s+, K9o+, Q8s+, QTo+, J8s+, T8s+, 98s'),
  },
};
