import { App } from "../_app";
import { isMobile } from "../shared/check-viewport";
import navCounter from "../shared/navCounter";
import { spriteSvg } from "../shared/svg";
import { qsUnwrapTpl } from "../shared/templates";
import trustedQS from "../shared/trustedQS";
import { infoPopup } from "./UI/UI";
import { Modal, ModalOptions, MobileSheet } from "./header/modal";
import { PriceTag, ProductCard, ProductCardContent } from "./product-card";
import { prodMsg } from "./snackbar/snackbar";

class CartModalOptions extends ModalOptions {
  innerTplSel: string = ".tpl--cart";
  clearTotalSel: string = ".mini-cart__amount-item_clear";
  saleItemSel: string = ".mini-cart__amount-item_sale";
  finalTotalSel: string = ".mini-cart__amount-item_total";
  deliverySel: string = ".mini-cart__section_delivery";
  cardCrtSel: string = ".mini-cart__cards";
  delAllSel: string = ".mini-cart__delete-all";
  shareBasketBtn: string = ".mini-cart__share-all";
}

export interface OrderCost {
  clearTotal: string;
  sales?: {
    name: string;
    value: string;
    // свойство позволяет добавить к пункту popup, смотри
    popup?: string;
    popupText?: string;
  }[];
  extraPrices?: {
    name: string;
    value: string;
    popup?: string;
    popupText?: string;
  }[];
  sumSale?: string;
  finalTotal: string;
}
export type dutyWarningBadge = { val: string };

export interface CartConfig {
  freeDelivery: boolean;
  deliveryBadgeText?: string;
  orderCost: OrderCost;
  dutyWarningBadge?: dutyWarningBadge;
  items: CartItemContent[];
  promocode?: {
    code: string;
  };
}

// действия с корзиной
type cartActions =
  | "addItemToCart"
  | "changeItemAmount"
  | "deleteItem"
  | "deleteAllItems";

export class CartModal extends Modal {
  override opt: CartModalOptions;
  innerEl: Element;
  actionUrl: string;
  cardCrt: Element;
  sheet?: MobileSheet;

  config?: Promise<CartConfig | void>;
  app: App;
  navCounter: navCounter;
  deliveryEl?: HTMLElement;
  urlToCopy: string = '';
  constructor(app: App, params?: CartModalOptions) {
    const def = new CartModalOptions();
    const options = {
      ...def,
      title: "Корзина",
      container: ".cart-modal",
      openTriggers: QsA("[cart-open]") || undefined,
      fromTemplate: true,
      innerTplSel: params?.innerTplSel || def.innerTplSel,
    };
    super(options);
    this.opt = options;
    this.app = app;

    //-
    const innerEl = qsUnwrapTpl(this.opt.innerTplSel);
    this.innerEl = this.bodyEl.appendChild(innerEl);
    if (!this.el.dataset.action) {
      throw new Error("У корзины не указан action");
    }

    this.actionUrl = this.el.dataset.action;
    this.cardCrt = trustedQS(this.el, this.opt.cardCrtSel);
    this.initControls();
    this.navCounter = new navCounter("[cart-open] .icon-btn-count");
    this.deliveryEl =
      this.el.querySelector<HTMLElement>(this.opt.deliverySel) || undefined;
    this.opt.on.firstOpen = () => {
      this.config = this.getConfig();
      this.config.then((r) => r && this.setConfig(r));
    };

    this.el
      .querySelector<HTMLButtonElement>(".sale-banner_second .button_buy")
      ?.addEventListener("click", (e) => {
        if (!appConfig['chocolateId']) {return}

        this.addItemById(appConfig['chocolateId'])
            .then((r) => {
              // тут код скрыть баннеры
              this.el.querySelectorAll('.sale-banner').forEach((el) => {
                el.style.setProperty("--sale-active", "none")
              })
            })
            .finally(() => {});
      });
  }

