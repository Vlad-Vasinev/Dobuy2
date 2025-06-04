import { App } from "../../_app";
import { isDesktop, isMobile } from "../../shared/check-viewport";
import { qsUnwrapTpl } from "../../shared/templates";
import trustedQS from "../../shared/trustedQS";
import { Modal } from "../header/modal";
import { ModalStepMenu, StepMenuOptions } from "../header/step-menu";

import SwiperConfigured from "../../shared/swiper";
import { aPixels } from "../../shared/aPixels";

export function initCatalog(app: App) {
  new Promise(() => {
    initSubcategoryGridSlider();
    initFiltersDrop();
  });
  if (Qs(".filter-modal")) {
    return new CatalogModal(app);
  } else {
    return undefined;
  }
  // filtersDrop
}
export class CatalogModal {
  filterModal: ModalStepMenu | Modal;
  constructor(app: App) {
    if (isMobile()) {
      this.filterModal = new ModalStepMenu(app, {
        ...new StepMenuOptions(),
        container: ".filter-modal",
        fromTemplate: true,
        selMainTpl: ".tpl--filter-mob",
        openTriggers: QsA("[open-filter]"),
      });
    } else {
      this.filterModal = new Modal({
        container: ".filter-modal",
        fromTemplate: true,
        selMainTpl: ".tpl--filter-dsk",
        openTriggers: QsA("[open-filter]"),
      });
    }
    // this.filterModal.open()
  }
}

function initFiltersDrop() {
  if (isMobile()) return;
  QsAfE(".filters .filters__el .filters-drop", (el) => {
    const trg = el.closest(".filters__el") as HTMLElement;
    trg.addEventListener("click", () => {
      el.classList.toggle("_active");
    });
  });
}

function initSubcategoryGridSlider() {
  document
    .querySelectorAll<HTMLElement>(".subcategory-grid")
    .forEach((slider) => {
      if (!slider) return;
      const slides = slider.querySelectorAll(
        ".subcategory-grid__wrapper .subcategory-card"
      );
      if (!isMobile() && slides.length < 8) {
        return;
      }
      let navEl: Element | undefined = undefined;
      if (!isMobile()) {
        const nav = DcCrEl("div");
        // TODO ссылки на свг стоят фиксированные, надо переделать
        nav.innerHTML = `<div class="edges-nav__prev"> <svg class="sprite-icon"> <use xlink:href="${window.appConfig.templatePath}spriteMono.svg#arrow-left"></use> </svg> </div> <div class="edges-nav__next"> <svg class="sprite-icon"> <use xlink:href="${window.appConfig.templatePath}spriteMono.svg#arrow-right"></use> </svg> </div>`;
        nav.classList.add("edges-nav");

        const rect = slider.getBoundingClientRect();
        nav.style.setProperty("height", rect.height + "px");
        nav.style.setProperty("width", rect.width + "px");
        navEl = slider.parentNode?.insertBefore(nav, slider);
      }

      slider &&
        new SwiperConfigured(slider, {
          wrapperClass: "subcategory-grid__wrapper",
          slideClass: "subcategory-card",
          allowTouchMove: true,
          mousewheel: {
            sensitivity: 0.8,
          },
          navigation: {
            enabled: !isMobile(),
            disabledClass: "_disabled",
            nextEl: navEl?.querySelector<HTMLElement>(".edges-nav__next"),
            prevEl: navEl?.querySelector<HTMLElement>(".edges-nav__prev"),
          },
          breakpoints: {
            320: {
              slidesPerView: 2.565,
              slidesPerGroup: 2,
              spaceBetween: 6,
            },
            768: {
              slidesPerView: slider.classList.contains(
                "subcategory-grid_dsk-slider"
              )
                ? 6.54
                : 7,
              slidesPerGroup: 7,
              spaceBetween: slider.classList.contains(
                "subcategory-grid_dsk-slider"
              )
                ? aPixels(24)
                : aPixels(6),
            },
          },
        });
    });
}
