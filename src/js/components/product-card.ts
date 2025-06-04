import Swiper from "swiper";
import { qsUnwrapTpl, unwrapTpl } from "../shared/templates";

import { isMobile } from "../shared/check-viewport";
import trustedQS from "../shared/trustedQS";
import { App } from "../_app";
import { replaceIcon } from "../shared/replaceSpriteIcon";
import productCardSlider from "./sliders/slider-product-card";

export async function prodCardInit(app: App) {
  QsAfE(
    ".prod-card:not(.prod-card_inited):not(.prod-card_static)",
    (el) => new ProductCard(app, { el: el as HTMLElement })
  );

  // Удаляем ненужные слайды, смотри sliderToStatic и ProductCard.initSlider
  const vars = cachedVars["prodCardSlidesToDelete"] as DocumentFragment;
  vars?.childNodes.forEach((el) => {
    el.remove();
  });
}

function sliderToStatic(el: HTMLElement) {
  // Удалить ненужные слайды из карточки и сделать первую картинку
  // ленивой независимо от слайдера карточки
  if (!cachedVars["prodCardSlidesToDelete"]) {
    cachedVars["prodCardSlidesToDelete"] = Dc.createDocumentFragment();
  }
  const fragment = cachedVars["prodCardSlidesToDelete"] as DocumentFragment;

  const slides = el.querySelectorAll(
    ".prod-card-slider__wrapper .prod-card-slider__slide"
  );
  if (slides.length) {
    const img = slides[0].querySelector("img");
    if (!img) return;
    img.setAttribute("lazy", "");

    const toDel = Array.from(slides).slice(1);
    toDel.length && fragment.append(...toDel);
  } else {
    return;
  }
}

export type Badge = {
  type: "new" | "hit" | "img" | string;
  val: string;
};

export interface ProductCardContent {
  id?: string;
  title?: string;
  href?: string;
  price?: {
    value: string;
    discount?: {
      old: string;
      sale?: string;
      dutySale?: string;
    };
  };
  badges?: Badge[];
  images?: string[];
}

export interface ProductCardParams {
  // если нужно активировать карточку из готовой вёрстки
  el?: HTMLElement;
  // заполнить карточку контентом сразу
  content?: ProductCardContent;
  // дополнительные классы
  addClasses?: string[];
  // инициализировать ли слайдер
  slider?: boolean;
  // инициализировать кнопки корзины и лайка
  buttons?: boolean;
}