  _loading: boolean = false;
  set loading(val) {
    this._loading = val;
    this.bodyEl.classList.toggle("_loading", val);
  }
  get loading() {
    return this._loading;
  }
  _empty: boolean = false;
  set empty(val) {
    this._empty = val;
    this.innerEl.classList.toggle("_empty", val);
  }
  get empty() {
    return this._empty;
  }
  itemsInCart: CartProductCard[] = [];
  delAllBtn?: HTMLButtonElement;
  //shareBasket?: HTMLButtonElement;
  private initControls() {
    this.delAllBtn = trustedQS<HTMLButtonElement>(this.el, this.opt.delAllSel);
    this.delAllBtn.addEventListener("click", () => {
      this.removeAllItems();
    });


    const shareBtn = this.el.querySelector('.mini-cart__share-all');
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(this.urlToCopy);
          app.modules.snackBar.showError(
              "Ссылка на корзину скопирована!",
              {time: 1500}
          );
        } catch (error) {
          console.error(error);
        }
      });
    }
    // this.shareBasket = trustedQS<HTMLButtonElement>(this.el, this.opt.shareBasketBtn);

    // if(this.el.querySelector('.mini-cart__share-all')) {

    //   this.shareBasket = trustedQS<HTMLButtonElement>(this.el, this.opt.shareBasketBtn);

    //   this.shareBasket.addEventListener("click", () => {

    //     const formData = new FormData();
    //     formData.append('getShareBasket', 'yes');
      
    //     const text = new ClipboardItem({
    //       "text/plain": fetch(location.pathname, {
    //       method: 'POST',
    //       body: formData
    //     })
    //       .then(response => response.text())
    //       .then(text => new Blob([text], { type: "text/plain" }))
    //     })

    //     console.log(typeof(text))

    //     navigator.clipboard.write([text])
        
    //   });
    // }

    // this.shareBasket.addEventListener("click", () => {
    //   console.log('click on share')
    //   app?.modules.snackBar.showError(
    //     "Ссылка на корзину скопирована!",
    //     { time: 3000 }
    //   );
    // });
  }
  private _onUpdate: Array<(config: CartConfig) => any> = [];

  set onAfterUpdate(cb: (config: CartConfig) => any) {
    this._onUpdate.push(cb);
  }
  private afterUpdate(config: CartConfig) {
    this._onUpdate.forEach((cb) => cb(config));
  }

  /**
   * Обновляет конфиг и устанавливает значения корзины
   */
  setConfig(newConfig: CartConfig) {
    this.setCart(newConfig);
    this.afterUpdate(newConfig);
    this.config = new Promise((resolve) => {
      resolve(newConfig);
    });
    return this.config;
  }
  getConfig(upd?: boolean) {
    if (this.config && !upd) {
      return this.config;
    }
    this.loading = true;
    this.config = fetch(this.actionUrl, {
      headers: new Headers({
        "ngrok-skip-browser-warning": "true",
      }),
    })
      .then((r) => r.json() as Promise<CartConfig>)
      .then((r) => {
        this.afterUpdate(r);
        return r;
      })
      .catch(() => {
        throw new Error("showErr There was an error loading the basket");
      });
    return this.config;
  }

  set toggleDelAllButton(val: boolean) {
    this?.delAllBtn?.classList.toggle("_active", val);
  }

  removeItem(id: string) {
    const index = this.itemsInCart.findIndex((i) => i.id == id);
    index != -1 && this.itemsInCart.splice(index, 1);
  }

  removeAllItems() {
    return this.itemsAction("deleteAllItems", {}).then((res) => {
      if (res.ok) {
        this.itemsInCart.forEach((item) => {
          item.remove();
        });
        this.itemsInCart = [];
        this.empty = true;
      }
    });
  }
  /**
   * Обновляет значения корзины
   */
  setCart(config: CartConfig) {
    this.empty = config.items.length == 0;
    this.toggleDelAllButton = !this.empty && config.items.length > 1;

    this.toggleDeliveryBadge(config.freeDelivery, config.deliveryBadgeText);
    this.setCost(config.orderCost);
    this.setDutyWarning(config.dutyWarningBadge);
    this.setCards(config.items);

    const cartElem = document.querySelector<HTMLElement>('.cart-modal');
    if(appConfig['chocolateId']) {
      const isChocolateExist = config.items.filter(item => item.id === appConfig['chocolateId']).length;
      // const cartElem = document.querySelector<HTMLElement>('.cart-modal');

      if (!isChocolateExist) {
        this.setChocolateBanner(config.orderCost.finalTotal);
      }
      else {
        if(cartElem) {
          trustedQS(cartElem, ".sale-banner.sale-banner_second").style.setProperty("--sale-active", "none")
          trustedQS(cartElem, ".sale-banner.sale-banner_first").style.setProperty("--sale-active", "none")
          // cartElem?.querySelectorAll('.sale-banner').forEach((el) => {
          //   el.style.setProperty("--sale-active", "none")
          // })
        }
      }
    }

    if (config.items.length > 0) {
      const formData = new FormData();
      formData.append('getShareBasket', 'yes');
      fetch(window.location.origin,
          {
            method: 'POST',
            body: formData
          })
          .then((res) => res.json())
          .then(({URL_FOR_FRIENDS}) => {
            if (URL_FOR_FRIENDS) {
              this.urlToCopy = URL_FOR_FRIENDS;
              const shareBtn = this.el.querySelector('.mini-cart__share-all');
              if (shareBtn) {
                shareBtn.style.opacity = '1';
              }
            }
          });
    }


    this.navCounter.set(() => config.items.reduce((t, i) => t + +i.amount, 0));

    this.app.func.updateLazy();
    this.loading = false;
  }

  private setChocolateBanner(totalPrice: string): void {
    const price = +totalPrice.split('₽')[0].replace(/ /g,'');

    if (price > appConfig['chocolatePrice']) {
      trustedQS(document, ".sale-banner.sale-banner_second").style.setProperty("--sale-active", "block")
      trustedQS(document, ".sale-banner.sale-banner_first").style.setProperty("--sale-active", "none")
    } else {
      trustedQS(document, ".sale-banner.sale-banner_second").style.setProperty("--sale-active", "none")
      trustedQS(document, ".sale-banner.sale-banner_first").style.setProperty("--sale-active", "block")
    }
  }

  /**
   * Обновление цены
   */
  private setCost(cost: OrderCost) {
    const sp = trustedQS(this.el, ".summary-price");
    sp.replaceWith(genSummaryTable(cost));
    // if(Number(cost.finalTotal) >= 50000) {
    //   console.log('finalTotal inside cart.ts setCost func')
    //   console.log(cost.finalTotal)
    //   console.log(typeof(cost.finalTotal))
    //   // trustedQS(document, ".sale-banner").style.setProperty("--sale-active", "block")
    // }
  }
  /**
   * Обновление карточек
   */
  private setCards(cards: CartItemContent[]) {
    if (!cards.length) {
      this.empty = true;
      return;
    }

    this.itemsInCart = cards.map((cardConf) => {
      const card = this.itemsInCart.find((el) => el.id == cardConf.id);

      if (card) {
        card.fillContent(cardConf);
        return card;
      } else {
        return this.addCard(cardConf);
      }
    });
    this.app.func.updateUi();
  }
  /**
   * Обновление плашки предупреждения о пошлине
   */
  setDutyWarning(dutyWarningBadge?: dutyWarningBadge) {
    const badgeEl = this.el.querySelector(".duty-badge");
    if (!badgeEl) {
      console.error("биба");
      return;
    }
    const valEl = badgeEl.querySelector(".duty-badge__val");
    if (!dutyWarningBadge || !valEl) {
      badgeEl.classList.toggle("display-none", true);
      console.error("биба");
      return;
    }
    valEl.textContent = dutyWarningBadge.val;
    badgeEl.classList.toggle("display-none", false);
  }
  async addItem(id: string, snackContent: prodMsg, options?: any) {
    return this.itemsAction("addItemToCart", {
      id: id,
      itemOptions: options,
    })
      .then((r) => {
        if (r.ok) {
          global.dataLayer?.push({
            ecommerce: {
              currencyCode: "RUB",
              add: {
                products: [
                  {
                    id: id,
                    name: snackContent.desk,
                    quantity: 1,
                  },
                ],
              },
            },
          });
          return r;
        } else {
          throw new Error("");
        }
      })
      .then(() => {
        snackContent
          ? app.modules.snackBar.showProduct(snackContent, "cart")
          : app.modules.snackBar.showMsg("Товар успешно добавлен в корзину");
      })
      .catch((err) => {
        //throw new Error("showErr Не удалось добавить товар в корзину");
        snackContent
          ? app.modules.snackBar.showProduct(snackContent, "cart")
          : app.modules.snackBar.showMsg("Товар успешно добавлен в корзину");
      });
  }
  async addItemById(id: string) {
    return this.itemsAction("addItemToCart", {
      id: id,
    })
        .then((r) => {
          if (r.ok) {
            global.dataLayer?.push({
              ecommerce: {
                currencyCode: "RUB",
                add: {
                  products: [
                    {
                      id: id,
                      name: '',
                      quantity: 1,
                    },
                  ],
                },
              },
            });
            return r;
          } else {
            throw new Error("");
          }
        })
        .then(() => {})
        .catch((err) => {throw new Error("showErr Не удалось добавить товар в корзину");});
  }
  private addCard(content: CartItemContent) {
    const card = new CartProductCard(this, content);
    this.cardCrt.appendChild(card.el);
    return card;
  }

  private _chain?: Promise<{
    ok: boolean;
    data: CartConfig;
    err?: Error;
  }>;

  async itemsAction(
    action: cartActions,
    item: {
      id?: string;
      amount?: number;
      itemOptions?: any;
    }
  ): Promise<{
    ok: boolean;
    data?: CartConfig;
    err?: Error;
  }> {
    const req = async () => {
      return fetch(this.actionUrl, {
        method: "POST",
        body: JSON.stringify({
          action: action,
          product: item,
        }),
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      })
        .then(async (r) => {
          const ok = r.ok;
          if (ok) {
            const data = (await r.json()) as CartConfig;
            this.setConfig(data);
            this.afterUpdate(data);
            return {
              ok,
              data,
            };
          } else {
            throw new Error("showErr произошла ошибка при обновлении корзины");
          }
        })
        .catch((err) => {
          console.error(err);
          return {
            ok: false,
            data: undefined,
            err,
          };
        })
        .finally(() => {
          this.loading = false;
          this._chain = undefined;
        });
    };

    this.loading = true;

    if (this._chain) {
      return this._chain.then(req);
    }

    return req();
  }
  deliveryBadge?: HTMLElement;
  toggleDeliveryBadge(badgeVal: boolean, badgeText?: string) {
    if (!this.deliveryEl) {
      console.error("There is no .mini-cart__section_delivery element in cart");
      return;
    }
    this.deliveryBadge?.remove();

    const sel = badgeVal
      ? ".tpl--cart--delivery-free"
      : ".tpl--cart--delivery-non-free";
    const newBadge = qsUnwrapTpl(sel);
    if (!newBadge) {
      console.error(sel, "не найден");
      return;
    }
    if (badgeText) {
      fnChain(
        () => newBadge.querySelector("span"),
        (innerSpan: HTMLElement | null) => {
          if (!innerSpan) {
            newBadge.innerHTML = badgeText;
            return newBadge;
          } else {
            innerSpan.innerHTML = badgeText;
            return innerSpan;
          }
        }
      );
    }

    this.deliveryBadge = this.deliveryEl?.appendChild(newBadge);
    console.log(this.deliveryBadge);
  }
}

