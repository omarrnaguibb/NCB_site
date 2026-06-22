const VIEWPORT_CONTENT =
  "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover";

export function resetPageZoom() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) return;

  viewport.setAttribute("content", VIEWPORT_CONTENT);
  requestAnimationFrame(() => {
    viewport.setAttribute("content", VIEWPORT_CONTENT);
  });
}

export function scrollToTop() {
  resetPageZoom();
}

export function ensureViewportMeta() {
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement("meta");
    viewport.setAttribute("name", "viewport");
    document.head.appendChild(viewport);
  }
  viewport.setAttribute("content", VIEWPORT_CONTENT);
}
