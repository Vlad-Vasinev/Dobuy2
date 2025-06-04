import { Modal } from "../header/modal";
import { isMobile, isDesktop, isTablet } from '../../shared/check-viewport';

export function LanguageFunction () {

  let langSelector = Qs(".choose-lang")
  let langSelectorOpen = langSelector?.querySelector(".choose-lang__top")
  if(langSelector && langSelectorOpen) {

    let langSelectors = langSelector?.querySelectorAll(".choose-lang__body .choose-lang__el")

    let langSelectorText = langSelectorOpen?.querySelector(".h5")

    if(isMobile()) {
      const modal = new Modal({
        replaceContainer: false,
        fromTemplate: true,
        selMainTpl: `.tpl--item-lang`,
        openTriggers: [langSelectorOpen],
      });
    }

  
    langSelectorOpen?.addEventListener('click', () => {
      if(!langSelectorOpen.classList.contains('_active')) {

        if(isDesktop() || isTablet()) {
          langSelectorOpen.classList.add('_active')
          langSelectors?.forEach((item) => {
            item.classList.add('_active')
            item?.addEventListener('click', () => {
              if(langSelectorText) {
                langSelectorText.innerHTML = item.querySelector('.h5').innerHTML
                langSelectorOpen.querySelector('img')?.setAttribute('src', item.querySelector('img')?.getAttribute('src'))
              }
            })
          })
        }

      }
      else {
        if(isDesktop() || isTablet()) { 
          langSelectorOpen.classList.remove('_active')
          langSelectors?.forEach((item) => {
            item.classList.remove('_active')
          })
        }
      }
    })
  }
}