export interface CartItemContent extends ProductCardContent {
  amount: number;
}

class CartProductCardOptions {
  itemTplSel = ".tpl--cart--prod-card";
  baseCl = ".prod-card";
  titleSel = this.baseCl + "__title span";
  btnsSel = this.baseCl + "__btns";
  delBtnSel = this.baseCl + "__delete";
  imageSel = this.baseCl + "__image";
  counterSel = this.baseCl + "__counter span";
  amountSel = ".amount-panel";
  priceSel = ".prod-price";
  optionsSel = this.baseCl + "__options";
}

// Карточка товара
class CartProductCard {
  //- TODO прокинуть вызов функции onChange на кнопке в модальном окне mobileSheet
  opt: CartProductCardOptions = new CartProductCardOptions();
  el: HTMLElement;
  price: PriceTag;
  amountPanel?: AmountPanel;
  id: string = "";

  constructor(cart: CartModal, public content: CartItemContent) {
    this.el = qsUnwrapTpl(this.opt.itemTplSel) as HTMLElement;

    this.price = new PriceTag(trustedQS(this.el, this.opt.priceSel));
    this.initBtns(cart, content);
    this.fillContent(content);
  }

  initBtns(cart: CartModal, content: CartItemContent) {
    const onChange = (id: string, val: number) => {
      return cart.itemsAction("changeItemAmount", {
        id: id,
        amount: val,
      });
    };
    const onDelete = (id: string) => {
      return cart
        .itemsAction("deleteItem", {
          id: id,
        })
        .then((res) => {
          if (res.ok) {
            global.dataLayer?.push({
              ecommerce: {
                currencyCode: "RUB",
                remove: {
                  products: [
                    {
                      id: id,
                      quantity: 1,
                    },
                  ],
                },
              },
            });
            cart.removeItem(id);
          }
          return res;
        });
    };

    if (isMobile()) {
      // на мобильном редактирование количества товара происходит в отдельном меню
      const optionBtn = trustedQS<HTMLButtonElement>(
        this.el,
        this.opt.optionsSel
      );

      optionBtn.addEventListener("click", (e) => {
        const sheet = new mobileCardOptionsSheet();
        //
        this.amountPanel = new AmountPanel(sheet.ap, {
          val: this.content.amount,
          onChange: (val) => {
            return onChange(this.id, val);
          },
        });
        sheet.deleteBtn.addEventListener("click", () => {
          onDelete(this.id).then(() => {
            sheet.close()?.then(() => {
              this.remove();
            });
          });
        });
        sheet.open();
      });
    } else {
      // на компе просто элемент
      this.amountPanel = new AmountPanel(
        trustedQS(this.el, this.opt.amountSel),
        {
          onChange: (val) => {
            return onChange(this.id, val);
          },
        }
      );
      trustedQS<Element>(this.el, this.opt.delBtnSel).addEventListener(
        "click",
        () => {
          onDelete(this.id).then((s) => {
            s && this.remove();
          });
        }
      );
    }
  }

