// Meta Pixel: solo se carga cuando hay un ID configurado en VITE_META_PIXEL_ID.
// Sin ID, los eventos son no-op. Nunca se envían datos personales: solo eventos estándar.

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string };
  }
}

const PIXEL_ID = (import.meta.env["VITE_META_PIXEL_ID"] as string | undefined) || "1480488820643263";

let loaded = false;

export function initPixel() {
  if (!PIXEL_ID || loaded || typeof window === "undefined") return;
  loaded = true;
  if (window.fbq) return;
  const fbq = ((...args: unknown[]) => {
    fbq.queue!.push(args);
  }) as NonNullable<Window["fbq"]>;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  fbq("init", PIXEL_ID);
}

export type PixelEvent = "PageView" | "ViewContent" | "Lead" | "Contact";

export function track(event: PixelEvent, eventId?: string) {
  if (!PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  if (eventId) window.fbq("track", event, {}, { eventID: eventId });
  else window.fbq("track", event);
}

export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]!) : undefined;
}
