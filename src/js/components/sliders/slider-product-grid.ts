import SwiperConfigured from "../../shared/swiper";
import bp from "../../shared/breakpoints";
import { aPixels } from "../../shared/aPixels";
import { isMobile } from "../../shared/check-viewport";

// export function productGridSlider() {
//   if(!isMobile()){
//     return
//   }
//   new SwiperConfigured(".product-grid_slider", {
//     wrapperClass: "product-grid__wrapper",
//     slideClass: "prod-card",
//     allowTouchMove: true,

//     breakpoints: {
//       [bp.min]: {
//         slidesPerView: 1.655,
//         spaceBetween: 15,
//       },
//       [bp.small]: {
//         slidesPerView: 4,
//         spaceBetween: aPixels(24),
//       },
//     },
//   });
// }

export function blogSliderAll() {
  new SwiperConfigured(".blog-wrapper", {
    wrapperClass: "blog-wrapper__mesh",
    slideClass: "blog-wrapper__item",
    allowTouchMove: true,
    // slidesPerView: 1.3,
    // spaceBetween: 12,
    breakpoints: {
      [bp.min]: {
        // slidesPerView: 1.917,
        slidesPerView: 1.3,
        spaceBetween: 12,
      },
      // [bp.small]: {
      //   slidesPerView: 5, //5
      //   spaceBetween: aPixels(24),
      // },
    },
  });
}

export function superSliderAll() {
  QsA(".super-slider").forEach((ssEl) => {
    const sliderEl = ssEl.querySelector(
      ".product-grid_slider:not(.product-grid_slider-mob):not(.product-grid_slider-dsk)"
    );
    if (!sliderEl) {
      return;
    }

    return new SwiperConfigured(sliderEl, {
      wrapperClass: "product-grid__wrapper",
      slideClass: "prod-card",
      allowTouchMove: true,
      breakpoints: {
        [bp.min]: {
          slidesPerGroup: 1,
          slidesPerView: 1.5,
          spaceBetween: 8,
        },
        [bp.small]: {
          slidesPerGroup: 1,
          slidesPerView: 3.5, //5
          spaceBetween: aPixels(8),
        },
      },
      navigation: {
        nextEl: ssEl.querySelector<HTMLElement>(".slider-navigation__next"),
        prevEl: ssEl.querySelector<HTMLElement>(".slider-navigation__prev"),
      },
    });
  });
}
export function productSliderAll() {
  new SwiperConfigured(
    ".product-grid_slider:not(.product-grid_slider-mob):not(.product-grid_slider-dsk):not(.swiper-initialized)",
    {
      wrapperClass: "product-grid__wrapper",
      slideClass: "prod-card",
      allowTouchMove: true,
      breakpoints: {
        [bp.min]: {
          // slidesPerView: 1.917,
          slidesPerView: 1.845,
          spaceBetween: 15,
        },
        [bp.small]: {
          slidesPerView: 5, //5
          spaceBetween: aPixels(24),
        },
      },
      navigation: {
        nextEl: ".slider-navigation__next",
        prevEl: ".slider-navigation__prev"
      },
    }
  );
}

export function productSliderMob() {
  if (!isMobile()) {
    return;
  }
  new SwiperConfigured(".product-grid_slider-mob", {
    wrapperClass: "product-grid__wrapper",
    slideClass: "prod-card",
    allowTouchMove: true,
    breakpoints: {
      [bp.min]: {
        slidesPerView: 2,
        spaceBetween: 15,
      },

      [bp.small]: {
        slidesPerView: 4,
        spaceBetween: aPixels(24),
      },
    },
  });
}