  setCounter(val: number) {
    const counter = trustedQS<HTMLImageElement>(this.el, this.opt.counterSel);
    counter.textContent != val.toString() &&
      (counter.textContent = val.toString());
    counter.parentElement?.classList.toggle("_hidden", !(val > 1));
    return true;
  }
  setImg(src: string) {
    const img = trustedQS<HTMLImageElement>(this.el, this.opt.imageSel);
    img.dataset.src != src && !img.src && (img.dataset.src = src);
  }
  setTitle(title: string) {
    const titleEl = trustedQS<Element>(this.el, this.opt.titleSel);
    titleEl.textContent != title && (titleEl.textContent = title);
  }
  fillContent(content: CartItemContent) {
    //- добавить проверку на те же результаты
    this.content = content;
    content.id &&
      this.id != content.id &&
      (this.id = content.id) &&
      (this.el.dataset.itemId = content.id);

    content.href && this.fillHrefs(content.href);
    content.title && this.setTitle(content.title);
    content.price && this.price.fill(content.price);

    if (content.amount) {
      this.setCounter(content.amount);
      this.amountPanel && (this.amountPanel.val = content.amount);
    }

    content.images && this.setImg(content.images[0]);
    this.el?.classList.remove("prod-card_placeholder");
  }
  private fillHrefs(link: string) {
    QsAfE(
      "a",
      (el) => {
        el.setAttribute("href", link);
      },
      this.el
    );
  }
  remove() {
    this.el.remove();
  }
}
interface AmountPanelParams {
  val?: number;
  onChange: (val: number) => Promise<any>;
}
class AmountPanelOptions {
  constructor() {}
  baseCl = ".amount-panel";
  valSel = this.baseCl + "__val span";
  minusSel = this.baseCl + "__minus";
  plusSel = this.baseCl + "__plus";
}

