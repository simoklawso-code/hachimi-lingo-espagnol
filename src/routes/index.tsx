import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import logoAsset from "@/assets/logo.png.asset.json";
import heroAsset from "@/assets/hero.jpg.asset.json";
import trophyAsset from "@/assets/trophy.png.asset.json";
import { sections, phrases, numbers, icons, type Item } from "@/data/lingo";
import { themes, verbs, stories } from "@/data/extra";
import {
  useProgress,
  DAILY_GOAL,
  MAX_FREEZES,
  LEVELS,
  reviewCard,
  dueCards,
  consumeStreakFreeze,
  setDarkMode,
  historySeries,
  type SrsCard,
} from "@/hooks/use-progress";
import { useSpeechRecognition, scorePronunciation } from "@/hooks/use-speech-recognition";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Espanol Lingo — تعلم الإسبانية بالعربية" },
      {
        name: "description",
        content:
          "تعلم الإسبانية بسهولة: 210 كلمة، 50 جملة، الأرقام 1-50، نطق صوتي واختبارات، مع ترجمة عربية.",
      },
      { property: "og:title", content: "Espanol Lingo — تعلم الإسبانية بالعربية" },
      {
        property: "og:description",
        content: "210 كلمة، 50 جملة، الأرقام 1-50 ونطق صوتي إسباني مع ترجمة عربية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

let onSpeak: (() => void) | null = null;
function speakText(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  onSpeak?.();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-MX";
  u.rate = 0.82;
  const vs = speechSynthesis.getVoices();
  u.voice = vs.find((v) => /^es-(MX|US|419)/i.test(v.lang)) ?? vs.find((v) => /^es/i.test(v.lang)) ?? null;
  speechSynthesis.speak(u);
}

type Screen =
  | { kind: "home" }
  | { kind: "lesson"; index: number }
  | { kind: "numbers" }
  | { kind: "phrases" }
  | { kind: "quiz" }
  | { kind: "progress" }
  | { kind: "themes" }
  | { kind: "theme"; id: string }
  | { kind: "grammar" }
  | { kind: "stories" }
  | { kind: "story"; id: string }
  | { kind: "review" }
  | { kind: "speak" }
  | { kind: "badges" };

function WordCard({ item, num }: { item: Item; num?: number }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-card">
      {num !== undefined && (
        <div className="text-center font-display text-3xl font-extrabold text-primary">{num}</div>
      )}
      <div className="flex items-center justify-between gap-2" dir="ltr">
        <span className="font-display text-lg font-extrabold">{item.es}</span>
        <button
          type="button"
          aria-label={`استمع إلى ${item.es}`}
          onClick={() => speakText(item.es)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          🔊
        </button>
      </div>
      <div className="mt-1 font-bold">{item.ar}</div>
      {item.pr && <div className="mt-0.5 text-xs text-muted-foreground">{item.pr}</div>}
    </article>
  );
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-2xl font-extrabold">{title}</h3>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function DailyCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ["Palabra del Día", "Gracias", "شكرا"],
        ["Frase del Día", "¿Cómo estás?", "كيف حالك؟"],
        ["Número del Día", "21", "واحد وعشرون"],
      ].map(([t, es, ar]) => (
        <div key={t} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h4 className="font-extrabold text-primary">{t}</h4>
          <div className="mt-2 flex items-center gap-2" dir="ltr">
            <span className="font-display text-2xl font-extrabold">{es}</span>
            <button
              type="button"
              aria-label={`استمع إلى ${es}`}
              onClick={() => speakText(es as string)}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary"
            >
              🔊
            </button>
          </div>
          <div className="mt-1">{ar}</div>
        </div>
      ))}
    </div>
  );
}

type Progress = ReturnType<typeof useProgress>;

