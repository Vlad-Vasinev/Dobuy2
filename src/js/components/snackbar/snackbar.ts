import { qsUnwrapTpl } from "../../shared/templates";
import { transitionProm } from "../../shared/transition-promice";
import trustedQS from "../../shared/trustedQS";

import { disableScroll, enableScroll } from '../../shared/scroll';

const options = {
  fadeTimeOut: 2500,
};
type MsgTypes = "" | "error" | "copied" | "saved";

type MsgProductTypes = "cart" | "fav";
export interface prodMsg {
  img: string;
  desk: string;
}

interface MsgOpt {
  time?: number;
}
// Подумать про оптимизацию, есть дублирование кода

export class SnackBar {
  //el: Element;//start vlad's changes
  el: HTMLElement;
  //start vlad's changes
  crt: HTMLElement;
  constructor() {
    this.el = Dc.body.appendChild(qsUnwrapTpl(".tpl--snackbar--crt"));
    this.crt = trustedQS(this.el, ".snackbar__crt");
  }
  items: HTMLElement[] = [];
  get counter() {
    return this.items.length;
  }
  
  //start vlad's changes
  isOpen: boolean = false;
  transitionInProgress: boolean = false;
  //start vlad's changes

  private hideTimeout: NodeJS.Timeout | number | undefined;
  private que = new Promise<void>((r) => r());
  async showMsg(text?: string, type?: MsgTypes, opt?: MsgOpt) {
    this.el.classList.add("_active");
    clearTimeout(this.hideTimeout);
    return this.que.then(() => {
      this.shiftItems();
      const msg = qsUnwrapTpl(
        type ? `.tpl--snackbar--msg-${type}` : ".tpl--snackbar--msg"
      ) as HTMLElement;

      if (text) {
        const textCrt = msg.querySelector("[tpl-text]");
        if (!textCrt) {
          console.error("У макета уведомления нет элемента [tpl-text]");
          return this.que;
        }
        textCrt.innerHTML = text;
      }
      const newEl = this.crt.appendChild(msg);
      msg.dataset.msgOrder = this.counter.toString();
      this.items.push(newEl);

      this.hideTimeout = setTimeout(() => {
        this.removeMsgs();
      }, opt?.time || options.fadeTimeOut);

      return transitionProm(newEl, () => {
        newEl.classList.add("_active");
      });
    });
  }

  //start vlad's changes
  // isOpen: boolean = false;
  // transitionInProgress: boolean = false;

  // Коллбек отменяется если функция вызвана раньше, чем через секунду
  // setOpenTriggers(items: Element[] | NodeListOf<Element>) {
  //   this.items.forEach((el) => {
  //     el.addEventListener("click", () => {
  //       console.log('click on trigger')
  //       if (!this.isOpen) {
  //         this.open();
  //       } else {
  //         this.close();
  //       }
  //     });
  //   });
  // }
  private _firstOpened: boolean = false;

  async open() {
    if (this.isOpen || this.transitionInProgress)
      return new Promise((r) => r(false));
    this.transitionInProgress = true;
    this.isOpen = true;
    // Первое открытие
    if (!this._firstOpened) {
      //this.opt.on?.firstOpen && this.opt.on.firstOpen(this);
      this._firstOpened = true;
    }
    //
    return app.func
      .closeActiveModal()
      .then(() => {
        app.activeModal = this;
      })
      .then(() => {
        this.activateBg();
      })
      .then(() => {
        return transitionProm(this.el, () => {
          this.el.classList.add("_active");
        });
      })
      .then(() => {
        this.transitionInProgress = false;
      });
  }
  async close() {
    if (!this.isOpen || this.transitionInProgress)
      return new Promise((r) => r(false));
    this.transitionInProgress = true;
    this.isOpen = false;
    return transitionProm(this.el, () => {
      trustedQS(document, ".snackbar").classList.remove('_active')
      this.removeBg();
      trustedQS(document, ".modal.modal-side-right.cart-modal").classList.remove('_active')
      console.log('inside close func')
      this.el.classList.remove("_active");
    }).then(() => {
      this.transitionInProgress = false;
      app.activeModal = undefined;
    });
  }
  //
  bgEl?: HTMLElement;
  private getBg() {
    const bgEl = DcCrEl("div");
    bgEl.classList.add("hdr-drop-bg", "fixed-block");
    this.bgEl = Dc.body.insertBefore(bgEl, this.el);
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
          trustedQS(document, ".snackbar").classList.remove('_active')
          this.close();
          enableScroll()
          trustedQS(document, ".modal.modal-side-right.cart-modal").classList.remove('_active')
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
  //start vlad's changes

  showProduct(item: prodMsg, type: MsgProductTypes = "fav") {
    clearTimeout(this.hideTimeout);
    return this.que.then(() => {
      this.shiftItems();
      const msg = qsUnwrapTpl(`.tpl--snackbar--msg-${type}`) as HTMLElement;

      const img = msg.querySelector<HTMLImageElement>("[tpl-img]");
      img && (img.src = item.img);
      const desk = msg.querySelector("[tpl-text]");
      desk && (desk.textContent = item.desk);

      msg.dataset.msgOrder = this.counter.toString();
      const newEl = this.crt.appendChild(msg);
      this.items.push(newEl);

      //start vlad's changes
      trustedQS(document, ".snackbar").classList.add('_active')
      if(newEl.hasAttribute("cart-open")) {
        newEl.addEventListener('click', () => {
          if (!this.isOpen) {
            app.func.openCart();
            // disableScroll()
            // trustedQS(document, ".modal.modal-side-right.cart-modal").classList.add('_active')
            // this.open();
          }
        })
      }
      //start vlad's changes

      trustedQS(document, ".modal.modal-side-right.cart-modal .modal__close").addEventListener('click', () => {
        trustedQS(document, ".snackbar").classList.remove('_active')
        this.close();
        enableScroll()
        trustedQS(document, ".modal.modal-side-right.cart-modal").classList.remove('_active')
      })

      this.hideTimeout = setTimeout(() => {
        this.removeMsgs();
      }, options.fadeTimeOut);
      return transitionProm(newEl, () => {
        newEl.classList.add("_active");
      });
    });
  }
  removeMsgs() {
    if (!this.items.length) return this.que;
    this.que = this.que
      .then(() =>
        transitionProm(this.crt, () => {
          this.crt.classList.add("_hide");
          // setTimeout(() => {
          //   trustedQS(document, ".snackbar").classList.remove('_active')
          // }, 2700)
        }).then(() => {
          this.items.splice(0, this.items.length).forEach((el) => el.remove());
        })
      )
      .then(() => {
        this.crt.classList.remove("_hide");
        trustedQS(document, ".snackbar").classList.remove('_active')
        // сброс цепочки промисов, возможно не нужен
        // this.que = new Promise((r) => r());
      });
  }
  private shiftItems() {
    this.items.forEach((el, indx, arr) => {
      const coef = arr.length + 1 - (indx + 1);
      el.style.setProperty("--shiftCoeff", coef.toString());
      el.classList.remove("_active");
      el.classList.add("_backlog");
    });
  }
  showError(msg: string = "Произошла ошибка!", opt?: MsgOpt) {
    this.showMsg(msg, "error", opt);
  }

}
// .tpl--snackbar--crt
// .tpl--snackbar--msg
// .tpl--snackbar--msg-cart
// .tpl--snackbar--msg-fav
