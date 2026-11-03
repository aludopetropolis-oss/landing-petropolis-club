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
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* decor */}
      <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-secondary" />
      <svg className="pointer-events-none absolute -bottom-10 -left-10 h-64 w-[28rem] text-primary" viewBox="0 0 400 200" aria-hidden>
        <path d="M0 40 C 120 0, 180 120, 400 200 L 0 200 Z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col px-6 pb-24 pt-6">
        <header className="flex items-center justify-between">
          <img src={logo.url} alt="Petropolis Club" width={72} height={72} className="h-16 w-16 floaty" fetchPriority="high" />
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">🔥 Cupos limitados</span>
        </header>

        {step > 0 && (
          <div className="mt-6 flex gap-2" aria-label="Progreso">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: step >= i ? "100%" : "0%" }} />
              </div>
            ))}
          </div>
        )}

        <div key={step} className="rise mt-8 flex-1">
          {step === 0 && (
            <section>
              <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-ink sm:text-6xl">
                Los mejores planes de recreación <span className="text-primary">para tu perrito</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                Nuestros planes van desde 1 día a la semana hasta todos los días de la semana, todas las semanas del mes.
              </p>

              <div className="mt-6 inline-block rounded-3xl bg-paper px-6 py-4 shadow-sm">
                <p className="text-sm font-bold text-ink">
                  Antes <span className="text-muted-foreground line-through decoration-primary decoration-2">$449.000</span>
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Ahorra 20%</span>
                </p>
                <p className="mt-1 font-bold text-ink">Planes desde</p>
                <p className="flex items-end gap-2">
                  <span className="text-5xl font-black text-primary sm:text-6xl">$358.000</span>
                  <span className="mb-2 text-sm font-bold text-ink">/ mensual</span>
                </p>
              </div>

              <p className="mt-4 text-sm font-medium text-ink">⏳ Precio de lanzamiento solo para nuevos peluditos este mes</p>

              <button onClick={() => setStep(1)} className="pulse-cta mt-6 flex w-full items-center justify-between gap-4 rounded-full bg-primary px-8 py-5 text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 sm:w-auto">
                Pregunta por nuestros planes <span aria-hidden>→</span>
              </button>

              <div className="mt-6 flex flex-wrap gap-2">
                {["🏫 Colegio", "🛏️ Hospedaje", "🐾 Recreación"].map((t) => (
                  <span key={t} className="rounded-full bg-card px-4 py-2 text-sm font-semibold text-ink shadow-sm">{t}</span>
                ))}
              </div>
              <p className="mt-5 text-sm text-muted-foreground">⭐ Más de 200 familias confían en nosotros</p>
            </section>
          )}

          {step === 1 && (
            <Question title="¿Cuál es el nombre de tu peludito?" emoji="🐶">
              <input autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
                placeholder="Ej: Max" className="w-full rounded-2xl border-2 border-input bg-card px-5 py-4 text-xl font-semibold outline-none transition focus:border-primary" />
              <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} disabled={!name.trim()} />
            </Question>
          )}

          {step === 2 && (
            <Question title={`¿Cuántos días a la semana estás interesado en dejarnos a ${name.trim() || "tu peludito"}?`} emoji="📅">
              <div className="rounded-3xl bg-card p-6 shadow-sm">
                <p className="text-center text-6xl font-black text-primary">{days}<span className="ml-2 text-xl text-ink">{days === 1 ? "día" : "días"}</span></p>
                <input type="range" min={1} max={5} step={1} value={days} onChange={(e) => setDays(Number(e.target.value))} className="range-brand mt-6 w-full" aria-label="Días a la semana" />
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
                placeholder="Ej: Calle 123 #45-67, barrio" className="w-full rounded-2xl border-2 border-input bg-card px-5 py-4 text-lg font-semibold outline-none transition focus:border-primary" />
              <button disabled={address.trim().length < 5} onClick={sendWa}
                className="pulse-cta mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-whatsapp px-8 py-5 text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:animate-none disabled:opacity-40">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.2Z" /></svg>
                Verificar cobertura por WhatsApp
              </button>
              <button onClick={() => setStep(2)} className="mt-4 w-full text-sm font-semibold text-muted-foreground">← Atrás</button>
            </Question>
          )}
        </div>
      </div>
    </main>
  );
}

function Question({ title, emoji, subtitle, children }: { title: string; emoji: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <span className="text-5xl">{emoji}</span>
      <h2 className="mt-4 text-4xl font-black leading-tight text-ink">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Nav({ onBack, onNext, disabled }: { onBack: () => void; onNext: () => void; disabled?: boolean }) {
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <button onClick={onBack} className="text-sm font-semibold text-muted-foreground">← Atrás</button>
      <button onClick={onNext} disabled={disabled} className="rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40">
        Continuar →
      </button>
    </div>
  );
}
