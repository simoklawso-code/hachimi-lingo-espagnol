import { supabase } from "@/integrations/supabase/client";

const appId = import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID as string | undefined;
const vapidKey = import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY as
  | string
  | undefined;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY as
    | string
    | undefined,
  projectId: import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID as
    | string
    | undefined,
  appId,
  messagingSenderId: appId?.split(":")[1] ?? "",
};

export type PushResult =
  | { status: "registered"; token: string }
  | { status: "not-configured" | "unsupported" | "open-in-new-tab" | "denied" };

const DEVICE_KEY = "espanol-lingo-device-id";
const TOKEN_KEY = "espanol-lingo-push-token";
const PROGRESS_KEY = "espanol-lingo-progress-v1";

function getDeviceId(): string {
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

/** Convert today's local HH:MM to UTC HH:MM */
function localToUtcHHMM(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/** Call from a click handler: browsers ignore permission requests without a user gesture. */
export async function enablePush(): Promise<PushResult> {
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !appId ||
    !vapidKey ||
    !firebaseConfig.messagingSenderId
  ) {
    return { status: "not-configured" };
  }
  const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
  const { initializeApp } = await import("firebase/app");
  if (!("Notification" in window) || !(await isSupported())) {
    return { status: "unsupported" };
  }
  if (window.top !== window.self) {
    return { status: "open-in-new-tab" };
  }

  const permission =
    Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") {
    return { status: "denied" };
  }

  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(firebaseConfig).map(([k, v]) => [k, String(v)])),
  ).toString();
  const serviceWorkerRegistration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${query}`,
  );
  const messaging = getMessaging(initializeApp(firebaseConfig));
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration });
  if (!token) return { status: "denied" };

  window.localStorage.setItem(TOKEN_KEY, token);
  await syncStudyTime();
  return { status: "registered", token };
}

/** Push the current study time + last study date to the server (used by the daily cron). */
export async function syncStudyTime(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return; // push not enabled on this device
  let studyTime: string | null = null;
  let lastStudyDate: string | null = null;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        studyTime?: string | null;
        days?: string[];
      };
      studyTime = parsed.studyTime ?? null;
      lastStudyDate = parsed.days?.length ? parsed.days[parsed.days.length - 1] : null;
    }
  } catch {
    /* ignore */
  }
  try {
    await supabase.from("push_subscriptions").upsert({
      device_id: getDeviceId(),
      token,
      study_utc_time: studyTime ? localToUtcHHMM(studyTime) : null,
      last_study_date: lastStudyDate,
      updated_at: new Date().toISOString(),
    });
  } catch {
    /* offline — retried on next study action */
  }
}
