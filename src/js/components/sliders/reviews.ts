import SwiperConfigured from "../../shared/swiper";
import bp from "../../shared/breakpoints";
import { aPixels } from "../../shared/aPixels";
import { isMobile } from "../../shared/check-viewport";

export function reviewsBlockInit() {
  // Длительность слайда
  const delay = 7000;
  document
    .querySelectorAll<HTMLElement>(".reviews__slider")
    .forEach((el, index) => {
      !isMobile() &&
        el
          .querySelector<HTMLElement>(".progress-pag")
          ?.style.setProperty("--duration", delay + "ms");

      const insideProduct = !!(el.closest(".product"))
      new SwiperConfigured(el, {
        wrapperClass: "reviews__wrapper",
        slideClass: "reviews-slide",
        allowTouchMove: true,
        speed: 750,
        autoplay: {
          delay: delay,
        },
        centeredSlides: true,
        breakpoints: {
          320: {
            pagination: {
              clickable: false,
              el: (el.closest(".reviews") as HTMLElement).querySelector(
                ".swiper-pagination"
              ) as HTMLElement,
              type: "progressbar",
            },
            watchSlidesProgress: true,
            slidesPerView: 1,
            spaceBetween: insideProduct ? 16 : 30,
          },
          768: {
            loop: true,
            pagination: {
              clickable: true,
              el: ".progress-pag",
              type: "bullets",
              modifierClass: "progress-pag-",
              bulletClass: "progress-pag-bullet",
              bulletActiveClass: "_active",
              renderBullet: function (index, className) {
                return (
                  '<span class="' +
                  className +
                  '">' +
                  '<div class="progress"> </div>' +
                  "</span>"
                );
              },
            },
            slidesPerView: insideProduct ? 1 : 1.778,
            spaceBetween: insideProduct ? aPixels(24) : aPixels(118),
          },
        },
      });
    });
}
