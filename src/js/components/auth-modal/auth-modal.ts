import Timer, { TimerParams } from "easytimer.js";
import { App } from "../../_app";
import { qsUnwrapTpl } from "../../shared/templates";
import { countdownTimer } from "../../shared/timers";
import trustedQS from "../../shared/trustedQS";
import { MyForm, getUiInputBlock, plainRules } from "../forms";
import { MenuStep, ModalStepMenu, StepMenuOptions } from "../header/step-menu";
import { LoginInput } from "./LoginInput";

class authModalOptions extends StepMenuOptions {
  innerTplSel: string = ".tpl--auth-modal";
}
//- РАЗДЕЛЫ
//- #Вход
//- step-name="auth"

//- #Восставновление пароля
//- step-name="password-recovery"

//- #Восставновление пароля - письмо отправлено
//- step-name="password-recovery-sended"

//- #Проверка кода
//- step-name="code-check"

//- #Регистрация
//- step-name="registration"

//- #Greetings
//- step-name="greetings"

export class AuthModal extends ModalStepMenu {
  override opt: authModalOptions;
  forms: {
    authForm?: AuthForm;
    codeForm?: CodeCheck;
  } = {};
  constructor(app: App) {
    const def = new authModalOptions();
    const options = {
      ...def,
      title: "",
      container: ".auth-modal",
      openTriggers: QsA("[auth-open]") || undefined,
      fromTemplate: true,
      on: {
        afterOpen: () => {
          this.afterAuthRedirect = undefined;
          if (this.openInitiator) {
            this.afterAuthRedirect = (
              this.openInitiator as HTMLElement
            ).dataset.afterAuthRedirect;
          }
        },
      },
    };

    super(app, options);

    this.opt = options;
    const inner = qsUnwrapTpl(this.opt.innerTplSel);

    this.el.replaceChild(inner, this.bodyEl);
    this.bodyEl = trustedQS(this.el, this.opt.selBody);

    this.steps = this.getSteps();
    this.init();

    this.steps.forEach((step) => {
      // ОБРАБОТКА ФОРМ РАЗДЕЛОВ
      switch (step.name) {
        case "auth": {
          const authForm = new AuthForm(trustedQS(step.el, ".auth-modal-form"));
          this.forms.authForm = authForm;
          authForm.onSuccess = async (res) => {
            authForm.hideErrorMsg();
            const data = (await res.json()) as {
              success: boolean;
              timeout?: number;
              message?: string;
            };
            if (data.success) {
              if (authForm.loginInput.type == "tel") {
                if (!this.forms.codeForm)
                  throw new Error("не удалось инициировать форму ввода кода");
                const codeForm = this.forms.codeForm;
                // установка телефона в поле "отправили код на"
                const step = this.getStepByName("code-check");
                step
                  ?.querySelectorAll(".auth-modal-form__entered-tel")
                  .forEach((el) => {
                    el.textContent = authForm.loginInput.val;
                  });
                // переход на проверку кода
                this.goToStepByName("code-check");
                //
                try {
                  const ac = new AbortController();
                  codeForm.el.addEventListener(
                    "submit",
                    () => {
                      ac.abort();
                    },
                    { once: true }
                  );
                  navigator.credentials
                    .get({
                      // @ts-ignore
                      otp: { transport: ["sms"] },
                      signal: ac.signal,
                    })
                    .then((otp) => {
                      if (otp) {
                        //@ts-ignore
                        codeForm.inputs.code.value = otp.code;
                        codeForm.inputs.code.dispatchEvent(new Event("input"));
                        codeForm.inputs.code.blur();
                        codeForm.el.submit();
                      } else {
                        throw new Error("otp is " + otp);
                      }
                    })
                    .catch((err) => {
                      console.info("Не получилось подставить код:");
                      console.info(err);
                    });
                } catch (error) {}
                // code for user icon is here
                // запуск таймера
                codeForm.startTimer(data.timeout);
              } else if (authForm.loginInput.type == "email") {
                this.afterAuth({ data });
              }
            } else {
              authForm.showErrorMsg(data.message || "Ошибка входа");
            }
          };

          break;
        }
        case "password-recovery": {
          const form = new MyForm(trustedQS(step.el, ".auth-modal-form"), {
            plainFields: true,
          });
          form.onSuccess = () => {
            this.goToStepByName("password-recovery-sended");
          };
          break;
        }
        case "code-check": {
          if (!this.forms.authForm?.inputs.login) {
            throw new Error("login form is not defined");
          }
          const codeForm = new CodeCheck(
            trustedQS(step.el, ".auth-modal-form"),
            this.forms.authForm.inputs.login,
            {
              onResend: () => {
                console.info("code re-sended");
                this.forms.authForm?.sendForm();
                codeForm.removeErrors();
              },
            }
          );
          this.forms.codeForm = codeForm;
          let lastCode = '';

          this.forms.codeForm.jv.onValidate(async () => {
            let valid: boolean = false;

            const delaySubmitOnChange = new Promise(
                (resolve) => {
                  valid = this.forms.codeForm!.jv.isFormValid()!;
                  codeForm.toggleSubmitters(valid);

                  setTimeout(() => {
                    if (valid && lastCode === codeForm.inputs.code.value) {
                      resolve(false);
                    }

                    resolve(valid);
                  }, 650);
                }
            );

            await delaySubmitOnChange.then((res: any) => {
              if (res) {
                lastCode = codeForm.inputs.code.value;
                if (codeForm.submitters && codeForm.submitters.length) {
                  codeForm.submitters[0].click();
                }
              }
            });

          });

          codeForm.onSuccess = async (data, event) => {
            this.afterAuth({
              data: await data.json(),
            });
          };
          codeForm.onPostFail = (res) => {
            console.error("При отправке кода произошла ошибка");
            console.error(res);
            codeForm.showError = "Неверный код, попробуйте еще раз";
          };
          break;
        }
        case "registration": {
          const regForm = new MyForm(trustedQS(step.el, ".auth-modal-form"), {
            plainFields: true,
            msgFieldSel: ".auth-modal-form__error-label",
          });
          regForm.onSuccess = (res) => {
            res.json().then((resp: { success: boolean; message?: string }) => {
              if (resp.success) {
                this.goToStepByName("greetings");
                this.opt.on.afterClose = () => {
                  location.reload();
                };
              } else {
                regForm.showErrorMsg(resp.message);
              }
            });
          };
          break;
        }
        default: {
          return;
          break;
        }
      }
    });
  }
  setSubtitle(msg: string) {
    // установить на странице входа подпись под заголовком
    const subT = this.defaultStep?.querySelector("p");
    if (subT) {
      const backupVal = subT.textContent;
      subT.textContent = msg;
      this.opt.on.afterClose = () => {
        subT.textContent = backupVal;
      };
    }
  }
  afterAuthRedirect?: string;
  private afterAuth(options: {
    data: { success: boolean };
    submitBtn?: HTMLButtonElement;
  }) {
    if (options.data.success) {
      this.afterAuthRedirect
        ? (window.location.href = this.afterAuthRedirect)
        : location.reload();
    }
  }
}

