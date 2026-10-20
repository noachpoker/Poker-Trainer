import { useState } from 'react';
import { DRILL_NAMES, loadStats, resetStats } from '../stats';

export function Progress() {
  const [stats, setStats] = useState(loadStats);
  const [confirming, setConfirming] = useState(false);
  const weekAgo = Date.now() - 7 * 864e5;
  const recent = stats.log.filter((l) => l.t >= weekAgo);
  const recentOk = recent.filter((l) => l.ok).length;

  // Hands missed more than once are the clearest leaks.
  const repeat: Record<string, number> = {};
  for (const m of stats.mistakes) {
    const k = `${DRILL_NAMES[m.drill] ?? m.drill}: ${m.spot}${m.hand ? `, ${m.hand}` : ''}`;
    repeat[k] = (repeat[k] ?? 0) + 1;
  }
  const leaks = Object.entries(repeat).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <section>
      <h1>Progress</h1>
      <div className="stats-row">
        <div><b>{recent.length}</b><span>answers this week</span></div>
        <div><b>{recent.length ? Math.round((recentOk / recent.length) * 100) : 0}%</b><span>correct this week</span></div>
      </div>
      <h2>By drill</h2>
      {Object.keys(stats.drills).length === 0 && <p className="muted">No answers yet. Start with a preflop drill.</p>}
      {Object.entries(stats.drills).map(([id, d]) => {
        const p = Math.round((d.correct / d.total) * 100);
        return (
          <div key={id} className="bar-row">
            <span>{DRILL_NAMES[id] ?? id}</span>
            <div className="bar"><div style={{ width: `${p}%` }} /></div>
            <span>{p}% of {d.total}</span>
          </div>
        );
      })}
      {leaks.length > 0 && (
        <>
          <h2>Repeat mistakes</h2>
          <ul className="plain">{leaks.map(([k, n]) => <li key={k}>{k} <span className="muted">({n} times)</span></li>)}</ul>
        </>
      )}
      {stats.mistakes.length > 0 && (
        <>
          <h2>Recent mistakes</h2>
          <ul className="plain">
            {stats.mistakes.slice(0, 15).map((m, i) => (
              <li key={i}>
                {DRILL_NAMES[m.drill] ?? m.drill}: {m.spot}{m.hand ? ` with ${m.hand}` : ''}. You chose {m.yours}, answer was <b>{m.correct}</b>.
              </li>
            ))}
          </ul>
        </>
      )}
      {confirming ? (
        <div className="row">
          <button className="danger" onClick={() => { resetStats(); setStats(loadStats()); setConfirming(false); }}>Yes, erase all results</button>
          <button onClick={() => setConfirming(false)}>Keep them</button>
        </div>
      ) : (
        <button className="danger" onClick={() => setConfirming(true)}>Reset progress</button>
      )}
    </section>
  );
}
