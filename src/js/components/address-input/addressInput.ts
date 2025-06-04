import trustedQS from "../../shared/trustedQS";
import { uiInputManualError } from "../forms";
import { TabsBlock } from "../tabs";
import { cityInputModal } from "./cityInput";
import { addressInputFields, streetInputModal } from "./streetInput";

export class AddressPick {
  el: HTMLElement;
  outInputs: HTMLInputElement[];
  addressInput: AddressInput;
  selExisting: SelectExistingAddress;
  tabs: TabsBlock;
  constructor(el: HTMLElement) {
    this.el = el;
    this.tabs = new TabsBlock(el);
    this.outInputs = Array.from(
      this.el.querySelectorAll(".address-pick__result input")
    );
    this.selExisting = new SelectExistingAddress(
      trustedQS(this.el, ".address-select")
    );
    if (this.selExisting.inputs.length) {
      if (!this.selExisting.inputs[0].checked) {
        this.selExisting.inputs[0].checked = true;
      }
      const value = this.selExisting.value;
      value && this.setResultInputs(value);

      this.selExisting.el.addEventListener("change", (e) => {
        // выбор из готовых
        this.addressInput.clear();
        this.addressInput.clearResult();

        const value = this.selExisting.value;
        value && this.setResultInputs(value);
      });
    } else {
      this.tabs.openTab("input");
    }

    this.addressInput = new AddressInput(trustedQS(this.el, ".address-input"));
    this.addressInput.onChange = (ai) => {
      // ввод нового адреса
      this.selExisting.clear();
      console.log(ai.cityInputEl.classList.remove('has-error'));

      this.setResultInputs(ai.value);
    };
  }
  setResultInputs(inInputs: Record<string, string>) {
    for (const key in inInputs) {
      const val = inInputs[key];
      const outField = this.outInputs.find((el) => el.name == key);
      if (!outField) {
        console.error("в .address-pick__result нет поля " + key);
      }
      if (outField) {
        outField.value = val;
      }
    }
    this.validate();
  }
  valid = false;
  validate() {
    const reqInputs = this.outInputs.filter((el) => {
      switch (el.name) {
        case "city":
        case "house":
        case "street":
          return true;
        default:
          return false;
      }
    });
    this.valid = !reqInputs.find((el) => !el.value);
    console.info("валидность секции выбора адреса: ", this.valid);

    return this.valid;
  }
  // showErr() {
  //   const street = this.addressInput.streetInputEl;
  //   const city = this.addressInput.cityInputEl;
  //   if (!city.value) {
  //     uiInputManualError({
  //       elem: city,
  //       errorMessage: "Вы не ввели город",
  //       isValid: false,
  //     });
  //     return;
  //   }
  //   if (!street.value) {
  //     uiInputManualError({
  //       elem: street,
  //       errorMessage: "Вы не ввели адрес",
  //       isValid: false,
  //     });
  //   }
  // }
}
export class SelectExistingAddress {
  el: HTMLElement;
  inputs: HTMLInputElement[];
  constructor(el: HTMLElement) {
    this.el = el;
    this.inputs = Array.from(this.el.querySelectorAll('input[type="radio"]'));
  }

  get value() {
    const active = this.inputs.find((el) => el.checked);

    if (!active) return undefined;

    return JSON.parse(active.value) as Record<string, string>;
  }
  clear() {
    this.inputs.forEach((el) => {
      el.checked = false;
    });
  }
}

export class AddressInput {
  // Блок выбора адреса, состоит из выбора города и выбора конечного адреса
  cityModal: cityInputModal;
  streetModal: streetInputModal;

  saveNew: HTMLInputElement | null;
  cityInputEl: HTMLInputElement;
  streetInputEl: HTMLInputElement;

  constructor(el: HTMLElement) {
    this.cityInputEl = trustedQS<HTMLInputElement>(
      el,
      '[name="city-input"]'
    );
    this.streetInputEl = trustedQS<HTMLInputElement>(
      el,
      '[name="address-input"]'
    );
    if (!window.addressInputModals) {
      window.addressInputModals = {
        city: undefined,
        street: undefined,
      };
    }
    if (!window.addressInputModals.city) {
      window.addressInputModals.city = new cityInputModal();
    }
    if (!window.addressInputModals.street) {
      window.addressInputModals.street = new streetInputModal();
    }
    this.cityModal = window.addressInputModals.city;
    this.cityModal.resultInput = this.cityInputEl;
    this.streetModal = window.addressInputModals.street;
    this.streetModal.resultInput = this.streetInputEl;

    this.saveNew = el.querySelector("input[name='save-new-address']");
    this.checkSaveNew();
    this.saveNew && (this.saveNew.checked = false);

    this.cityInputEl.addEventListener("focus", (e) => {
      e.stopImmediatePropagation();
      this.cityInputEl?.blur();
      this.cityModal.open();
    });
    this.cityModal.cityInput.opt.afterSubmit = (ci) => {
      this.triggerChange();
      this.streetModal.streetInput.city = this.cityInputEl.value;
      this.streetModal.open()?.then(() => {
        this.cityModal.close({ enScroll: false });
      });
    };

    this.streetInputEl.addEventListener("focus", (e) => {
      e.stopImmediatePropagation();
      this.streetInputEl.blur();

      if (this.cityInputEl.value) {
        this.streetModal.streetInput.city = this.cityInputEl.value;
        this.streetModal.resultInput = this.streetInputEl;

        this.streetModal.open();
      } else {
        this.cityModal.open();
      }
    });
    this.streetModal.streetInput.opt.afterSubmit = () => {
      this.triggerChange();
    };
    this.streetModal.streetInput.changeCityBtn.addEventListener(
      "click",
      (e) => {
        this.streetModal.close({ enScroll: false })?.then(() => {
          this.cityModal.open();
        });
      }
    );
    // this.triggerChange()
  }
  _onChange: (ai: AddressInput) => any = () => {};
  set onChange(clb: typeof this._onChange) {
    this._onChange = clb;
  }
  triggerChange() {
    this._onChange(this);
    this.checkSaveNew();
  }
  checkSaveNew() {
    if (this.saveNew && this.cityModal.value && this.streetModal.value) {
      this.saveNew.disabled = false;
    } else if (this.saveNew && !this.saveNew.disabled) {
      this.saveNew.checked = false;
      this.saveNew.disabled = true;
    }
  }

  get valid() {
    return this.cityModal.value && this.streetModal.value;
  }
  get value() {
    return this.streetModal.value;
  }
  get addressString() {
    return `${this.cityInputEl.value} ${this.streetInputEl.value}`;
  }
  clearResult() {
    this.cityModal.resultInput && (this.cityModal.resultInput.value = "");
    this.streetModal.resultInput && (this.streetModal.resultInput.value = "");
  }
  clear() {
    this.cityModal.clear();
    this.streetModal.clear();
    this.checkSaveNew();
  }
}
