import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

import { goesToWhatsApp, leadInputSchema, type LeadInput } from "./lead";

export const saveLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadInputSchema.parse(data) as LeadInput)
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"]!;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

    const supabase = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: ((input: RequestInfo | URL, init?: RequestInit) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        }) as typeof fetch,
      },
    });

    const { error } = await supabase.from("leads").insert({
      pet_name: data.petName,
      days_per_week: data.daysPerWeek,
      investment_range: data.investmentRange,
      status: goesToWhatsApp(data.daysPerWeek, data.investmentRange) ? "sent_to_whatsapp" : "pending_contact",
    });

    if (error) {
      console.error("No se pudo guardar la consulta:", error.message);
      return { ok: false as const };
    }

    return { ok: true as const };
  });
