import { useCallback, useSyncExternalStore } from "react";

export type SrsCard = { es: string; ar: string; box: number; due: string; reps: number };

export type ProgressState = {
  /** ISO dates (YYYY-MM-DD) with at least one study action */
  days: string[];
  /** listens / quiz answers recorded today (date key -> count) */
  today: { date: string; listens: number; quiz: number };
  /** date -> actions count, for the 7/30 days chart */
  history: Record<string, number>;
  totalListens: number;
  totalQuiz: number;
  bestStreak: number;
  /** streak protection ("jours de repos") */
  freezes: number;
  freezeUsed: string[];
  /** spaced repetition cards keyed by spanish word */
  srs: Record<string, SrsCard>;
  correct: number;
  wrong: number;
  darkMode: boolean;
  /** HH:MM of the day's first study action — used to remind at the same time */
  studyTime: string | null;
  /** last date a study-time reminder notification was shown */
  lastReminder: string | null;
};

const KEY = "espanol-lingo-progress-v1";
export const DAILY_GOAL = 15; // 10 écoutes + 5 réponses quiz
export const MAX_FREEZES = 3;

export const LEVELS = [
  { id: "A1", label: "A1 — مبتدئ", min: 0 },
  { id: "A2", label: "A2 — أساسي", min: 150 },
  { id: "B1", label: "B1 — متوسط", min: 500 },
  { id: "B2", label: "B2 — متقدم", min: 1200 },
] as const;

export const BADGES = [
  { id: "first", icon: "🌱", label: "أول خطوة", test: (s: ProgressState) => s.totalListens + s.totalQuiz >= 1 },
  { id: "listen50", icon: "🔊", label: "50 استماع", test: (s: ProgressState) => s.totalListens >= 50 },
  { id: "quiz50", icon: "📝", label: "50 إجابة", test: (s: ProgressState) => s.totalQuiz >= 50 },
  { id: "streak3", icon: "🔥", label: "3 أيام متتالية", test: (s: ProgressState) => s.bestStreak >= 3 },
  { id: "streak7", icon: "🏅", label: "أسبوع كامل", test: (s: ProgressState) => s.bestStreak >= 7 },
  { id: "srs20", icon: "🧠", label: "20 كلمة محفوظة", test: (s: ProgressState) => Object.values(s.srs).filter((c) => c.box >= 3).length >= 20 },
  { id: "days30", icon: "🏆", label: "30 يوم دراسة", test: (s: ProgressState) => s.days.length >= 30 },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function empty(): ProgressState {
  return {
    days: [],
    today: { date: todayKey(), listens: 0, quiz: 0 },
    history: {},
    totalListens: 0,
    totalQuiz: 0,
    bestStreak: 0,
    freezes: MAX_FREEZES,
    freezeUsed: [],
    srs: {},
    correct: 0,
    wrong: 0,
    darkMode: false,
    studyTime: null,
    lastReminder: null,
  };
}

let state: ProgressState = load();
const listeners = new Set<() => void>();

function load(): ProgressState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed.today?.date !== todayKey()) {
      parsed.today = { date: todayKey(), listens: 0, quiz: 0 };
    }
    return { ...empty(), ...parsed };
  } catch {
    return empty();
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function markDay(t: string) {
  if (!state.days.includes(t)) state.days = [...state.days, t];
  state.history = { ...state.history, [t]: (state.history[t] ?? 0) + 1 };
  const streak = currentStreak(state.days, state.freezeUsed);
  if (streak > state.bestStreak) state.bestStreak = streak;
}

export function recordAction(type: "listen" | "quiz") {
  if (typeof window === "undefined") return;
  const t = todayKey();
  if (state.today.date !== t) {
    // first action of the day — remember the study time for tomorrow's reminder
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    state.today = { date: t, listens: 0, quiz: 0 };
    state.studyTime = hhmm;
  }
  if (type === "listen") {
    state.today.listens += 1;
    state.totalListens += 1;
  } else {
    state.today.quiz += 1;
    state.totalQuiz += 1;
  }
  markDay(t);
  state = { ...state };
  persist();
}

/** Spaced repetition — Leitner boxes (1..5), intervals in days */
const INTERVALS = [0, 1, 2, 4, 8, 16];

export function reviewCard(es: string, ar: string, good: boolean) {
  if (typeof window === "undefined") return;
  const prev = state.srs[es] ?? { es, ar, box: 1, due: todayKey(), reps: 0 };
  const box = good ? Math.min(5, prev.box + 1) : 1;
  const card: SrsCard = {
    es,
    ar,
    box,
    reps: prev.reps + 1,
    due: addDays(todayKey(), INTERVALS[box] ?? 1),
  };
  state = {
    ...state,
    srs: { ...state.srs, [es]: card },
    correct: state.correct + (good ? 1 : 0),
    wrong: state.wrong + (good ? 0 : 1),
  };
  persist();
}

export function dueCards(): SrsCard[] {
  const t = todayKey();
  return Object.values(state.srs).filter((c) => c.due <= t);
}

export function consumeStreakFreeze() {
  if (typeof window === "undefined") return false;
  if (state.freezes <= 0) return false;
  const yesterday = addDays(todayKey(), -1);
  if (state.days.includes(yesterday) || state.freezeUsed.includes(yesterday)) return false;
  state = { ...state, freezes: state.freezes - 1, freezeUsed: [...state.freezeUsed, yesterday] };
  persist();
  return true;
}

export function setDarkMode(on: boolean) {
  state = { ...state, darkMode: on };
  if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", on);
  persist();
}

export function currentStreak(days: string[], freezeUsed: string[] = []): number {
  const set = new Set([...days, ...freezeUsed]);
  let streak = 0;
  const d = new Date();
  // if today not studied yet, streak counts from yesterday
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** last N days as [{date, count}] for the chart */
export function historySeries(history: Record<string, number>, n: number) {
  const out: { date: string; count: number }[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(d);
    day.setDate(d.getDate() - i);
    const iso = day.toISOString().slice(0, 10);
    out.push({ date: iso, count: history[iso] ?? 0 });
  }
  return out;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useProgress() {
  const s = useSyncExternalStore(subscribe, () => state, () => state);
  const todayActions = s.today.listens + s.today.quiz;
  const percent = Math.min(100, Math.round((todayActions / DAILY_GOAL) * 100));
  const streak = currentStreak(s.days, s.freezeUsed);
  const xp = s.totalListens + s.totalQuiz * 3;
  const level = [...LEVELS].reverse().find((l) => xp >= l.min) ?? LEVELS[0];
  const badges = BADGES.map((b) => ({ ...b, earned: b.test(s) }));
  const recordListen = useCallback(() => recordAction("listen"), []);
  const recordQuiz = useCallback(() => recordAction("quiz"), []);
  return {
    ...s,
    streak,
    todayActions,
    percent,
    xp,
    level,
    badges,
    goalDone: todayActions >= DAILY_GOAL,
    totalDays: s.days.length,
    learned: Object.values(s.srs).filter((c) => c.box >= 3).length,
    recordListen,
    recordQuiz,
  };
}
