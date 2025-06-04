import { afterEventStop } from "../../shared/afterEventStop";
import trustedQS from "../../shared/trustedQS";
import { getUiInputBlock } from '../forms';
import { Modal } from "../header/modal";

import { AddressInput } from "./addressInput";
import { highlightText } from "./suggestionDropdown";

export class cityInputModal extends Modal {
  // value: string;
  get value() {
    return this.cityInput.inputValue;
  }
  resultInput?: HTMLInputElement;
  cityInput: cityInput;

  constructor() {
    super({
      container: ".city-input-modal",
      fromTemplate: true,
      selMainTpl: ".tpl--city-input",
    });
    this.cityInput = new cityInput(this, trustedQS(this.bodyEl, ".city-form"));
    this.opt.on.afterOpen = () => {
      this.cityInput.input.focus();
    };
  }

  clear() {
    this.cityInput.clear();
    this.resultInput?.dispatchEvent(new Event("change"));
  }
}

export class cityInput {
  opt = {
    afterSubmit: (ci: cityInput) => {},
  };
  el: HTMLElement;
  input: HTMLInputElement;
  suggCrt: HTMLElement;
  suggestionUrl: string;
  constructor(cityModal: cityInputModal, el: HTMLElement) {
    this.el = el;
    if (!this.el.dataset.suggestion)
      throw new Error("У ввода адреса не указан data-suggestion");
    this.suggestionUrl = this.el.dataset.suggestion;
    this.input = trustedQS<HTMLInputElement>(this.el, 'input[name="city"]');
    this.suggCrt = trustedQS(this.el, ".city-form__sugg-crt");
    afterEventStop(this.input, "input", () => {
      this.valid = false;
      if (this.input.value.trim()) {
        this.getSuggestions("city").then((data) => {
          this.fillList(data);
        });
      } else {
        this.active = false;
        this.suggCrt.innerHTML = "";
      }
    });
    this.el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const suggest = (e.target as HTMLElement).closest("li");
      if (suggest && suggest.textContent) {
        this.inputValue = suggest.textContent;
        this.valid = true;
        this.active = false;
        this.suggCrt.innerHTML = "";
        if (!cityModal.resultInput) {
          console.error("Не передан resultInput");
          return;
        }
        cityModal.resultInput.value = this.inputValue;
        cityModal.resultInput.closest(".ui-input")?.classList.add("is-focused");
        cityModal.resultInput.dispatchEvent(
          new Event("change", { bubbles: true })
        );
        getUiInputBlock(cityModal.resultInput)?.querySelector('.ui-input__float-label_error')?.remove()
        this.opt.afterSubmit && this.opt.afterSubmit(this);
      }
    });
  }

  fillList(data: string[]) {
    const createItem = () => {
      const el = DcCrEl("li");
      // el.classList.add("sugg-drop__item");
      return el;
    };

    if (data.length) {
      const elements = data.map((el, i) => {
        const sugg = createItem();
        sugg.innerHTML = highlightText(el, this.inputValue);
        return sugg;
      });
      this.suggCrt.innerHTML = "";
      this.suggCrt.append(...elements);
    } else {
      const nothingFound = createItem();
      nothingFound.innerHTML = "Такого города не найдено";
      this.suggCrt.innerHTML = "";
      this.suggCrt.append(nothingFound);
    }
    this.active = true;
  }
  async getSuggestions(name: string) {
    return fetch(
      this.suggestionUrl +
        "?" +
        new URLSearchParams({
          query: this.input.value,
          type: name,
        })
    ).then((r) => r.json() as Promise<string[]>);
  }
  set active(isEmpty: boolean) {
    this.el.classList.toggle("_active", isEmpty);
  }
  set inputValue(value: string) {
    this.input.value = value;
  }
  get inputValue() {
    return this.input.value;
  }
  set valid(isValid: boolean) {
    isValid
      ? this.input.setAttribute("valid", "")
      : this.input.removeAttribute("valid");
  }
  get isValid() {
    return this.input.hasAttribute("valid");
  }
  clear() {
    this.inputValue = "";
  }
}
