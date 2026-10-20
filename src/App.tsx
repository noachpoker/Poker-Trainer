import { ComponentType, useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { Preflop } from './pages/Preflop';
import { MathDrills } from './pages/MathDrills';
import { EquityPage } from './pages/Equity';
import { Review } from './pages/Review';
import { Progress } from './pages/Progress';

const ROUTES: Record<string, { label: string; el: ComponentType }> = {
  '': { label: 'Home', el: Home },
  preflop: { label: 'Preflop', el: Preflop },
  math: { label: 'Math', el: MathDrills },
  equity: { label: 'Equity', el: EquityPage },
  review: { label: 'Review', el: Review },
  progress: { label: 'Progress', el: Progress },
};

const current = () => location.hash.replace(/^#\/?/, '');

export function App() {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const on = () => { setRoute(current()); window.scrollTo(0, 0); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  const Page = (ROUTES[route] ?? ROUTES['']).el;
  return (
    <>
      <main><Page /></main>
      <nav className="bottom-nav">
        {Object.entries(ROUTES).map(([k, r]) => (
          <a key={k} href={`#/${k}`} className={k === route ? 'on' : ''}>{r.label}</a>
        ))}
      </nav>
    </>
  );
}
