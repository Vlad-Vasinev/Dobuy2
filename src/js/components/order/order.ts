import { App } from "../../_app";
import { isMobile } from "../../shared/check-viewport";
import trustedQS from "../../shared/trustedQS";
import {
  CartItemContent,
  genSummaryTable,
  CartConfig,
  OrderCost,
  genSummaryTableRow,
  dutyWarningBadge,
} from "../cart";
import {
  MyForm,
  getUiInputBlock,
  plainRules,
  uiInputManualError,
} from "../forms";

import { AddressPick } from "../address-input/addressInput";
import { FieldInterface, FieldRuleInterface, Rules } from "just-validate";
import { PriceTag } from "../product-card";
import { initCdekInOrder } from '../cdekWidget';

export function initOrder(app: App) {
  const el = Qs<HTMLFormElement>(".order");
  if (!el) return undefined;
  return new Order(app, el);
}
export class Order {
  el: HTMLFormElement;
  addressPick: AddressPick;
  summary: orderSummary;
  form: OrderForm;
  mobilePriceTag: PriceTag | undefined;
  cdekWidget: any;

  constructor(app: App, el: HTMLFormElement) {
    this.el = el;
    this.addressPick = new AddressPick(trustedQS(this.el, ".address-pick"));

    this.summary = new orderSummary(
      app,
      this,
      trustedQS(this.el, ".order-side .order-summary")
    );
    this.mobilePriceTag =
      (isMobile() &&
        new PriceTag(
          trustedQS(Dc.body, ".nav-mob.nav-mob_order .prod-price")
        )) ||
      undefined;

    this.el
    .querySelector<HTMLButtonElement>(".sale-banner_second .button_buy")
    ?.addEventListener("click", (e) => {
      if (!appConfig['chocolateId']) {return}

      app.components.cart.addItemById(appConfig['chocolateId'])
          .then((r) => {
            this.el.querySelectorAll('.sale-banner').forEach((el) => {
              el.style.setProperty("--sale-active", "none")
            })
          })
          .finally(() => {});
    });

    app.components.cart.onAfterUpdate = (c) => {

      if (appConfig['chocolateId']) {
        const isChocolateExist = c.items.filter(item => item.id === appConfig['chocolateId']).length;
        if (!isChocolateExist) {
          this.setChocolateBanner(c.orderCost.finalTotal);
        } else {
          this.el.querySelectorAll('.sale-banner').forEach((el) => {
            el.style.setProperty("--sale-active", "none")
          });
        }
      }
      this.summary.update(c);
      this.mobilePriceTag &&
        this.mobilePriceTag.fill({
          value: c.orderCost.finalTotal,
          discount: { old: c.orderCost.clearTotal, sale: c.orderCost.sumSale },
        });
    };
    let addRules: Record<string, FieldRuleInterface[]> | undefined = undefined;

    if (!this.addressPick.valid) {
      this.addressPick.addressInput.cityInputEl.removeAttribute("order-ignore");
      this.addressPick.addressInput.streetInputEl.removeAttribute(
        "order-ignore"
      );
      addRules = {
        "city-input": [
          {
            rule: Rules.Required,
            errorMessage: "Необходимо выбрать город",
          },
        ],
        "address-input": [
          {
            rule: Rules.Required,
            errorMessage: "Необходимо выбрать адрес",
          },
        ],
      };
    }
    this.form = new OrderForm(trustedQS(this.el, ".order-steps"), addRules);

    this.form.el.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      // console.log(this.addressPick.valid);

      if (target && target.parentNode && target.parentNode.parentNode) {
        if (
          target.parentNode.parentNode['classList'].contains('order-step__opt-crt-cdek') ||
          target.parentNode.parentNode['classList'].contains('order-step__opt-crt-mail') || 
          target.parentNode.parentNode['classList'].contains('order-step__opt-crt-emsDelivery')
        ) {
          this.summary.setDelivery();
        }
      }

      this.revalidate();
    });

    this.summary.submitBtn.addEventListener("click", () => {
      this.revalidate(true).then((valid) => {
        console.log(this.form.inputs);

        // const isEMS = this.el.querySelector('.order-step__opt-crt-mail')?.checked
        const isEMS = this.el.querySelector('.order-step__opt-crt-mail input')!['checked'];
        const isCdek = this.el.querySelector('.order-step__opt-crt-cdek input')!['checked'];
        let isEMSDelivery = undefined
        if(this.el.querySelector('.order-step__opt-crt-emsDelivery input')) {
          isEMSDelivery = this.el.querySelector('.order-step__opt-crt-emsDelivery input')!['checked'];
        }

        if (isEMS || isEMSDelivery) {
          const oldAddress = this.el.querySelector('.tabs .tabs__head ._active').classList.contains('old-address');
          const isSavedAddressesExits = this.el.querySelector('.address-select .address-select__crt');

          if (!oldAddress || !isSavedAddressesExits) {
            this.el.querySelector('.tabs .tabs__head [open-tab="select"]').classList.remove('_active');
            this.el.querySelector('.tabs .tabs__head [open-tab="input"]').classList.add('_active');
            this.el.querySelector('.tabs .tabs__body [tab-name="select"]').classList.remove('_active');
            this.el.querySelector('.tabs .tabs__body [tab-name="input"]').classList.add('_active');

            if (
                !this.form.inputs['address-input'].value.length ||
                !this.form.inputs['city-input'].value.length
            ) {
              if (!this.form.inputs['address-input'].value || this.form.inputs['address-input'].value.length <= 0) {
                this.form.inputs['address-input'].classList.add('has-error');
              } else {
                this.form.inputs['address-input'].classList.remove('has-error');
              }

              if (!this.form.inputs['city-input'].value || this.form.inputs['city-input'].value.length <= 0) {
                this.form.inputs['city-input'].classList.add('has-error');
              } else {
                this.form.inputs['city-input'].classList.remove('has-error');
              }

              app?.modules.snackBar.showError(
                  "Вы не заполнили обязательные поля!",
                  { time: 3000 }
              );

              return;
            }
          }
        }

        // if (isEMSDelivery) {
        //   const oldAddress = this.el.querySelector('.tabs-2 .tabs__head ._active').classList.contains('old-address');
        //   const isSavedAddressesExits = this.el.querySelector('.address-select-2 .address-select__crt');

        //   if (!oldAddress || !isSavedAddressesExits) {
        //     this.el.querySelector('.tabs-2 .tabs__head [open-tab="select"]').classList.remove('_active');
        //     this.el.querySelector('.tabs-2 .tabs__head [open-tab="input"]').classList.add('_active');
        //     this.el.querySelector('.tabs-2 .tabs__body [tab-name="select"]').classList.remove('_active');
        //     this.el.querySelector('.tabs-2 .tabs__body [tab-name="input"]').classList.add('_active');

        //     if (
        //         !this.form.inputs['address-input'].value.length ||
        //         !this.form.inputs['city-input'].value.length
        //     ) {
        //       if (!this.form.inputs['address-input'].value || this.form.inputs['address-input'].value.length <= 0) {
        //         this.form.inputs['address-input'].classList.add('has-error');
        //       } else {
        //         this.form.inputs['address-input'].classList.remove('has-error');
        //       }

        //       if (!this.form.inputs['city-input'].value || this.form.inputs['city-input'].value.length <= 0) {
        //         this.form.inputs['city-input'].classList.add('has-error');
        //       } else {
        //         this.form.inputs['city-input'].classList.remove('has-error');
        //       }

        //       app?.modules.snackBar.showError(
        //           "Вы не заполнили обязательные поля!",
        //           { time: 3000 }
        //       );

        //       return;
        //     }
        //   }
        // }

        if (isCdek) {
          const isCdekPvzExists =
              this.el.querySelector('.cdek-pvz input')!['value'] &&
              this.el.querySelector('.cdek-pvz input')!['value'].length > 0 &&
              this.el.querySelector('.cdek-address input')!['value'] &&
              this.el.querySelector('.cdek-address input')!['value'].length > 0;
          if (!isCdekPvzExists) {
            //Qs('.snackbar')?.classList.add('_active')
            app?.modules.snackBar.showError(
                "Пожалуйста выберите пункт выдачи CDEK",
                { time: 4000 }
            );
            // setTimeout(() => {
            //   Qs('.snackbar')?.classList.remove('_active')
            // }, 3000)

            return;
          }
        }

        if (valid) {
          this.form.sendForm();
        } else {
          app?.modules.snackBar.showError(
              "Вы не заполнили обязательные поля!",
              { time: 3000 }
          );
        }
      });
    });
    initCdekInOrder(this);

    this.revalidate();
  }
  private setChocolateBanner(totalPrice: string): void {
    const price = +totalPrice.split('₽')[0].replace(/ /g,'');

    if (price > appConfig['chocolatePrice']) {
      trustedQS(this.el, ".sale-banner.sale-banner_second").style.setProperty("--sale-active", "block")
      trustedQS(this.el, ".sale-banner.sale-banner_first").style.setProperty("--sale-active", "none")
    } else {
      trustedQS(this.el, ".sale-banner.sale-banner_second").style.setProperty("--sale-active", "none")
      trustedQS(this.el, ".sale-banner.sale-banner_first").style.setProperty("--sale-active", "block")
    }
  }
  revalidate(show = false) {
    return this.form.revalidate(show);
  }
}

