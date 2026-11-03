import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/petropolis_logo.webp.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Petropolis Club | Planes de recreación para tu perrito" },
      { name: "description", content: "Planes de recreación, colegio y hospedaje para tu perrito desde $358.000 al mes. Verifica cobertura de ruta." },
      { property: "og:title", content: "Petropolis Club | Planes para tu perrito" },
      { property: "og:description", content: "Planes desde $358.000/mes. Pregunta por cupos y cobertura de ruta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const WA_NUMBER = "573503818555";
type Step = 0 | 1 | 2 | 3;

const CTA_BAR =
  "sticky bottom-0 z-20 -mx-5 mt-auto flex flex-col gap-2 bg-background/85 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:mx-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-none";

function Index() {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [days, setDays] = useState(3);
  const [address, setAddress] = useState("");

  const sendWa = () => {
    const msg = `¡Hola Petropolis Club! 🐾 Quiero información de sus planes.\n\n• Nombre de mi peludito: ${name.trim()}\n• Días a la semana: ${days}\n• Dirección: ${address.trim()}\n\n¿Tienen cobertura de ruta en mi zona?`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="relative min-h-dvh overflow-clip bg-background">
      {/* decor */}
      <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-secondary" />
      <svg className="pointer-events-none absolute -bottom-14 -left-14 h-40 w-[22rem] text-primary sm:-bottom-10 sm:-left-10 sm:h-64 sm:w-[28rem]" viewBox="0 0 400 200" aria-hidden>
        <path d="M0 40 C 120 0, 180 120, 400 200 L 0 200 Z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-2 pt-4 sm:px-6 sm:pt-6">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src={logo.url} alt="Petropolis Club" width={72} height={72} className="h-11 w-11 shrink-0 floaty sm:h-16 sm:w-16" fetchPriority="high" />
            <span className="truncate text-sm font-black text-ink sm:text-base">Petropolis Club</span>
          </div>
          <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground sm:text-xs">🔥 Cupos limitados</span>
        </header>

        {step > 0 && (
          <div className="mt-4 flex gap-2 sm:mt-6" aria-label="Progreso">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: step >= i ? "100%" : "0%" }} />
              </div>
            ))}
          </div>
        )}

        <div key={step} className="rise mt-5 flex flex-1 flex-col sm:mt-8">
          {step === 0 && (
            <section className="flex flex-1 flex-col">
              <h1 className="text-[1.9rem] font-black leading-[1.06] tracking-tight text-ink sm:text-6xl sm:leading-[1.02]">
                Los mejores planes de recreación <span className="text-primary">para tu perrito</span>
              </h1>
              <p className="mt-3 text-base leading-snug text-muted-foreground sm:mt-5 sm:text-lg">
                Planes desde 1 día a la semana hasta todos los días, todas las semanas del mes.
              </p>

              <div className="mt-4 rounded-3xl bg-paper px-5 py-3 shadow-sm sm:mt-6 sm:inline-block sm:px-6 sm:py-4">
                <p className="flex flex-wrap items-center gap-x-2 text-sm font-bold text-ink">
                  Antes <span className="text-muted-foreground line-through decoration-primary decoration-2">$449.000</span>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">Ahorra 20%</span>
                </p>
                <p className="mt-1 text-sm font-bold text-ink">Planes desde</p>
                <p className="flex flex-wrap items-end gap-x-2">
                  <span className="text-[2.6rem] font-black leading-none text-primary sm:text-6xl">$358.000</span>
                  <span className="mb-1 text-sm font-bold text-ink">/ mensual</span>
                </p>
              </div>

              <p className="mt-3 text-[13px] font-medium text-ink sm:mt-4 sm:text-sm">⏳ Precio de lanzamiento solo para nuevos peluditos este mes</p>

              <div className="mt-3 flex flex-wrap gap-2 sm:mt-6">
                {["🏫 Colegio", "🛏️ Hospedaje", "🐾 Recreación"].map((t) => (
                  <span key={t} className="rounded-full bg-card px-3 py-1.5 text-[13px] font-semibold text-ink shadow-sm sm:px-4 sm:py-2 sm:text-sm">{t}</span>
                ))}
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground sm:mt-5 sm:text-sm">⭐ Más de 200 familias confían en nosotros</p>

              <div className={CTA_BAR}>
                <button onClick={() => setStep(1)} className="pulse-cta flex w-full items-center justify-between gap-4 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 sm:px-8 sm:py-5 sm:text-lg">
                  Pregunta por nuestros planes <span aria-hidden>→</span>
                </button>
              </div>
            </section>
          )}

          {step === 1 && (
            <Question title="¿Cuál es el nombre de tu peludito?" emoji="🐶">
              <input autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
                placeholder="Ej: Max" className="w-full rounded-2xl border-2 border-input bg-card px-4 py-3 text-lg font-semibold outline-none transition focus:border-primary sm:px-5 sm:py-4 sm:text-xl" />
              <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} disabled={!name.trim()} />
            </Question>
          )}

          {step === 2 && (
            <Question title={`¿Cuántos días a la semana estás interesado en dejarnos a ${name.trim() || "tu peludito"}?`} emoji="📅">
              <div className="rounded-3xl bg-card p-4 shadow-sm sm:p-6">
                <p className="text-center text-5xl font-black text-primary sm:text-6xl">{days}<span className="ml-2 text-lg text-ink sm:text-xl">{days === 1 ? "día" : "días"}</span></p>
                <input type="range" min={1} max={5} step={1} value={days} onChange={(e) => setDays(Number(e.target.value))} className="range-brand mt-4 w-full sm:mt-6" aria-label="Días a la semana" />
                <div className="mt-2 flex justify-between text-sm font-bold text-muted-foreground">
                  {[1, 2, 3, 4, 5].map((d) => <span key={d}>{d}</span>)}
                </div>
              </div>
              <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </Question>
          )}

          {step === 3 && (
            <Question title="¿Cuál es tu dirección?" emoji="📍" subtitle="La usamos para verificar la cobertura de nuestra ruta.">
              <input autoFocus value={address} maxLength={150} onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Calle 123 #45-67, barrio" className="w-full rounded-2xl border-2 border-input bg-card px-4 py-3 text-base font-semibold outline-none transition focus:border-primary sm:px-5 sm:py-4 sm:text-lg" />
              <div className={CTA_BAR}>
                <button disabled={address.trim().length < 5} onClick={sendWa}
                  className="pulse-cta flex w-full items-center justify-center gap-3 rounded-full bg-whatsapp px-6 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:animate-none disabled:opacity-40 sm:px-8 sm:py-5 sm:text-lg">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.2Z" /></svg>
                  Verificar cobertura por WhatsApp
                </button>
                <button onClick={() => setStep(2)} className="w-full text-sm font-semibold text-muted-foreground">← Atrás</button>
              </div>
            </Question>
          )}
        </div>
      </div>
    </main>
  );
}

function Question({ title, emoji, subtitle, children }: { title: string; emoji: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-1 flex-col">
      <span className="text-4xl sm:text-5xl">{emoji}</span>
      <h2 className="mt-3 text-[1.7rem] font-black leading-tight text-ink sm:mt-4 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      <div className="mt-5 sm:mt-8">{children}</div>
    </section>
  );
}

function Nav({ onBack, onNext, disabled }: { onBack: () => void; onNext: () => void; disabled?: boolean }) {
  return (
    <div className={CTA_BAR + " flex-row items-center justify-between gap-4"}>
      <button onClick={onBack} className="shrink-0 text-sm font-semibold text-muted-foreground">← Atrás</button>
      <button onClick={onNext} disabled={disabled} className="shrink-0 rounded-full bg-primary px-6 py-3.5 font-bold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40 sm:px-8 sm:py-4">
        Continuar →
      </button>
    </div>
  );
}
