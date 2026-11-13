import { describe, expect, it } from "vitest";
import {
  BUDGET_OPTIONS,
  budgetById,
  datesAreValid,
  estimateText,
  formatCOP,
  leadEventData,
  midpoint,
  nightsBetween,
  whatsappHospedajeUrl,
} from "@/lib/hospedaje";

const opt = (id: string) => budgetById(id)!;

describe("Opciones de presupuesto", () => {
  it("tres opciones con el texto exacto", () => {
    expect(BUDGET_OPTIONS.map((o) => o.label)).toEqual([
      "De $78.000 a $102.000",
      "De $108.000 a $126.000",
      "Desde $144.000",
    ]);
  });
  it("puntos medios", () => {
    expect(midpoint(opt("A"))).toBe(90000);
    expect(midpoint(opt("B"))).toBe(117000);
    expect(midpoint(opt("C"))).toBe(174000);
  });
});

describe("Fechas y noches", () => {
  const today = "2026-11-13";
  it("cuenta noches", () => {
    expect(nightsBetween("2026-11-20", "2026-11-25")).toBe(5);
    expect(nightsBetween("2026-12-30", "2027-01-02")).toBe(3);
  });
  it("entrada desde hoy y salida posterior", () => {
    expect(datesAreValid("2026-11-13", "2026-11-14", today)).toBe(true);
    expect(datesAreValid("2026-11-12", "2026-11-14", today)).toBe(false);
    expect(datesAreValid("2026-11-20", "2026-11-20", today)).toBe(false);
    expect(datesAreValid("2026-11-20", "2026-11-19", today)).toBe(false);
    expect(datesAreValid("", "", today)).toBe(false);
  });
});

describe("Total estimado con 5 noches", () => {
  it("A", () => expect(estimateText(5, opt("A"))).toBe("Entre $390.000 y $510.000 aprox."));
  it("B", () => expect(estimateText(5, opt("B"))).toBe("Entre $540.000 y $630.000 aprox."));
  it("C", () => expect(estimateText(5, opt("C"))).toBe("Desde $720.000"));
  it("puntos de miles", () => expect(formatCOP(1234567)).toBe("1.234.567"));
});

describe("WhatsApp y evento Lead", () => {
  const lead = {
    petName: " Max ",
    entrada: "2026-11-20",
    salida: "2026-11-25",
    budgetId: "B" as const,
  };
  it("mensaje prellenado", () => {
    const url = new URL(whatsappHospedajeUrl(lead, "2026-11-13"));
    expect(url.origin + url.pathname).toBe("https://api.whatsapp.com/send");
    expect(url.searchParams.get("phone")).toBe("573503818555");
    expect(url.searchParams.get("text")).toBe(
      "Hola 👋 Quiero reservar hospedaje para Max del 20 de noviembre al 25 de noviembre (5 noches). " +
        "Presupuesto por noche: De $108.000 a $126.000. Soy cliente nuevo y tengo el carnet de vacunas para enviarles.",
    );
  });
  it("datos del Lead sin el nombre del peludo", () => {
    const d = leadEventData(lead);
    expect(d).toEqual({
      content_name: "Hospedaje",
      currency: "COP",
      value: 585000,
      fecha_entrada: "2026-11-20",
      noches: 5,
      rango_presupuesto: "De $108.000 a $126.000",
    });
    expect(JSON.stringify(d)).not.toContain("Max");
  });
});
