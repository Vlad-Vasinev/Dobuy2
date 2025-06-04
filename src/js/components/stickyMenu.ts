import { aPixels } from "../shared/aPixels";
import { isMobile } from "../shared/check-viewport";
import trustedQS from "../shared/trustedQS";
// @ts-ignore
import Sticky from "sticky-js";

export function initStickyMenu() {
  new StickyMenu();
}

export class StickyMenu {
  el: HTMLElement | null;
  side?: HTMLElement;
  sticky: typeof Sticky;
  // Если нужено будет еще одно меню - добавить другой id в конструктор
  constructor(id: string = "0") {
    const isM = isMobile();
    this.el = Qs(".sticky-menu:not([sticky-id])");

    if (!this.el) return;
    if (isMobile() && !this.el.classList.contains("sticky-menu_mob")) return;

    this.side = trustedQS(this.el, ".sticky-menu__side");

    // const marginTop = (sideRect.top + window.scrollY).toFixed(0) + "px";

    const headerBottom = +trustedQS(document, "header")
      .getBoundingClientRect()
      .height.toFixed(0);

    const marginTop = headerBottom + (isM ? 16 : aPixels(24)) + "px";

    this.side.dataset.marginTop = marginTop;
    // this.side.style.setProperty("--stickyMarginTop", marginTop);

    this.side.dataset.stickyClass = "_sticked";

    const sideRect = this.side.getBoundingClientRect();
    const menuHeight = sideRect.height.toFixed() + "px";
    this.side.style.height = menuHeight;
    this.el.style.setProperty("--menuHeight", menuHeight);
    this.el.setAttribute("sticky-id", id);
    this.sticky = new Sticky(
      `.sticky-menu[sticky-id="${id}"] .sticky-menu__side`
    );
  }
  destroy() {
    this.sticky.destroy();
  }
}
