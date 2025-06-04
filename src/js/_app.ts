import { ILazyLoadInstance } from "vanilla-lazyload";
import { HeaderComponent } from "./components/header/header";
import { lazyImgInit } from "./components/lazyImg";
import { prodCardInit } from "./components/product-card";
import initSliders from "./components/sliders/sliders";
import initUI from "./components/UI/UI";
import { CartModal } from "./components/cart";
import { AuthModal } from "./components/auth-modal/auth-modal";
import {
  ProductDesc,
  initProductDescription,
} from "./components/product/product";
import { CatalogModal, initCatalog } from "./components/catalog/catalog";
import { Order, initOrder } from "./components/order/order";
//import { lazyContent } from "./components/lazyContent/lazyContent";
import { UserData, initProfile } from "./components/profile/profile";
import { Favorites } from "./components/favorites/favs";
import { SnackBar, prodMsg } from "./components/snackbar/snackbar";
import { initStories } from "../components/blocks/stories/_stories";
import { headerDrop } from "./components/header/header-drop";
import { onDocLoad, onWinLoad } from "./shared/onDocLoad";
import { mtsFlexInfoModal } from "./components/mts-flex-info-modal";
import itemsReviews from "./components/reviews/reviews";
import { initDutyInfoModal } from "./components/duty-info-modal";
import { initChatWidget } from "./components/initChatWidget";
import { openBannerModal } from "./components/openBannerModal";
import { openModalOnQuery } from "./components/openModalOnQuery";
import { prodListWatchObserver } from "./components/prodListWatchObserver";
import { stopVideoOnScreenLeave } from "./components/stopVideoOnScreenLeave";
import { LanguageFunction } from './components/choose-lang/choose-lang';
import { appHeight } from './components/appHeight';

/**
 * префикс для ошибки, которую нужно вывести у пользователя
 */
const logFlag = "showErr ";

// Отображение ошибок
window.addEventListener("error", (event) => {
  const subI = event.message.indexOf(logFlag);
  if (!~subI) return;
  const errMsg = event.message.slice(subI + logFlag.length).trim();
  window.app.modules.snackBar.showError(errMsg);
  return true;
});
// Отображение ошибок внутри fetch
window.addEventListener("unhandledrejection", (event) => {
  const reason = `${event.reason}`;
  if (!reason.indexOf) return;
  const subI = reason.indexOf(logFlag);
  if (!~subI) return;
  const errMsg = reason.slice(subI + logFlag.length).trim();
  window.app.modules.snackBar.showError(errMsg);

  return true;
});

// TODO переделать атрибуты с добавлением data

export class App {
  modules: {
    globalLazy?: ILazyLoadInstance;
    snackBar: SnackBar;
  };
  components: {
    header: HeaderComponent;
    cart: CartModal;
    auth: AuthModal;
    favs: Favorites;
  };
  pageComponents: {
    product?: ProductDesc;
    catalog?: CatalogModal;
    order?: Order;
    profile?: { userData?: UserData };
  } = {};
  activeModal?: { close: () => Promise<any> };
  func = {
    updateLazy: () => {
      this.modules.globalLazy && this.modules.globalLazy.update();
    },
    // вывести добавление в избранное, возможно
    addItemToCart: (id: string, snack: prodMsg, opt?: any) => {
      return this.components.cart.addItem(id, snack, opt);
    },
    updateUi: () => {
      prodCardInit(this);
      initUI();
    },
    closeActiveModal: () => {
      return (
        this.activeModal?.close().then(() => {
          this.activeModal = undefined;
        }) || new Promise<void>((r) => r())
      );
    },
    openCart: () => {
      this.components.cart.open();
    },
    openLogin: (msg?: string) => {
      this.components.auth.goToStepByName("auth");
      msg && this.components.auth.setSubtitle(msg);
      return this.components.auth.open();
    },
  };
  constructor() {
    // profSideScroll();
    this.modules = {
      snackBar: new SnackBar(),
    };
    this.components = {
      header: new HeaderComponent(this),
      cart: new CartModal(this),
      auth: new AuthModal(this),
      favs: new Favorites(this),
    };
    // компоненты отдельных страниц, инициализируется только один
    // можно переделать с использованием switch
    {
      (this.pageComponents.catalog = initCatalog(this)) ||
        (this.pageComponents.product = initProductDescription(this)) ||
        (this.pageComponents.order = initOrder(this)) ||
        (this.pageComponents.profile = initProfile(this));
    }
    new Promise<void>((r) => {
      initSliders();
      r();
    });
    asyncCall(initChatWidget);
    asyncCall(this.func.updateUi);

    new Promise<void>((r) => {
      initStories();
      initStories({
        mainSel: ".unpacking-reviews",
        innerSel: ".unpacking-reviews__wrapper",
        previewItem: ".unpacking-el",
      });

      r();
    });
    onDocLoad(async () => {
      this.modules.globalLazy = lazyImgInit();
      stopVideoOnScreenLeave();
      appHeight()
      openModalOnQuery(this);
      openBannerModal();
      LanguageFunction()
      //console.log(dataLayer)
      // itemClickInit();
      if(dataLayer) {
        prodListWatchObserver();
      }
      mtsFlexInfoModal();
      // Обзор
      itemsReviews();
      // информация о пошлине
      initDutyInfoModal();
    });
  }
}

globalThis.app = new App();
