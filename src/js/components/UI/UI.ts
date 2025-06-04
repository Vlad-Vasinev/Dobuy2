import { qsUnwrapTpl } from "../../shared/templates";

import { footerLists } from "../footer/mobile-dropdown";
import { initSearchFields } from "../header/searchField";
import { initRangeSliders } from "../range/range";
import { initShareMenu } from "./share";
import { initStickyMenu } from "../stickyMenu";
import { TabsBlock } from "../tabs";
import { setMap } from "../ymaps";
import { iconToggleInit } from "./iconToggle";
import { isMobile } from "../../shared/check-viewport";
import { MobileSheet } from "../header/modal";
import trustedQS from "../../shared/trustedQS";
import { initWidget } from '../cdekWidget';

export default function initUI() {
  [
    checkBoxCheckedDefault,
    jsInputFocus,
    jsPasswordField,
    copyButton,
    iconToggleInit,
    footerLists,
    initRangeSliders,
    clearUiInput,
    infoPopupsInit,
    initTabs,
    initShareMenu,
    accordionItems,
    // - должны выполнятся в конце
    initStickyMenu,
    initSearchFields,
    setMap,
    customerListNavigation,
  ].forEach((f) => asyncCall(f));
}

function checkBoxCheckedDefault() {
  QsA<HTMLInputElement>(".chbox.chbox_default-checked input").forEach(
    (input) => {
      input.checked = true;
      input.addEventListener(
        "change",
        () => {
          input.closest(".chbox")?.classList.remove("chbox_default-checked");
        },
        { once: true }
      );
    }
  );
}
function initTabs() {
  QsAfE(".tabs:not([ui-inited])", (el) => {
    new TabsBlock(el);
    el.setAttribute("ui-inited", "");
  });
}
function jsPasswordField() {
  QsAfE(
    "[js-password-field] .ui-input__toggle-pass:not([ui-inited])",
    (btn) => {
      const el = btn.closest("[js-password-field]");
      if (!el) {
        console.error(
          `не могу найти closest [js-password-field] относительно элемента`
        );
        console.error(btn);

        return;
      }
      const input = el?.querySelector('input[type="password"]');
      if (!input) {
        console.error("there is js-password-field, but no password input", el);
        return;
      }
      btn.addEventListener("click", (e) => {
        const isShown = el.classList.toggle("ui-input_pass-shown");
        input.setAttribute("type", isShown ? "text" : "password");
      });
      el.setAttribute("ui-inited", "");
    }
  );
}

function clearUiInput() {
  QsAfEEL(".ui-input .ui-input__clear:not([ui-inited])", "click", (e) => {
    const uiInput = (e.currentTarget as Element)?.closest(".ui-input");
    const input = uiInput?.querySelector<HTMLInputElement>("input");
    if (!uiInput || !input) return;

    input.value = "";
    uiInput.classList.remove("is-focused");
  });
}
function jsInputFocus() {
  QsA(".ui-input:not([ui-inited])").forEach((el) => {
    // console.log(el)
    const input = el.querySelector(
      "input, textarea, .textarea[contenteditable]"
    ) as HTMLInputElement;

    if (input.value?.trim()) {
      el.classList.add("is-focused");
    }
    input.addEventListener("change", function () {
      el.classList.toggle("is-focused", !!input.value?.trim());

      if (!input.value) {
        input.hasAttribute("value") && input.removeAttribute("value");
      }
    });
    input.addEventListener("focus", function () {
      el.classList.add("is-focused");
    });
    input.addEventListener("blur", function () {
      if (input.value?.trim() || input.textContent !== "") {
        el.classList.add("is-focused");
      } else {
        el.classList.remove("is-focused");
      }
    });
    el.setAttribute("ui-inited", "");
  });
}
function copyButton(
  // selector = "[js-copy]:not([ui-inited])",
  selector = "[js-copy]:not([ui-inited])",
  copyTargetSel = "span"
) {
  QsA(selector).forEach((el) => {
    el.addEventListener("click", (event) => {
      console.log("h;ohha");
      trustedQS(document, ".snackbar").classList.add('_active')
      setTimeout(() => {
        trustedQS(document, ".snackbar").classList.remove('_active')
      }, 2700)
      //trustedQS(document, ".snackbar").classList.add('_active')
    });
    el.addEventListener("click", (event) => {
      console.log(el + " " + el.innerHTML)
      // if(el.classList.contains('.mini-cart__share-all')) {
      //   console.log('inside mini-cart')
      //   navigator.clipboard
      //   .writeText(window.location.href)
      //   .then(
      //     () => {
      //       // успех
      //       const msg = el.dataset.copyMsg || "Текст успешно скопирован!";
      //       app?.modules.snackBar.showMsg(msg);
      //     },
      //     () => {
      //       // ошибка
      //       app?.modules.snackBar.showError("Не удалось скопировать текст.");
      //     }
      //   );
      // }
      const target = el.querySelector("[js-copy-trg], span");
      navigator.clipboard
        .writeText(target?.textContent?.trim() || el.textContent?.trim() || "")
        .then(
          () => {
            // успех
            const msg = el.dataset.copyMsg || "Текст успешно скопирован!";
            app?.modules.snackBar.showMsg(msg);
          },
          () => {
            // ошибка
            app?.modules.snackBar.showError("Не удалось скопировать текст.");
          }
        );

      // const target = el.querySelector("[js-copy-trg], span");
      // navigator.clipboard
      //   .writeText(target?.textContent?.trim() || el.textContent?.trim() || "")
      //   .then(
      //     () => {
      //       // успех
      //       const msg = el.dataset.copyMsg || "Текст успешно скопирован!";
      //       app?.modules.snackBar.showMsg(msg);
      //     },
      //     () => {
      //       // ошибка
      //       app?.modules.snackBar.showError("Не удалось скопировать текст.");
      //     }
      //   );
    });
    el.setAttribute("ui-inited", "");
  });
}

