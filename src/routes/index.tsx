import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/petropolis_logo.webp.asset.json";
import { saveLead } from "@/lib/leads.functions";
import { initMetaPixel, trackPixel } from "@/lib/meta-pixel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Petropolis Club | Planes de recreación para tu perrito" },
      { name: "description", content: "Planes de recreación, colegio y hospedaje para tu perrito desde $358.000 al mes. Verifica cobertura de ruta." },
      { property: "og:title", content: "Petropolis Club | Planes para tu perrito" },
      { property: "og:description", content: "Planes desde $358.000/mes. Pregunta por cobertura de ruta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const WA_NUMBER = "573503818555";
type Step = 1 | 2 | 3 | 4;

const CTA_BAR =
  "sticky bottom-0 z-20 pt-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pt-8 sm:pb-0";

// Rangos de inversión mensual según días por semana (valores confirmados por Petropolis Club).
const INVESTMENT_OPTIONS: Record<number, string[]> = {
  1: ["Menos de $358.800 COP", "Entre $358.800 y $599.999 COP", "$600.000 COP o más"],
  2: ["Menos de $534.000 COP", "Entre $534.000 y $893.999 COP", "$894.000 COP o más"],
  3: ["Menos de $696.000 COP", "Entre $696.000 y $1.193.999 COP", "$1.194.000 COP o más"],
  4: ["Quisiera recibir una cotización personalizada"],
  5: ["Menos de $890.400 COP", "Entre $890.400 y $1.499.999 COP", "$1.500.000 COP o más"],
};

function Index() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [days, setDays] = useState(3);
  const [investment, setInvestment] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initMetaPixel();
    trackPixel("PageView");
    trackPixel("ViewContent");
  }, []);

  const options = INVESTMENT_OPTIONS[days] ?? INVESTMENT_OPTIONS[3]!;

  const changeDays = (d: number) => {
    setDays(d);
    setInvestment(null); // limpiar respuesta anterior para evitar inconsistencias
  };

  const chooseInvestment = async (index: number) => {
    if (saving) return;
    setInvestment(index);
    const range = options[index] ?? "";
    const toWhatsApp = days === 4 || index > 0;
    setSaving(true);
    try {
      await saveLead({
        data: {
          petName: name,
          daysPerWeek: days,
          investmentRange: range,
          status: toWhatsApp ? "sent_to_whatsapp" : "pending_contact",
        },
      });
    } catch {
      // No bloquear al usuario si el registro falla; el lead sigue su ruta.
    }
    setSaving(false);

    trackPixel("Lead", { days_per_week: days });

    if (toWhatsApp) {
      trackPixel("Contact");
      const msg = `¡Hola, PETropolis Club! Quiero conocer más sobre los planes de guardería para mi peludito ${name.trim()}. Me gustaría que asistiera ${days} ${days === 1 ? "día" : "días"} por semana y tengo contemplada una inversión mensual de ${range}. Quisiera recibir más información.`;
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      setStep(4);
    }
  };

  const reset = () => {
    setStep(1);
    setName("");
    setDays(3);
    setInvestment(null);
  };

  return (
    <main className="relative min-h-dvh overflow-clip bg-background">
      {/* decor */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-44 w-44 rounded-full bg-secondary/70 sm:-right-24 sm:-top-28 sm:h-64 sm:w-64" />
      <svg className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-[18rem] text-primary sm:-bottom-10 sm:-left-10 sm:h-64 sm:w-[28rem]" viewBox="0 0 400 200" aria-hidden>
        <path d="M0 40 C 120 0, 180 120, 400 200 L 0 200 Z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-2 pt-4 sm:px-6 sm:pt-6">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src={logo.url} alt="Petropolis Club" width={72} height={72} className="h-11 w-11 shrink-0 floaty sm:h-16 sm:w-16" fetchPriority="high" />
            <span className="truncate text-sm font-black text-ink sm:text-base">Petropolis Club</span>
          </div>
          <div className="shrink-0 rounded-2xl bg-paper px-3 py-1.5 text-right sm:px-4 sm:py-2">
            <p className="text-[11px] font-bold text-muted-foreground line-through decoration-primary decoration-2 sm:text-sm">Antes $449.000</p>
            <p className="text-base font-black leading-none text-primary sm:text-2xl">$358.000<span className="text-[11px] font-bold text-ink sm:text-sm"> / mes</span></p>
          </div>
        </header>

        <div className="mt-4 flex gap-2 sm:mt-6" aria-label="Progreso">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: step >= i ? "100%" : "0%" }} />
            </div>
          ))}
        </div>

        <div key={step} className="rise mt-5 flex flex-1 flex-col sm:mt-8">
          {step === 1 && (
            <Question
              title="¿Cuál es el nombre de tu peludito?"
              emoji="🐶"
              cta={<Nav onNext={() => setStep(2)} disabled={!name.trim()} />}
            >
              <input autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
                placeholder="Ej: Max" className="w-full rounded-2xl border-2 border-input bg-card px-4 py-3 text-lg font-semibold outline-none transition focus:border-primary sm:px-5 sm:py-4 sm:text-xl" />
            </Question>
          )}

          {step === 2 && (
            <Question
              title={`¿Cuántos días a la semana estás interesado en dejarnos a ${name.trim() || "tu peludito"}?`}
              emoji="📅"
              cta={<Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />}
            >
              <div className="rounded-3xl bg-card p-4 shadow-sm sm:p-6">
                <p className="text-center text-5xl font-black text-primary sm:text-6xl">{days}<span className="ml-2 text-lg text-ink sm:text-xl">{days === 1 ? "día" : "días"}</span></p>
                <input type="range" min={1} max={5} step={1} value={days} onChange={(e) => changeDays(Number(e.target.value))} className="range-brand mt-4 w-full sm:mt-6" aria-label="Días a la semana" />
                <div className="mt-2 flex justify-between text-sm font-bold text-muted-foreground">
                  {[1, 2, 3, 4, 5].map((d) => <span key={d}>{d}</span>)}
                </div>
              </div>
            </Question>
          )}

          {step === 3 && (
            <Question
              title="¿Qué inversión mensual te gustaría destinar para que tu peludito disfrute de todo lo que PETropolis Club tiene para él?"
              emoji="💛"
              subtitle="Selecciona el rango de inversión que mejor se ajuste a la frecuencia con la que te gustaría que tu peludito asistiera a PETropolis Club."
              cta={
                <div className={CTA_BAR}>
                  <button onClick={() => setStep(2)} className="w-full text-sm font-semibold text-muted-foreground">← Atrás</button>
                </div>
              }
            >
              <div className="flex flex-col gap-3" role="radiogroup" aria-label="Rango de inversión mensual">
                {options.map((opt, i) => (
                  <button
                    key={opt}
                    role="radio"
                    aria-checked={investment === i}
                    disabled={saving}
                    onClick={() => chooseInvestment(i)}
                    className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left text-base font-bold transition-all active:scale-[0.98] disabled:opacity-50 sm:px-5 sm:py-4 sm:text-lg ${
                      investment === i
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-card text-ink hover:border-primary"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Question>
          )}

          {step === 4 && (
            <Question
              title="¡Gracias por tu interés en PETropolis Club!"
              emoji="🐾"
              subtitle="Hemos recibido tus respuestas. Nuestro equipo se pondrá en contacto contigo para brindarte más información y orientarte sobre las opciones disponibles para tu peludito."
              cta={
                <div className={CTA_BAR}>
                  <button onClick={reset}
                    className="w-full rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 sm:px-8 sm:py-5 sm:text-lg">
                    Finalizar
                  </button>
                </div>
              }
            >
              <div className="rounded-3xl bg-card p-4 shadow-sm sm:p-6">
                <p className="text-sm font-semibold text-muted-foreground sm:text-base">
                  Resumen: <span className="text-ink">{name.trim()}</span> · {days} {days === 1 ? "día" : "días"} por semana · {investment !== null ? options[investment] : ""}
                </p>
              </div>
            </Question>
          )}
        </div>
      </div>
    </main>
  );
}

function Question({ title, emoji, subtitle, children, cta }: { title: string; emoji: string; subtitle?: string; children: React.ReactNode; cta?: React.ReactNode }) {
  return (
    <section className="flex flex-1 flex-col">
      <div className="my-auto">
        <span className="text-4xl sm:text-5xl">{emoji}</span>
        <h2 className="mt-3 text-[1.7rem] font-black leading-tight text-ink sm:mt-4 sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
        <div className="mt-5 sm:mt-8">{children}</div>
        {cta}
      </div>
    </section>
  );
}

function Nav({ onBack, onNext, disabled }: { onBack?: () => void; onNext: () => void; disabled?: boolean }) {
  return (
    <div className={CTA_BAR + " flex flex-row items-center justify-between gap-4"}>
      {onBack && (
        <button onClick={onBack} className="shrink-0 text-sm font-semibold text-muted-foreground">← Atrás</button>
      )}
      <button onClick={onNext} disabled={disabled} className={`shrink-0 rounded-full bg-primary px-6 py-3.5 font-bold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40 sm:px-8 sm:py-4 ${onBack ? "" : "w-full"}`}>
        Continuar →
      </button>
    </div>
  );
}