class orderSummary {
  submitBtn: HTMLButtonElement;
  promoInput: PromoCodeInput;
  constructor(private app: App, private order: Order, public el: HTMLElement) {
    this.submitBtn = isMobile()
      ? Qs(".nav-mob .nav-btn") || trustedQS(el, 'button[name="submit-order"]')
      : trustedQS(el, 'button[name="submit-order"]');
    this.promoInput = new PromoCodeInput(
      app,
      trustedQS(this.el, ".ui-input_promocode")
    );
    app.components.cart.getConfig(true).then((c) => {
      if (c) {
        this.update(c);
        order.mobilePriceTag &&
          order.mobilePriceTag.fill({
            value: c.orderCost.finalTotal,
            discount: {
              old: c.orderCost.clearTotal,
              sale: c.orderCost.sumSale,
            },
          });
      }
    });
  }
  set isLoaded(val: boolean) {
    this.el.classList.toggle("_loaded", val);
  }
  private set isEmpty(val: boolean) {
    this.el.classList.toggle("_empty", val);
  }
  update(config: CartConfig) {
    this.isLoaded = false;
    const isEmpty = !config.items.length;
    this.isEmpty = isEmpty;
    this.order.form.isBlocked = isEmpty;
    if (isEmpty) {
      this.onCartEmpty();
      this.isLoaded = true;
      return;
    }

    this.setTable(config.orderCost);
    this.setDelivery();
    this.setCount(config.items.length);
    this.setGallery(config.items);
    this.setDutyWarning(config.dutyWarningBadge);

    config.promocode && this.setPromocode(config.promocode.code);
    this.isLoaded = true;
  }
  /**
   * Обновление плашки предупреждения о пошлине
   */
  setDutyWarning(dutyWarningBadge?: dutyWarningBadge) {

    const badgeEl = this.el.querySelector(".duty-badge");
    if (!badgeEl) {
      console.error(".duty-badge");
      return;
    }
    const valEl = badgeEl.querySelector(".duty-badge__val");
    if (!dutyWarningBadge || !valEl) {
      badgeEl.classList.toggle("display-none", true);
      console.error(".duty-badge__val");
      return;
    }
    valEl.textContent = dutyWarningBadge.val;
    badgeEl.classList.toggle("display-none", false);
  }
  setPromocode(code: string) {
    this.promoInput.value = code;
  }
  setTable(cost: OrderCost) {
    const newSp = genSummaryTable(cost);
    trustedQS(this.el, ".summary-price").replaceWith(newSp);

  }
  setDelivery() {
    const sp = trustedQS<HTMLTableElement>(this.el, ".summary-price");

    const isCdek = this.order.el.querySelector('.order-step__opt-crt-cdek input')!['checked'];
    const isEMS = this.order.el.querySelector('.order-step__opt-crt-mail input')!['checked'];
    //const emsDelivery = this.order.el.querySelector('.order-step__opt-crt-emsDelivery input')!['checked'];

    let emsDelivery = undefined
    if(this.order.el.querySelector('.order-step__opt-crt-emsDelivery input')) {
      emsDelivery = this.order.el.querySelector('.order-step__opt-crt-emsDelivery input')!['checked'];
    }

    if (isCdek) {
      const newRow = genSummaryTableRow({
        key: "Доставка",
        val: this.order.el.querySelector('.order-step__opt-crt-cdek .order-opt__name .h6')!.textContent!,
        class: "summary-price__delivery",
      });
      const delivery = sp.querySelector(".summary-price__delivery");
      if (delivery) {
        delivery.replaceWith(newRow);
      } else {
        sp?.tBodies[0].firstChild?.after(newRow);
      }
    }

    if (isEMS) {
      const newRow = genSummaryTableRow({
        key: "Доставка",
        val: this.order.el.querySelector('.order-step__opt-crt-mail .order-opt__name .h6')!.textContent!,
        class: "summary-price__delivery",
      });
      const delivery = sp.querySelector(".summary-price__delivery");
      if (delivery) {
        delivery.replaceWith(newRow);
      } else {
        sp?.tBodies[0].firstChild?.after(newRow);
      }
    }

    if (emsDelivery) {
      const newRow = genSummaryTableRow({
        key: "Доставка",
        val: this.order.el.querySelector('.order-step__opt-crt-emsDelivery .order-opt__name .h6')!.textContent!,
        class: "summary-price__delivery",
      });
      const delivery = sp.querySelector(".summary-price__delivery");
      if (delivery) {
        delivery.replaceWith(newRow);
      } else {
        sp?.tBodies[0].firstChild?.after(newRow);
      }
    }
  }