//-ВЫНЕСТИ КЛАСС ИЗ ФАЙЛА
//-ДОБАВИТЬ ОГРАНИЧЕНИЯ ПО КОЛИЧЕСТВУ
//-ВОЗМОЖНО Добавить внутрь INPUT TYPE NUMBER
class AmountPanel {
  opt = new AmountPanelOptions();
  el: Element;
  valEl: Element;
  minusEl: HTMLButtonElement;
  plusEl: HTMLButtonElement;
  constructor(el: Element, params: AmountPanelParams) {
    this.el = el;
    this.valEl = trustedQS(el, this.opt.valSel);
    this.minusEl = trustedQS<HTMLButtonElement>(el, this.opt.minusSel);
    this.plusEl = trustedQS<HTMLButtonElement>(el, this.opt.plusSel);
    this.val = params?.val || 0;
    this.plusEl.addEventListener("click", (ev) => {
      this._onPlus(ev);

      params.onChange(this.val).then((s) => {
        !s && this._changeBack();
      });
    });
    this.minusEl.addEventListener("click", (ev) => {
      this._onMinus(ev);
      params?.onChange(this.val).then((s) => {
        !s && this._changeBack();
      });
    });
  }

  private _val: number = 0;
  get val() {
    return this._val;
  }
  set val(v: number) {
    if (this._val == v) return;
    const prev = this._val;
    this._val = Math.max(v, 0);
    this.valEl.textContent = `${this._val}`;
    if (this._val < 2) {
      this.toggleBtn(this.minusEl, false);
    } else {
      this.toggleBtn(this.minusEl, true);
    }
  }
  _prevVal = this.val;
  private _onPlus(ev: Event) {
    this._prevVal = this.val;
    this.val += 1;
  }
  private _onMinus(ev: Event) {
    this._prevVal = this.val;
    this.val -= 1;
  }
  private _changeBack() {
    this.val = this._prevVal;
  }
  toggleBtn(btn: HTMLButtonElement, en: boolean) {
    if (btn.disabled !== !en) {
      btn.disabled = !en;
    }
  }
}

