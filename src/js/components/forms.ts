import JustValidate, {
  FieldInterface,
  GlobalConfigInterface,
} from "just-validate";

import {
  Rules,
  FieldRuleInterface,
  FieldsInterface,
  OnValidateCallbackInterface,
} from "just-validate";
import equalValues from "../shared/equalValues";
import { afterEventStop } from "../shared/afterEventStop";

// import { FieldRuleInterface, Rules } from "just-validate/dist/modules/interfaces";

export function grecaptchaScriptCheck() {
  return !!Qs('script[src*="www.google.com/recaptcha"]');
}

export function telMaskRu() {
  return new Inputmask({
    mask: ["+(7|375) (9{3}) 9{3}-9{2}-9{2}"],
    showMaskOnHover: false,
    keepStatic: false,
  });
}
export function telMaskByRu(opt?: Inputmask.Options) {
  //# Телефонная маска Россия и Беларусь
  return new Inputmask({
    ...opt,
    mask: ["+(7|375) (9{3}) 9{3}-9{2}-9{2}"],
    showMaskOnHover: false,
    keepStatic: false,
  });
}
export const plainRules = {
  name: [
    {
      errorMessage: "Вы не ввели Имя ",
      rule: Rules.Required,
    },
  ] as FieldRuleInterface[],
  login: [
    {
      errorMessage: "Вы не ввели Логин",
      rule: Rules.Required,
    },
    {
      validator: (val, context: FieldsInterface) => {
        return false;
      },
      errorMessage: "Введите номер телефона или почту",
    },
  ] as FieldRuleInterface[],
  required: [
    {
      errorMessage: "Это обязательное поле",
      rule: Rules.Required,
    },
  ] as FieldRuleInterface[],
  tel: [
    {
      errorMessage: "Вы не ввели Телефон",
      rule: Rules.Required,
    },
    {
      validator: (value) => {
        if (typeof value == "string") {
          const onlyNum = value.replace(/[^0-9]/g, "");
          return onlyNum.length >= 11;
        } else {
          return false;
        }
      },
      errorMessage: "Некорректный формат телефона",
    },
  ] as FieldRuleInterface[],
  email: [
    { rule: Rules.Email, errorMessage: "Некорректный формат e-mail" },
    {
      rule: Rules.Required,
      errorMessage: "Вы не ввели Email",
    },
  ] as FieldRuleInterface[],
  code: [
    {
      errorMessage: "Вы не ввели код",
      rule: Rules.Required,
    },
    {
      validator: (value) => {
        if (typeof value == "string") {
          const onlyNum = value.replace(/[^0-9.]/g, "");
          return onlyNum.length >= 4;
        } else {
          return false;
        }
      },
      errorMessage: "Введите код до конца",
    },
  ] as FieldRuleInterface[],
};

const sameValuesRules = (fields: HTMLInputElement[]) => {
  return [
    {
      errorMessage: "Повторите пароль",
      rule: Rules.Required,
    },
    {
      validator: (value) => {
        const eq = equalValues(fields.map((el) => el.value));
        return eq;
      },
      errorMessage: "Значения должны совпадать",
    },
  ] as FieldRuleInterface[];
};

export interface MyFormParams {
  initFields?: boolean;
  addRules?: Record<string, FieldRuleInterface[]>;
  jvAddParams?: Partial<GlobalConfigInterface> | undefined;
  plainFields?: boolean;
  validationIgnore?: string[];
  method?: string;
  msgFieldSel?: string;
}
const myFormDefOptions: MyFormParams = {
  initFields: true,
  plainFields: false,
  validationIgnore: [],
};
// FieldRuleInterface
// FieldConfigInterface
// форма с валидацией, коллбеками и разными приколами

