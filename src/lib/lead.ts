import { z } from "zod";

export const WA_NUMBER = "573503818555";

export const CUSTOM_QUOTE = "Quisiera recibir una cotización personalizada";

// Rangos de inversión mensual según los días a la semana (valores exactos definidos por Petropolis Club).
export const INVESTMENT_OPTIONS: Record<number, string[]> = {
  1: ["Entre $358.800 - $462.000", "Entre $462.000 - $564.000", "$564.000 o Más"],
  2: ["Entre $534.000 - $687.600", "Entre $687.600 - $840.000", "$840.000 o más"],
  3: ["Entre $696.000 - $898.800", "Entre $898.000 - $1.098.000", "$1.098.000 o Más"],
  4: [CUSTOM_QUOTE],
  5: ["Menos de $890.400 COP", "Entre $890.400 y $1.499.999 COP", "$1.500.000 COP o más"],
};

const ALL_RANGES = Object.values(INVESTMENT_OPTIONS).flat();

export function investmentOptionsFor(days: number): string[] {
  return INVESTMENT_OPTIONS[days] ?? [];
}

// Todas las opciones válidas llevan a la pantalla de WhatsApp.
export function goesToWhatsApp(days: number, range: string): boolean {
  return investmentOptionsFor(days).includes(range);
}

export const leadInputSchema = z
  .object({
    petName: z.string().trim().min(1, "Pon el nombre de tu peludito").max(40),
    daysPerWeek: z.number().int().min(1, "Mínimo 1 día").max(5, "Máximo 5 días"),
    investmentRange: z
      .string()
      .trim()
      .min(1, "Selecciona un rango de inversión")
      .max(80)
      .refine((r) => ALL_RANGES.includes(r), "Rango de inversión no válido"),
  })
  .superRefine((data, ctx) => {
    if (!investmentOptionsFor(data.daysPerWeek).includes(data.investmentRange)) {
      ctx.addIssue({ code: "custom", path: ["investmentRange"], message: "El rango no corresponde a los días elegidos" });
    }
  });

export type LeadInput = z.infer<typeof leadInputSchema>;

export function whatsappUrl(lead: LeadInput): string {
  const base = `¡Hola, PETropolis Club! Quiero conocer más sobre los planes de guardería para mi peludito ${lead.petName}. Me gustaría que asistiera ${lead.daysPerWeek} ${lead.daysPerWeek === 1 ? "día" : "días"} por semana`;
  const msg =
    lead.investmentRange === CUSTOM_QUOTE
      ? `${base} y quisiera recibir una cotización personalizada.`
      : `${base} y tengo contemplada una inversión mensual de ${lead.investmentRange}. Quisiera recibir más información.`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}