interface CodeCheckInputs extends HTMLFormControlsCollection {
  code: HTMLInputElement;
}
interface CodeCheckParams {
  onResend: () => void;
  time?: number;
}

class CodeCheck extends MyForm {
  private resendCodeBtn;
  override inputs: CodeCheckInputs;
  // Время таймера жизни кода
  timeout = 30;

  private _timerEl;
  private timer: Timer;
  private telInput;
  constructor(
    el: HTMLFormElement,
    telInput: HTMLInputElement,
    params: CodeCheckParams
  ) {
    super(el, {
      initFields: false,
      jvAddParams: {
        errorLabelCssClass: "ui-input__hidden-error",
      },
    });
    this.inputs = el.elements as CodeCheckInputs;
    this.telInput = telInput;
    this.jv.addField('[name="code"]', plainRules.code);

    this.resendCodeBtn = this.inputs.namedItem(
      "resend-code"
    ) as HTMLInputElement;
    if (!this.resendCodeBtn) throw new Error("у ввода кода нет resend-code");
    this.resendCodeBtn.disabled = true;
    this.resendCodeBtn.addEventListener("click", () => {
      params.onResend();
      this.toggleResendCodeVisible(false);
    });

    // TODO ПЕРЕДЕЛАТЬ ВЫВОД СООБЩЕНИЯ НА МЕТОДЕ MyForm
    const errEl = DcCrEl("div");
    errEl.classList.add("ui-input__bottom-error");

    this.errLabel = this.inputs.code?.closest(".ui-input")?.appendChild(errEl);
    //
    params.time && (this.timeout = params.time);
    this._resendCrt = trustedQS(this.el, ".auth-modal-form__resend-code");

    this._timerEl = trustedQS<Element>(this._resendCrt, ".timer");
    this.timer = countdownTimer(this._timerEl, {
      startValues: { seconds: this.timeout },
    });
    this.timer.on("targetAchieved", () => {
      console.info("Время жизни кода истекло");
      this.showError = "Время жизни кода истекло";
      this.toggleResendCodeVisible(true);
      this.timer.reset();
      this.timer.stop();
    });
  }