export class MyForm {
  opt: MyFormParams;
  el: HTMLFormElement;
  jv: JustValidate;
  inputs: HTMLFormControlsCollection;
  action: string;
  errMsgField: HTMLElement | null;
  constructor(el: HTMLFormElement, params?: MyFormParams) {
    this.el = el;
    if (this.el.dataset.action === undefined) {
      console.error(this.el);
      throw new Error(`в форме выше не установлен data-action`);
    }
    this.action = this.el.dataset.action;
    this.opt = {
      ...myFormDefOptions,
      ...params,
    };
    this.inputs = el.elements;
    this.opt.method && (this.method = this.opt.method);
    this.jv = new JustValidate(el, {
      errorLabelCssClass: "ui-input__float-label ui-input__float-label_error",
      errorLabelStyle: {},
      errorFieldCssClass: "has-error",
      successFieldCssClass: "is-valid",
      validateBeforeSubmitting: true,
      focusInvalidField: false,
      lockForm: false,
      ...this.opt.jvAddParams,
    });
    this.jv.setCurrentLocale("ru");
    this.submitters = this.el.querySelectorAll(
      'button[type="submit"]'
    ) as NodeListOf<HTMLButtonElement>;
    this.initSubmitters();
    // this.jv.onFail((fields) => {
    //   console.log("validation failed");
    //   console.log(fields);
    // });

    this.jv.onSuccess((ev) => {
      // this.sendForm(ev as SubmitEvent);
      this.toggleSubmitters(true);
    });
    this.el.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendForm(e);
      return false;
    });
    if (this.opt.initFields) {
      this.setFields();
    }
    this.errMsgField = this.opt.msgFieldSel
      ? this.el.querySelector<HTMLElement>(this.opt.msgFieldSel)
      : null;
  }
  get formData() {
    return new FormData(this.el);
  }
  submitters: NodeListOf<HTMLButtonElement>;

  toggleSubmitters(enable: boolean) {
    this.submitters.forEach((btn) => {
      btn.disabled = !enable;
    });
  }
  private initSubmitters() {
    this.toggleSubmitters(false);
    this.jv.onValidate(({ isValid }) => {
      isValid != undefined && this.toggleSubmitters(isValid);
    });
  }
  method: string = "POST";

  sendForm(ev?: SubmitEvent) {
    fetch(this.action, {
      method: this.method,

      body: this.formData,
    })
      .then((res) => {
        if (res.ok) {
          this._sucClb(res, ev);
        } else {
          throw new Error("showErr Не удалось отправить форму");
        }
      })
      .catch((reason) => {
        this._falClb(reason);
      });
  }
  private _sucClb = (res: Response, event?: SubmitEvent) => {
    return res;
  };
  set onSuccess(clb: (res: Response, event?: SubmitEvent) => any) {
    this._sucClb = clb;
  }
  private _falClb = (reason: any) => {};
  set onPostFail(clb: (reason: any) => any) {
    this._falClb = clb;
  }
  setFields() {
    this.el.querySelectorAll("input").forEach((input, k, inputArr) => {
      if (
        this.opt.validationIgnore?.find((selector) => input.matches(selector))
      )
        return;
      if (this.opt.plainFields) {
        const rule = plainRules[input.name as keyof typeof plainRules];
        if (rule) {
          this.jv.addField(input, rule);

          if (input.name == "tel") {
            telMaskByRu().mask(input);
          }
          return;
        }

        if (input.name == "password-rep") {
          const pass = this.inputs.namedItem(
            "password"
          ) as HTMLInputElement | null;
          if (!pass)
            throw new Error("в форме есть password-rep, но нет password");
          this.jv.addField(input, sameValuesRules([pass, input]));
          return;
        }
      }
      if (this.opt.addRules) {
        const rule = this.opt.addRules[input.name];
        if (rule) {
          this.jv.addField(input, rule);
          return;
        }
      }
      if (input.hasAttribute("required")) {
        plainRules["required"] &&
          this.jv.addField(input, plainRules["required"]);
        return;
      } else {
        // обработка опционального поля
        input.addEventListener("paste", () => this.jv.revalidate());
        afterEventStop(input, "input", () => this.jv.revalidate());
      }
    });
  }
  showErrorMsg(msg = "При отправке формы произошла ошибка") {
    if (!this.errMsgField) {
      const newL = DcCrEl("div");

      newL.classList.add("form-error-label");
      this.errMsgField = this.el.appendChild(newL);
    }
    const span =
      this.errMsgField.querySelector("span") ||
      this.errMsgField.appendChild(DcCrEl("span"));
    span.innerHTML = msg;
    this.errMsgField.classList.add("_shown");
  }
  hideErrorMsg() {
    this.errMsgField?.classList.remove("_shown");
  }
}
// getUiInputErrLabel
export function getUiInputBlock(el: HTMLElement) {
  const parent = el.closest<HTMLElement>(".ui-input");
  if (!parent) throw new Error();
  return parent;
}
export function uiInputManualErrorRemove(elem: HTMLInputElement){
  getUiInputBlock(elem)?.querySelector('.ui-input__float-label_error')?.remove()
}
export function uiInputManualError({
  elem,
  isValid,
  errorMessage,
}: {
  elem: HTMLInputElement;
  isValid?: boolean;
  errorMessage?: string;
}) {
  const uiI = getUiInputBlock(elem);
  if (!isValid && !uiI.querySelector(".ui-input__float-label_error")) {
    const errorEl = DcCrEl("div");
    errorEl.classList.add(
      "ui-input__float-label",
      "ui-input__float-label_error",
      "just-validate-error-label"
    );
    errorEl.innerText = errorMessage || "Заполните поле";
    uiI.appendChild(errorEl);

    elem.addEventListener(
      "focus",
      () => {
        elem.classList.remove("has-error");
        errorEl.remove();
      },
      { once: true }
    );
  }
  !isValid && elem.classList.add("has-error");
  !isValid && uiI.classList.add("has-error");
  elem.scrollIntoView({
    inline: "center",
    block: "center",
  });
}
