import trustedQS from "../../shared/trustedQS";
import { getUiInputBlock, uiInputManualError } from "../forms";
import { Modal } from "../header/modal";

import { AddressInput } from "./addressInput";
import { suggestionDdInput } from "./suggestionDropdown";

export class streetInputModal extends Modal {
  resultInput?: HTMLInputElement;
  streetInput: StreetInput;
  constructor() {
    super({
      container: ".address-input-modal",
      fromTemplate: true,
      selMainTpl: ".tpl--address-input",
    });

    this.streetInput = new StreetInput(
      this,
      trustedQS(this.bodyEl, ".address-form")
    );

    this.opt.on.afterOpen = () => {
      this.streetInput.inputs.street.input?.focus();
    };
    this.opt.on.afterClose = () => {
      this.clear();
    };
  }
  get value() {
    return this.streetInput.value;
  }
  clear() {
    this.streetInput.clear();
    // --!--
    // this.resultInput.value = "";
    this.resultInput?.dispatchEvent(new Event("change"));
  }
}

export interface addressInputFields {
  city: HTMLInputElement;
  street: suggestionDdInput;
  house: suggestionDdInput;
  apart: HTMLInputElement;
  postindex: HTMLInputElement;
}

export class StreetInput {
  addressModal: streetInputModal;
  inputs: addressInputFields = {} as addressInputFields;
  inputsArr: HTMLInputElement[] = [];
  el: HTMLFormElement;
  suggestionUrl: string;

  submitBtn: HTMLButtonElement;

  changeCityBtn: HTMLElement;
  opt = {
    afterSubmit: (streetInput: StreetInput) => {},
  };
  constructor(addressModal: streetInputModal, el: HTMLFormElement) {
    this.el = el;
    //
    //
    if (!this.el.dataset.suggestion)
      throw new Error("у формы адреса не указан data-action");
    this.suggestionUrl = this.el.dataset.suggestion;
    //

    this.addressModal = addressModal;
    //
    this.submitBtn = trustedQS(this.el, ".address-form__bottom button");
    this.toggleSubmitBtn(false);
    //
    this.changeCityBtn = trustedQS(this.el, "[change-city]");

    // this.citySpan = this.changeCityBtn.querySelector('span')
    // this.citySpan && (this.citySpan.innerHTML = order.cityModal.value)
    //
    this.inputsArr = Array.from(this.el.elements) as HTMLInputElement[];

    this.inputsArr.forEach((el: HTMLInputElement) => {
      if (el.type != "text") return;
      const name = el.getAttribute("name") as
        | "street"
        | "house"
        | "apart"
        | null;
      if (!name) return;

      if (name == "apart") {
        this.inputs.apart = el;
        return;
      }

      this.inputs[name] = new suggestionDdInput(
        this,
        el.parentElement as HTMLElement,
        name
      );
    });

    {
      const postIndexInput = DcCrEl("input");
      postIndexInput.name = "postindex";
      postIndexInput.classList.add("_hidden");
      this.inputs["postindex"] = trustedQS<Element>(
        this.el,
        ".address-form__crt"
      ).appendChild(postIndexInput);
      this.inputsArr.unshift(postIndexInput);

      const cityInput = DcCrEl("input");
      cityInput.name = "city";
      cityInput.classList.add("_hidden");
      this.inputs["city"] = trustedQS<Element>(
        this.el,
        ".address-form__crt"
      ).appendChild(cityInput);
      cityInput.value = this.city;
      this.inputsArr.unshift(cityInput);
    }
    this.el.addEventListener("submit", (e) => this._onSubmit(e));
    // `${this.inputs.street} ${this.inputs.house}`
    // Выяснилось, что адрес у пользователя может не содержать улицы
    this.el
      .querySelector(`[name="no-street"]`)
      ?.addEventListener("input", (e) => {
        this.inputs["street"].disabled = (e.target as HTMLInputElement).checked;
      });
  }
  private _city = "";
  get city() {
    return this._city;
  }
  set city(val: string) {
    this._city = val;
    this.inputs["city"].value = this._city;
    const citySpan = this.changeCityBtn.querySelector("span");
    citySpan && (citySpan.innerHTML = this._city);
  }

  get query() {
    return `${this.city} ${this.inputs.street.input.value} ${this.inputs.house.input.value}`;
  }
  get addressValue() {
    return `${this.inputs.street.input.value}, ${
      this.inputs.house.input.value
    }${this.inputs.apart.value && ", " + this.inputs.apart.value}, ${
      this.inputs.postindex.value
    }`;
  }
  clearNextInputs(name: string) {
    if (!this.inputsArr.length) return;
    const index = this.inputsArr.findIndex((el) => el.name == name);
    if (index < 0 || index == this.inputsArr.length - 1) return;
    this.inputsArr.slice(index + 1).forEach((el, i, arr) => {
      el.removeAttribute("valid");
      el.value = "";
      el.setAttribute("value", "");
      el.closest(".is-focused")?.classList.remove("is-focused");
    });
  }
  async getSuggestions(name: string) {
    // вариант с query параметрами
    if (!this.query.trim()) {
      return new Promise<{ sug: string[]; index: string[] }>((r) => {
        r({ sug: [], index: [] });
      });
    }
    return fetch(
      this.suggestionUrl +
        "?" +
        new URLSearchParams({
          query: this.query,
          type: name,
        })
    ).then((r) => r.json() as Promise<{ sug: string[]; index: string[] }>);
    // вариант с post
    // return fetch(this.actionUrl, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json;charset=utf-8",
    //   },
    //   body: JSON.stringify({ query: this.query, type: name }),
    // });
  }
  checkValid() {
    const valid = this.isValid;
    this.toggleSubmitBtn(valid);

    return valid;
  }
  toggleSubmitBtn(direction: boolean) {
    this.submitBtn.disabled = !direction;
  }
  private _onSubmit(e: SubmitEvent | undefined) {
    e && e.preventDefault();
    if (this.isValid) {
      if (this.addressModal.resultInput) {
        this.addressModal.resultInput.value = this.addressValue;
        this.addressModal.resultInput
          .closest(".ui-input")
          ?.classList.add("is-focused");
        this.addressModal.resultInput
            .closest(".ui-input textarea")
            ?.classList.remove("has-error");

        this.addressModal.resultInput.dispatchEvent(
          new Event("change", { bubbles: true })
        );
        getUiInputBlock(this.addressModal.resultInput)
          ?.querySelector(".ui-input__float-label_error")
          ?.remove();
      }
      this.addressModal.close();
      this.opt.afterSubmit && this.opt.afterSubmit(this);
    }
  }
  get isValid() {
    const invalidInput = this.inputsArr.findIndex((el) => {
      return el.hasAttribute("required") && !el.hasAttribute("valid");
    });
    const isValid = invalidInput == -1;

    return isValid;
  }
  get value() {
    const value = {} as Record<string, string>;
    this.inputsArr
      .filter((el) => el.tagName == "INPUT" && el.type == "text")
      .forEach((el) => {
        value[el.name] = el.value;
      });
    return value;
  }
  clear() {
    this.inputsArr
      .filter((el) => el.tagName == "INPUT" && el.type == "text")
      .forEach((el) => {
        el.value = "";
        el.dispatchEvent(new Event("change"));
      });
  }
}
