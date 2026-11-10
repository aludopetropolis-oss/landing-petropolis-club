import { describe, expect, it } from "vitest";

import { leadInputSchema, whatsappUrl } from "@/lib/lead";

describe("Reglas de la consulta de Petropolis Club", () => {
  it("acepta una consulta completa", () => {
    const parsed = leadInputSchema.parse({
      petName: "Max",
      daysPerWeek: 3,
      address: "Calle 123 #45-67, barrio",
    });

    expect(parsed).toEqual({ petName: "Max", daysPerWeek: 3, address: "Calle 123 #45-67, barrio" });
  });

  it("rechaza un nombre vacío", () => {
    expect(
      leadInputSchema.safeParse({ petName: "   ", daysPerWeek: 3, address: "Calle 123 #45-67" }).success,
    ).toBe(false);
  });

  it("rechaza 0 y 6 días y acepta 1 y 5", () => {
    expect(leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 0, address: "Calle 123 #45-67" }).success).toBe(
      false,
    );
    expect(leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 6, address: "Calle 123 #45-67" }).success).toBe(
      false,
    );
    expect(leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 1, address: "Calle 123 #45-67" }).success).toBe(
      true,
    );
    expect(leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 5, address: "Calle 123 #45-67" }).success).toBe(
      true,
    );
  });

  it("rechaza una dirección más corta de 5 caracteres", () => {
    expect(leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 2, address: "abc" }).success).toBe(false);
    expect(leadInputSchema.safeParse({ petName: "Max", daysPerWeek: 2, address: "Calle 5" }).success).toBe(true);
  });

  it("arma el enlace de WhatsApp con el número y las respuestas", () => {
    const url = whatsappUrl({ petName: "Max", daysPerWeek: 4, address: "Calle 123 #45-67" });

    expect(url.startsWith("https://wa.me/573503818555?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Nombre de mi peludito: Max");
    expect(decodeURIComponent(url)).toContain("Días a la semana: 4");
    expect(decodeURIComponent(url)).toContain("Dirección: Calle 123 #45-67");
  });
});
