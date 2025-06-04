export function iconToggleInit() {
  QsAfE("[icon-tgl-trg]:not([ui-inited])", (iconEl) => {
    iconEl.addEventListener("click", () => toggleIcon(iconEl));
    iconEl.setAttribute("ui-inited", "");
  });
}
export function toggleIcon(el: HTMLElement) {
  const crt = el.hasAttribute("icon-tgl-crt")
    ? el
    : el.querySelector("[icon-tgl-crt]");
  crt?.toggleAttribute("icon-tgl-active");
}
