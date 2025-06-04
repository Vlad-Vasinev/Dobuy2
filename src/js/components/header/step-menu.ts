import { App } from "../../_app";
import { unwrapTpl } from "../../shared/templates";
import { Modal, ModalOptions, ModalParams } from "./modal";

// ".step-menu";
// ".step-menu__head";
// ".step-menu__back";
// ".step-menu__title";
// ".step-menu__close";
// ".step-menu__body";

export interface StepMenuParams extends ModalParams {
  defaultStepSel?: string;
  selMainTpl?: string;
  selStep?: string;
  selBack?: string;
  init?: boolean;
}
export class StepMenuOptions extends ModalOptions {
  defaultStepSel?: string = "[default-step]";
  selMainTpl: string = ".tpl--step-menu";
  selStep: string = ".modal__step";
  selBack?: string = "[modal-back]";
  init = true;
}

export interface MenuStep {
  name?: string;
  el: HTMLElement;
}

export class ModalStepMenu extends Modal {
  backButtons?: NodeListOf<HTMLButtonElement>;
  defaultStep?: HTMLElement;
  override opt: StepMenuOptions = new StepMenuOptions();
  constructor(app: App, params?: StepMenuParams) {
    const options = { ...new StepMenuOptions(), ...params };
    super({ ...options });
    this.opt = options;

    const steps = this.getSteps();
    steps.length && this.opt.init && this.init();
  }

  steps: MenuStep[] = [];
  init() {
    if (!this.opt.selBack) throw new Error("не указан селектор");
    this.backButtons = this.el.querySelectorAll(this.opt.selBack);
    this.getDfltSteps();
    this.addStepsListeners();
    this.defaultStep && this.goToStep(this.defaultStep);
    this.el.classList.add("_inited");
  }
  getDfltSteps() {
    if (!this.opt.defaultStepSel) {
      throw new Error("");
    }
    const defaultStep = this.el.querySelector(
      this.opt.defaultStepSel
    ) as HTMLElement | null;
    if (defaultStep) {
      this.defaultStep = defaultStep;
    } else {
      if (this.steps[0]) {
        this.defaultStep = this.steps[0].el;
      }
    }
  }

  override close() {
    return super.close().then(() => {
      this.clearHistory();
      this.opt.on.afterClose && this.opt.on.afterClose(this);
    });
  }
  
  getSteps(sel = this.opt.selStep) {
    const steps: MenuStep[] = [];
    this.bodyEl.querySelectorAll(sel).forEach((el) => {
      const step = {
        name: el.getAttribute("step-name") || "",
        el: el as HTMLElement,
      };
      steps.push(step);
    });
    return steps;
  }
  addStepsListeners() {
    this.backButtons?.forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.goBack();
      })
    );
    this.initClose();
    this.el.querySelectorAll("[open-step]").forEach((el) => {
      const stepToOpenName = el.getAttribute("open-step");
      el.addEventListener("click", () => {
        stepToOpenName && this.goToStepByName(stepToOpenName);
      });
    });
  }
  stepHistory: HTMLElement[] = [];
  _prevStep?: Element;
  get prevStep(): Element | undefined {
    return this._prevStep;
  }
  set prevStep(el: Element | undefined) {
    this._prevStep && this._prevStep?.classList.remove("_prev");
    if (el) {
      el.classList.add("_prev");
      this._prevStep = el;
    } else {
      this._prevStep = el;
    }
  }
  _activeStep?: Element;
  get activeStep(): Element | undefined {
    return this._activeStep;
  }
  set activeStep(el: HTMLElement | undefined) {
    this._activeStep && this._activeStep?.classList.remove("_active");
    if (el) {
      el.classList.add("_active");
      this._activeStep = el;
      if (el.dataset && el.dataset.stepTitle) {
        this.title = el.dataset.stepTitle;
      }
    } else {
      this._activeStep = el;
    }
  }
  goToStepByName(stepName: string) {
    const step = this.getStepByName(stepName);
    step && this.goToStep(step);
  }
  getStepByName(stepName: string) {
    const step = this.bodyEl.querySelector<HTMLElement>(
      `[step-name="${stepName}"]`
    );
    if (!step) {
      console.error("can't find " + stepName);
      return;
    }
    return step;
  }

  goToStep(step: HTMLElement) {
    if (!step) {
      throw new Error("no such step");
    }

    if (this.stepHistory.length > 0) {
      const currentStep =
        this.stepHistory[Math.max(this.stepHistory.length - 1, 0)];
      if (currentStep == step) {
        return;
      }
      this.stepHistory.push(step);
      const nextStep =
        this.stepHistory[Math.max(this.stepHistory.length - 1, 0)];

      this.prevStep = currentStep;
      this.activeStep = nextStep;
    } else {
      this.stepHistory.push(step);
      const nextStep =
        this.stepHistory[Math.max(this.stepHistory.length - 1, 0)];
      this.activeStep = nextStep;
    }
    this.toggleBackBtn();
  }
  goBack() {
    if (this.stepHistory.length > 1) {
      const curr = this.stepHistory.pop();
      const prev = this.stepHistory[Math.max(this.stepHistory.length - 1, 0)];
      const prevPrev =
        this.stepHistory[Math.max(this.stepHistory.length - 2, 0)];

      this.activeStep = prev;
      this.prevStep = prev == prevPrev ? undefined : prevPrev;
    }
    this.toggleBackBtn();
  }
  clearHistory() {
    this.stepHistory = [];
    this.activeStep = undefined;
    this.prevStep = undefined;
    this.defaultStep && this.goToStep(this.defaultStep);
  }
  toggleBackBtn() {
    const isLast = this.stepHistory.length <= 1;
    if (
      this.backButtons &&
      this.backButtons[0] &&
      this.backButtons[0].disabled == !isLast
    )
      this.backButtons?.forEach((el) => {
        el.disabled = isLast;
      });
  }
  addStep(el: HTMLElement, name?: string) {
    const step = this.bodyEl.appendChild(el);
    this.steps.push({
      el: step,
    });

    return step;
  }
  
}
