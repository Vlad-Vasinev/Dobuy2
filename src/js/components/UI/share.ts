import { qsUnwrapTpl } from "../../shared/templates";
import trustedQS from "../../shared/trustedQS";
import { toggleIcon } from "./iconToggle";

export function initShareMenu() {
  const btns = QsA("[data-share-popup]");
  if (!btns.length) return;
  try {
    const menu = new shareMenu(btns);
  } catch (error) {}
}
/*

*/
/**
 * 
 */
class shareMenu {
  menuEl?: HTMLElement;
  opened = false;
  private _tpl: HTMLElement;
  private get tpl() {
    return this._tpl.cloneNode(true) as HTMLElement;
  }
  constructor(btns: NodeListOf<HTMLElement>) {
    this._tpl = qsUnwrapTpl(".tpl--popup--share");
    btns.forEach((crt) => {
      const trg = trustedQS(crt, "[data-share-popup-trg]");
      trg.addEventListener("click", () => {
        // this.opened ? this.close() : this.open(crt);
        //-
        this.copyThenShowMsg(crt);
        //-
      });
    });
  }
  closeOutside = ((event: Event) => {
    if ((event.target as Element).closest("[data-share-popup]")) {
      return;
    }
    this.close();
  }).bind(this);
  open(crt: HTMLElement) {
    if (this.opened) return;
    this.menuEl = crt.appendChild(this.tpl) as HTMLElement;
    // this.init();
    this.opened = true;
    Dc.addEventListener("click", this.closeOutside);
  }
  close() {
    if (!this.opened) return;
    Dc.removeEventListener("click", this.closeOutside);
    this.menuEl?.remove();
    this.opened = false;
  }
  copyThenShowMsg(crt: HTMLElement) {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const tpl = this.tpl;
      const copyBtn = tpl.querySelector<HTMLElement>("[data-copy-href]");
      copyBtn && toggleIcon(copyBtn);
      const span = tpl.querySelector<Element>("[data-copy-href] span");
      span && (span.textContent = "Link copied");
      this.menuEl = crt.appendChild(tpl);
      this.opened = true;
      Dc.addEventListener("click", this.closeOutside);
      setTimeout(() => this.close(), 3000);
    });
  }
}
