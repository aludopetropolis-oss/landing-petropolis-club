import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type LeadInput = {
  petName: string;
  daysPerWeek: number;
  investmentRange: string;
  status: "pending_contact" | "sent_to_whatsapp";
};

export const saveLead = createServerFn({ method: "POST" })
  .inputValidator((input: LeadInput) => input)
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabasePublic = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false },
      // Opaque sb_ keys aren't JWTs; send only apikey, not the default Authorization bearer.
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const petName = data.petName.trim().slice(0, 40);
    const investmentRange = data.investmentRange.trim().slice(0, 120);
    const daysPerWeek = Math.min(5, Math.max(1, Math.round(data.daysPerWeek)));
    if (!petName || !investmentRange) throw new Error("Datos incompletos");

    const { error } = await supabasePublic.from("leads").insert({
      pet_name: petName,
      days_per_week: daysPerWeek,
      investment_range: investmentRange,
      status: data.status === "sent_to_whatsapp" ? "sent_to_whatsapp" : "pending_contact",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