  onCartEmpty() {
    // console.log("cart is empty");
  }
  setCount(num: number) {
    const count = trustedQS(this.el, ".order-summary__items-count");
    count.innerText = num.toString();
  }
  setGallery(items: CartItemContent[]) {
    const getCard = (item: CartItemContent) => {
      const card = DcCrEl("a");
      card.classList.add("order-summary__product");
      if (item.href) {
        card.href = item.href;
      }
      if (item.images) {
        const img = card.appendChild(DcCrEl("img"));
        img.src = item.images[0];
      }
      if (item.amount > 1) {
        const amount = card.appendChild(DcCrEl("span"));
        amount.innerText = item.amount + "x";
      }
      return card;
    };

    const products = trustedQS(this.el, ".order-summary__products");
    products.innerHTML = "";

    products.append(...items.map((i) => getCard(i)));
  }
}

interface OrderPostResponse {
  // Устаревший вариант, сейчас в ответе приходит редирект
  order: {
    REDIRECT_URL: string;
    ID: string;
  };
}

// TODO доделать кейс когда пользователь начинает вводить адрес
// при наличии существующих и не вводит его до конца
class OrderForm extends MyForm {
  constructor(
    el: HTMLFormElement,
    addRules?: Record<string, FieldRuleInterface[]>
  ) {
    super(el, {
      initFields: false,
      plainFields: true,
      addRules,
      // validationIgnore: ["[order-ignore]"],
    });
    this.setFields();

    this.onSuccess = (response) => {
      // Обработка ответа на отправку заказа
      response.json().then((data: OrderPostResponse) => {
        try {
          location.href = data.order.REDIRECT_URL;
        } catch (error) {
          console.error("Не удалось выполнить переадресацию ");
          console.error(error);
          throw new Error("showErr Не удалось отправить заказ");
        }
      });
    };

    let clickCount = 0;
    let timer: NodeJS.Timeout | undefined;
    this.onPostFail = () => {
      clickCount++;
      if (clickCount === 1) {
        timer = setTimeout(() => (clickCount = 0), 3000);
      }

      if (clickCount >= 3) {
        clearTimeout(timer);
        // пятое нажатие
        app?.modules.snackBar.showError(
          "Ошибка отправки заказа. Пожалуйста, обратитесь в поддержку",
          { time: 5000 }
        );
        return;
      }
      app?.modules.snackBar.showError(
        "Не удалось разместить заказ. Пожалуйста, отключите VPN и попробуйте ещё раз",
        { time: 4000 }
      );
    };
  }
  set isBlocked(val: boolean) {
    this.el.classList.toggle("_blocked", val);
    Array.from(this.el.elements).forEach(
      (el) => ((el as HTMLInputElement).disabled = val)
    );
  }
  override get formData(): FormData {
    const ignoreArr = (
      Array.from(this.el.elements) as HTMLInputElement[]
    ).filter((el) =>
      el.matches("[order-ignore], fieldset[order-ignore], button")
    );

    ignoreArr.forEach((input) => {
      input.disabled = true;
    });
    const data = new FormData(this.el);
    ignoreArr.forEach((input) => {
      input.disabled = false;
    });

    return data;
  }
  revalidate(show = false) {
    return this.jv.revalidate().then((valid) => {
      if (!valid && show) {
        for (const key in this.jv.fields) {
          const element = this.jv.fields[key] as FieldInterface;
          if (!element.isValid) {
            uiInputManualError(element);
            return valid;
          }
        }
      }

      return valid;
    });
  }
}

