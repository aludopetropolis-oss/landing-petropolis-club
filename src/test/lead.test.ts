import { describe, expect, it } from "vitest";

import { CUSTOM_QUOTE, goesToWhatsApp, investmentOptionsFor, leadInputSchema, whatsappUrl } from "@/lib/lead";

describe("Rangos de inversión según los días a la semana", () => {
  it("1 día: menos de $358.800, entre $358.800 y $599.999, $600.000 o más", () => {
    expect(investmentOptionsFor(1)).toEqual([
      "Menos de $358.800 COP",
      "Entre $358.800 y $599.999 COP",
      "$600.000 COP o más",
    ]);
  });

  it("2 días: menos de $534.000, entre $534.000 y $893.999, $894.000 o más", () => {
    expect(investmentOptionsFor(2)).toEqual([
      "Menos de $534.000 COP",
      "Entre $534.000 y $893.999 COP",
      "$894.000 COP o más",
    ]);
  });

  it("3 días: menos de $696.000, entre $696.000 y $1.193.999, $1.194.000 o más", () => {
    expect(investmentOptionsFor(3)).toEqual([
      "Menos de $696.000 COP",
      "Entre $696.000 y $1.193.999 COP",
      "$1.194.000 COP o más",
    ]);
  });

  it("4 días: solo cotización personalizada, sin precios", () => {
    expect(investmentOptionsFor(4)).toEqual([CUSTOM_QUOTE]);
  });

  it("5 días: menos de $890.400, entre $890.400 y $1.499.999, $1.500.000 o más", () => {
    expect(investmentOptionsFor(5)).toEqual([
      "Menos de $890.400 COP",
      "Entre $890.400 y $1.499.999 COP",
      "$1.500.000 COP o más",
    ]);
  });
});

describe("Rutas del formulario", () => {
  it("la primera opción de 1, 2, 3 y 5 días también va a WhatsApp", () => {
    expect(goesToWhatsApp(1, "Menos de $358.800 COP")).toBe(true);
    expect(goesToWhatsApp(2, "Menos de $534.000 COP")).toBe(true);
    expect(goesToWhatsApp(3, "Menos de $696.000 COP")).toBe(true);
    expect(goesToWhatsApp(5, "Menos de $890.400 COP")).toBe(true);
  });

  it("la segunda y tercera opción siempre van a WhatsApp", () => {
    expect(goesToWhatsApp(1, "Entre $358.800 y $599.999 COP")).toBe(true);
    expect(goesToWhatsApp(1, "$600.000 COP o más")).toBe(true);
    expect(goesToWhatsApp(2, "Entre $534.000 y $893.999 COP")).toBe(true);
    expect(goesToWhatsApp(2, "$894.000 COP o más")).toBe(true);
    expect(goesToWhatsApp(3, "Entre $696.000 y $1.193.999 COP")).toBe(true);
    expect(goesToWhatsApp(3, "$1.194.000 COP o más")).toBe(true);
    expect(goesToWhatsApp(5, "Entre $890.400 y $1.499.999 COP")).toBe(true);
    expect(goesToWhatsApp(5, "$1.500.000 COP o más")).toBe(true);
  });

  it("la cotización personalizada de 4 días va a WhatsApp", () => {
    expect(goesToWhatsApp(4, CUSTOM_QUOTE)).toBe(true);
  });
});

describe("Validación de la consulta", () => {
  it("acepta una consulta completa", () => {
    const parsed = leadInputSchema.parse({
      petName: "Max",
      daysPerWeek: 3,
      investmentRange: "Entre $696.000 y $1.193.999 COP",
    });
    expect(parsed.petName).toBe("Max");
  });

  it("rechaza un rango que no corresponde a los días elegidos", () => {
    expect(
      leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 1, investmentRange: "Menos de $696.000 COP" }).success,
    ).toBe(false);
  });

  it("rechaza rangos inventados y nombre vacío", () => {
    expect(
      leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 2, investmentRange: "Menos de $100.000 COP" }).success,
    ).toBe(false);
    expect(
      leadInputSchema.safeParse({ petName: "  ", daysPerWeek: 2, investmentRange: "Menos de $534.000 COP" }).success,
    ).toBe(false);
  });
});

describe("Mensaje de WhatsApp", () => {
  it("incluye nombre, días y rango de inversión con redacción natural", () => {
    const url = whatsappUrl({ petName: "Luna", daysPerWeek: 3, investmentRange: "Entre $696.000 y $1.193.999 COP" });
    const msg = decodeURIComponent(url);

    expect(url.startsWith("https://wa.me/573503818555?text=")).toBe(true);
    expect(msg).toContain("mi peludito Luna");
    expect(msg).toContain("asistiera 3 días por semana");
    expect(msg).toContain("inversión mensual de Entre $696.000 y $1.193.999 COP");
  });

  it("la cotización personalizada de 4 días pide cotización, sin precios", () => {
    const msg = decodeURIComponent(whatsappUrl({ petName: "Max", daysPerWeek: 4, investmentRange: CUSTOM_QUOTE }));

    expect(msg).toContain("asistiera 4 días por semana");
    expect(msg).toContain("cotización personalizada");
    expect(msg).not.toContain("$");
  });

  it("usa 'día' en singular para 1 día", () => {
    const msg = decodeURIComponent(whatsappUrl({ petName: "Max", daysPerWeek: 1, investmentRange: "$600.000 COP o más" }));
    expect(msg).toContain("asistiera 1 día por semana");
  });
});
