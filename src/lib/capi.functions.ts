import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const META_PIXEL_ID = "1480488820643263";

const input = z.object({
  eventId: z.string().min(8).max(80),
  eventSourceUrl: z.string().url().max(500),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(300).optional(),
});

// Envía el evento Lead a Meta Conversions API (servidor). Sin datos personales.
export const sendCapiLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const token = process.env["META_ACCESS_TOKEN"];
    if (!token) {
      console.error("META_ACCESS_TOKEN no configurado");
      return { ok: false as const };
    }
    const req = getRequest();
    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      undefined;
    const ua = req.headers.get("user-agent") ?? undefined;
    const body = {
      data: [
        {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          event_id: data.eventId,
          action_source: "website",
          event_source_url: data.eventSourceUrl,
          user_data: { client_ip_address: ip, client_user_agent: ua, fbp: data.fbp, fbc: data.fbc },
        },
      ],
    };
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      );
      const json = (await res.json()) as { events_received?: number; error?: { message?: string } };
      if (!res.ok) {
        console.error("Meta CAPI error", res.status, json.error?.message);
        return { ok: false as const };
      }
      return { ok: true as const, received: json.events_received ?? 0 };
    } catch (e) {
      console.error("Meta CAPI fallo de red", e);
      return { ok: false as const };
    }
  });
