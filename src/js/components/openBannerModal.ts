import { Modal } from './header/modal';
import { isMobile } from '../shared/check-viewport';

/**
 * Открытие баннера с акциями (показывается раз в сессию)
 */
export async function openBannerModal() {
  const isCookiesAccepted = localStorage.getItem('dobuyCookieAccepted');
  if (!isCookiesAccepted) {
    const popups = QsA(".tpl--modal--cookies-popup");

    if (!popups.length) {
      return;
    }

    popups[0].classList.add('_selected-cookies-popup');
    const modal = new Modal({
      replaceContainer: false,
      fromTemplate: true,
      selMainTpl: "._selected-cookies-popup",
    });

    modal.open({
      disScroll: false,
    });

    modal.el.querySelector('.modal__close')?.addEventListener('click', (e) => {
      localStorage.setItem('dobuyCookieAccepted', true);
    });

    if (isMobile()) {
      const checkIsCookieModalisClosed = setInterval(() => {
        if (!modal.isOpen) {
          clearInterval(checkIsCookieModalisClosed);
          showGiveAway();
        }
      }, 500);
    }

    return;
  }

  if(isMobile()) {
    showGiveAway();
  }
}

function showGiveAway() {
  const isGiveAwayClosed = localStorage.getItem('dobuyGiveAwayClosed');
  if (!isGiveAwayClosed) {
    const popups = QsA(".tpl--modal--session-popup");
    if (!popups.length) {
      return;
    }

    popups[0]?.classList.add("_selected-session-popup");
    const modal = new Modal({
      replaceContainer: false,
      fromTemplate: true,
      selMainTpl: "._selected-session-popup",
    });

    modal.open({
      disScroll: false,
    });

    modal.el.querySelector('.modal__close')?.addEventListener('click', (e) => {
      localStorage.setItem('dobuyGiveAwayClosed', true);
    });

    modal.el.querySelector('.modal__body a.n-h8')?.addEventListener('click', (e) => {
      localStorage.setItem('dobuyGiveAwayClosed', true);
    });
  }
}
