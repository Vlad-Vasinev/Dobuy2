
import SwiperConfigured from "../../shared/swiper";
import bp from '../../shared/breakpoints';
import { aPixels } from '../../shared/aPixels';

export function unpackingReviewSliderAll() {
  new SwiperConfigured(".unpacking-reviews", {
    wrapperClass: "unpacking-reviews__wrapper",
    slideClass: "unpacking-el",
    allowTouchMove: true,
    breakpoints: {
      [bp.min]: {
        // slidesPerView: 1.917,
        slidesPerView: 1.3,
        spaceBetween: 8,
      },
      [bp.small]: {
        slidesPerView: 5, //5
        spaceBetween: aPixels(24),
      },
    },
    
  });
}

export function selectionSliderAll() {

  QsA(".selection-slider").forEach((ssEl) => {

    const sliderEl = ssEl
    if (!sliderEl) {
      return;
    }

    new SwiperConfigured(sliderEl, {
      wrapperClass: "selection-slider__wrapper",
      slideClass: "selection-item",
      allowTouchMove: true,
      breakpoints: {
        [bp.min]: {
          slidesPerView: 1.8,
          spaceBetween: 8,
        },
        [bp.small]: {
          slidesPerView: 5, //5
          spaceBetween: aPixels(20),
        },
      },
      navigation: {
        nextEl: ssEl.querySelector<HTMLElement>(".slider-navigation__next"),
        prevEl: ssEl.querySelector<HTMLElement>(".slider-navigation__prev"),
      },
    });

  })

}