export class ProductCard {
  baseClass = ".prod-card";
  elements = {
    badgesCtr: this.baseClass + "__badges",
    gallery: this.baseClass + "__gallery",
    title: this.baseClass + "__title span",
    btns: this.baseClass + "__btns",
    image: this.baseClass + "__image",
    price: ".prod-price",
  };
  content?: ProductCardContent;
  el: HTMLElement;
  sliderEl?: HTMLElement;
  price: PriceTag;
  params?: ProductCardParams;
  app: App;
  id?: string;
  constructor(app: App, params?: ProductCardParams) {
    this.params = {
      slider: true,
      buttons: true,
      ...params,
    };
    this.app = app;
    if (
      this.params?.el &&
      !this.params.el.classList.contains("prod-card_inited")
    ) {
      this.el = this.params.el;
    } else {
      this.el = qsUnwrapTpl(".tpl--prod-card") as HTMLElement;
    }
    if (this.params?.addClasses) {
      this.params.addClasses.forEach((cl) => {
        this.el.classList.add(cl);
      });
    }

    if (this.params?.content) {
      this.fillContent(this.params?.content);
    } else if (!this.params?.el) {
      this.placeholder = true;
    }
    if (this.params?.el) {
      this.id = this.el.dataset.itemId;
    }
    if (this.params?.el && this.params?.slider) {
      this.sliderEl = this.el.querySelector(".prod-card-slider") || undefined;
      this.sliderEl && this.initSlider();
    }

    this.price = new PriceTag(trustedQS(this.el, this.elements.price));
    this.params.buttons && this.initButtons(app);
    this.inited = true;
  }
  _inited: boolean = false;
  set inited(val) {
    this._inited = val;
    this.el.classList.toggle("prod-card_inited", this._inited);
  }
  get inited() {
    return this._inited || this.el.classList.contains("prod-card_inited");
  }
  _filled: boolean = false;
  set filled(val) {
    this._filled = val;
    this.el.classList.toggle("prod-card_filled", this._filled);
  }
  get filled() {
    return this._filled || this.el.classList.contains("prod-card_filled");
  }
  _placeholder: boolean = false;
  set placeholder(val: boolean) {
    this._placeholder = val;
    this.el.classList.toggle("prod-card_placeholder", this._placeholder);
  }
  get placeholder() {
    return (
      this._placeholder || this.el.classList.contains("prod-card_placeholder")
    );
  }
  initButtons(app: App) {
    const btnsCrt = this.el.querySelector(this.elements.btns);
    if (btnsCrt) {
      // button_buy button_heart

      btnsCrt
        .querySelector<HTMLButtonElement>(".button_buy")
        ?.addEventListener("click", (e) => {
          if (!this.id) {
            console.error("У карточки не указан id", this.el);
            throw new Error("showErr Не удалось добавить товар в корзину");
          }
          const target = (e.target as Element)?.closest<HTMLButtonElement>(
            ".button_buy"
          );
          target && (target.disabled = true);
          this.app.func
            .addItemToCart(this.id, getCardContent(this))
            .then((r) => {
              target && replaceIcon(target, "cart-check");
              target?.classList.add("_active");
              return r;
            })
            .finally(() => {
              target && (target.disabled = false);
            });
        });
      btnsCrt
        .querySelector(".button_heart")
        ?.addEventListener("click", (event) => {
          const target = event.currentTarget as HTMLButtonElement;

          if (!this.id) {
            console.error("Не удалось получить id карточки");
            return;
          }

          app.components.favs.toggleFav(target, this.id, getCardContent(this));
        });
    }
  }
  fillContent(content: ProductCardContent) {
    content.id &&
      (this.id = content.id) &&
      (this.el.dataset.itemId = content.id);
    content.href && this.fillHrefs(content.href);
    content.title && this.fillTitle(content.title);
    content.badges && this.fillBadges(content.badges);
    content.price && this.fillPrice(content.price);
    content.images && this.fillGallery(content.images);
    this.params?.slider && this.initSlider();
    this.placeholder = false;
    this.inited = true;
  }
  private fillHrefs(link: string) {
    this.el.querySelectorAll("a").forEach((el) => {
      el.setAttribute("href", link);
    });
  }
  private fillTitle(title: string) {
    if (!this.el) {
      return;
    }
    const span = this.el.querySelector<HTMLElement>(this.elements.title);
    if (span) {
      span.innerText = title;
    }
  }
  private fillBadges(badges: Badge[]) {
    if (!this.el) {
      return;
    }
    const ctr = this.el.querySelector<HTMLElement>(this.elements.badgesCtr);
    if (ctr) {
      badges.forEach((badgeItem) => {
        const badge = DcCrEl("div");
        badge.classList.add("badge", `badge_${badgeItem.type}`);
        //! если картинка - подставляем src вместо текста..
        //! . если добавятся ещё типы бейджей (например с видео)..
        //! . - переделать на switch
        if (badgeItem.type == "img") {
          fnChain(
            () => DcCrEl("img"),
            (el) => {
              el.setAttribute("src", badgeItem.val);
              el.setAttribute("alt", "");
              return el;
            }
          );
        } else {
          badge.innerText = badgeItem.val;
        }
        ctr.appendChild(badge);
      });
    }
  }
  private fillPrice(price: PriceParams) {
    this.price.fill(price);
  }

  private fillGallery(images: string[]) {
    const gallery = trustedQS(this.el, this.elements.gallery);

    if (this.params?.slider) {
      const tplSlider = Qs<HTMLTemplateElement>(".tpl--prod-card-slider");
      const tplSlide = Qs<HTMLTemplateElement>(".tpl--prod-card-slider-slide");
      if (!tplSlider || !tplSlide) {
        return;
      }
      const slider = unwrapTpl(tplSlider);
      if (!slider) {
        return;
      }

      const wrapper = slider.querySelector(".prod-card-slider__wrapper");
      images.forEach((el) => {
        const slide = unwrapTpl(tplSlide) as HTMLImageElement;
        const img = slide.querySelector("img");
        if (img) {
          img.dataset.src = el;
          wrapper?.appendChild(slide);
        }
      });

      this.sliderEl = gallery.appendChild(slider) as HTMLElement;
    } else {
      const img = DcCrEl("img");
      img.classList.add("prod-card__image");
      img.setAttribute("lazy", "");
      if (images.length) {
        img.dataset.src = images[0];
      }
      gallery.appendChild(img);
      this.app.func.updateLazy();
    }
  }
  swiper?: Swiper;
  initSlider() {
    if (!this.sliderEl) {
      console.error(
        "tried to init slider in card, but there is no slider container: "
      );
      console.error(this.el);
      return;
    }
    // TODO если карточка генерируется из json - нужно это учитывать и убрать удаление слайдов, просто не создавать их
    // Если карточка внутри слайдера на мобильном(!) -
    // не включаем слайдер карточки
    // Если появятся контейнеры-слайдеры как .product-grid_slider - добавить их

    if (isMobile()) {
      const getClosestSlider = () =>
        this.sliderEl?.closest(".product-grid_slider");

      const lastCrt = cachedVars["lastProdCardContainer"] as
        | HTMLElement
        | undefined;

      if (lastCrt && lastCrt.contains(this.el)) {
        sliderToStatic(this.sliderEl);
        return;
      } else {
        const closest = getClosestSlider();
        cachedVars["lastProdCardContainer"] = closest;
        if (closest) {
          sliderToStatic(this.sliderEl);
          return;
        }
      }
    }
    this.swiper = productCardSlider(this.sliderEl);
  }

