import { afterEventStop } from "../../shared/afterEventStop";
import trustedQS from "../../shared/trustedQS";

interface searchFieldOptions {
  inputSel: string;
  enterBtnSel: string;
  clearBtnSel: string;
}
const searchFieldDefaults = {
  inputSel: ".search-field__input input",
  enterBtnSel: ".search-field__enter",
  clearBtnSel: ".search-field__clear",
};

export function initSearchFields() {
  QsAfE(".search-field:not(._inited)", (el) => new SearchField(el));
}

export class SearchField {
  rootEl: Element;
  clearBtnEls: NodeListOf<Element>;
  enterBtnEls: NodeListOf<Element>;

  inputEl: HTMLInputElement;
  opt: searchFieldOptions;
  constructor(el: Element) {
    this.opt = { ...searchFieldDefaults };
    this.rootEl = el;

    this.clearBtnEls = this.rootEl.querySelectorAll(this.opt.clearBtnSel);
    this.enterBtnEls = this.rootEl.querySelectorAll(this.opt.enterBtnSel);

    this.inputEl = trustedQS<HTMLInputElement>(this.rootEl, this.opt.inputSel);

    this.inputEl.addEventListener("input", (event: any) => {
      this.rootEl.classList.toggle("_has-value", !!this.value.trim());
    });
    afterEventStop(
      this.inputEl,
      "input",
      (event: any) => {
        this.onInput(event);
      },
      750
    );
    this.clearBtnEls.forEach((el) =>
      el.addEventListener("click", () => {
        this.onClearBtn();
      })
    );
    this.rootEl.classList.add("_inited");
  }
  blur() {
    this.inputEl.blur();
  }
  focus() {
    this.inputEl.focus();
  }

  onInput(e: InputEvent) {}
  onClearBtn() {
    this.beforeClear && this.beforeClear();
    this.clearInput();
  }
  beforeClear?: () => void;
  clearInput() {
    this.inputEl.value = "";
    this.inputEl.dispatchEvent(new Event("input"));
  }
  get value() {
    return this.inputEl.value;
  }
}