function ProgressPanel({ progress }: { progress: Progress }) {
  const [freezeMsg, setFreezeMsg] = useState<string | null>(null);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <img
          src={trophyAsset.url}
          alt="كأس التقدم الذهبي"
          width={1024}
          height={1024}
          loading="lazy"
          className={`h-36 w-36 object-contain transition-all ${
            progress.goalDone ? "drop-shadow-[0_10px_25px_oklch(0.83_0.16_85/0.6)]" : "opacity-40 grayscale"
          }`}
        />
        {progress.goalDone ? (
          <p className="mt-3 font-extrabold text-primary">🏆 أحسنت! أنجزت هدف اليوم</p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">أكمل هدف اليوم لتحصل على الكأس الذهبي</p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
        <h3 className="text-xl font-extrabold">هدف اليوم 🎯</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {DAILY_GOAL} إجراء: استمع 🔊 للكلمات وأجب في الاختبار 📝
        </p>
        <div className="mt-4 font-display text-5xl font-extrabold text-primary">{progress.percent}%</div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {progress.todayActions}/{DAILY_GOAL} اليوم • 🔊 {progress.today.listens} استماع • 📝 {progress.today.quiz}{" "}
          اختبار
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl font-extrabold">أيام الدراسة 📅</h3>
          <LevelBadge level={progress.level} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-primary-soft p-4">
            <b className="font-display text-3xl text-primary">{progress.streak}</b>
            <small className="block text-muted-foreground">🔥 أيام متتالية</small>
          </div>
          <div className="rounded-xl bg-primary-soft p-4">
            <b className="font-display text-3xl text-primary">{progress.totalDays}</b>
            <small className="block text-muted-foreground">📆 مجموع الأيام</small>
          </div>
          <div className="rounded-xl bg-primary-soft p-4">
            <b className="font-display text-3xl text-primary">{progress.totalListens}</b>
            <small className="block text-muted-foreground">🔊 استماع</small>
          </div>
          <div className="rounded-xl bg-primary-soft p-4">
            <b className="font-display text-3xl text-primary">{progress.totalQuiz}</b>
            <small className="block text-muted-foreground">📝 إجابات</small>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const ok = consumeStreakFreeze();
            setFreezeMsg(ok ? "🧊 تم إنقاذ سلسلتك ليوم أمس!" : "لا يمكن استعمال يوم الراحة الآن");
          }}
          className="mt-4 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold"
        >
          🧊 يوم راحة — حماية السلسلة ({progress.freezes}/{MAX_FREEZES})
        </button>
        {freezeMsg && <p className="mt-2 text-center text-xs text-muted-foreground">{freezeMsg}</p>}
      </div>
    </div>
  );
}


function LevelBadge({ level }: { level: { id: string; label: string } }) {
  return (
    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary">
      {level.label}
    </span>
  );
}

