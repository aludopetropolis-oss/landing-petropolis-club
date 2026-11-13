import { WA_NUMBER } from "./lead";

// ─── Tarifas de hospedaje por noche (COP, clientes nuevos) ─────────────────────
// Edita aquí los precios. El texto de cada opción es lo que ve el cliente.
// `soloMinimo`: el total estimado muestra solo "Desde $..." (sin máximo).
export const BUDGET_OPTIONS = [
  { id: "A", label: "De $78.000 a $102.000", min: 78000, max: 102000, soloMinimo: false },
  { id: "B", label: "De $108.000 a $126.000", min: 108000, max: 126000, soloMinimo: false },
  { id: "C", label: "Desde $144.000", min: 144000, max: 204000, soloMinimo: true },
] as const;

export const CONTENT_NAME = "Hospedaje";
export const CURRENCY = "COP";
// ───────────────────────────────────────────────────────────────────────────────

export type BudgetOption = (typeof BUDGET_OPTIONS)[number];
export type BudgetId = BudgetOption["id"];

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function budgetById(id: string | null | undefined): BudgetOption | undefined {
  return BUDGET_OPTIONS.find((o) => o.id === id);
}

/** Punto medio por noche = (mínimo + máximo) / 2. */
export function midpoint(opt: BudgetOption): number {
  return (opt.min + opt.max) / 2;
}

/** 1234567 → "1.234.567" (puntos de miles, igual en servidor y navegador). */
export function formatCOP(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Fecha local de hoy como "AAAA-MM-DD" (el formato de <input type="date">). */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISO(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function addDays(iso: string, days: number): string {
  const t = parseISO(iso);
  if (t === null) return "";
  return new Date(t + days * 86400000).toISOString().slice(0, 10);
}

/** Noches entre entrada y salida. 0 si las fechas no son válidas. */
export function nightsBetween(entrada: string, salida: string): number {
  const a = parseISO(entrada);
  const b = parseISO(salida);
  if (a === null || b === null) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

/** Entrada desde hoy y salida posterior a la entrada. */
export function datesAreValid(entrada: string, salida: string, today: string): boolean {
  if (!parseISO(entrada) || !parseISO(salida)) return false;
  return entrada >= today && salida > entrada;
}

export function nightsLabel(n: number): string {
  return n === 1 ? "1 noche" : `${n} noches`;
}

/** "AAAA-MM-DD" → "20 de noviembre" (agrega el año si no es el actual). */
export function formatDateEs(iso: string, today: string = todayISO()): string {
  const [y, m, d] = iso.split("-").map(Number);
  const base = `${d} de ${MONTHS[(m ?? 1) - 1]}`;
  return String(y) === today.slice(0, 4) ? base : `${base} de ${y}`;
}

/** Total estimado: "Entre $390.000 y $510.000 aprox." o "Desde $720.000". */
export function estimateText(nights: number, opt: BudgetOption): string {
  if (opt.soloMinimo) return `Desde $${formatCOP(nights * opt.min)}`;
  return `Entre $${formatCOP(nights * opt.min)} y $${formatCOP(nights * opt.max)} aprox.`;
}

export type HospedajeLead = {
  petName: string;
  entrada: string;
  salida: string;
  budgetId: BudgetId;
};

export function whatsappHospedajeUrl(lead: HospedajeLead, today: string = todayISO()): string {
  const opt = budgetById(lead.budgetId)!;
  const n = nightsBetween(lead.entrada, lead.salida);
  const msg =
    `Hola 👋 Quiero reservar hospedaje para ${lead.petName.trim()} ` +
    `del ${formatDateEs(lead.entrada, today)} al ${formatDateEs(lead.salida, today)} (${nightsLabel(n)}). ` +
    `Presupuesto por noche: ${opt.label}. ` +
    `Soy cliente nuevo y tengo el carnet de vacunas para enviarles.`;
  // api.whatsapp.com/send en vez de wa.me: la redirección de wa.me rompe los emojis (👋 → �).
  return `https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}`;
}

/** Parámetros del evento Lead (sin nombre del peludo ni datos personales). */
export function leadEventData(lead: HospedajeLead) {
  const opt = budgetById(lead.budgetId)!;
  const noches = nightsBetween(lead.entrada, lead.salida);
  return {
    content_name: CONTENT_NAME,
    currency: CURRENCY,
    value: noches * midpoint(opt),
    fecha_entrada: lead.entrada,
    noches,
    rango_presupuesto: opt.label,
  };
}
