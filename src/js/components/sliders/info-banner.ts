import SwiperConfigured from "../../shared/swiper";
import bp from '../../shared/breakpoints';
import { aPixels } from '../../shared/aPixels';
import { isMobile } from '../../shared/check-viewport';

export function infoBannerGridSlider() {
  if(!isMobile()){
    return
  }

  new SwiperConfigured(".info-banner", {
    wrapperClass: "banners-small",
    slideClass: "banner-small",
    allowTouchMove: true,

    breakpoints: {
      [bp.min]: {
        slidesPerView: 2.5,
        spaceBetween: 6,
      },
      [bp.small]: {
        slidesPerView: 2.5,
        spaceBetween: aPixels(6),
      },
    },
  });
}