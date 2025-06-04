import { App } from "../js/_app";
import { cityInputModal } from "../js/components/address-input/cityInput";
import { streetInputModal } from "../js/components/address-input/streetInput";
import { aPixels } from "../js/shared/aPixels";
import { default as fnCh } from "../js/shared/fnChain";
import { isMobile } from "../js/shared/check-viewport";
import { disableScroll, enableScroll } from "../js/shared/scroll";
import { YMEcommerceObject, EcommerceWrap } from "../types/ya_metrica_types";
import { YMap } from "ymaps3";
import {
  QsAfE as QuerySelectorAllForEach,
  QsAfEEL as QuerySelectorAllForEachEventListener, 
  callItAsync,
} from "../js/shared/js-mixins";

declare let map: YMap;

interface AppConfig {
  favoritesAction: string;
  loggedIn: boolean;
  showPopupBanner?: boolean;
  showPopupBannerTimeout?: number;
  templatePath: string;
}

type PipeFunction<T, R> = (input: T) => R;

// Глобальные миксины, нужны для удобства и краткости
// TODO добавить список в readme
declare global {
  var app: App;
  var appConfig: AppConfig;
  var addressInputModals: {
    city?: cityInputModal;
    street?: streetInputModal;
  };
  var dataLayer: EcommerceWrap[] | undefined;
  var sliderObserver: IntersectionObserver | undefined;
  /**
   * объект для сохранения результатов вычислений
   */
  var cachedVars: Record<string, any>;
  /**
   * document
   */
  var Dc: Document;
  /**
   * document.querySelector
   */
  var Qs: Document["querySelector"];
  /**
   * document.querySelectorAll
   */
  var QsA: Document["querySelectorAll"];
  /**
   * document.querySelectorAll.forEach(clb)
   */
  var QsAfE: typeof QuerySelectorAllForEach;
  var QsAfEEL: typeof QuerySelectorAllForEachEventListener;
  var asyncCall: typeof callItAsync;
  /**
   * document.createElement
   */
  var DcCrEl: Document["createElement"];
  var fnChain: typeof fnCh;
  var clb: {
    isMobile: typeof isMobile;
    aPixels: typeof aPixels;
    disableScroll: typeof disableScroll;
    enableScroll: typeof enableScroll;
  };

  /**
   * эта часть переопределяет querySelector чтобы по умолчанию он возвращал HTMLElement
   */
  interface Document {
    querySelector<E extends Element = HTMLElement>(selectors: string): E | null;
    querySelector<K extends keyof HTMLElementTagNameMap>(
      selectors: K
    ): HTMLElementTagNameMap[K] | null;

    querySelectorAll<E extends Element = HTMLElement>(
      selectors: string
    ): NodeListOf<E>;
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(
      selectors: K
    ): NodeListOf<HTMLElementTagNameMap[K]>;
  }
  interface Element {
    /**
     * TODO c Element не всегда работает корректно, поправить
     */
    querySelector<E extends Element = HTMLElement>(selectors: string): E | null;
    querySelector<K extends keyof HTMLElementTagNameMap>(
      selectors: K
    ): HTMLElementTagNameMap[K] | null;

    querySelectorAll<E extends Element = HTMLElement>(
      selectors: string
    ): NodeListOf<E>;
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(
      selectors: K
    ): NodeListOf<HTMLElementTagNameMap[K]>;
  }
}
