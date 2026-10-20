import { useMemo, useState } from 'react';
import { Card, pick, shuffle } from '../poker/cards';
import { outsEquity, requiredEquity } from '../poker/equity';
import { Cards } from '../components/PlayingCard';
import { Choices, Feedback } from '../components/Choices';
import { record } from '../stats';
import { routeParam } from '../route';
import * as C from '../poker/concepts';
import { CHEAT_SHEET, CONCEPT_QUIZ, QuizItem } from '../learn/quiz';
import { CHAPTERS } from '../learn/guide';

type Mode =
  | 'potodds' | 'outs' | 'callfold' | 'ev' | 'implied' | 'discount' | 'combos'
  | 'foldeq' | 'bluffbe' | 'mdf' | 'bluffshare' | 'spr' | 'texture' | 'players'
  | 'mzone' | 'icm' | 'ror' | 'quiz' | 'cheat';

interface Draw { hand: Card[]; board: Card[]; outs: number; name: string }

const DRAWS: Draw[] = [
  { hand: ['Ah', '5h'], board: ['Kh', '8h', '2c'], outs: 9, name: 'nut flush draw' },
  { hand: ['9c', '8d'], board: ['7s', '6h', '2c'], outs: 8, name: 'open-ended straight draw (5 or T)' },
  { hand: ['Kd', 'Qc'], board: ['Jh', 'Ts', '3c'], outs: 8, name: 'open-ended straight draw (A or 9)' },
  { hand: ['9s', '8s'], board: ['Jd', '7c', '2h'], outs: 4, name: 'gutshot (any T)' },
  { hand: ['Ac', 'Kd'], board: ['9h', '7s', '2c'], outs: 6, name: 'two overcards' },
  { hand: ['Qh', 'Jh'], board: ['Th', '9h', '3c'], outs: 15, name: 'flush draw plus open-ended straight draw' },
  { hand: ['Ks', 'Js'], board: ['Qs', '9d', '3s'], outs: 12, name: 'flush draw plus gutshot' },
  { hand: ['5c', '5d'], board: ['Kh', '9s', '2c'], outs: 2, name: 'pocket pair looking for a set' },
  { hand: ['Ah', '5h'], board: ['Kh', '8h', '2c', '3s'], outs: 9, name: 'nut flush draw' },
  { hand: ['9c', '8d'], board: ['7s', '6h', '2c', 'Kd'], outs: 8, name: 'open-ended straight draw' },
  { hand: ['9s', '8s'], board: ['Jd', '7c', '2h', '3d'], outs: 4, name: 'gutshot' },
  { hand: ['Qh', 'Jh'], board: ['Th', '9h', '3c', '2d'], outs: 15, name: 'flush draw plus open-ended straight draw' },
];

const pct = (x: number) => `${Math.round(x * 100)}%`;

function numberOptions(correct: number, extra: number[] = []): string[] {
  const set = [correct];
  // Distractors stay clear of each other so only one answer is plausible.
  for (const v of [...extra, ...shuffle([-12, -7, 6, 10, 15, -4, 4].map((d) => correct + d))]) {
    if (set.length >= 4) break;
    if (v >= 3 && v <= 97 && set.every((x) => Math.abs(x - v) >= 4)) set.push(v);
  }
  return shuffle(set).map((v) => `${v}%`);
}

interface Question {
  prompt: React.ReactNode;
  options: string[];
  answer: string;
  explain: React.ReactNode;
  spot: string;
  cards?: { hand?: Card[]; board: Card[] };
  /** Chapter to read for this question. */
  ch?: number;
}

const CONCEPT: Partial<Record<Mode, () => C.Question>> = {
  ev: C.evCall, implied: C.impliedOdds, discount: C.outsDiscount, combos: C.combosQuestion,
  foldeq: C.foldEquity, bluffbe: () => C.betSizeQuestion('bluffbe'), mdf: () => C.betSizeQuestion('mdf'),
  bluffshare: () => C.betSizeQuestion('bluffshare'), spr: C.sprQuestion, texture: C.textureQuestion,
  players: C.playerTypeQuestion, mzone: C.mQuestion, icm: C.icmQuestion, ror: C.rorQuestion,
};

