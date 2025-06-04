import SwiperConfigured from "../../shared/swiper";
import bp from '../../shared/breakpoints';
import { aPixels } from '../../shared/aPixels';
import { isMobile, isDesktop } from '../../shared/check-viewport';
import Swiper from 'swiper';
import { bulletPagination, imgPagination } from './shared/pagination';

export function prodPageGallery() {
  if (document && document.querySelector('.prod-gallery_selection') && isMobile()) {
    return new SwiperConfigured(".prod-gallery.prod-gallery_selection", {
      wrapperClass: "prod-gallery__wrapper",
      slideClass: "prod-gallery__item",

      effect: isMobile() ? undefined :"fade",
      fadeEffect: isMobile() ? undefined : {
        crossFade: true
      },

      speed: isMobile() ? 300 : 200,
      breakpoints: {
        [bp.min]: {
          allowTouchMove: true,
          pagination: bulletPagination,
          slidesPerView: 1.3,
          spaceBetween: 2,
        },
      },
    });
  } else {
    return new SwiperConfigured(".prod-gallery", {
      wrapperClass: "prod-gallery__wrapper",
      slideClass: "prod-gallery__item",

      effect: isMobile() ? undefined :"fade",
      fadeEffect: isMobile() ? undefined : {
        crossFade: true
      },

      slidesPerView: 1,
      spaceBetween: 0,
      speed: isMobile() ? 300 : 200,
      breakpoints: {
        [bp.min]: {
          allowTouchMove: true,
          pagination: bulletPagination
        },
        [bp.small]: {
          allowTouchMove: false,
          pagination: imgPagination
        },
      },
    });
  }
}
