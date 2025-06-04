import Swiper from "swiper";
import vanillaLazy, { ILazyLoadOptions } from "vanilla-lazyload";

export function setAutoplayByVideo(sw: Swiper) {
  // вызвать эту функцию в afterInit когда нужно задать autoplay в слайдере с видео
  if (!sw.params.autoplay) {
    return;
  }

  sw.wrapperEl.querySelectorAll<HTMLVideoElement>("video").forEach((el) => {
    // Array.from(node.parentNode.childNodes).indexOf(node)

    const parentSlide = el.closest<HTMLElement>("." + sw.params.slideClass);

    if (!parentSlide || !parentSlide.parentNode) return;
    const index = sw.params.loop
      ? +(parentSlide.dataset.swiperSlideIndex as string)
      : Array.from(parentSlide.parentNode.childNodes).indexOf(parentSlide);
    let bullet: HTMLElement | undefined;
    if (sw.params.pagination) {
      bullet = sw.pagination.bullets[index];
      bullet?.style.setProperty("--duration", "600s");
    }
    el.addEventListener(
      "loadedmetadata",
      () => {
        const dur = +el.duration.toFixed(1);

        parentSlide;
        bullet?.style.setProperty("--duration", dur + "s");
        parentSlide.setAttribute(
          "data-swiper-autoplay",
          (dur * 1000 - 250).toString()
        );
        sw.autoplay.start();
      },
      { once: true }
    );
  });
}

export function startSliderLazy(
  el: HTMLElement,
  sw: Swiper,
  opt?: ILazyLoadOptions
) {
  const vl = new vanillaLazy({
    container: el,
    elements_selector: `
    img[data-src],
    video[data-src],
    video[lazy-video]
  `,
    unobserve_entered: true,
    thresholds: "0px -5% 0px 0px",
    class_loaded: "is-loaded",

    callback_loaded: (el) => {
      setTimeout(() => {
        el.removeAttribute("lazy-slide");
        el.removeAttribute("data-ll-status");
        el.removeAttribute("data-src");
        el.classList.remove("entered", "is-loaded");
      }, 2000);
    },
    callback_finish: () => {
      vl.destroy();
    },

    ...opt,
  });
  return vl;
}

export function initLazySlider(sw: Swiper) {
  // Глобальный наблюдатель, который загружает слайдер
  // только тогда когда он в области видимости

  if (!window?.sliderObserver) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startSliderLazy(entry.target as HTMLElement, sw);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px 20% 0px",
        threshold: 0.4,
      }
    );
    window.sliderObserver = observer;
  }
  window.sliderObserver && window.sliderObserver.observe(sw.el);
}
