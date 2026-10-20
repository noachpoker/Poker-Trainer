import { useMemo, useState } from 'react';
import { Card, pick, shuffle } from '../poker/cards';
import { outsEquity, requiredEquity } from '../poker/equity';
import { Cards } from '../components/PlayingCard';
import { Choices, Feedback } from '../components/Choices';
import { record } from '../stats';

type Mode = 'potodds' | 'outs' | 'callfold';

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
  cards?: Draw;
}

function makeQuestion(mode: Mode): Question {
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

const MODES: { id: Mode; label: string }[] = [
  { id: 'potodds', label: 'Pot odds' },
  { id: 'outs', label: 'Outs to equity' },
  { id: 'callfold', label: 'Call or fold a draw' },
];

export function MathDrills() {
  const [mode, setMode] = useState<Mode>('potodds');
  const [n, setN] = useState(0);
  const q = useMemo(() => makeQuestion(mode), [mode, n]);
  const [picked, setPicked] = useState<string>();

  const choose = (o: string) => {
    setPicked(o);
    record(mode, o === q.answer, { spot: q.spot, hand: q.cards ? q.cards.hand.join('') : '', yours: o, correct: q.answer });
  };
  const next = () => { setPicked(undefined); setN(n + 1); };

  return (
    <section>
      <h1>Poker math</h1>
      <div className="tabs small">
        {MODES.map((m) => (
          <button key={m.id} className={m.id === mode ? 'on' : ''} onClick={() => { setMode(m.id); next(); }}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="table-felt">
        {q.cards && (
          <div className="board-row">
            <div><div className="muted">You</div><Cards cards={q.cards.hand} /></div>
            <div><div className="muted">Board</div><Cards cards={q.cards.board} /></div>
          </div>
        )}
        <p className="prompt">{q.prompt}</p>
      </div>
      <Choices options={q.options} onPick={choose} answered={!!picked} correct={q.answer} picked={picked} />
      {picked && <Feedback ok={picked === q.answer} onNext={next}>{q.explain}</Feedback>}
    </section>
  );
}
