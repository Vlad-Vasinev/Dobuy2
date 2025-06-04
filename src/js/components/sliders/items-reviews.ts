
import SwiperConfigured from "../../shared/swiper";
import bp from '../../shared/breakpoints';
import { aPixels } from '../../shared/aPixels';

export function itemsReviewSliderAll() {
  QsA(".items-reviews").forEach((ssEl) => {
    return new SwiperConfigured(ssEl, {
      wrapperClass: "items-reviews__wrapper",
      slideClass: "items-reviews__item",
      allowTouchMove: true,
      breakpoints: {
        [bp.min]: {
          slidesPerView: 1.7,
          spaceBetween: 8,
        },
        [bp.small]: {
          slidesPerView: 5,
          spaceBetween: aPixels(20),
        },
      },
      navigation: {
        nextEl: ssEl.querySelector<HTMLElement>(".slider-navigation__next"),
        prevEl: ssEl.querySelector<HTMLElement>(".slider-navigation__prev"),
      },
    });
  });
}