class mobileCardOptionsSheet extends MobileSheet {
  ap: Element;
  deleteBtn: HTMLButtonElement;
  constructor() {
    super();
    const inner = this.bodyEl.appendChild(
      qsUnwrapTpl(".tpl--cart--mobile-card-options")
    );
    this.ap = trustedQS(inner, ".amount-panel");
    this.deleteBtn = trustedQS(inner, ".cart-item-options__delete");
  }
  override removeBg() {
    const prom = super.removeBg();
    return prom.then(() => {
      this.el.remove();
    });
  }
  override close() {
    return super.close({ enScroll: false });
  }
}

export function genSummaryTableRow(opt: {
  key: string;
  val: string;
  class?: string;
  popup?: string;
  popupText?: string;
}) {
  const tr = DcCrEl("tr");
  opt.class && tr.classList.add(opt.class);
  //
  const key = tr.appendChild(DcCrEl("td"));
  key.innerHTML = opt.key;
  //
  const val = tr.appendChild(DcCrEl("td"));
  val.innerHTML = opt.val;
  //
  // TODO добавить инструкцию как добавлять попапы
  //
  if (opt.popupText || opt.popup) {
    key.appendChild(spriteSvg("info"));
    if (opt.popupText) {
      infoPopup(key, "blank", opt.popupText);
    } else {
      infoPopup(key, opt.popup);
    }
  }
  //
  return tr;
}

export function genSummaryTable(config: OrderCost) {
  const table = DcCrEl("table");
  table.classList.add("summary-price");
  const tbody = table.appendChild(DcCrEl("tbody"));

  
  // if(Number(config.finalTotal) >= 50000) {
  //   console.log('finalTotal inside cart.ts genSummaryTable func')
  //   console.log(config.finalTotal)
  //   console.log(typeof(config.finalTotal))
  //   //trustedQS(document, ".sale-banner ").style.setProperty("--sale-active", "block")
  // }

  tbody.appendChild(
    genSummaryTableRow({
      key: "Сумма заказа",
      val: config.clearTotal,
      class: "summary-price__tr_clear",
    })
  );
  config.extraPrices?.forEach((el) => {
    tbody.appendChild(
      genSummaryTableRow({
        key: el.name,
        val: el.value,
        class: "summary-price__tr_clear",
        popup: el.popup || undefined,
        popupText: el.popupText,
      })
    );
  });
  config.sales?.forEach((el) => {
    tbody.appendChild(
      genSummaryTableRow({
        key: el.name,
        val: el.value,
        class: "summary-price__tr_sale",
        popup: el.popup || undefined,
        popupText: el.popupText,
      })
    );
  });
  tbody.appendChild(
    genSummaryTableRow({
      key: "Итого",
      val: config.finalTotal,
      class: "summary-price__tr_total",
    })
    
  );
  return table;
}