interface PromocodeCheckData extends CartConfig {
  errMsg?: string;
}

class PromoCodeInput {
  el: HTMLElement;
  input: HTMLInputElement;
  submitArrow: HTMLElement;
  actionUrl: string;
  msgEl: HTMLDivElement;

  constructor(app: App, el: HTMLInputElement) {
    this.el = el;
    this.input = trustedQS(el, "input");
    this.actionUrl = this.el.dataset.action || "";
    if (!this.actionUrl)
      throw new Error("у поля ввода промокода не data-action");
    this.submitArrow = trustedQS(this.el, ".ui-input__arrow");

    this.submitArrow.addEventListener("click", async () => {
      app.components.cart.getConfig(false).then((config) => {
        if (!config)
          throw new Error("showErr При загрузке корзины произошла ошибка");
        if (
          config.promocode?.code.trim().toLocaleLowerCase() ==
          this.value.toLocaleLowerCase()
        ) {
          app?.modules.snackBar.showMsg("Этот промокод уже применён!");
          return;
        }

        this.sendRequest()?.then((result) => {
          if (!result) {
            app?.modules.snackBar.showError(
              "Ошибка: не удалось проверить промокод"
            );
            return;
          }

          app.components.cart.setConfig(result.data);

          this.msgShow(
            result?.ok,
            (!result.ok && result.data?.errMsg) || undefined
          );
        });
      });
    });

    this.msgEl = this.el.appendChild(DcCrEl("div"));
    this.msgEl.classList.add("ui-input__msg", "_hidden");
  }
  msgHide() {
    this.msgEl.classList.add("_hidden");
  }
  msgShow(ok: boolean, msg?: string | undefined) {
    this.msgEl.textContent = ok
      ? "Промокод применен"
      : msg || "ой, у нас нет такого промокода";
    const msgCL = this.msgEl.classList;
    if (ok) {
      msgCL.remove("ui-input__msg_error");
      msgCL.add("ui-input__msg_success");
    } else {
      msgCL.remove("ui-input__msg_success");
      msgCL.add("ui-input__msg_error");
    }
    msgCL.remove("_hidden");
  }
  get value() {
    return this.input.value.trim();
  }
  set value(val: string) {
    this.input.value = val;
  }
  sendRequest(): Promise<{
    ok: boolean;
    data: PromocodeCheckData;
  } | null> | null {
    // Если поле пустое - промокод должен обнуляться
    return fetch(this.actionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({ code: this.value }),
    })
      .then(async (r) => {
        return { data: await r.text(), ok: r.ok };
      })
      .then(({ data, ok }) => {
        if (data) {
          try {
            const resultData = JSON.parse(data);
            return { data: resultData, ok };
          } catch (err) {
            console.error("ошибка при применении промокода: ", err);
            return null;
          }
        }
        return null;
      });
  }
}