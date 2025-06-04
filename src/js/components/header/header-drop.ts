import {
  ProductCard,
  ProductCardContent,
  ProductCardParams,
} from "../product-card";
import { App } from "../../_app";
import { transitionProm } from "../../shared/transition-promice";
import trustedQS from "../../shared/trustedQS";
import { infoPopupsInit } from '../UI/UI';

type clb = (drop: headerDrop) => void;

export interface headerDropOptions {
  mainSel: string;
  openTriggers: Element[] | NodeListOf<Element> | undefined;
  cardsCtrSel: string;
  on: {
    firstOpen?: clb;
  };
}

export interface headerDropParams {
  mainSel?: string;
  openTriggers?: Element[] | NodeListOf<Element>;
  on?: {
    firstOpen?: clb;
  };
}

export class headerDrop {
  opt: headerDropOptions;
  dropEl: HTMLElement;
  headerEl: HTMLElement;
  cardsCtr?: HTMLElement;
  cardSection?: CardSection;
  constructor(app: App, params: headerDropParams = {}) {
    this.opt = {
      mainSel: "",
      openTriggers: undefined,
      cardsCtrSel: ".hdr-drop__cards",
      on: {},
      ...params,
    };
    this.dropEl = trustedQS(document, this.opt.mainSel);
    this.headerEl = trustedQS(document, ".header");
    this.cardsCtr =
      this.dropEl.querySelector(this.opt.cardsCtrSel) || undefined;
    if (this.cardsCtr) {
      this.cardSection = new CardSection(app, this.cardsCtr);
    }
    if (this.opt.openTriggers) {
      this.setOpenTriggers(this.opt.openTriggers);
    }
  }
  isOpen: boolean = false;
  transitionInProgress: boolean = false;

  // Коллбек отменяется если функция вызвана раньше, чем через секунду
  setOpenTriggers(items: Element[] | NodeListOf<Element>) {
    items.forEach((el) => {
      el.addEventListener("click", () => {
        if (!this.isOpen) {
          this.open();
        } else {
          this.close();
        }
      });
    });
  }
  private _firstOpened: boolean = false;

  async open() {
    if (this.isOpen || this.transitionInProgress)
      return new Promise((r) => r(false));
    this.transitionInProgress = true;
    this.isOpen = true;
    // Первое открытие
    if (!this._firstOpened) {
      this.opt.on?.firstOpen && this.opt.on.firstOpen(this);
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
        return transitionProm(this.dropEl, () => {
          this.dropEl.classList.add("_active");
        });
      })
      .then(() => {
        // // закрыть дроп при нажатии за его приделами
        // const closeOnClickOutside = ((e: Event) => {
        //   e.stopPropagation();
        //   if ((e.target as Element).closest(this.opt.mainSel)) {
        //     return;
        //   }
        //   Dc.removeEventListener("click", closeOnClickOutside);
        //   this.close();
        // }).bind(this);
        // Dc.addEventListener("click", closeOnClickOutside);
        // //
        this.transitionInProgress = false;
      });
  }
  async close() {
    if (!this.isOpen || this.transitionInProgress)
      return new Promise((r) => r(false));
    this.transitionInProgress = true;
    this.isOpen = false;
    return transitionProm(this.dropEl, () => {
      this.removeBg();
      this.dropEl.classList.remove("_active");
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
    this.bgEl = Dc.body.insertBefore(bgEl, this.headerEl);
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

// export class multiLevelList {
//   constructor() {}
// }
interface CardSectionParams {}

export class CardSection {
  cardsCtr: HTMLElement;
  opt?: CardSectionParams;
  app: App;
  constructor(app: App, container: HTMLElement, opt?: CardSectionParams) {
    this.cardsCtr = container;
    this.app = app;

    if (opt) {
      this.opt = opt;
    }
  }
  // Задержка до загрузки, чтобы при хаотичном наведении не выполнялись лишние запросы
  cardFetchTimeoutTime: number = 250;
  cardFetchTimeout: NodeJS.Timeout | number | undefined;
  productCards: Array<ProductCard | undefined> = [];

  clearCardsSection() {
    this.cardsCtr && (this.cardsCtr.innerHTML = "");
  }
  fillCardsSection(productUrls: string[], params?: ProductCardParams) {
    clearTimeout(this.cardFetchTimeout);
    return new Promise<number>((resolve, reject) => {
      this.cardFetchTimeout = setTimeout(
        async (productUrls: string[]) => {
          this.productCards.forEach((card) => card?.destroy());
          this.productCards = [];

          const productsPromArr = productUrls
            .map((url) => fetch(url));
          Promise.all(productsPromArr)
            .then((responses) =>
              Promise.all(
                responses.map(async (r) => {
                  return r.json().catch(() => undefined);
                })
              )
            )
            .then((cardsParams: Array<ProductCardContent | undefined>) => {
              cardsParams.forEach((content) => {
                if (!content) return;
                const card = new ProductCard(this.app, params);
                if (card.el) {
                  this.cardsCtr?.appendChild(card.el);
                }
                this.productCards.push(card);

                card.fillContent(content);
              });
              // обновление UI
              this.cardsCtr && infoPopupsInit(this.cardsCtr)
              this.app.func.updateLazy();
              resolve(cardsParams.length);
            });
        },
        this.cardFetchTimeoutTime,
        productUrls
      );
    });
  }
}
