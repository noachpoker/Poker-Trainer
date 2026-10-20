import { ComponentType, useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { Preflop } from './pages/Preflop';
import { MathDrills } from './pages/MathDrills';
import { EquityPage } from './pages/Equity';
import { Review } from './pages/Review';
import { Progress } from './pages/Progress';
import { Learn } from './pages/Learn';
import { routePath } from './route';

const ROUTES: Record<string, { label: string; el: ComponentType }> = {
  '': { label: 'Home', el: Home },
  learn: { label: 'Learn', el: Learn },
  preflop: { label: 'Preflop', el: Preflop },
  math: { label: 'Drills', el: MathDrills },
  equity: { label: 'Equity', el: EquityPage },
  review: { label: 'Review', el: Review },
  progress: { label: 'Progress', el: Progress },
};

export function App() {
  const [route, setRoute] = useState(location.hash);
  useEffect(() => {
    const on = () => { setRoute(location.hash); window.scrollTo(0, 0); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  const path = routePath();
  const Page = (ROUTES[path] ?? ROUTES['']).el;
  return (
    <>
      {/* Keyed by the full hash so links to a drill mode or chapter start fresh. */}
      <main><Page key={route} /></main>
      <nav className="bottom-nav">
        {Object.entries(ROUTES).map(([k, r]) => (
          <a key={k} href={`#/${k}`} className={k === path ? 'on' : ''}>{r.label}</a>
        ))}
      </nav>
    </>
  );
}
