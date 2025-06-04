import { afterEventStop } from "../../shared/afterEventStop";
import trustedQS from "../../shared/trustedQS";
import { StreetInput } from "./streetInput";

export class suggestionDdInput {
  input: HTMLInputElement;
  dropEl: HTMLElement;
  dropInner: HTMLElement;
  set loading(val: boolean) {
    this.dropEl.classList.toggle("_loading", val);
  }
  constructor(
    public addressForm: StreetInput,
    public el: HTMLElement,
    public name: string
  ) {
    this.input = trustedQS(el, "input");
    this.valid = false;

    this.dropEl = DcCrEl("div");
    this.dropEl.classList.add("sugg-drop");
    this.dropInner = this.dropEl.appendChild(DcCrEl("ul"));
    this.dropInner.classList.add("sugg-drop__inner");

    this.dropInner.appendChild(
      this.createItem(undefined, "Начните вводить, затем выберите")
    );

    el.appendChild(this.dropEl);

    this.dropInner.addEventListener("click", (e) => {
      // Клик по варианту
      e.preventDefault();
      e.stopPropagation();
      const suggest = (e.target as HTMLElement).closest<HTMLOptionElement>(
        ".sugg-drop__item"
      );

      if (suggest && suggest.dataset.value) {
        this.inputValue = suggest.dataset.value;

        this.valid = true;
        this.isOpen = false;
        // this.dropInner.innerHTML = "";
        if (suggest?.dataset.postIndex) {
          this.addressForm.inputs["postindex"].value =
            suggest.dataset.postIndex;
        }
        this.addressForm.toggleSubmitBtn(false);
        this.clearNextInputs(name);
        this.addressForm.checkValid();
      }
    });
    this.input.addEventListener("focus", () => {
      "focus";
      this.isOpen = true;
    });
    this.input.addEventListener("input", () => {
      this.loading = true;
      this.addressForm.toggleSubmitBtn(false);
    });
    afterEventStop(this.input, "input", () => {
      if (this.disabled) {
        this.valid = true;
        return;
      }
      this.valid = false;
      !this.isOpen && (this.isOpen = true);
      this.loading = false;
      this.clearNextInputs(name);
      if (!this.input.value.trim()) {
        this.isOpen = false;
        return;
      }
      addressForm.getSuggestions(name).then((data) => {
        this.fillList(data);
      });
    });
  }
  clearNextInputs(name: string) {
    this.addressForm.toggleSubmitBtn(false);
    return this.addressForm.clearNextInputs(name);
  }
  createItem(val?: string, text?: string) {
    const el = DcCrEl("li");
    el.classList.add("sugg-drop__item");
    text && (el.textContent = text);
    val && (el.dataset.value = val);

    val && !text && (el.textContent = val);
    return el;
  }
  fillList(data: { sug?: string[]; index: string[] }) {
    if (data?.sug?.length) {
      const elements = data.sug.map((suggestionVal, i) => {
        const sugg = this.createItem(suggestionVal);
        sugg.innerHTML = highlightText(suggestionVal, this.inputValue);
        sugg.setAttribute("value", suggestionVal);
        if (data?.index?.length && !!data.index[i]) {
          sugg.dataset.postIndex = data.index[i];
        }
        return sugg;
      });
      this.dropInner.innerHTML = "";
      this.dropInner.append(...elements);
    } else {
      const getNotfound = () => {
        switch (this.name) {
          case "street": {
            return "Такая улица не найдена в указанном городе";
          }
          case "house": {
            return "Такой дом не найден на указанной улице";
          }
          default: {
            return "Ничего не найдено";
          }
        }
      };

      const nothingFound = this.createItem(getNotfound());

      this.dropInner.innerHTML = "";
      this.dropInner.append(nothingFound);
    }
  }

  set inputValue(value: string) {
    this.input.value = value;
    this.input.dispatchEvent(new Event("change"));
  }
  get inputValue() {
    return this.input.value;
  }
  _valid: boolean = false;
  set valid(value: boolean) {
    this._valid = value;
    this._valid
      ? this.input.setAttribute("valid", "")
      : this.input.removeAttribute("valid");
  }
  get valid() {
    return this._valid;
  }
  get isValid() {
    return this._valid;
  }

  private _open: boolean = false;

  get isOpen() {
    return this._open;
  }
  set isOpen(val: boolean) {
    if (this._open == val) return;
    this.dropEl.classList.toggle("_open", val);
    this._open = val;

    const closeOnClickOutside = (e: Event) => {
      const isInsideInput =
        (e.target as HTMLElement)?.closest(".ui-input") == this.el;

      if (isInsideInput) return;
      this.isOpen = false;
      Dc.removeEventListener("click", closeOnClickOutside);
    };
    if (val) {
      Dc.removeEventListener("click", closeOnClickOutside);
      Dc.addEventListener("click", closeOnClickOutside);
    } else {
      Dc.removeEventListener("click", closeOnClickOutside);
    }
  }
  private _disabled = false;
  get disabled() {
    return this._disabled;
  }
  set disabled(val: boolean) {
    this.input.required = !val;
    if (val) {
      this.input.removeAttribute("required");
    } else {
      this.input.setAttribute("required", "");
    }

    this._disabled = val;
    this.valid = val;
    this.addressForm.checkValid();
  }
}

export function highlightText(str: string, substr: string) {
  if (!str || !substr) {
    return str;
  }
  const i = str.toLowerCase().indexOf(substr.toLowerCase());
  if (i == -1) {
    return str;
  }
  const endI = i + substr.length;
  const result = `${str.substring(0, i)}<b>${str.substring(
    i,
    endI
  )}</b>${str.substring(endI)}`;
  return result;
}
