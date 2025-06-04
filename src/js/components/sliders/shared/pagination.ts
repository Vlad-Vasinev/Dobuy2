import Swiper from "swiper";
Swiper;

export const imgPagination: typeof Swiper.defaults.pagination = {
  clickable: true,
  el: ".image-pag",
  type: "bullets",
  modifierClass: "image-pag-",
  bulletClass: "image-pag-bullet",
  bulletActiveClass: "_active",
  renderBullet: imgBullet,
};
function imgBullet(this: Swiper, index: number, className: string) {
  return (
    '<div class="' +
    className +
    '">' +
    `<img src="${this.slides[index].dataset.bullet}"/>` +
    "</div>"
  );
}
export const bulletPagination: typeof Swiper.defaults.pagination = {
  clickable: false,
  el: ".bullet-pag",
  type: "bullets"
};
