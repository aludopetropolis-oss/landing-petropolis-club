// Meta Pixel (Facebook Pixel) integration.
// Set PIXEL_ID to the Pixel ID from Meta Events Manager to activate tracking.
// Until then, all calls are safe no-ops.

const PIXEL_ID = "";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function initMetaPixel() {
  if (!PIXEL_ID || typeof window === "undefined" || window.fbq) return;

  const fbq = function (...args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fbq as any).queue.push(args);
  } as unknown as NonNullable<Window["fbq"]> & { queue: unknown[]; loaded: boolean; version: string };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", PIXEL_ID);
}

export function trackPixel(event: "PageView" | "ViewContent" | "Lead" | "Contact", params?: Record<string, string | number>) {
  if (typeof window === "undefined" || !window.fbq) return;
  // Never send personal data to Meta — only anonymous funnel metadata.
  window.fbq("track", event, params);
}
