import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import logoUrl from "@/assets/petropolis_logo.webp";

import {
  BUDGET_OPTIONS,
  addDays,
  budgetById,
  datesAreValid,
  estimateText,
  leadEventData,
  nightsBetween,
  nightsLabel,
  todayISO,
  whatsappHospedajeUrl,
  type BudgetId,
  type HospedajeLead,
} from "@/lib/hospedaje";
import { initPixel, readCookie, track, trackCustom } from "@/lib/pixel";
import { sendCapiLead } from "@/lib/capi.functions";

export const Route = createFileRoute("/hospedaje")({
  head: () => ({
    meta: [
      { title: "Hospedaje para tu peludo | PETropolis Club" },
      {
        name: "description",
        content: "Hospedaje para tu peludo. Cuéntanos tres cosas y te escribimos por WhatsApp.",
      },
      { property: "og:title", content: "Hospedaje para tu peludo | PETropolis Club" },
      { property: "og:description", content: "Cuéntanos tres cosas y te escribimos por WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Hospedaje,
});

type Step = 1 | 2 | 3 | 4;

// Espera antes de abrir WhatsApp para que el Pixel alcance a enviar el Lead.
const WA_DELAY_MS = 400;
// Tope de espera a la API de Conversiones antes de abrir WhatsApp igual.
const CAPI_MAX_WAIT_MS = 1500;
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

const CTA_BAR =
  "sticky bottom-0 z-20 pt-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pt-8 sm:pb-0";

const FIELD =
  "w-full rounded-2xl border-2 border-input bg-card px-4 py-3 text-lg font-semibold outline-none transition focus:border-primary sm:px-5 sm:py-4 sm:text-xl";

function Hospedaje() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [entrada, setEntrada] = useState("");
  const [salida, setSalida] = useState("");
  const [budgetId, setBudgetId] = useState<BudgetId | null>(null);
  const [waHref, setWaHref] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const completedSent = useRef(false);
  const capi = useServerFn(sendCapiLead);

  useEffect(() => {
    initPixel();
    track("PageView");
  }, []);

  // Solo se calcula en el navegador (los pasos 2–4 nunca se renderizan en el servidor).
  const today = step >= 2 ? todayISO() : "";
  const nights = nightsBetween(entrada, salida);
  const validDates = step >= 2 && datesAreValid(entrada, salida, today);
  const budget = budgetById(budgetId);

  const lead = (): HospedajeLead => ({
    petName: name.trim(),
    entrada,
    salida,
    budgetId: budgetId!,
  });

  const changeEntrada = (v: string) => {
    setEntrada(v);
    // Si la salida ya no es posterior a la nueva entrada, se limpia.
    if (salida && v && salida <= v) setSalida("");
    setWaHref(null);
  };

  const finish = () => {
    setStep(4);
    if (!completedSent.current) {
      completedSent.current = true;
      trackCustom("FormularioCompletado");
    }
  };

  const sendWa = () => {
    if (sending) return;
    setSending(true);
    const data = lead();
    const url = whatsappHospedajeUrl(data, today);
    setWaHref(url);
    // Lead = clic en WhatsApp. Mismo event_id en navegador y servidor para que Meta deduplique.
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const customData = leadEventData(data);
    track("Lead", eventId, customData);
    track("Contact");
    const capiDone = capi({
      data: {
        eventId,
        eventSourceUrl: window.location.href,
        fbp: readCookie("_fbp"),
        fbc: readCookie("_fbc"),
        customData,
      },
    }).catch(() => {});
    // Se navega en la misma pestaña (no lo bloquea el teléfono como haría un popup) tras al menos
    // 400 ms, y esperando a que CAPI responda (máx. 1,5 s) para que salir de la página no lo corte.
    Promise.all([sleep(WA_DELAY_MS), Promise.race([capiDone, sleep(CAPI_MAX_WAIT_MS)])]).then(
      () => {
        window.location.href = url;
        setSending(false);
      },
    );
  };

  return (
    <main className="relative min-h-dvh overflow-clip bg-background">
      {/* decor */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-44 w-44 rounded-full bg-secondary/70 sm:-right-24 sm:-top-28 sm:h-64 sm:w-64" />
      <svg
        className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-[18rem] text-primary sm:-bottom-10 sm:-left-10 sm:h-64 sm:w-[28rem]"
        viewBox="0 0 400 200"
        aria-hidden
      >
        <path d="M0 40 C 120 0, 180 120, 400 200 L 0 200 Z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-2 pt-4 sm:px-6 sm:pt-6">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={logoUrl}
              alt="Petropolis Club"
              width={72}
              height={72}
              className="h-11 w-11 shrink-0 floaty sm:h-16 sm:w-16"
              fetchPriority="high"
            />
            <span className="truncate text-sm font-black text-ink sm:text-base">
              PETropolis Club
            </span>
          </div>
        </header>

        {step < 4 && (
          <div className="mt-4 sm:mt-6">
            <h1 className="text-xl font-black leading-tight text-primary sm:text-2xl">
              Hospedaje para tu peludo
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Cuéntanos tres cosas y te escribimos por WhatsApp
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-2 sm:mt-6" aria-label="Progreso">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: step >= i ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        <div key={step} className="rise mt-5 flex flex-1 flex-col sm:mt-8">
          {step === 1 && (
            <Question
              title="¿Cómo se llama tu peludo?"
              emoji="🐶"
              cta={<Nav onNext={() => setStep(2)} disabled={!name.trim()} />}
            >
              <input
                autoFocus
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
                placeholder="Ej: Max"
                className={FIELD}
              />
            </Question>
          )}

          {step === 2 && (
            <Question
              title="¿Cuándo lo dejarías?"
              emoji="📅"
              cta={
                <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} disabled={!validDates} />
              }
            >
              <div className="rounded-3xl bg-card p-4 shadow-sm sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-muted-foreground">Entrada</span>
                    <input
                      type="date"
                      value={entrada}
                      min={today}
                      onChange={(e) => changeEntrada(e.target.value)}
                      className={FIELD + " mt-1 bg-background"}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold text-muted-foreground">Salida</span>
                    <input
                      type="date"
                      value={salida}
                      min={entrada ? addDays(entrada, 1) : addDays(today, 1)}
                      onChange={(e) => {
                        setSalida(e.target.value);
                        setWaHref(null);
                      }}
                      className={FIELD + " mt-1 bg-background"}
                    />
                  </label>
                </div>
                {validDates ? (
                  <p className="mt-4 text-center text-2xl font-black text-primary sm:text-3xl">
                    {nights === 1 ? "Es 1 noche" : `Son ${nights} noches`}
                  </p>
                ) : entrada && salida ? (
                  <p className="mt-4 text-center text-sm font-bold text-destructive">
                    {entrada < today
                      ? "La entrada no puede ser antes de hoy."
                      : "La salida debe ser después de la entrada."}
                  </p>
                ) : null}
              </div>
            </Question>
          )}

          {step === 3 && (
            <Question
              title="¿Cuál es tu presupuesto por noche?"
              emoji="💛"
              cta={<Nav onBack={() => setStep(2)} onNext={finish} disabled={!budget} />}
            >
              <div
                className="flex flex-col gap-3"
                role="radiogroup"
                aria-label="Presupuesto por noche"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    role="radio"
                    aria-checked={budgetId === opt.id}
                    onClick={() => {
                      setBudgetId(opt.id);
                      setWaHref(null);
                    }}
                    className={`rounded-2xl border-2 px-4 py-3.5 text-left text-base font-bold transition-all active:scale-[0.98] sm:px-5 sm:py-4 sm:text-lg ${
                      budgetId === opt.id
                        ? "border-primary bg-card text-primary shadow-sm"
                        : "border-input bg-card text-ink hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Question>
          )}

          {step === 4 && budget && (
            <Question
              title={`Perfecto, esto es lo que tenemos para ${name.trim() || "tu peludo"}`}
              emoji="🐾"
              cta={
                <div className={CTA_BAR + " flex flex-col gap-2"}>
                  <button
                    onClick={sendWa}
                    disabled={sending}
                    className="pulse-cta flex w-full items-center justify-center gap-3 rounded-full bg-whatsapp px-6 py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 sm:px-8 sm:py-5 sm:text-lg"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 shrink-0"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.2Z" />
                    </svg>
                    {sending ? "Abriendo WhatsApp…" : "Hablar por WhatsApp"}
                  </button>
                  {waHref && (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-center text-sm font-bold text-whatsapp underline underline-offset-4"
                    >
                      ¿No se abrió WhatsApp? Toca aquí
                    </a>
                  )}
                  <button
                    onClick={() => setStep(3)}
                    className="w-full text-sm font-semibold text-muted-foreground"
                  >
                    ← Atrás
                  </button>
                </div>
              }
            >
              <div className="rounded-3xl bg-card p-5 shadow-sm sm:p-6">
                <p className="text-sm font-bold text-muted-foreground">
                  Total estimado por {nightsLabel(nights)}
                </p>
                <p className="mt-1 text-3xl font-black leading-tight text-primary sm:text-4xl">
                  {estimateText(nights, budget)}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Valor estimado. No incluye transporte ni servicios adicionales. Sujeto a
                  disponibilidad.
                </p>
              </div>
            </Question>
          )}
        </div>
      </div>
    </main>
  );
}

function Question({
  title,
  emoji,
  subtitle,
  children,
  cta,
}: {
  title: string;
  emoji: string;
  subtitle?: string;
  children: React.ReactNode;
  cta?: React.ReactNode;
}) {
  return (
    <section className="flex flex-1 flex-col">
      <div className="my-auto">
        <span className="text-4xl sm:text-5xl">{emoji}</span>
        <h2 className="mt-3 text-[1.7rem] font-black leading-tight text-ink sm:mt-4 sm:text-4xl">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
        <div className="mt-5 sm:mt-8">{children}</div>
        {cta}
      </div>
    </section>
  );
}

function Nav({
  onBack,
  onNext,
  disabled,
  nextLabel = "Continuar →",
}: {
  onBack?: () => void;
  onNext: () => void;
  disabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className={CTA_BAR + " flex flex-row items-center justify-between gap-4"}>
      {onBack && (
        <button onClick={onBack} className="shrink-0 text-sm font-semibold text-muted-foreground">
          ← Atrás
        </button>
      )}
      <button
        onClick={onNext}
        disabled={disabled}
        className={`shrink-0 rounded-full bg-primary px-6 py-3.5 font-bold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40 sm:px-8 sm:py-4 ${onBack ? "" : "w-full"}`}
      >
        {nextLabel}
      </button>
    </div>
  );
}
