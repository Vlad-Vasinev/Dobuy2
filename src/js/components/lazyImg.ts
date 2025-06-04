import LazyLoad, { ILazyLoadInstance } from "vanilla-lazyload";
import { isMobile } from '../shared/check-viewport';


/**
 * Инициализирует глобальный lazy loading..
 * ..то есть lazy load всех медиа вне слайдеров (и кроме других исключений)..
 * (см TODO добавить ссылку на место с ленивой загрузкой слайдеров)
 */
export function lazyImgInit(): ILazyLoadInstance {
  const elementSelector = `
      img[lazy], video[lazy]
      `;
  return new LazyLoad({
    // elements_selector: "",
    elements_selector: elementSelector,
    unobserve_entered: true,
    class_loaded: "is-loaded",
    thresholds: isMobile() ? "0px 0px 10% 0px" : "0px 0px 20% 0px",
    callback_loaded: (el) => {
      setTimeout(() => {
        el.removeAttribute('data-src')
        el.removeAttribute('lazy')
        el.removeAttribute('data-ll-status')
        el.classList.remove("entered", "is-loaded")
      }, 2000);
    },
    // callback_enter: (elt, entry, instance) => {
    //   const rold = elt.getBoundingClientRect()
    //   console.log(elt);
    //   // setTimeout(() => {
    //   //   const rect = elt.getBoundingClientRect()
    //   //   console.log(rold.top, rold.left);
    //   //   console.log(rect.top, rect.left);
    //   //   console.log('----');
    //   // }, 1500);
    // }
  });
}