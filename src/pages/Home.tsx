import { useState } from 'react';
import { loadGoals, saveGoals } from '../stats';

const SECTIONS = [
  { href: '#/preflop', title: 'Preflop drills', text: 'Open raises, big blind defense, and tournament push or fold.' },
  { href: '#/math', title: 'Poker math', text: 'Pot odds, outs, and call-or-fold decisions with draws.' },
  { href: '#/equity', title: 'Equity', text: 'Guess all-in equity and run any hand against a range.' },
  { href: '#/review', title: 'Hand review', text: 'Load your hand histories and replay your decisions.' },
  { href: '#/progress', title: 'Progress', text: 'Accuracy by drill and the mistakes you repeat.' },
];

export function Home() {
  const [goals, setGoals] = useState(loadGoals);
  return (
    <section>
      <h1>Poker Trainer</h1>
      <p className="muted">No-Limit Hold'em practice. Cash games first, tournaments included.</p>
      <div className="tiles">
        {SECTIONS.map((s) => (
          <a key={s.href} className="tile" href={s.href}>
            <b>{s.title}</b>
            <span>{s.text}</span>
          </a>
        ))}
      </div>
      <h2>My goals</h2>
      <textarea rows={4} value={goals} placeholder="e.g. Defend my big blind correctly. Know pot odds instantly."
        onChange={(e) => { setGoals(e.target.value); saveGoals(e.target.value); }} />
    </section>
  );
}
