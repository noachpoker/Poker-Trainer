// Practice results live in this browser's local storage.

export interface Mistake { t: number; drill: string; spot: string; hand: string; yours: string; correct: string }
interface Stats {
  drills: Record<string, { correct: number; total: number }>;
  log: { t: number; drill: string; ok: boolean }[];
  mistakes: Mistake[];
}

const KEY = 'poker-trainer-stats-v1';
const GOALS_KEY = 'poker-trainer-goals-v1';

function empty(): Stats {
  return { drills: {}, log: [], mistakes: [] };
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save(s: Stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: results just are not kept */
  }
}

export function record(drill: string, ok: boolean, mistake?: Omit<Mistake, 't' | 'drill'>) {
  const s = loadStats();
  const d = (s.drills[drill] ??= { correct: 0, total: 0 });
  d.total++;
  if (ok) d.correct++;
  const t = Date.now();
  s.log.push({ t, drill, ok });
  if (s.log.length > 5000) s.log = s.log.slice(-5000);
  if (!ok && mistake) {
    s.mistakes.unshift({ t, drill, ...mistake });
    s.mistakes = s.mistakes.slice(0, 200);
  }
  save(s);
}

export function resetStats() {
  save(empty());
}

export function loadGoals(): string {
  try {
    return localStorage.getItem(GOALS_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveGoals(text: string) {
  try {
    localStorage.setItem(GOALS_KEY, text);
  } catch {
    /* ignore */
  }
}

export const DRILL_NAMES: Record<string, string> = {
  rfi: 'Cash: open raise',
  bbdef: 'Cash: big blind defense',
  pushfold: 'Tournament: push or fold',
  potodds: 'Pot odds',
  outs: 'Outs to equity',
  callfold: 'Call or fold a draw',
  equity: 'Equity guess',
};
