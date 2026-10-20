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
  ev: 'EV of a call',
  implied: 'Implied odds',
  discount: 'Clean outs',
  combos: 'Combos',
  foldeq: 'Fold equity',
  bluffbe: 'Bluff break-even',
  mdf: 'Minimum defense frequency',
  bluffshare: 'River bluff share',
  spr: 'SPR and commitment',
  texture: 'Board texture',
  players: 'Player types',
  mzone: 'Tournament: M zones',
  icm: 'Tournament: ICM bubble calls',
  ror: 'Risk of ruin',
  quiz: 'Concept quiz',
  cheat: 'Cheat sheet',
};

// Study guide reading progress and the 8-week plan start date.
const READ_KEY = 'poker-trainer-read-v1';
const PLAN_KEY = 'poker-trainer-plan-start-v1';

export function loadRead(): number[] {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveRead(chapters: number[]) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(chapters));
  } catch {
    /* ignore */
  }
}

export function loadPlanStart(): number | null {
  try {
    const v = localStorage.getItem(PLAN_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

export function savePlanStart(t: number | null) {
  try {
    if (t === null) localStorage.removeItem(PLAN_KEY);
    else localStorage.setItem(PLAN_KEY, String(t));
  } catch {
    /* ignore */
  }
}
