import { App } from "./_app";
import { cityInputModal } from "./components/address-input/cityInput";
import { streetInputModal } from "./components/address-input/streetInput";
//import { YMap } from '@yandex/ymaps3-types'
import { YMap } from "ymaps3";
import { YMEcommerceObject, EcommerceWrap } from "./types/ya_metrica_types";
import { cityInputCDEKModal } from './components/address-input/cityInputCDEK';

declare let map: YMap;

interface AppConfig {
  favoritesAction: string;
  loggedIn: boolean;
  showPopupBanner?: boolean;
  showPopupBannerTimeout?: number;
  templatePath: string;
  [key: string]: any,
}

declare global {
  var app: App;
  var appConfig: AppConfig;
  var addressInputModals: {
    cdekCity?: cityInputCDEKModal;
    city?: cityInputModal;
    street?: streetInputModal;
  };
  var dataLayer: EcommerceWrap[] | undefined;
  var sliderObserver: IntersectionObserver | undefined;
  // можно использовать этот объект для простого запоминания результатов вычислений
  var cachedVars: Record<string, any>;
}
