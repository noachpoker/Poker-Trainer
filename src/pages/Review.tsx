import { useMemo, useState } from 'react';
import { handClass } from '../poker/cards';
import { CASH_RFI, CashPosition, PUSH_FOLD, PushPosition } from '../poker/charts';
import { requiredEquity } from '../poker/equity';
import { HandAction, heroFirstIn, ParsedHand, parseHands, SAMPLE_HANDS, Street } from '../poker/handHistory';
import { Cards } from '../components/PlayingCard';
import { flopSpr, sprAdvice } from '../poker/spr';

const STORE = 'poker-trainer-hands-v1';
const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];
const BOARD_SIZE: Record<Street, number> = { preflop: 0, flop: 3, turn: 4, river: 5 };

function loadSaved(): string {
  try {
    return localStorage.getItem(STORE) ?? '';
  } catch {
    return '';
  }
}

const PUSH_POS: Record<string, PushPosition> = {
  UTG: 'UTG', 'UTG+1': 'UTG', 'UTG+2': 'MP', MP: 'MP', LJ: 'MP', HJ: 'CO', CO: 'CO', BTN: 'BTN', SB: 'SB',
};

/** Compares the hero's first-in preflop decision with the standard charts. */
export function chartCheck(h: ParsedHand): string | null {
  const first = heroFirstIn(h);
  if (!first) return null;
  const cls = handClass(h.heroCards[0], h.heroCards[1]);
  if (h.isTournament && h.heroStackBB > 0 && h.heroStackBB <= 17) {
    const pos = PUSH_POS[h.heroPosition];
    if (!pos) return null;
    const depth = h.heroStackBB <= 12.5 ? 10 : 15;
    const shove = PUSH_FOLD[depth][pos].has(cls);
    const didShove = first.type === 'raise' && first.allIn;
    if (shove && first.type === 'fold') return `Push/fold chart (${depth}bb) shoves ${cls} here`;
    if (!shove && first.type !== 'fold') return `Push/fold chart (${depth}bb) folds ${cls} here`;
    if (shove && !didShove) return `Push/fold chart (${depth}bb) shoves ${cls} here`;
    return null;
  }
  if (h.isTournament || !(h.heroPosition in CASH_RFI)) return null;
  const open = CASH_RFI[h.heroPosition as CashPosition].has(cls);
  if (first.type === 'call') return `Limped first in. The chart ${open ? 'raises' : 'folds'} ${cls}`;
  if (open && first.type === 'fold') return `The chart opens ${cls} from ${h.heroPosition}`;
  if (!open && first.type === 'raise') return `The chart folds ${cls} from ${h.heroPosition}`;
  return null;
}

function describe(a: HandAction, bb: number): string {
  const f = (x: number) => `${+(x / bb).toFixed(1)}bb`;
  const tail = a.allIn ? ' (all-in)' : '';
  switch (a.type) {
    case 'post': return `posts ${f(a.amount)}`;
    case 'fold': return 'folds';
    case 'check': return 'checks';
    case 'call': return `calls ${f(a.amount)}${tail}`;
    case 'bet': return `bets ${f(a.amount)}${tail}`;
    case 'raise': return `raises to ${f(a.raiseTo ?? a.amount)}${tail}`;
  }
}

