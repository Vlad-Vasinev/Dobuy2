import { Type } from "typescript";
import { disableScroll, enableScroll } from "../../shared/scroll";
import { qsUnwrapTpl, unwrapTpl } from "../../shared/templates";
import { ILazyLoadInstance } from "vanilla-lazyload";
import trustedQS from "../../shared/trustedQS";
import { transitionProm } from "../../shared/transition-promice";

import { isDesktop } from '../../shared/check-viewport';
import { isTablet } from '../../shared/check-viewport';

const header = trustedQS(document, ".header")
const hdrTop = document.querySelector<HTMLElement>('.hdr-top')
//const hdrBot = document.querySelector<HTMLElement>('.hdr-bot')

if(hdrTop) {
  let newTop = hdrTop?.offsetHeight + "px"
  header.style.setProperty('--hdrTop-Height', `${newTop}`)
}

// let newTop = hdrTop?.offsetHeight + "px" //ts

// header.style.setProperty('--hdrTop-Height', `${newTop}`)

type clb = (modal: Modal) => void;

export interface ModalParams {
  container?: string;
  openTriggers?: Element[] | NodeListOf<Element>;
  fromTemplate: boolean;
  replaceContainer?: boolean;
  //
  title?: string;

  //-- selectors
  selMainTpl?: string;
  selHead?: string;
  selTitle?: string;
  selClose?: string;
  selBody?: string;
  //-- callbacks
  on?: {
    afterInit?: clb;
    beforeOpen?: clb;
    afterOpen?: clb;
    beforeClose?: clb;
    afterClose?: clb;
    firstOpen?: clb;
  };
}

export class ModalOptions {
  container?: string;
  openTriggers?: Element[] | NodeListOf<Element>;
  fromTemplate: boolean = false;
  replaceContainer: boolean = true;
  //
  title: string = "";

  //-- selectors
  selMainTpl: string = ".tpl--modal";
  selHead: string = ".modal__head";
  selTitle: string = ".modal__title span";
  selClose: string = ".modal__close, [modal-close]";
  selBody: string = ".modal__body";
  //-- callbacks
  on: {
    afterInit?: clb;
    beforeOpen?: clb;
    afterOpen?: clb;
    beforeClose?: clb;
    afterClose?: clb;
    firstOpen?: clb;
  } = {};
}

export class Modal {
  el: HTMLElement;
  headEl?: HTMLElement;
  bodyEl: Element;
  closeBtns?: NodeListOf<Element>;
  titleEl?: HTMLElement;
  opt: ModalOptions;
  isOpen: boolean = false;

  constructor(params: ModalParams) {
    const def = new ModalOptions();
    this.opt = { ...def, ...params };
    if (!this.opt.container && this.opt.replaceContainer) {
      throw new Error(
        "для модального окна не указан контейнер, но указана замена контейнера"
      );
    }
    if (
      !this.opt.fromTemplate &&
      this.opt.replaceContainer &&
      this.opt.container
    ) {
      this.el = trustedQS(document, this.opt.container) as HTMLElement;
    } else {
      this.el = qsUnwrapTpl(this.opt.selMainTpl) as HTMLElement;
    }

    this.headEl =
      this.el.querySelector<HTMLElement>(this.opt.selHead) || undefined;
    this.titleEl =
      this.el.querySelector<HTMLElement>(this.opt.selTitle) || undefined;
    this.bodyEl = trustedQS(this.el, this.opt.selBody);

    if (this.opt.container && this.opt.replaceContainer) {
      const crt = Qs(this.opt.container);
      if (!crt) {
        throw Error("can't find modal container: " + this.opt.container);
      }

      for (let classToCopy of crt.classList.values()) {
        this.el.classList.add(classToCopy);
      }
      Object.assign(this.el.dataset, crt.dataset);

      crt.replaceWith(this.el);
    } else if (this.opt.fromTemplate && !this.opt.replaceContainer) {
      Dc.body.appendChild(this.el);
    }

    //
    if (this.opt.openTriggers) {
      this.setOpenTriggers(this.opt.openTriggers);
    }
    //
    if (this.opt.title) {
      //- TODO ДОБАВИТЬ ТАЙТЛ ЧЕРЕЗ ДАТА
      this.title = this.opt.title;
    }
    this.initClose();
    this.opt.on?.afterInit && this.opt.on.afterInit(this);
  }
  _title: string = "";
  get title() {
    return this._title;
  }
  set title(newTitle: string) {
    if (!this.titleEl) return;
    this._title = newTitle;
    this.titleEl.innerHTML = newTitle;
  }
  private _inOpenTransition = false;
  private _firstOpened: boolean = false;
  open(
    params: { closeActive?: boolean; disScroll?: boolean } = {
      closeActive: true,
      disScroll: true,
    }
  ) {
    
    if (this.isOpen || this._inOpenTransition)
      return new Promise((r) => r(false));

    this.isOpen = true;
    this._inOpenTransition = true;
    //
    if (!this._firstOpened) {
      this.opt.on?.firstOpen && this.opt.on.firstOpen(this);
      this._firstOpened = true;
    }
    //
    this.opt.on?.beforeOpen && this.opt.on.beforeOpen(this);
    (params.closeActive
      ? app.func.closeActiveModal().then(() => {
          app.activeModal = this;
        })
      : new Promise((r) => r(undefined))
    ).then(() => {
      return this.activateBg().then(() => {
        return transitionProm(this.el, () => {
          this.el.classList.add("_active");
          params?.disScroll && disableScroll();
        }).then(() => {
          this._inOpenTransition = false;
          this.opt.on?.afterOpen && this.opt.on.afterOpen(this);
        });
      });
    });
  }

