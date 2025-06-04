import { telMaskByRu } from "../forms";

export class LoginInput {
  el: HTMLInputElement;
  telMask: Inputmask.Instance;
  opt: LoginInputParams;
  type: string | undefined;
  get val() {
    return this.el.value;
  }
  set val(val: string) {
    this.el.value = val;
    this.el.dispatchEvent(new Event("input"));
    this.el?.parentElement?.classList.toggle("is-focused", !!this.el.value);
  }
  constructor(el: HTMLInputElement, opt: LoginInputParams) {
    this.el = el;
    this.opt = opt;
    this.telMask = telMaskByRu({
      oncleared: () => {
        this.removeMask();
        this.onClear();
      },
    });
    this.addIdentifier();
    el.addEventListener("input", (e) => {
      //включать определение при очистке
      const event = e as InputEvent;

      if (event.inputType?.search("delete") == -1) {
        return;
      }
      const target = event.target as HTMLInputElement;
      if (target.value == "") {
        this.onClear();
      }
    });
    el.addEventListener("paste", this.identifyInputType);
  }
  set inputTitle(val: string) {
    const titleEl = this.el
      .closest(".ui-input")
      ?.querySelector(".ui-input__float-label");
    (titleEl && (titleEl.textContent = val)) ||
      console.error("can't find input title");
  }
  setPhoneType() {
    this.el.setAttribute("type", "tel");
    this.type = "tel";
    this.inputTitle = "Введите свой телефон";

    this.telMask.mask(this.el);
    this.opt.onPhone(this);
  }
  setMailType() {
    this.el.setAttribute("type", "mail");
    this.type = "email";
    this.inputTitle = "Введите свой email";
    this.opt.onMail(this);
  }
  identifyInputType = this._identifyInputType.bind(this);
  private _identifyInputType(event: Event) {
    const e = event as InputEvent | ClipboardEvent;
    const target = e.target as HTMLInputElement;
    let val;
    if (e.type == "paste" && e instanceof ClipboardEvent) {
      const data = e.clipboardData;
      if (!data) return;
      const text = data.getData("text");
      if(!text) return
      val = text

      // val = e;
    } else {
      val = target.value;
    }
    if (!val) {
      return;
    }
    val = val.trim();
    
    if (val.startsWith("+") || /[0-9]{11,13}/.test(val)) {
      val.startsWith("8") && (target.value = val.replace("8", "+7"));
      val.startsWith("375") && (target.value = val.replace("375", "+3"));
      this.setPhoneType();
      this.removeIdentifier();
    } else if (/[a-zA-Z]+/.test(val) || val.search("@") >= 0) {
      this.setMailType();
      this.removeIdentifier();
    }
  }
  addIdentifier() {
    this.el.addEventListener("input", this.identifyInputType);
  }
  removeIdentifier() {
    this.el.removeEventListener("input", this.identifyInputType);
  }
  removeMask() {
    this.el.inputmask?.remove();
  }
  onClear() {
    this.el.setAttribute("type", "text");
    this.type = undefined;
    this.inputTitle = "Введите телефон или e–mail";
    this.addIdentifier();
    this.opt.onClear(this);
  }
}
export interface LoginInputParams {
  onPhone: (input?: LoginInput) => void;
  onMail: (input?: LoginInput) => void;
  onClear: (input?: LoginInput) => void;
}
