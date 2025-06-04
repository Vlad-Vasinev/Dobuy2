import { aPixels } from './shared/aPixels';
import { isMobile } from './shared/check-viewport';
import { disableScroll, enableScroll } from './shared/scroll';
import fnChain from './shared/fnChain';
import { callItAsync, QsAfEEL, QsAfE } from './shared/js-mixins';

// Присвоение глобальных переменных
globalThis.Dc = document;
globalThis.Qs = document.querySelector.bind(document);
globalThis.QsA = document.querySelectorAll.bind(document);
globalThis.QsAfE = QsAfE
globalThis.QsAfEEL = QsAfEEL
globalThis.DcCrEl = document.createElement.bind(document);
globalThis.cachedVars = {};
globalThis.fnChain = fnChain;
globalThis.asyncCall = callItAsync;
//

globalThis.clb = {
  isMobile,
  aPixels,
  disableScroll,
  enableScroll,
};

// interface CDEKWidget {
//   new (options: { from?: any; popup?: any; root?: string; apiKey: string; servicePath: string; defaultLocation: any, canChoose?: boolean, hideFilters?: object, hideDeliveryOptions?: object, debug?: boolean, goods?: any, lang: string, currency: string, tariffs?: any, onReady: any, onCalculate: any, onChoose: any}): CDEKWidget;
// }
//
// // interface CDEKWidget {
// //   new (options: { from: any; root: string; apiKey: string; servicePath: string; defaultLocation: any}): CDEKWidget;
// // }
//
// declare global {
//   interface Window {
//     CDEKWidget: CDEKWidget;
//   }
// }