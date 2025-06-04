export function footerLists() {
  QsAfE(".footer__item_list .footer__item-title:not([ui-inited])", (el) => {
    el.addEventListener("click", (event: any) => {
      el.closest(".footer__item")?.classList.toggle("footer__item_list-open");
    });
    el.setAttribute("ui-inited", "");
  });
}
