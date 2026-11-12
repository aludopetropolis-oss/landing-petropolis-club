import { z } from "zod";

export const WA_NUMBER = "573503818555";

export const DAY_OPTIONS = [4, 8, 12, 20] as const;

// Rangos de inversión mensual según los días al mes (valores exactos definidos por Petropolis Club).
export const INVESTMENT_OPTIONS: Record<number, string[]> = {
  4: ["Entre $358.800 - $462.000", "Entre $462.000 - $564.000", "$564.000 o Más"],
  8: ["Entre $534.000 - $687.600", "Entre $687.600 - $840.000", "$840.000 o más"],
  12: ["Entre $696.000 - $898.800", "Entre $898.000 - $1.098.000", "$1.098.000 o Más"],
  20: ["Entre $890.400 - $1.144.800", "Entre $1.144.800 - $1.380.000", "$1.380.000 o Más"],
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
    daysPerWeek: z.number().int().refine((d) => (DAY_OPTIONS as readonly number[]).includes(d), "Días no válidos"),
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
  const msg = `¡Hola, PETropolis Club! Quiero conocer más sobre los planes de guardería para mi peludito ${lead.petName}. Me gustaría que asistiera ${lead.daysPerWeek} días al mes y tengo contemplada una inversión mensual de ${lead.investmentRange}. Quisiera recibir más información.`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}
