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
  useStreakFreeze,
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
        <h3 className="text-xl font-extrabold">أيام الدراسة 📅</h3>
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
      </div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const [search, setSearch] = useState("");
  const [phraseSearch, setPhraseSearch] = useState("");

  const allItems = useMemo(() => sections.flatMap((s) => s.items), []);
  const [quiz, setQuiz] = useState(() => makeQuiz(allItems));
  const [answer, setAnswer] = useState<string | null>(null);
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
                <div className="mt-6 ml-auto grid max-w-[820px] grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    ["210", "كلمة عملية"],
                    ["50", "جملة مهمة"],
                    ["50", "رقم من 1 إلى 50"],
                    ["7", "أقسام"],
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
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {sections.map((s, i) => (
                  <div
                    key={s.title}
                    className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card"
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
            <SectionTitle title="📝 اختبار سريع" sub="اختبر فهمك" />
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
              <div>ما معنى الكلمة التالية؟</div>
              <div className="my-4 font-display text-3xl font-extrabold" dir="ltr">
                {quiz.word.es}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {quiz.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => {
                      setAnswer(o);
                      progress.recordQuiz();
                    }}
                    className="rounded-xl border border-border bg-card px-4 py-2 hover:bg-primary-soft"
                  >
                    {o}
                  </button>
                ))}
              </div>
              {answer && (
                <p className="mt-4 font-bold">{answer === quiz.word.ar ? "✅ صحيح!" : "❌ حاول مرة أخرى"}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  setQuiz(makeQuiz(allItems));
                  setAnswer(null);
                }}
                className="mt-5 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
              >
                سؤال جديد 🔄
              </button>
            </div>
          </section>
        )}

        {screen.kind === "progress" && (
          <section className="px-[5%] py-6">
            <SectionTitle title="🌟 اليومية" sub="كلمة، جملة ورقم يوميين" />
            <DailyCards />
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
  while (options.length < 4) {
    const z = all[Math.floor(Math.random() * all.length)]!.ar;
    if (!options.includes(z)) options.push(z);
  }
  options.sort(() => Math.random() - 0.5);
  return { word, options };
}
