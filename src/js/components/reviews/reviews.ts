// import { Modal } from "../header/modal";
// import SwiperConfigured from "../../shared/swiper";
// import bp from "../../shared/breakpoints";
// import { aPixels } from "../../shared/aPixels";

// // import { sideReviewSliderAll } from "../sliders/reviews-slider-side";

// export default function itemsReviews() {
//   const crt = Qs(".items-reviews");
//   if (!crt) return; 
//   crt.querySelectorAll(".items-reviews__item").forEach((card) => {
//     card.addEventListener(
//       "click",
//       () => {
//         const id = card.dataset.openReview;
//         if (!id) {
//           console.error("не указан id");
//           return;
//         }

//         const modal = new Modal({
//           replaceContainer: false,
//           fromTemplate: true,
//           selMainTpl: `.tpl--item-review[data-review-id='${id}']`,
//           openTriggers: [card],
//           on: {
//             afterInit: (modal) => {
//               new SwiperConfigured(".review-slider", {
//                 wrapperClass: "review-slider__wrapper ",
//                 slideClass: "review-slider__item ",
//                 allowTouchMove: true,
//                 breakpoints: {
//                   [bp.min]: {
//                     slidesPerView: 1,
//                     spaceBetween: 8,
//                   },
//                   [bp.small]: {
//                     slidesPerView: 1.125,
//                     spaceBetween: aPixels(16),
//                   },
//                 },
//               });
//             },
//           },
//         });
//         modal.open();
//       },
//       { once: true }
//     );
//   });
// }

import { Modal } from "../header/modal";
import SwiperConfigured from "../../shared/swiper";
import bp from "../../shared/breakpoints";
import { aPixels } from "../../shared/aPixels";

// import { sideReviewSliderAll } from "../sliders/reviews-slider-side";

export default function itemsReviews() {
  const crt = document.querySelector(".items-reviews");
  if (!crt) return;
  crt.querySelectorAll<HTMLElement>(".items-reviews__item").forEach((card) => {
    card.addEventListener(
      "click",
      () => {
        const id = card.dataset.openReview;
        if (!id) {
          console.error("не указан id");
          return;
        }

        const modal = new Modal({
          replaceContainer: false,
          fromTemplate: true,
          selMainTpl: `.tpl--item-review[data-review-id='${id}']`,
          openTriggers: [card],
          on: {
            afterInit: (modal) => {
              new SwiperConfigured(".review-slider", {
                wrapperClass: "review-slider__wrapper ",
                slideClass: "review-slider__item ",
                allowTouchMove: true,
                breakpoints: {
                  [bp.min]: {
                    slidesPerView: 1,
                    spaceBetween: 8,
                  },
                  [bp.small]: {
                    slidesPerView: 1.125,
                    spaceBetween: aPixels(16),
                  },
                },
              });
            },
          },
        });
        modal.open();
      },
      { once: true }
    );
  });
}