  destroy() {
    this.swiper?.destroy();
    this.el.remove();
  }
}

export interface PriceParams {
  value: string;
  discount?: {
    old?: string;
    sale?: string;
    dutySale?: string;
  };
}
export class PriceTag {
  valEl?: HTMLElement;
  oldEl?: HTMLElement;
  saleEl?: HTMLElement;
  dutySaleEl?: HTMLElement;
  dutySaleSpan?: HTMLElement;
  sel = {
    priceVal: ".prod-price__val",
    priceOld: ".prod-price__old",
    priceSale: ".badge.badge_sale",
    dutySale: ".badge-duty-sale",
    dutySaleSpan: ".prod-price__duty-sale-span",
  };
  constructor(public el: HTMLElement, price?: PriceParams) {
    this.valEl = this.el.querySelector(this.sel.priceVal) || undefined;
    this.oldEl = this.el.querySelector(this.sel.priceOld) || undefined;
    this.saleEl = this.el.querySelector(this.sel.priceSale) || undefined;
    this.dutySaleEl = this.el.querySelector(this.sel.dutySale) || undefined;
    this.dutySaleSpan =
      this.el.querySelector(this.sel.dutySaleSpan) || undefined;
    if (this.valEl || this.oldEl || this.saleEl || this.dutySaleEl) {
      price && this.fill(price);
    }
  }
  fill(price: PriceParams) {
    if (price.value && this.val != price.value) {
      this.val = price.value;
    }
    this.oldEl?.classList.toggle("_empty", !price.discount?.old);
    this.saleEl?.classList.toggle("_empty", !price.discount?.sale);
    this.dutySaleEl?.classList.toggle("_empty", !price.discount?.dutySale);
    this.dutySaleSpan?.classList.toggle("_empty", !price.discount?.dutySale);
    if (price.discount) {
      // debugger;
      if (price.discount.old) {
        if (this.old != price.discount.old) {
          this.old = price.discount.old;
        }
      }
      if (price.discount.sale) {
        if (this.sale != price.discount.sale) {
          this.sale = price.discount.sale;
        }
      }

      if (price.discount.dutySale) {
        if (this.duty != price.discount.dutySale) {
          this.duty = price.discount.dutySale;
        }
      }
    }
  }
  //--- VAL
  private _val: string = "";
  get val() {
    return this._val;
  }
  set val(v: string) {
    if (!this.valEl) return;

    this._val = `${v}`;
    this.valEl.textContent = this._val;
  }
  //--- OLD
  private _old: string = "";
  get old() {
    return this._old;
  }
  set old(v: string) {
    if (!this.oldEl) return;
    this._old = `${v}`;
    this.oldEl.textContent = this._old;
  }
  //--- SALE
  private _sale: string = "";
  get sale() {
    return this._sale;
  }
  set sale(v: string) {
    if (!this.saleEl) return;
    this._sale = `${v}`;
    this.saleEl.textContent = this._sale;
  }
  //--- DUTY
  private _duty: string = "";
  get duty() {
    return this._duty;
  }
  set duty(v: string) {
    if (!this.dutySaleEl) return;
    this._duty = `${v}`;
    trustedQS(this.dutySaleEl, "span").textContent = this._duty;
  }
}

function getCardContent(source: ProductCard) {
  const img =
    (source.content?.images && source.content?.images[0]) ||
    source.el.querySelector('.prod-card__gallery img')?.getAttribute("src") ||
    "";
    console.log(source.el.querySelector('.prod-card__gallery img'))
  const desk =
    source.content?.title ||
    trustedQS<Element>(source.el, source.elements.title)?.textContent ||
    "";

  return {
    img,
    desk,
  };
}
