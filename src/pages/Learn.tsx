import { ReactNode, useState } from 'react';
import { Block, BOOKS, Chapter, CHAPTERS, PLAN, planRow } from '../learn/guide';
import { loadPlanStart, loadRead, savePlanStart, saveRead } from '../stats';
import { routeParam } from '../route';

/** Renders **bold** spans inside guide text. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p))}</>;
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="table-wrap">
      <table className="guide-table">
        <thead><tr>{rows[0].map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.slice(1).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><Rich text={c} /></td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function BlockView({ b }: { b: Block }): ReactNode {
  if ('h' in b) return <h2>{b.h}</h2>;
  if ('p' in b) return <p><Rich text={b.p} /></p>;
  if ('f' in b) return <div className="formula">{b.f}</div>;
  if ('list' in b) return <ul>{b.list.map((t, i) => <li key={i}><Rich text={t} /></li>)}</ul>;
  if ('steps' in b) return <ol>{b.steps.map((t, i) => <li key={i}><Rich text={t} /></li>)}</ol>;
  return <Table rows={b.table} />;
}

function ChapterView({ c }: { c: Chapter }) {
  const [read, setRead] = useState(loadRead);
  const done = read.includes(c.n);
  const toggle = () => {
    const next = done ? read.filter((x) => x !== c.n) : [...read, c.n];
    setRead(next);
    saveRead(next);
  };
  const prev = CHAPTERS[c.n - 2];
  const nxt = CHAPTERS[c.n];
  return (
    <section className="guide">
      <a href="#/learn">← All chapters</a>
      <h1>{c.n}. {c.title}</h1>
      <p className="lead">{c.lead}</p>
      {c.blocks.map((b, i) => <BlockView key={i} b={b} />)}
      <div className="practice">
        <h3>Practice</h3>
        <p>{c.practice}</p>
        <div className="row">
          {c.drills.map(([label, href]) => <a key={href + label} className="button" href={href}>{label}</a>)}
        </div>
      </div>
      <button className={done ? '' : 'primary'} onClick={toggle}>{done ? '✓ Read (tap to undo)' : 'Mark chapter as read'}</button>
      <div className="pager">
        {prev ? <a className="button" href={`#/learn?ch=${prev.n}`}>← {prev.n}. {prev.title}</a> : <span />}
        {nxt && <a className="button" href={`#/learn?ch=${nxt.n}`}>{nxt.n}. {nxt.title} →</a>}
      </div>
    </section>
  );
}

function PlanCard() {
  const [start, setStart] = useState(loadPlanStart);
  const set = (t: number | null) => { setStart(t); savePlanStart(t); };
  const week = start ? Math.floor((Date.now() - start) / (7 * 864e5)) + 1 : null;
  const row = week && week <= 8 ? planRow(week) : null;
  return (
    <div className="plan-card">
      <h3>8-week study plan</h3>
      {week === null && <p className="muted">Read one chapter per session, then drill it. Start the plan to see this week's focus here.</p>}
      {row !== null && (
        <>
          <p>Week <b>{week}</b> of 8: <b>{PLAN[row].focus}</b> (chapters {PLAN[row].chapters.join(' and ')}).</p>
          <p className="muted">Daily, 15–20 min: {PLAN[row].daily}. Off the table: {PLAN[row].offTable}.</p>
          <div className="row">
            {PLAN[row].chapters.map((n) => <a key={n} className="button" href={`#/learn?ch=${n}`}>Read ch. {n}</a>)}
            {PLAN[row].drills.map(([label, href]) => <a key={href} className="button" href={href}>{label}</a>)}
          </div>
        </>
      )}
      {week !== null && week > 8 && (
        <p>Plan complete. Now rotate: one review session per three playing sessions, and make your most costly leak the week's focus.</p>
      )}
      <div className="table-wrap">
        <table className="guide-table plan-table">
          <thead><tr><th>Weeks</th><th>Focus</th><th>Daily drill</th></tr></thead>
          <tbody>
            {PLAN.map((p, i) => (
              <tr key={p.weeks} className={i === row ? 'now' : ''}><td>{p.weeks}</td><td>{p.focus}</td><td>{p.daily}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {start === null
        ? <button className="primary" onClick={() => set(Date.now())}>Start the plan today</button>
        : <button onClick={() => set(null)}>Reset plan</button>}
    </div>
  );
}

export function Learn() {
  const n = Number(routeParam('ch'));
  const chapter = CHAPTERS.find((c) => c.n === n);
  const [read] = useState(loadRead);
  if (chapter) return <ChapterView c={chapter} />;
  return (
    <section className="guide">
      <h1>Study guide</h1>
      <p className="muted">
        Winning No-Limit Hold'em comes down to one habit: making the decision with the highest expected value against the
        range your opponent actually has. Chapters 2 to 4 are the base everything else stands on, so master them first.
      </p>
      <PlanCard />
      <h2>Chapters <span className="muted">({read.length} of {CHAPTERS.length} read)</span></h2>
      <ul className="chapter-list">
        {CHAPTERS.map((c) => (
          <li key={c.n}>
            <a href={`#/learn?ch=${c.n}`}>
              <span className="num">{c.n}</span>
              <span>{c.title}</span>
              {read.includes(c.n) && <span className="done">✓</span>}
            </a>
          </li>
        ))}
      </ul>
      <h2>The books</h2>
      <p className="muted">Tags in brackets show which books an idea comes from. Numbers are standard figures you can check in the drills.</p>
      <Table rows={BOOKS} />
    </section>
  );
}