function ActivityChart({ history }: { history: Record<string, number> }) {
  const [range, setRange] = useState<7 | 30>(7);
  const data = historySeries(history, range);
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold">تطور النشاط 📈</h3>
        <div className="flex gap-1">
          {[7, 30].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r as 7 | 30)}
              className={`rounded-lg px-3 py-1 text-xs font-bold ${
                range === r ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"
              }`}
            >
              {r} يوم
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex h-32 items-end gap-1" dir="ltr">
        {data.map((d) => (
          <div key={d.date} className="flex-1" title={`${d.date}: ${d.count}`}>
            <div
              className="w-full rounded-t bg-primary transition-all"
              style={{ height: `${Math.max(3, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.25 }}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">عدد الأنشطة اليومية خلال آخر {range} يوم</p>
    </div>
  );
}

function PronounceBox({ item }: { item: Item }) {
  const { supported, listening, listen } = useSpeechRecognition();
  const [result, setResult] = useState<{ said: string; score: number } | null>(null);
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-2" dir="ltr">
        <span className="font-display text-xl font-extrabold">{item.es}</span>
        <button
          type="button"
          aria-label={`استمع إلى ${item.es}`}
          onClick={() => speakText(item.es)}
          className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary"
        >
          🔊
        </button>
      </div>
      <div className="mt-1 font-bold">{item.ar}</div>
      {supported ? (
        <button
          type="button"
          onClick={() => listen((said) => setResult({ said, score: scorePronunciation(item.es, said) }))}
          className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          {listening ? "🎙️ أتحدث..." : "🎤 كرر الكلمة"}
        </button>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">متصفحك لا يدعم التعرف على الصوت</p>
      )}
      {result && (
        <div className="mt-3 text-sm">
          <div className="font-bold text-primary">{result.score}%</div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${result.score}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
            سمعت: {result.said}
          </p>
          <p className="mt-1 text-xs font-bold">
            {result.score >= 80 ? "✅ نطق ممتاز!" : result.score >= 50 ? "🙂 قريب، أعد المحاولة" : "❌ حاول مرة أخرى"}
          </p>
        </div>
      )}
    </article>
  );
}

type QuizMode = "mcq" | "reverse" | "listen" | "match";

function VariedQuiz({ all, onAnswer }: { all: Item[]; onAnswer: () => void }) {
  const [mode, setMode] = useState<QuizMode>("mcq");
  const [q, setQ] = useState(() => makeQuiz(all));
  const [answer, setAnswer] = useState<string | null>(null);

  const next = () => {
    setQ(makeQuiz(all));
    setAnswer(null);
  };

  const correct = mode === "reverse" ? q.word.es : q.word.ar;
  const options = mode === "reverse" ? q.optionsEs : q.options;

  const modes: { id: QuizMode; label: string }[] = [
    { id: "mcq", label: "اختيار متعدد" },
    { id: "reverse", label: "عربي ← إسباني" },
    { id: "listen", label: "استماع" },
    { id: "match", label: "توصيل" },
  ];

  if (mode === "match") {
    return (
      <>
        <QuizModes modes={modes} mode={mode} setMode={(m) => { setMode(m); next(); }} />
        <MatchQuiz all={all} onAnswer={onAnswer} />
      </>
    );
  }

  return (
    <>
      <QuizModes modes={modes} mode={mode} setMode={(m) => { setMode(m); next(); }} />
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        {mode === "mcq" && <div>ما معنى الكلمة التالية؟</div>}
        {mode === "reverse" && <div>ما هي الكلمة بالإسبانية؟</div>}
        {mode === "listen" && <div>استمع ثم اختر المعنى الصحيح</div>}
        {mode === "listen" ? (
          <button
            type="button"
            onClick={() => speakText(q.word.es)}
            className="my-4 rounded-xl bg-primary-soft px-6 py-4 text-3xl text-primary"
            aria-label="استمع إلى الكلمة"
          >
            🔊
          </button>
        ) : (
          <div className="my-4 font-display text-3xl font-extrabold" dir={mode === "reverse" ? "rtl" : "ltr"}>
            {mode === "reverse" ? q.word.ar : q.word.es}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                setAnswer(o);
                onAnswer();
                reviewCard(q.word.es, q.word.ar, o === correct);
              }}
              className={`rounded-xl border border-border px-4 py-2 ${
                answer
                  ? o === correct
                    ? "bg-primary text-primary-foreground"
                    : "bg-card opacity-60"
                  : "bg-card hover:bg-primary-soft"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        {answer && <p className="mt-4 font-bold">{answer === correct ? "✅ صحيح!" : `❌ الجواب: ${correct}`}</p>}
        <button
          type="button"
          onClick={next}
          className="mt-5 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
        >
          سؤال جديد 🔄
        </button>
      </div>
    </>
  );
}

function QuizModes({
  modes,
  mode,
  setMode,
}: {
  modes: { id: QuizMode; label: string }[];
  mode: QuizMode;
  setMode: (m: QuizMode) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => setMode(m.id)}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${
            mode === m.id ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function MatchQuiz({ all, onAnswer }: { all: Item[]; onAnswer: () => void }) {
  const [round, setRound] = useState(0);
  const pairs = useMemo(() => pickPairs(all, 5), [all, round]);
  const shuffledAr = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <p className="mb-4 text-center">وصّل الكلمة الإسبانية بمعناها العربي</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          {pairs.map((p) => (
            <button
              key={p.es}
              type="button"
              dir="ltr"
              disabled={done[p.es]}
              onClick={() => setSelected(p.es)}
              className={`rounded-xl border border-border px-3 py-2 font-bold ${
                done[p.es] ? "bg-primary text-primary-foreground" : selected === p.es ? "bg-primary-soft" : "bg-card"
              }`}
            >
              {p.es}
            </button>
          ))}
        </div>
        <div className="grid gap-2">
          {shuffledAr.map((p) => (
            <button
              key={p.ar}
              type="button"
              disabled={done[p.es]}
              onClick={() => {
                if (!selected) return;
                const good = selected === p.es;
                onAnswer();
                const target = pairs.find((x) => x.es === selected);
                if (target) reviewCard(target.es, target.ar, good);
                if (good) setDone((d) => ({ ...d, [p.es]: true }));
                setSelected(null);
              }}
              className={`rounded-xl border border-border px-3 py-2 ${
                done[p.es] ? "bg-primary text-primary-foreground" : "bg-card"
              }`}
            >
              {p.ar}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setDone({});
          setSelected(null);
          setRound((r) => r + 1);
        }}
        className="mt-5 w-full rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
      >
        جولة جديدة 🔄
      </button>
    </div>
  );
}

function ReviewScreen({ onAnswer }: { onAnswer: () => void }) {
  const [tick, setTick] = useState(0);
  const cards = useMemo(() => dueCards(), [tick]);
  const card: SrsCard | undefined = cards[0];
  const [shown, setShown] = useState(false);

  if (!card) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
        <div className="text-5xl">🧠</div>
        <p className="mt-3 font-extrabold">لا توجد كلمات للمراجعة الآن</p>
        <p className="mt-1 text-sm text-muted-foreground">
          أجب في الاختبار لإضافة كلمات إلى نظام المراجعة المتباعدة (SRS).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
      <p className="text-xs text-muted-foreground">متبقٍ اليوم: {cards.length} • المستوى {card.box}/5</p>
      <div className="my-5 font-display text-4xl font-extrabold" dir="ltr">
        {card.es}
      </div>
      <button
        type="button"
        onClick={() => speakText(card.es)}
        className="rounded-full bg-primary-soft px-4 py-2 text-primary"
      >
        🔊 استمع
      </button>
      {shown ? (
        <>
          <div className="mt-4 text-2xl font-extrabold">{card.ar}</div>
          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                reviewCard(card.es, card.ar, false);
                onAnswer();
                setShown(false);
                setTick((t) => t + 1);
              }}
              className="rounded-xl border border-border bg-card px-4 py-2 font-bold"
            >
              ❌ لم أتذكر
            </button>
            <button
              type="button"
              onClick={() => {
                reviewCard(card.es, card.ar, true);
                onAnswer();
                setShown(false);
                setTick((t) => t + 1);
              }}
              className="rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
            >
              ✅ أتذكرها
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setShown(true)}
          className="mt-5 block w-full rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
        >
          أظهر الترجمة
        </button>
      )}
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const [search, setSearch] = useState("");
  const [phraseSearch, setPhraseSearch] = useState("");

  const allItems = useMemo(() => sections.flatMap((s) => s.items), []);
  const progress = useProgress();
  onSpeak = progress.recordListen;

  const navItems = [
    { label: "الرئيسية", icon: "🏠", screen: { kind: "home" } as Screen },
    ...sections.map((s, i) => ({
      label: s.title,
      icon: icons[i] ?? "📘",
      screen: { kind: "lesson", index: i } as Screen,
    })),
    { label: "الأرقام 1–50", icon: "🔢", screen: { kind: "numbers" } as Screen },
    { label: "50 جملة", icon: "💬", screen: { kind: "phrases" } as Screen },
    { label: "دروس مواضيعية", icon: "🧳", screen: { kind: "themes" } as Screen },
    { label: "قواعد سريعة", icon: "📐", screen: { kind: "grammar" } as Screen },
    { label: "قصص قصيرة", icon: "📖", screen: { kind: "stories" } as Screen },
    { label: "النطق", icon: "🎤", screen: { kind: "speak" } as Screen },
    { label: "المراجعة الذكية", icon: "🧠", screen: { kind: "review" } as Screen },
    { label: "اختبار", icon: "📝", screen: { kind: "quiz" } as Screen },
    { label: "الأوسمة", icon: "🏅", screen: { kind: "badges" } as Screen },
    { label: "تقدمي", icon: "📊", screen: { kind: "progress" } as Screen },
  ];

  const isActive = (s: Screen) =>
    s.kind === screen.kind && (s.kind !== "lesson" || (screen.kind === "lesson" && s.index === screen.index));

  useEffect(() => {
    if (progress.darkMode) document.documentElement.classList.add("dark");
  }, [progress.darkMode]);

  // Real push notifications (FCM): work even when the site is closed, with 2s vibration.
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  const askReminder = async () => {
    const { enablePush } = await import("@/lib/push");
    const result = await enablePush();
    if (result.status === "registered") {
      setPushMsg("✅ تم تفعيل الإشعارات! سأذكرك كل يوم في نفس وقت دراستك، حتى لو كان الموقع مغلقاً 📳");
    } else if (result.status === "open-in-new-tab") {
      setPushMsg("⚠️ افتح الموقع في تبويب مستقل (أو التطبيق المنشور) ثم اضغط الزر مجدداً");
    } else if (result.status === "denied") {
      setPushMsg("⚠️ الإشعارات مرفوضة — فعّلها من إعدادات المتصفح لهذا الموقع");
    } else if (result.status === "not-configured") {
      setPushMsg("⚠️ خدمة الإشعارات غير مهيأة بعد");
    } else {
      setPushMsg("⚠️ متصفحك لا يدعم الإشعارات");
    }
  };

  const go = (s: Screen) => {
    setScreen(s);
    setSearch("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background font-sans text-foreground">
      <aside className="fixed inset-y-0 right-0 z-20 w-[86px] overflow-y-auto border-l border-border bg-sidebar p-3 shadow-card md:w-[275px] md:p-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <img
            src={logoAsset.url}
            alt="شعار Espanol Lingo — علم إسبانيا"
            width={512}
            height={512}
            className="h-12 w-12 shrink-0"
          />
          <div className="hidden md:block">
            <h1 className="font-display text-xl font-extrabold text-primary" dir="ltr">
              Espanol Lingo
            </h1>
            <small className="text-[10px] text-muted-foreground">Aprende Español Fácilmente</small>
          </div>
        </div>
        <nav className="pt-3">
          {navItems.map((n) => (
            <button
              key={n.label}
              type="button"
              onClick={() => go(n.screen)}
              className={`my-0.5 flex w-full items-center justify-center gap-2 rounded-xl p-3 text-right text-sm transition-colors md:justify-start ${
                isActive(n.screen)
                  ? "bg-primary-soft font-extrabold text-primary"
                  : "hover:bg-primary-soft hover:text-primary"
              }`}
            >
              <span>{n.icon}</span>
              <span className="hidden md:inline">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-3 grid gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setDarkMode(!progress.darkMode)}
            className="flex w-full items-center justify-center gap-2 rounded-xl p-3 text-sm hover:bg-primary-soft hover:text-primary md:justify-start"
          >
            <span>{progress.darkMode ? "☀️" : "🌙"}</span>
            <span className="hidden md:inline">{progress.darkMode ? "الوضع الفاتح" : "الوضع الليلي"}</span>
          </button>
          <button
            type="button"
            onClick={askReminder}
            className="flex w-full items-center justify-center gap-2 rounded-xl p-3 text-sm hover:bg-primary-soft hover:text-primary md:justify-start"
          >
            <span>🔔</span>
            <span className="hidden md:inline">تذكير يومي</span>
          </button>
          {pushMsg && (
            <p className="hidden rounded-xl bg-card p-3 text-xs text-muted-foreground md:block">
              {pushMsg}
            </p>
          )}
        </div>
      </aside>

      <main className="mr-[86px] md:mr-[275px]">
        {screen.kind === "home" && (
          <>
            <section className="relative overflow-hidden bg-gradient-to-l from-card to-primary-soft px-[6%] py-12">
              <img
                src={heroAsset.url}
                alt="علم إسبانيا يرفرف"
                width={1920}
                height={1080}
                className="pointer-events-none absolute -top-8 left-0 hidden h-[115%] w-[46%] object-cover object-left opacity-95 [mask-image:linear-gradient(to_right,transparent,black_38%)] lg:block"
              />
              <div className="relative text-right">
                <h2 className="font-display text-4xl font-extrabold" dir="ltr">
                  ¡Hola! 👋
                </h2>
                <h2 className="font-display text-4xl font-extrabold" dir="ltr">
                  Bienvenido a <span className="text-primary">Espanol Lingo</span>
                </h2>
                <p className="mt-2 text-muted-foreground">تعلم الإسبانية بطريقة سهلة، عملية وعصرية.</p>
                <p className="text-muted-foreground">🇪🇸 Español Latino • 🇸🇦 ترجمة عربية • 🔊 نطق صوتي</p>
                <div className="mt-6 ml-auto grid max-w-[820px] grid-cols-2 gap-3">
                  {[
                    ["210", "كلمة عملية"],
                    ["50", "جملة مهمة"],
                  ].map(([n, l]) => (
                    <div key={l} className="rounded-2xl border border-border bg-card/90 p-4 backdrop-blur">
                      <b className="font-display text-2xl text-primary">{n}</b>
                      <small className="block text-muted-foreground">{l}</small>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="px-[5%] py-6">
              <SectionTitle title="Aprende por Categorías" sub="تعلم حسب المواقف اليومية" />
              <div className="flex flex-wrap justify-center gap-4">
                {sections.map((s, i) => (
                  <div
                    key={s.title}
                    className="flex w-full flex-col rounded-2xl border border-border bg-card p-5 shadow-card sm:w-[calc(50%-0.5rem)] xl:w-[calc(25%-0.75rem)]"
                  >
                    <div className="text-3xl">{icons[i]}</div>
                    <h4 className="mt-2 font-extrabold">{s.title}</h4>
                    <p className="mb-3 flex-1 text-xs text-muted-foreground">
                      30 كلمة مختلفة مع ترجمة عربية ونطق وصوت.
                    </p>
                    <button
                      type="button"
                      onClick={() => go({ kind: "lesson", index: i })}
                      className="self-start rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      ابدأ ←
                    </button>
                  </div>
                ))}
              </div>

              <SectionTitle title="📊 تقدمي" sub="تقدم حقيقي يُحسب من نشاطك اليومي" />
              <ProgressPanel progress={progress} />
              <div className="mt-4">
                <ActivityChart history={progress.history} />
              </div>
            </section>
          </>
        )}

        {screen.kind === "lesson" && (
          <section className="px-[5%] py-6">
            <SectionTitle
              title={sections[screen.index]?.title ?? ""}
              sub="30 كلمة مختلفة • ترجمة عربية • نطق • صوت"
            />
            <div className="mb-4 flex gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالإسبانية أو العربية..."
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => speakText("Hola, bienvenido a Espanol Lingo")}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm"
              >
                🔊 جرب الصوت
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {(sections[screen.index]?.items ?? [])
                .filter((x) => `${x.es}${x.ar}${x.pr ?? ""}`.toLowerCase().includes(search.toLowerCase()))
                .map((x) => (
                  <WordCard key={x.es} item={x} />
                ))}
            </div>
          </section>
        )}

        {screen.kind === "phrases" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="💬 50 جملة مهمة" sub="للتعارف، الفهم، المطعم، التسوق والسفر" />
            <input
              value={phraseSearch}
              onChange={(e) => setPhraseSearch(e.target.value)}
              placeholder="ابحث في الجمل..."
              className="mb-4 w-full rounded-xl border border-border bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {phrases
                .filter((x) => `${x.es}${x.ar}`.toLowerCase().includes(phraseSearch.toLowerCase()))
                .map((x) => (
                  <WordCard key={x.es} item={x} />
                ))}
            </div>
          </section>
        )}

        {screen.kind === "numbers" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="🔢 Números 1–50" sub="الأرقام بالإسبانية + العربية + الصوت" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {numbers.map((x, i) => (
                <WordCard key={x.es} item={x} num={i + 1} />
              ))}
            </div>
          </section>
        )}

        {screen.kind === "quiz" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="📝 اختبارات متنوعة" sub="اختيار متعدد • عربي ← إسباني • استماع • توصيل" />
            <VariedQuiz all={allItems} onAnswer={progress.recordQuiz} />
          </section>
        )}

        {screen.kind === "progress" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="🌟 اليومية" sub="كلمة، جملة ورقم يوميين" />
            <DailyCards />
          </section>
        )}

        {screen.kind === "themes" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="🧳 دروس مواضيعية" sub="السفر • المطعم • الفندق • العمل • العائلة" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {themes.map((t) => (
                <div key={t.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="text-3xl">{t.icon}</div>
                  <h4 className="mt-2 font-extrabold">
                    {t.title} <span className="text-muted-foreground">• {t.es}</span>
                  </h4>
                  <p className="mb-3 flex-1 text-xs text-muted-foreground">
                    {t.items.length} كلمة وجملة • المستوى {t.level}
                  </p>
                  <button
                    type="button"
                    onClick={() => go({ kind: "theme", id: t.id })}
                    className="self-start rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                  >
                    ابدأ ←
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {screen.kind === "theme" && (
          <section className="px-[5%] py-6">
            <SectionTitle
              title={`${themes.find((t) => t.id === screen.id)?.icon ?? ""} ${themes.find((t) => t.id === screen.id)?.title ?? ""}`}
              sub="español latino • ترجمة عربية • نطق • صوت"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {(themes.find((t) => t.id === screen.id)?.items ?? []).map((x) => (
                <WordCard key={x.es} item={x} />
              ))}
            </div>
          </section>
        )}

        {screen.kind === "grammar" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="📐 قواعد سريعة" sub="أهم الأفعال: ser / estar / tener / ir / hacer / querer" />
            <div className="grid gap-4 lg:grid-cols-2">
              {verbs.map((v) => (
                <div key={v.es} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-2xl font-extrabold text-primary" dir="ltr">
                      {v.es}
                    </h4>
                    <span className="font-bold">{v.ar}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{v.note}</p>
                  <div className="mt-3 grid gap-1">
                    {v.forms.map((f) => (
                      <div key={f.p} className="flex items-center justify-between rounded-xl bg-primary-soft px-3 py-2 text-sm">
                        <span dir="ltr" className="font-bold">
                          {f.p} — {f.es}
                        </span>
                        <span className="flex items-center gap-2">
                          {f.ar}
                          <button
                            type="button"
                            aria-label={`استمع إلى ${f.es}`}
                            onClick={() => speakText(`${f.p} ${f.es}`)}
                            className="text-primary"
                          >
                            🔊
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {screen.kind === "stories" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="📖 قصص قصيرة" sub="قصص بالإسبانية اللاتينية مع ترجمة عربية وصوت" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stories.map((st) => (
                <div key={st.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h4 className="font-display text-xl font-extrabold" dir="ltr">
                    {st.title}
                  </h4>
                  <p className="mb-3 flex-1 text-sm">
                    {st.ar} • المستوى {st.level}
                  </p>
                  <button
                    type="button"
                    onClick={() => go({ kind: "story", id: st.id })}
                    className="self-start rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                  >
                    اقرأ ←
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {screen.kind === "story" && (
          <section className="px-[5%] py-6">
            <SectionTitle
              title={stories.find((x) => x.id === screen.id)?.title ?? ""}
              sub={stories.find((x) => x.id === screen.id)?.ar ?? ""}
            />
            <button
              type="button"
              onClick={() => speakText((stories.find((x) => x.id === screen.id)?.lines ?? []).map((l) => l.es).join(" "))}
              className="mb-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              🔊 استمع للقصة كاملة
            </button>
            <div className="grid gap-3">
              {(stories.find((x) => x.id === screen.id)?.lines ?? []).map((l) => (
                <div key={l.es} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between gap-2" dir="ltr">
                    <span className="font-display text-lg font-bold">{l.es}</span>
                    <button
                      type="button"
                      aria-label={`استمع إلى ${l.es}`}
                      onClick={() => speakText(l.es)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"
                    >
                      🔊
                    </button>
                  </div>
                  <div className="mt-1">{l.ar}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {screen.kind === "speak" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="🎤 تدريب النطق" sub="كرر الكلمة والموقع يقيّم نطقك" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {allItems.slice(0, 24).map((x) => (
                <PronounceBox key={x.es} item={x} />
              ))}
            </div>
          </section>
        )}

        {screen.kind === "review" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="🧠 المراجعة المتباعدة" sub="راجع الكلمات في الوقت المناسب حتى لا تنساها" />
            <ReviewScreen onAnswer={progress.recordQuiz} />
          </section>
        )}

        {screen.kind === "badges" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="🏅 المستوى والأوسمة" sub="تقدم، نقاط ومكافآت" />
            <div className="mb-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <LevelBadge level={progress.level} />
                <span className="font-display text-2xl font-extrabold text-primary">{progress.xp} XP</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <span
                    key={l.id}
                    className={`rounded-xl px-3 py-2 text-xs font-bold ${
                      progress.xp >= l.min ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {l.label} • {l.min} XP
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {progress.badges.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-2xl border border-border bg-card p-5 text-center shadow-card ${
                    b.earned ? "" : "opacity-40 grayscale"
                  }`}
                >
                  <div className="text-4xl">{b.icon}</div>
                  <div className="mt-2 font-extrabold">{b.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{b.earned ? "تم الحصول عليه ✅" : "مقفل 🔒"}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <ActivityChart history={progress.history} />
            </div>
          </section>
        )}

        <footer className="mt-6 flex flex-wrap justify-between gap-2 bg-primary px-[5%] py-4 text-xs text-primary-foreground">
          <span>“Un idioma diferente es una visión diferente de la vida.”</span>
          <span>Espanol Lingo • Aprende cada día ❤️ 🇪🇸</span>
        </footer>
      </main>
    </div>
  );
}

function makeQuiz(all: Item[]) {
  const word = all[Math.floor(Math.random() * all.length)]!;
  const options = [word.ar];
  const optionsEs = [word.es];
  while (options.length < 4) {
    const z = all[Math.floor(Math.random() * all.length)]!;
    if (!options.includes(z.ar)) options.push(z.ar);
    if (!optionsEs.includes(z.es)) optionsEs.push(z.es);
  }
  while (optionsEs.length < 4) {
    const z = all[Math.floor(Math.random() * all.length)]!.es;
    if (!optionsEs.includes(z)) optionsEs.push(z);
  }
  options.sort(() => Math.random() - 0.5);
  optionsEs.sort(() => Math.random() - 0.5);
  return { word, options, optionsEs };
}

function pickPairs(all: Item[], n: number) {
  const out: Item[] = [];
  while (out.length < n) {
    const w = all[Math.floor(Math.random() * all.length)]!;
    if (!out.some((x) => x.es === w.es)) out.push(w);
  }
  return out;
}
