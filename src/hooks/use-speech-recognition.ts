import { useCallback, useRef, useState } from "react";

type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getCtor(): (new () => Rec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** normalise: minuscules, sans accents ni ponctuation */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ ]/g, "")
    .trim();
}

/** score 0..100 basé sur la distance de Levenshtein */
export function scorePronunciation(target: string, said: string) {
  const a = normalize(target);
  const b = normalize(said);
  if (!a || !b) return 0;
  const m: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i]![j] = Math.min(
        m[i - 1]![j]! + 1,
        m[i]![j - 1]! + 1,
        m[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  const dist = m[a.length]![b.length]!;
  return Math.max(0, Math.round((1 - dist / Math.max(a.length, b.length)) * 100));
}

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const ref = useRef<Rec | null>(null);

  const supported = typeof window !== "undefined" && getCtor() !== null;

  const listen = useCallback((onDone: (said: string) => void) => {
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    ref.current = rec;
    rec.lang = "es-MX";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const said = e.results[0]?.[0]?.transcript ?? "";
      setTranscript(said);
      onDone(said);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setTranscript("");
    setListening(true);
    rec.start();
  }, []);

  const stop = useCallback(() => {
    ref.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, listen, stop };
}
