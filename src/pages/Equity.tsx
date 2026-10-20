import { useMemo, useState } from 'react';
import { Card, classCombos, parseCards, pick } from '../poker/cards';
import { equity, Holding } from '../poker/equity';
import { parseRange } from '../poker/ranges';
import { Cards } from '../components/PlayingCard';
import { Choices, Feedback } from '../components/Choices';
import { record } from '../stats';

const MATCHUPS = [
  ['AA', 'KK'], ['QQ', 'AKo'], ['AKs', 'QQ'], ['JJ', 'AQs'], ['TT', '98s'], ['AKo', '22'],
  ['AKo', 'AQo'], ['KQs', 'AJo'], ['77', 'AKs'], ['A5s', 'KQo'], ['T9s', 'AKo'], ['A2o', 'K7o'],
  ['QJs', 'A2s'], ['55', 'JTs'], ['KK', 'A5s'], ['AJo', 'KTs'],
];
const BUCKETS = ['Under 35%', '35 to 45%', '45 to 55%', '55 to 65%', '65 to 75%', 'Over 75%'];
const bucket = (e: number) => BUCKETS[e < 0.35 ? 0 : e < 0.45 ? 1 : e < 0.55 ? 2 : e < 0.65 ? 3 : e < 0.75 ? 4 : 5];

function dealMatchup(): { a: Card[]; b: Card[]; eq: number } {
  const [ca, cb] = pick(MATCHUPS);
  const a = pick(classCombos(ca));
  let b = pick(classCombos(cb));
  while (b.some((c) => a.includes(c))) b = pick(classCombos(cb));
  const flip = Math.random() < 0.5;
  const [x, y] = flip ? [b, a] : [a, b];
  return { a: x, b: y, eq: equity(x, y, [], 8000).equity };
}

function EquityQuiz() {
  const [n, setN] = useState(0);
  const m = useMemo(dealMatchup, [n]);
  const [picked, setPicked] = useState<string>();
  const answer = bucket(m.eq);
  return (
    <div>
      <h2>Equity guess</h2>
      <div className="table-felt">
        <div className="board-row">
          <div><div className="muted">You</div><Cards cards={m.a} /></div>
          <div><div className="muted">Opponent</div><Cards cards={m.b} /></div>
        </div>
        <p className="prompt">All-in before the flop. How often do you win?</p>
      </div>
      <Choices options={BUCKETS} onPick={(o) => { setPicked(o); record('equity', o === answer, { spot: 'preflop all-in', hand: `${m.a.join('')} vs ${m.b.join('')}`, yours: o, correct: answer }); }}
        answered={!!picked} correct={answer} picked={picked} />
      {picked && (
        <Feedback ok={picked === answer} onNext={() => { setPicked(undefined); setN(n + 1); }}>
          You have about <b>{Math.round(m.eq * 100)}%</b> equity.
        </Feedback>
      )}
    </div>
  );
}

/** "qq+, a5s-a2s" → "QQ+, A5s-A2s" */
const normalizeRange = (t: string) =>
  t.split(',').map((tok) =>
    tok.trim().split('-').map((p) => p.slice(0, 2).toUpperCase() + p.slice(2).toLowerCase()).join('-'),
  ).join(',');

function parseHolding(text: string): Holding {
  const compact = text.replace(/\s/g, '');
  if (/^([AKQJT2-9][shdc]){2}$/i.test(compact)) return parseCards(compact);
  const set = parseRange(normalizeRange(text));
  if (!set.size) throw new Error(`Could not read "${text}"`);
  return set;
}

function Calculator() {
  const [a, setA] = useState('AhKh');
  const [b, setB] = useState('QQ+, AKs');
  const [board, setBoard] = useState('');
  const [out, setOut] = useState<string>();
  const run = () => {
    try {
      const r = equity(parseHolding(a), parseHolding(b), board.trim() ? parseCards(board) : [], 30000);
      setOut(`You win ${Math.round(r.win * 1000) / 10}%, tie ${Math.round(r.tie * 1000) / 10}%. Total equity ${Math.round(r.equity * 1000) / 10}%.`);
    } catch (e) {
      setOut((e as Error).message);
    }
  };
  return (
    <div>
      <h2>Equity calculator</h2>
      <p className="muted">Enter exact cards (AhKh) or a range (QQ+, AKs, A5s-A2s).</p>
      <label>Your hand<input value={a} onChange={(e) => setA(e.target.value)} /></label>
      <label>Opponent's hand or range<input value={b} onChange={(e) => setB(e.target.value)} /></label>
      <label>Board (optional)<input value={board} placeholder="e.g. Kh7h2c" onChange={(e) => setBoard(e.target.value)} /></label>
      <button className="primary" onClick={run}>Calculate</button>
      {out && <p className="result">{out}</p>}
    </div>
  );
}

export function EquityPage() {
  return (
    <section>
      <h1>Equity</h1>
      <EquityQuiz />
      <Calculator />
    </section>
  );
}