  private _resendCrt: HTMLElement;
  toggleResendCodeVisible(direction?: boolean) {
    this.resendCodeBtn.disabled = !direction;
    const buttonVisible = this._resendCrt.classList.toggle(
      "_switched",
      direction
    );
    if (!buttonVisible) {
      this.startTimer();
    }
  }
  startTimer(time?: number) {
    this.timer.start(time ? { startValues: { seconds: time } } : undefined);
  }

  errLabel?: HTMLElement;
  set showError(msg: string) {
    this.errLabel && (this.errLabel.textContent = msg);
  }
  removeErrors() {
    this.errLabel && (this.errLabel.textContent = "");
  }
  override get formData() {
    const data = new FormData(this.el);
    data.append("tel", this.telInput.value);
    return data;
  }
}

interface AuthFormInputs extends HTMLFormControlsCollection {
  login: HTMLInputElement;
  password: HTMLInputElement;
}

const getError = (el: Element) => {
  return { errorsContainer: getUiInputBlock(el) };
};

class AuthForm extends MyForm {
  override inputs: AuthFormInputs;

  private _passField: boolean = false;
  private _passVis: boolean = false;

  set showPassword(val: boolean) {
    this.passSect.classList.toggle("_hidden", !val);
    this._passVis = val;

    if (this._passVis && !this._passField) {
      this.jv.addField(
        this.inputs.password,
        plainRules.required,
        getError(this.inputs.password)
      );
      this._passField = true;
    } else if (!this._passVis && this._passField) {
      this.jv.removeField(this.inputs.password);
      this._passField = false;
    }
  }
  passSect: HTMLElement;
  loginInput: LoginInput;
  constructor(el: HTMLFormElement) {
    super(el, {
      initFields: false,
      msgFieldSel: ".auth-modal-form__error-label",
    });
    this.inputs = el.elements as AuthFormInputs;
    const pRules = plainRules;
    this.jv.addField(
      this.inputs.login,
      pRules.login,
      getError(this.inputs.login)
    );
    this.loginInput = new LoginInput(this.inputs.login, {
      onPhone: () => {
        this.jv.addField(
          this.inputs.login,
          pRules.tel,
          getError(this.inputs.login)
        );
        this.showPassword = false;
        this.jv.revalidateField(this.inputs.login);
      },
      onMail: () => {
        this.showPassword = true;
        this.jv.addField(
          this.inputs.login,
          pRules.email,
          getError(this.inputs.login)
        );
      },
      onClear: (input?: LoginInput) => {
        this.showPassword = false;
        this.jv.addField(
          this.inputs.login,
          pRules.login,
          getError(this.inputs.login)
        );
      },
    });

    // TODO перенести селектор в options
    this.passSect = this.inputs.password.closest(
      ".auth-modal-form__field"
    ) as HTMLElement;
  }

  override get formData() {
    const payload = new FormData();
    payload.append("login", this.loginInput.val);
    payload.append("type", this.loginInput.type || "undefined");
    this._passField && payload.append("password", this.inputs.password.value);
    return payload;
  }
}