  close(params?: { enScroll: boolean }) {
    if (!this.isOpen || this._inOpenTransition)
      return new Promise((r) => r(false));

    this.isOpen = false;
    this._inOpenTransition = true;
    return transitionProm(this.el, () => {
      this.el.classList.remove("_active");
    })
      .then(() => this.removeBg())
      .then(() => {
        app.activeModal = undefined;
        this._inOpenTransition = false;
        (params == undefined || params?.enScroll) && enableScroll();
        this.opt.on?.afterClose && this.opt.on.afterClose(this);
      });
  }
  openInitiator?: EventTarget;
  setOpenTriggers(items: Element[] | NodeListOf<Element>) {
    items.forEach((el) => {
      el.addEventListener("click", (e) => {
        // header.classList.add('side-modalOpen')
        this.openInitiator = e.currentTarget || undefined;
        this.open();
        //console.log(lastScrollTop)
      });
    });
  }
  initClose() {
    this.closeBtns = this.el.querySelectorAll(this.opt.selClose);
    this.closeBtns?.forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      })
    );
  }
  bgEl?: HTMLElement;
  private getBg() {
    const bgEl = DcCrEl("div");
    bgEl.classList.add("modal-background", "fixed-block");
    this.bgEl = this.el.parentElement?.insertBefore(bgEl, this.el);
    return this.bgEl;
  }
  async activateBg() {
    this.getBg();
    if (!this.bgEl) {
      return new Promise((r) => r(true));
    }

    return transitionProm(this.bgEl, () => {
      this.bgEl?.classList.add("_active");
    }).then(() => {
      this.bgEl?.addEventListener(
        "click",
        (e) => {
          this.close();
        },
        { once: true }
      );
    });
  }
  async removeBg() {
    if (!this.bgEl) {
      return new Promise((r) => r(true));
    }
    return transitionProm(this.bgEl, () => {
      this.bgEl?.classList.remove("_active");
    }).then(() => {
      this.bgEl?.remove();
    });
  }
}

export class MobileSheet extends Modal {
  constructor(xOpt?: ModalParams) {
    const options: ModalOptions = {
      ...new ModalOptions(),
      // container: 'body',
      fromTemplate: true,
      replaceContainer: false,
      ...xOpt
    };
    super(options);
    this.el?.classList.add("modal_sheet");
    Dc.body.appendChild(this.el);
  }
  open(){
    return super.open({closeActive: false, disScroll: false})
  }
}

if(isDesktop() || isTablet() && hdrTop) {
  let lastScrollTop = 0;
  window.addEventListener('scroll', () => {
    let currentScrollTop = window.scrollY;
    //header.classList.add('side-modalOpen')
    if (lastScrollTop <= 44) {
      header.classList.remove('side-modalOpen')
    }
    if (currentScrollTop > lastScrollTop) {
      header.classList.add('side-modalOpen')
    }
    lastScrollTop = currentScrollTop;
  });
}
// if(isDesktop() || isTablet() && hdrBot) {
//   let lastScrollTop = 0;
//   window.addEventListener('scroll', () => {
//     let currentScrollTop = window.scrollY;
//     //header.classList.add('side-modalOpen')
//     if (lastScrollTop <= 44) {
//       header.classList.remove('side-modalOpen')
//     }
//     if (currentScrollTop > lastScrollTop) {
//       header.classList.add('side-modalOpen')
//     }
//     lastScrollTop = currentScrollTop;
//   });
// }

//