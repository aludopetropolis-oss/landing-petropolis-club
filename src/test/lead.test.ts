import { describe, expect, it } from "vitest";
import { DAY_OPTIONS, goesToWhatsApp, investmentOptionsFor, leadInputSchema, whatsappUrl } from "@/lib/lead";

describe("Días al mes", () => {
  it("solo 4, 8, 12 y 20 días", () => {
    expect([...DAY_OPTIONS]).toEqual([4, 8, 12, 20]);
  });
});

describe("Rangos de inversión según los días al mes", () => {
  it("4 días", () => expect(investmentOptionsFor(4)).toEqual(["Entre $358.800 - $462.000", "Entre $462.000 - $564.000", "$564.000 o Más"]));
  it("8 días", () => expect(investmentOptionsFor(8)).toEqual(["Entre $534.000 - $687.600", "Entre $687.600 - $840.000", "$840.000 o más"]));
  it("12 días", () => expect(investmentOptionsFor(12)).toEqual(["Entre $696.000 - $898.800", "Entre $898.000 - $1.098.000", "$1.098.000 o Más"]));
  it("20 días", () => expect(investmentOptionsFor(20)).toEqual(["Menos de $890.400 COP", "Entre $890.400 y $1.499.999 COP", "$1.500.000 COP o más"]));
  it("ya no existen 1, 2, 3 ni 5 días", () => {
    for (const d of [1, 2, 3, 5]) expect(investmentOptionsFor(d)).toEqual([]);
  });
});

describe("Rutas y validación", () => {
  it("todas las opciones van a WhatsApp", () => {
    for (const d of DAY_OPTIONS) for (const r of investmentOptionsFor(d)) expect(goesToWhatsApp(d, r)).toBe(true);
  });
  it("acepta consulta completa", () => {
    expect(leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 12, investmentRange: "$1.098.000 o Más" }).success).toBe(true);
  });
  it("rechaza días fuera de las opciones", () => {
    expect(leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 5, investmentRange: "Menos de $890.400 COP" }).success).toBe(false);
  });
  it("rechaza rango que no corresponde a los días", () => {
    expect(leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 4, investmentRange: "$840.000 o más" }).success).toBe(false);
  });
  it("mensaje de WhatsApp dice días al mes", () => {
    const url = whatsappUrl({ petName: "Luna", daysPerWeek: 8, investmentRange: "$840.000 o más" });
    expect(decodeURIComponent(url)).toContain("8 días al mes");
  });
});
