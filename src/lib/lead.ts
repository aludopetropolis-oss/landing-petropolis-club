import { z } from "zod";

export const WA_NUMBER = "573503818555";

export const leadInputSchema = z.object({
  petName: z.string().trim().min(1, "Pon el nombre de tu peludito").max(40),
  daysPerWeek: z.number().int().min(1, "Mínimo 1 día").max(5, "Máximo 5 días"),
  address: z.string().trim().min(5, "Escribe la dirección completa").max(150),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export function whatsappUrl(lead: LeadInput): string {
  const msg = `¡Hola Petropolis Club! 🐾 Quiero información de sus planes.\n\n• Nombre de mi peludito: ${lead.petName}\n• Días a la semana: ${lead.daysPerWeek}\n• Dirección: ${lead.address}\n\n¿Tienen cobertura de ruta en mi zona?`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}
