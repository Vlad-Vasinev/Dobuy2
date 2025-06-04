import SwiperConfigured from "../../shared/swiper";

import { isMobile } from "../../shared/check-viewport";
import { CSSSelector } from "swiper/types/shared";
import Swiper from "swiper";
import { initLazySlider } from "./shared/sliders-lazyload";

function addHoverArea(sw: Swiper, baseClass: string) {
  const slides = sw.slides;
  if (slides.length <= 1) return;
  const area = DcCrEl("div");
  baseClass;
  const itemTpl = DcCrEl("div");
  area.classList.add(baseClass + "__hover-area");
  itemTpl.classList.add(baseClass + "__hover-item");
  slides.forEach((el, i, par) => {
    const hoverItem = area.appendChild(itemTpl.cloneNode(false));
    hoverItem.addEventListener("mouseenter", (e) => {
      sw.slideTo(i);
    });
  });
  area.addEventListener("mouseleave", (e) => {
    sw.slideTo(0);
  });
  sw.el.prepend(area);
}

export default function productCardSlider(slider: HTMLElement | CSSSelector) {
  return new SwiperConfigured(slider, {
    wrapperClass: "prod-card-slider__wrapper",
    slideClass: "prod-card-slider__slide",
    allowTouchMove: isMobile(),
    slidesPerView: 1,
    speed: isMobile() ? 300 : 0,
    pagination: {
      el: ".prod-card-pag .prod-card-pag-wrapper",
      type: "bullets",
      modifierClass: "prod-card-pag-",
      bulletClass: "prod-card-pag-bullet",
      bulletActiveClass: "_active",
      bulletElement: "div",
    },
    on: {
      beforeInit(sw) {
        initLazySlider(sw);
        const pag = sw.el.querySelector(".prod-card-pag");
        if (pag) {
          pag.innerHTML = "<div class='prod-card-pag-wrapper'></div>";
        }
      },
      init(sw) {
        if (sw.slides.length < 2) {
          sw.params.pagination = false;
        }
        if (sw.slides.length > 3) {
          // visible bullets
          const vb = 3
          const vbo = vb - 1 

          sw.on("slideChange", (sw) => {
            const activeBullet = sw.activeIndex + 1;
            sw.pagination.el.style.setProperty(
              "--offset",
              activeBullet > vbo ? sw.slides.length == activeBullet ? `${activeBullet - vb}` : `${activeBullet - vbo}` : "0"
            );
          });
        }
        if (!isMobile()) {
          // На компе поверх слайдера "сетка", при наведении меняются слайды
          addHoverArea(sw, "prod-card-slider");
        }
      },
    },
  });
}
