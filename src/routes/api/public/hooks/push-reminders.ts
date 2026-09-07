import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

// Called every minute by the database scheduler. Sends a push reminder to each
// device whose stored study time (UTC) matches the current minute, unless that
// device already studied today.
export const Route = createFileRoute("/api/public/hooks/push-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Verify the scheduler: the secret lives in the DB (server-only table)
        // so the pg_cron job can read it without exposing it anywhere.
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.replace(/^Bearer\s+/i, "");
        const { data: cfg } = await supabaseAdmin
          .from("app_config")
          .select("value")
          .eq("key", "cron_secret")
          .maybeSingle();
        if (!cfg?.value || !token || token !== cfg.value) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const lovableKey = process.env["LOVABLE_API_KEY"];
        const connectionKey = process.env["FIREBASE_MESSAGING_API_KEY"];
        if (!lovableKey || !connectionKey) {
          return new Response(JSON.stringify({ error: "Push not configured" }), { status: 500 });
        }

        const now = new Date();
        const hhmm = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
        const todayUtc = now.toISOString().slice(0, 10);

        const { data: subs, error } = await supabaseAdmin
          .from("push_subscriptions")
          .select("device_id, token, last_study_date")
          .eq("study_utc_time", hhmm)
          .not("token", "is", null);

        if (error) {
          console.error("push-reminders query failed:", error.message);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        let sent = 0;
        const stale: string[] = [];
        for (const sub of subs ?? []) {
          if (sub.last_study_date && sub.last_study_date >= todayUtc) continue; // already studied
          const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": connectionKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: {
                token: sub.token,
                notification: {
                  title: "Espanol Lingo 🇪🇸",
                  body: "حان وقت درسك اليومي! ¡Vamos a estudiar! 🔥",
                },
                data: { path: "/" },
                webpush: {
                  notification: {
                    icon: "/favicon.png",
                    vibrate: [2000], // vibration de 2 secondes
                    requireInteraction: false,
                  },
                },
              },
            }),
          });
          if (res.ok) {
            sent += 1;
          } else {
            const body = await res.text();
            console.error(`FCM send failed [${res.status}]: ${body}`);
            if (res.status === 404 || res.status === 400) stale.push(sub.device_id);
          }
        }

        if (stale.length) {
          await supabaseAdmin.from("push_subscriptions").delete().in("device_id", stale);
        }

        return new Response(JSON.stringify({ ok: true, matched: subs?.length ?? 0, sent }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