function HandDetail({ h, onBack }: { h: ParsedHand; onBack: () => void }) {
  const playable = h.actions.filter((a) => a.type !== 'post');
  const [step, setStep] = useState(playable.length);
  const shown = new Set(playable.slice(0, step));
  const bb = h.bigBlind || 1;
  const lastShown = playable[step - 1];
  const street = lastShown?.street ?? 'preflop';
  const flag = chartCheck(h);
  const spr = flopSpr(h);

  return (
    <div>
      <button className="link" onClick={onBack}>← All hands</button>
      <h2>
        <Cards cards={h.heroCards} small /> {h.heroPosition}, {h.isTournament ? 'tournament' : 'cash'}
      </h2>
      <p className={h.heroNet >= 0 ? 'win' : 'loss'}>
        Result: {h.heroNet >= 0 ? '+' : ''}{(h.heroNet / bb).toFixed(1)}bb
      </p>
      {flag && <p className="flag">⚑ {flag}</p>}
      {spr && (
        <p className="spr-note">
          Flop SPR <b>{spr.spr.toFixed(1)}</b> ({+(spr.effective / bb).toFixed(1)}bb behind, {+(spr.pot / bb).toFixed(1)}bb pot). {sprAdvice(spr.spr)}
        </p>
      )}
      <div className="table-felt">
                {BOARD_SIZE[street] ? <Cards cards={h.board.slice(0, BOARD_SIZE[street])} /> : <div className="muted">No flop yet</div>}
      </div>
      <div className="stepper">
        <button onClick={() => setStep(0)}>⏮</button>
        <button onClick={() => setStep(Math.max(0, step - 1))}>Back</button>
        <span>{step} / {playable.length}</span>
        <button onClick={() => setStep(Math.min(playable.length, step + 1))}>Next</button>
        <button onClick={() => setStep(playable.length)}>⏭</button>
      </div>
      {STREETS.map((s) => {
        const acts = h.actions.filter((a) => a.street === s && (a.type === 'post' || shown.has(a)));
        if (!acts.length) return null;
        return (
          <div key={s} className="street">
            <h3>{s[0].toUpperCase() + s.slice(1)}</h3>
            <ul>
              {acts.map((a, i) => (
                <li key={i} className={a.isHero ? 'hero' : ''}>
                  <b>{a.isHero ? 'You' : a.player}</b> {describe(a, bb)}
                  {a.isHero && a.toCall > 0 && (a.type === 'call' || a.type === 'fold') && (
                    <span className="odds">
                      {' '}Facing {+(a.toCall / bb).toFixed(1)}bb into {+(a.potBefore / bb).toFixed(1)}bb: needed{' '}
                      {Math.round(requiredEquity(a.potBefore, a.toCall) * 100)}% equity to call
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <details className="practice">
        <summary>Review this hand like the study guide</summary>
        <ol>
          <li>What was villain's range preflop, and what did each action remove from it? Count the combos left.</li>
          <li>Was each of your key decisions +EV or −EV with what you knew at the time, whatever the result?</li>
          <li>Was your hand a commitment hand for this SPR?</li>
          <li>For each bet you made: value, bluff, or denial? A bet with no reason is a leak.</li>
          <li>What type of player was villain, and which exploit did you use?</li>
        </ol>
        <p className="muted">Log any leak you find in your notes doc. <a href="#/learn?ch=4">Hand reading</a> · <a href="#/learn?ch=7">SPR</a> · <a href="#/learn?ch=8">Postflop</a></p>
      </details>
    </div>
  );
}

export function Review() {
  const [text, setText] = useState(loadSaved);
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const { hands, failed } = useMemo(() => parseHands(text), [text]);

  const load = (t: string) => {
    setText(t);
    setOpen(null);
    try {
      localStorage.setItem(STORE, t);
    } catch {
      /* too large to keep: fine for this visit */
    }
  };
  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const parts = await Promise.all([...files].map((f) => f.text()));
    load([text, ...parts].filter(Boolean).join('\n\n'));
  };

  if (open !== null && hands[open]) return <section><HandDetail h={hands[open]} onBack={() => setOpen(null)} /></section>;

  const totalBB = hands.reduce((s, h) => s + h.heroNet / (h.bigBlind || 1), 0);
  const byPos: Record<string, { n: number; bb: number }> = {};
  for (const h of hands) {
    const p = (byPos[h.heroPosition] ??= { n: 0, bb: 0 });
    p.n++;
    p.bb += h.heroNet / (h.bigBlind || 1);
  }
  const flagged = hands.filter((h) => chartCheck(h)).length;

  return (
    <section>
      <h1>Hand review</h1>
      <p className="muted">
        Paste hand histories or open the .txt files your poker site exports (PokerStars and GGPoker formats).
        They stay on this device.
      </p>
      <textarea rows={5} value={draft} placeholder="Paste hand histories here" onChange={(e) => setDraft(e.target.value)} />
      <div className="row">
        <button className="primary" disabled={!draft.trim()} onClick={() => { load([text, draft].filter(Boolean).join('\n\n')); setDraft(''); }}>
          Add hands
        </button>
        <label className="button">
          Open files
          <input type="file" accept=".txt,text/plain" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        </label>
        <button onClick={() => load(SAMPLE_HANDS)}>Try sample hands</button>
        {hands.length > 0 && <button onClick={() => load('')}>Clear</button>}
      </div>
      {failed > 0 && <p className="flag">{failed} hand(s) could not be read.</p>}
      {hands.length > 0 && (
        <>
          <div className="stats-row">
            <div><b>{hands.length}</b><span>hands</span></div>
            <div><b className={totalBB >= 0 ? 'win' : 'loss'}>{totalBB >= 0 ? '+' : ''}{totalBB.toFixed(1)}</b><span>bb won</span></div>
            <div><b>{flagged}</b><span>off-chart preflop</span></div>
          </div>
          <table className="pos-table">
            <thead><tr><th>Position</th><th>Hands</th><th>bb won</th></tr></thead>
            <tbody>
              {Object.entries(byPos).map(([p, v]) => (
                <tr key={p}><td>{p}</td><td>{v.n}</td><td className={v.bb >= 0 ? 'win' : 'loss'}>{v.bb.toFixed(1)}</td></tr>
              ))}
            </tbody>
          </table>
          <ul className="hand-list">
            {hands.map((h, i) => {
              const flag = chartCheck(h);
              const net = h.heroNet / (h.bigBlind || 1);
              return (
                <li key={i} onClick={() => setOpen(i)}>
                  <Cards cards={h.heroCards} small />
                  <span className="pos">{h.heroPosition}</span>
                  <span className={net >= 0 ? 'win' : 'loss'}>{net >= 0 ? '+' : ''}{net.toFixed(1)}bb</span>
                  {flag && <span className="flag" title={flag}>⚑</span>}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
