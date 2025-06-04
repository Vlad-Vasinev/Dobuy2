import { App } from "../../_app";
import { isMobile } from "../../shared/check-viewport";
import trustedQS from "../../shared/trustedQS";
import { prodPageGallery } from "../sliders/prod-page-gallery";
import { Modal } from "../header/modal";
import Swiper from "swiper";
import navCounter from "../../shared/navCounter";

import { Fancybox } from '@fancyapps/ui';

export function initProductDescription(app: App) {
  const el = Qs(".product");
  if (el) {
    return new ProductDesc(app, el);
  } else return undefined;
}

// Изначально параметры (цвет и тп) были реализованы через запрос и замену верстки без перезагрузки
// Позже были переделаны просто на ссылки, если будет нужен старый код - искать в Git

export class ProductDesc {
  id?: string;
  descModal?: Modal;
  charsModal?: Modal;
  prodNavbar?: {
    el: Element;
    addToCart: HTMLElement | undefined;
    favCartCounter: navCounter;
  };
  el: HTMLElement;
  titleEl: HTMLElement;

  gallery: Swiper;

  constructor(private app: App, el: HTMLElement) {
    this.el = el;
    this.titleEl = trustedQS(this.el, ".prod-side__title, .h1");

    this.gallery = prodPageGallery();

    const addBtn = trustedQS(this.el, ".prod-side__add-to-cart");
    const id = addBtn.dataset.itemId as string;
    if (!id) {
      console.log(this.el)
      console.error("не удалось получить id товара! На элементе: ");
      console.error(addBtn);
    }
    const getContent = () => {

      // if (!this.gallery || !this.gallery.slides) {
      //   console.log(this.el)
      //   console.error('Gallery is not initialized or slides are undefined');
      //   return null;
      // }

      return {
        img: trustedQS<HTMLImageElement>(this.gallery.slides[0], "img").src,
        desk: this.titleEl.innerText,
      };
    };

    const addToCart = async (id: string) => {
      // const content = getContent();
      // if (content === null) {
      //   console.error('Не удалось получить содержимое для добавления в корзину');
      //   return;
      // }
      // return this.app.func.addItemToCart(id, content);

      
      return this.app.func.addItemToCart(id, getContent());
    };

    // добавление в корзину
    if (isMobile()) {
      this.prodNavbar = initProductNavbar();
      if(this.prodNavbar?.el.classList.contains('nav-mob_product_available')) {
        this.prodNavbar?.addToCart?.addEventListener("click", () => {
          addToCart(id).then(() => {
            this.prodNavbar?.favCartCounter.inc();
            const inner =this.prodNavbar?.addToCart?.querySelector('.btnS')
            if(inner){
              inner.textContent = 'В корзине'
            }
          });
        });
      }
      // else {
      //   this.prodNavbar?.el.classList.add('nav-mob_product_hide')
      // }
      // this.prodNavbar?.addToCart?.addEventListener("click", () => {
      //   addToCart(id).then(() => {
      //     this.prodNavbar?.favCartCounter.inc();
      //     const inner =this.prodNavbar?.addToCart?.querySelector('.btnS')
      //     if(inner){
      //       inner.textContent = 'В корзине'
      //     }
      //   });
      // });
    }
    else {
      addBtn?.addEventListener("click", () => {
        addToCart(id).then(() => { 
          if(addBtn){
            addBtn.textContent = 'В корзине'
          }
         });
      });
    }
    // добавление в избранное
    this.el
      .querySelector(".prod-side__add-to-fav")
      ?.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const title = trustedQS(target, "span");
        this.app.components.favs
          .toggleFav(target, id, getContent())
          .then(() => {
            target.classList.contains("_active")
              ? (title.textContent = "В избранном")
              : (title.textContent = "В избранное");
          });
      });

    // описание и характеристики
    const descTriggers = QsA("[open-description]");
    if (descTriggers.length) {
      this.descModal = new Modal({
        container: ".product-description-modal",
        fromTemplate: false,
        openTriggers: descTriggers,
      });
    }
    const charsTriggers = QsA("[open-chars]");
    if (charsTriggers.length) {
      this.charsModal = new Modal({
        container: ".product-chars-modal",
        fromTemplate: false,
        openTriggers: charsTriggers,
      });
    }
  }
}
function initProductNavbar() {
  const el = Qs(".nav-mob.nav-mob_product");
  if (!el) return undefined;
  const btnCrt = el.querySelector(".nav-mob__btn-ctr");
  if (!btnCrt) return undefined;
  el.querySelector(".nav-mob__show")?.addEventListener("click", () => {
    btnCrt.classList.toggle("_shown");
  });
  const favCartCounter = new navCounter(
    ".nav-mob.nav-mob_product .nav-mob__show .icon-btn-count"
  );

  const addToCart = el.querySelector<HTMLElement>(".nav-btn") || undefined;
  return { el, addToCart, favCartCounter };
}

const containerZoom = document.querySelectorAll(".product-preview");

containerZoom.forEach((item) => {
  Fancybox.bind('[data-fancybox="gallery"]', {
    Toolbar: {
      display: {
        left: [],
        middle: [],
        right: ['close'],
      },
    },
    Thumbs: {
      type: 'classic',
    },
  })
})