/** The chapter of the study guide each drill comes from. */
const MODE_CHAPTER: Record<Mode, number> = {
  potodds: 2, outs: 2, callfold: 2, ev: 1, implied: 2, discount: 2, combos: 2, foldeq: 3, bluffbe: 3, mdf: 9,
  bluffshare: 9, spr: 7, texture: 8, players: 10, mzone: 11, icm: 11, ror: 12, quiz: 13, cheat: 13,
};

function fromItem(item: QuizItem): Question {
  return {
    spot: item.q.length > 70 ? `${item.q.slice(0, 67)}…` : item.q,
    prompt: item.q,
    options: shuffle(item.options),
    answer: item.answer,
    explain: item.why,
    ch: item.ch,
  };
}

function makeQuestion(mode: Mode, chapter: number | null): Question {
  const gen = CONCEPT[mode];
  if (gen) {
    const q = gen();
    return { ...q, cards: q.board ? { hand: q.hand, board: q.board } : undefined, ch: MODE_CHAPTER[mode] };
  }
  if (mode === 'quiz') {
    const pool = CONCEPT_QUIZ.filter((x) => !chapter || x.ch === chapter);
    return fromItem(pick(pool.length ? pool : CONCEPT_QUIZ));
  }
  if (mode === 'cheat') return fromItem(pick(CHEAT_SHEET));
  if (mode === 'potodds') {
    const pot = 5 * (2 + Math.floor(Math.random() * 40));
    const frac = pick([0.25, 0.33, 0.5, 0.66, 0.75, 1, 1.5, 2]);
    const bet = Math.max(5, Math.round((pot * frac) / 5) * 5);
    const need = requiredEquity(pot, bet);
    const answer = `${Math.round(need * 100)}%`;
    const mistake = Math.round((bet / (pot + bet)) * 100);
    return {
      spot: `$${bet} into $${pot}`,
      prompt: <>The pot is <b>${pot}</b>. Your opponent bets <b>${bet}</b>. How much equity do you need to call?</>,
      options: numberOptions(Math.round(need * 100), mistake !== Math.round(need * 100) ? [mistake] : []),
      answer,
      explain: (
        <>You call ${bet} to win a final pot of ${pot + 2 * bet}, so you need {bet} ÷ {pot + 2 * bet} = <b>{answer}</b>.
          A quick check: a half-pot bet needs 25%, a pot-size bet needs 33%.</>
      ),
    };
  }
  const d = pick(DRAWS);
  const street = d.board.length === 3 ? 'flop' : 'turn';
  if (mode === 'outs') {
    const toRiver = street === 'flop';
    const eq = outsEquity(d.outs, street, toRiver);
    const answer = pct(eq);
    const rule = toRiver ? `${d.outs} × 4 ≈ ${d.outs * 4}%` : `${d.outs} × 2 ≈ ${d.outs * 2}%`;
    return {
      spot: d.name,
      prompt: <>{toRiver ? 'On the flop, with two cards to come' : 'On the turn, with one card to come'}: how often do you hit your draw?</>,
      options: numberOptions(Math.round(eq * 100)),
      answer,
      explain: <>You have a {d.name}: <b>{d.outs} outs</b>. Exact chance is {answer}. Rule of thumb: {rule}.</>,
      cards: d,
    };
  }
  const pot = 10 * (3 + Math.floor(Math.random() * 15));
  const frac = pick([0.33, 0.5, 0.75, 1]);
  const bet = Math.max(5, Math.round((pot * frac) / 5) * 5);
  const need = requiredEquity(pot, bet);
  const have = outsEquity(d.outs, street, false);
  const answer = have >= need ? 'Call' : 'Fold';
  return {
    spot: `${d.name}, $${bet} into $${pot}`,
    prompt: <>The pot is <b>${pot}</b> and you face a <b>${bet}</b> bet. Your opponent will shove the next street, so count only the next card. Call or fold?</>,
    options: ['Call', 'Fold'],
    answer,
    explain: (
      <>{d.outs} outs gives you {pct(have)} to hit the next card. You need {pct(need)}, so it is a <b>{answer.toLowerCase()}</b> on direct odds.
        In real games, the money you can win later (implied odds) can turn close folds into calls.</>
    ),
    cards: d,
  };
}

