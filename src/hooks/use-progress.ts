import { useCallback, useSyncExternalStore } from "react";

export type ProgressState = {
  /** ISO dates (YYYY-MM-DD) with at least one study action */
  days: string[];
  /** listens / quiz answers recorded today (date key -> count) */
  today: { date: string; listens: number; quiz: number };
  totalListens: number;
  totalQuiz: number;
  bestStreak: number;
};

const KEY = "espanol-lingo-progress-v1";
export const DAILY_GOAL = 15; // 10 écoutes + 5 réponses quiz

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function empty(): ProgressState {
  return {
    days: [],
    today: { date: todayKey(), listens: 0, quiz: 0 },
    totalListens: 0,
    totalQuiz: 0,
    bestStreak: 0,
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

export function recordAction(type: "listen" | "quiz") {
  if (typeof window === "undefined") return;
  const t = todayKey();
  if (state.today.date !== t) state.today = { date: t, listens: 0, quiz: 0 };
  if (type === "listen") {
    state.today.listens += 1;
    state.totalListens += 1;
  } else {
    state.today.quiz += 1;
    state.totalQuiz += 1;
  }
  if (!state.days.includes(t)) state.days = [...state.days, t];
  const streak = currentStreak(state.days);
  if (streak > state.bestStreak) state.bestStreak = streak;
  state = { ...state };
  persist();
}

export function currentStreak(days: string[]): number {
  const set = new Set(days);
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

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useProgress() {
  const s = useSyncExternalStore(subscribe, () => state, () => state);
  const todayActions = s.today.listens + s.today.quiz;
  const percent = Math.min(100, Math.round((todayActions / DAILY_GOAL) * 100));
  const streak = currentStreak(s.days);
  const recordListen = useCallback(() => recordAction("listen"), []);
  const recordQuiz = useCallback(() => recordAction("quiz"), []);
  return {
    ...s,
    streak,
    todayActions,
    percent,
    goalDone: todayActions >= DAILY_GOAL,
    totalDays: s.days.length,
    recordListen,
    recordQuiz,
  };
}
