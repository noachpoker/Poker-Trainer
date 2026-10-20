import { useMemo, useState } from 'react';
import { Card, classCombos, gridClass, handClass, pick } from '../poker/cards';
import {
  BB_VS_BTN, CASH_POSITIONS, CASH_RFI, CashPosition, PUSH_FOLD, PUSH_POSITIONS, PUSH_STACKS, PushPosition, PushStack,
} from '../poker/charts';
import { Cards } from '../components/PlayingCard';
import { Choices, Feedback } from '../components/Choices';
import { GridLayer, RangeGrid } from '../components/RangeGrid';
import { record } from '../stats';

type Mode = 'rfi' | 'bbdef' | 'pushfold';

interface Spot {
  hand: [Card, Card];
  cls: string;
  title: string;
  spot: string;
  detail: string;
  options: string[];
  answer: string;
  layers: GridLayer[];
}

/** Hands next to a different action on the chart: the decisions worth drilling. */
function borderHands(actionOf: (cls: string) => string): string[] {
  const out: string[] = [];
  for (let i = 0; i < 13; i++)
    for (let j = 0; j < 13; j++) {
      const a = actionOf(gridClass(i, j));
      const near = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]].filter(([x, y]) => x >= 0 && y >= 0 && x < 13 && y < 13);
      if (near.some(([x, y]) => actionOf(gridClass(x, y)) !== a)) out.push(gridClass(i, j));
    }
  return out;
}

function dealFrom(actionOf: (cls: string) => string): [Card, Card] {
  if (Math.random() < 0.65) {
    const combo = pick(classCombos(pick(borderHands(actionOf))));
    return Math.random() < 0.5 ? combo : [combo[1], combo[0]];
  }
  const deck = 'AKQJT98765432'.split('').flatMap((r) => 'shdc'.split('').map((s) => r + s));
  const a = pick(deck);
  let b = pick(deck);
  while (b === a) b = pick(deck);
  return [a, b];
}

function makeSpot(mode: Mode): Spot {
  if (mode === 'rfi') {
    const pos = pick(CASH_POSITIONS) as CashPosition;
    const range = CASH_RFI[pos];
    const actionOf = (c: string) => (range.has(c) ? 'Raise' : 'Fold');
    const hand = dealFrom(actionOf);
    const cls = handClass(...hand);
    return {
      hand, cls,
      title: `You are in the ${pos}`,
      spot: `${pos} first in`,
      detail: 'Cash game, 6-max, 100bb deep. Everyone before you folded.',
      options: ['Raise', 'Fold'],
      answer: actionOf(cls),
      layers: [{ set: range, className: 'raise', label: `Open from ${pos}` }],
    };
  }
  if (mode === 'bbdef') {
    const actionOf = (c: string) => (BB_VS_BTN.threebet.has(c) ? '3-bet' : BB_VS_BTN.call.has(c) ? 'Call' : 'Fold');
    const hand = dealFrom(actionOf);
    const cls = handClass(...hand);
    return {
      hand, cls,
      title: 'You are in the big blind',
      spot: 'BB vs button open',
      detail: 'Cash game, 100bb. The button raises to 2.5bb and the small blind folds.',
      options: ['3-bet', 'Call', 'Fold'],
      answer: actionOf(cls),
      layers: [
        { set: BB_VS_BTN.call, className: 'call', label: 'Call' },
        { set: BB_VS_BTN.threebet, className: 'raise', label: '3-bet' },
      ],
    };
  }
  const stack = pick(PUSH_STACKS) as PushStack;
  const pos = pick(PUSH_POSITIONS) as PushPosition;
  const range = PUSH_FOLD[stack][pos];
  const actionOf = (c: string) => (range.has(c) ? 'Shove' : 'Fold');
  const hand = dealFrom(actionOf);
  const cls = handClass(...hand);
  return {
    hand, cls,
    title: `${stack}bb in the ${pos}`,
    spot: `${stack}bb ${pos}`,
    detail: 'Tournament, 9 players with antes. Everyone before you folded. Shove all-in or fold.',
    options: ['Shove', 'Fold'],
    answer: actionOf(cls),
    layers: [{ set: range, className: 'raise', label: `Shove ${stack}bb from ${pos}` }],
  };
}

const MODES: { id: Mode; label: string }[] = [
  { id: 'rfi', label: 'Cash: open raise' },
  { id: 'bbdef', label: 'Cash: big blind defense' },
  { id: 'pushfold', label: 'Tournament: push or fold' },
];

export function Preflop() {
  const [mode, setMode] = useState<Mode>('rfi');
  const [n, setN] = useState(0);
  const spot = useMemo(() => makeSpot(mode), [mode, n]);
  const [picked, setPicked] = useState<string>();
  const [streak, setStreak] = useState(0);

  const choose = (o: string) => {
    setPicked(o);
    const ok = o === spot.answer;
    setStreak(ok ? streak + 1 : 0);
    record(mode, ok, { spot: spot.spot, hand: spot.cls, yours: o, correct: spot.answer });
  };
  const next = () => {
    setPicked(undefined);
    setN(n + 1);
  };

  return (
    <section>
      <h1>Preflop drills</h1>
      <div className="tabs small">
        {MODES.map((m) => (
          <button key={m.id} className={m.id === mode ? 'on' : ''} onClick={() => { setMode(m.id); next(); setStreak(0); }}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="table-felt">
        <div className="spot-title">{spot.title}</div>
        <div className="muted">{spot.detail}</div>
        <div className="hole">
          <Cards cards={spot.hand} />
        </div>
        <div className="muted">Streak: {streak}</div>
      </div>
      <Choices options={spot.options} onPick={choose} answered={!!picked} correct={spot.answer} picked={picked} />
      {picked && (
        <>
          <Feedback ok={picked === spot.answer} onNext={next}>
            The chart says <b>{spot.answer}</b> with {spot.cls}.
          </Feedback>
          <RangeGrid layers={spot.layers} highlight={spot.cls} />
        </>
      )}
    </section>
  );
}