const GROUPS: { label: string; modes: { id: Mode; label: string }[] }[] = [
  {
    label: 'Math',
    modes: [
      { id: 'potodds', label: 'Pot odds' },
      { id: 'outs', label: 'Outs to equity' },
      { id: 'callfold', label: 'Call or fold a draw' },
      { id: 'ev', label: 'EV of a call' },
      { id: 'implied', label: 'Implied odds' },
      { id: 'discount', label: 'Clean outs' },
      { id: 'combos', label: 'Combos' },
    ],
  },
  {
    label: 'Strategy',
    modes: [
      { id: 'foldeq', label: 'Fold equity' },
      { id: 'bluffbe', label: 'Bluff break-even' },
      { id: 'mdf', label: 'MDF' },
      { id: 'bluffshare', label: 'River bluff share' },
      { id: 'spr', label: 'SPR' },
      { id: 'texture', label: 'Board texture' },
      { id: 'players', label: 'Player types' },
    ],
  },
  {
    label: 'Tournament & bankroll',
    modes: [
      { id: 'mzone', label: 'M zones' },
      { id: 'icm', label: 'ICM bubble' },
      { id: 'ror', label: 'Risk of ruin' },
    ],
  },
  {
    label: 'Concept quiz',
    modes: [
      { id: 'quiz', label: 'By chapter' },
      { id: 'cheat', label: 'Cheat sheet' },
    ],
  },
];

const ALL_MODES = GROUPS.flatMap((g) => g.modes);

export function MathDrills() {
  const [mode, setMode] = useState<Mode>(() => (ALL_MODES.find((m) => m.id === routeParam('m'))?.id ?? 'potodds'));
  const [chapter, setChapter] = useState<number | null>(() => Number(routeParam('ch')) || null);
  const [n, setN] = useState(0);
  const q = useMemo(() => ({ ch: MODE_CHAPTER[mode], ...makeQuestion(mode, chapter) }), [mode, chapter, n]);
  const [picked, setPicked] = useState<string>();
  const group = GROUPS.find((g) => g.modes.some((m) => m.id === mode))!;

  const choose = (o: string) => {
    setPicked(o);
    record(mode, o === q.answer, { spot: q.spot, hand: q.cards?.hand ? q.cards.hand.join('') : '', yours: o, correct: q.answer });
  };
  const next = () => { setPicked(undefined); setN(n + 1); };
  const quizChapters = [...new Set(CONCEPT_QUIZ.map((x) => x.ch))];

  return (
    <section>
      <h1>Concept drills</h1>
      <div className="tabs">
        {GROUPS.map((g) => (
          <button key={g.label} className={g === group ? 'on' : ''} onClick={() => { setMode(g.modes[0].id); next(); }}>
            {g.label}
          </button>
        ))}
      </div>
      <div className="tabs small">
        {group.modes.map((m) => (
          <button key={m.id} className={m.id === mode ? 'on' : ''} onClick={() => { setMode(m.id); next(); }}>
            {m.label}
          </button>
        ))}
      </div>
      {mode === 'quiz' && (
        <div className="tabs small">
          <button className={!chapter ? 'on' : ''} onClick={() => { setChapter(null); next(); }}>All</button>
          {quizChapters.map((c) => (
            <button key={c} className={chapter === c ? 'on' : ''} onClick={() => { setChapter(c); next(); }}>Ch. {c}</button>
          ))}
        </div>
      )}
      <div className="table-felt">
        {q.cards && (
          <div className="board-row">
            {q.cards.hand && <div><div className="muted">You</div><Cards cards={q.cards.hand} /></div>}
            <div><div className="muted">Board</div><Cards cards={q.cards.board} /></div>
          </div>
        )}
        <p className="prompt">{q.prompt}</p>
      </div>
      <Choices options={q.options} onPick={choose} answered={!!picked} correct={q.answer} picked={picked} />
      {picked && (
        <Feedback ok={picked === q.answer} onNext={next} nextLabel={q.cards ? 'Next hand' : 'Next question'}>
          {q.explain}
          {q.ch && (
            <span className="odds">
              Read more: <a href={`#/learn?ch=${q.ch}`}>Chapter {q.ch}, {CHAPTERS[q.ch - 1].title}</a>
            </span>
          )}
        </Feedback>
      )}
    </section>
  );
}