export function infoPopupsInit(crt: HTMLElement | Document = document) {
  crt
    .querySelectorAll<HTMLElement>("[info-popup]:not([ui-inited])")
    .forEach((el) => {
      infoPopup(el);
      el.setAttribute("ui-inited", "");
    });
}
export function infoPopup(el: HTMLElement, name?: string, text?: string) {
  const getPopup = (name: string) => {
    const x = qsUnwrapTpl(".tpl--popup--" + name);

    if (text) {
      trustedQS(x, ".info-popup__inner").textContent = text;
    }
    return x;
  };
  name && el.setAttribute("info-popup", name);
  const popupName = name || el.getAttribute("info-popup") || (text && "blank");
  if (!popupName) return;
  //
  //
  if (!isMobile()) {
    let aPopup: Element | undefined;
    el.addEventListener("mouseenter", () => {
      !aPopup && (aPopup = el.appendChild(getPopup(popupName)));
    });
    el.addEventListener("mouseleave", () => {
      aPopup && aPopup.remove();
      aPopup && (aPopup = undefined);
    });
  } else {
    const sheet = new MobileSheet();
    el.addEventListener("click", () => {
      const inner =
        getPopup(popupName).querySelector<HTMLElement>(".info-popup__inner");
      if (!inner) return;
      sheet.el.classList.add("modal_info-popup");
      sheet.bodyEl.innerHTML = inner.innerHTML;
      sheet.open();
    });
  }
  el.setAttribute("ui-inited", "");
}

async function customerListNavigation() {
  return new Promise<void>((r, rej) => {
    const nav = Qs(".customer-list-nav nav");
    if (!nav) {
      r();
      return;
    }
    let lastTarget: Element | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        console.error(
          ...entries.map((el) => `${el.target.id} ${el.isIntersecting}`)
        );
        const target = entries.find((el) => el.isIntersecting)?.target;
        if (!target) return;
        const linkId = target.id;
        if (!linkId) return;
        const link =
          nav.querySelector<Element>(`a[href="#${linkId}"]`) || undefined;

        lastTarget?.classList.remove("_active");
        lastTarget = link;
        link?.classList.add("_active");
      },
      {
        rootMargin: `-20% 0px -20% 0px`,
        threshold: 0,
      }
    );
    nav.querySelectorAll<HTMLElement>("a[href^='#']").forEach((link, k, a) => {
      Array.from(a);
      const anchorId = link.getAttribute("href")?.slice(1);
      if (!anchorId) return;
      const section = Dc.getElementById(anchorId);
      if (!section) return;
      observer.observe(section);
    });

    r();
  });
}
function accordionItems() {
  QsAfE(".accordion-item:not([ui-inited])", (el) => {
    const title = el.querySelector(".accordion-item__title");
    if (!title) return;
    title.addEventListener("click", () => {
      el.classList.toggle("_open");
    });
    el.setAttribute("ui-inited", "");
  });
}
