import { App } from "../../_app";
import { aPixels } from "../../shared/aPixels";
import { isMobile } from "../../shared/check-viewport";
import SwiperConfigured from "../../shared/swiper";
import { qsUnwrapTpl } from "../../shared/templates";
import { throttle } from "../../shared/throttle";
import trustedQS from "../../shared/trustedQS";
import {
  CardSection,
  headerDrop,
  
  headerDropOptions,
  headerDropParams,
} from "./header-drop";
import { SearchField } from "./searchField";

export interface searchResult {
  cards: string[];
  suggestions: { text: string; href: string }[];
}

interface headerDropSearchOptions{
  suggItemSel: string;
  suggCtrSel: string;
  searchFieldSel: string;
}


export class headerDropSearch extends headerDrop {
  searchOpt: headerDropSearchOptions;
  controller: searchController;

  constructor(app: App, params: headerDropParams = {}) {
    const options = {
      mainSel: ".hdr-drop_search",
      ...params,
    };
    super(app, options);
    this.searchOpt = {
      suggItemSel: ".tpl--hdr-drop-search-query",
      suggCtrSel: ".hdr-drop__queries-ctr",
      searchFieldSel: ".search-field",
    };

    if (!this.cardSection) throw new Error("");
    this.controller = new searchController(this.dropEl, {
      suggItemSel: this.searchOpt.suggItemSel,
      suggCtrSel: this.searchOpt.suggCtrSel,
      searchFieldSel: this.searchOpt.searchFieldSel,
      cardSection: this.cardSection,
    });

    this.controller.searchField.beforeClear = () => {
      !this.controller.searchField.value && this.close();
    };

    this.opt.on.firstOpen = () => {
      this.controller.init();
    }
    
  }
  resultSwiper?: SwiperConfigured;

  initResultSwiper() {
    if (this.cardsCtr) {
      const resultEl = this.cardsCtr.closest<HTMLElement>(".hdr-drop__result");
      if (resultEl) {
        return new SwiperConfigured(resultEl, {
          slidesPerView: 6,
          spaceBetween: aPixels(24),
          wrapperClass: "hdr-drop__cards",
          slideClass: "prod-card",

          mousewheel: {
            sensitivity: 2,
          },

          // allowTouchMove: false,
        });
      }
    }
    return undefined;
  }
  override open() {
    return super.open().then(() => {
      this.controller.searchField.focus();

      this.resultSwiper = this.initResultSwiper();
      
    });
  }
  override close() {
    return super.close().then(() => {
      this.controller.searchField.blur();
      this.controller.searchField.clearInput();
      this.resultSwiper && this.resultSwiper.destroy(true, true);
      this.resultSwiper = undefined;
    });
  }
}

interface searchControllerParams {
  suggItemSel: string;
  suggCtrSel: string;
  searchFieldSel: string;
  cardSection: CardSection;
  flat?: boolean;
}

export class searchController {
  opt: searchControllerParams;
  searchField: SearchField;
  actionUrl: string;
  recommendationsUrl: string;
  recommendationsConfig?: searchResult;
  suggItemEl: Element;
  suggCtrEl: Element;
  cardSection: CardSection;
  constructor(public rootEl: HTMLElement, opt: searchControllerParams) {
    this.opt = opt;

    this.cardSection = this.opt.cardSection;

    this.searchField = new SearchField(
      trustedQS(this.rootEl, this.opt.searchFieldSel)
    );

    if (!this.rootEl.dataset.action)
      throw new Error("У поискового поля не указан action");
    this.actionUrl = this.rootEl.dataset.action;

    if (!this.rootEl.dataset.recommended)
      throw new Error("У поискового поля не указан recommended");
    this.recommendationsUrl = this.rootEl.dataset.recommended;

    this.suggItemEl = qsUnwrapTpl(this.opt.suggItemSel, this.rootEl);
    this.suggCtrEl = trustedQS(this.rootEl, this.opt.suggCtrSel);
  }
  async init() {
    this.getRecommendations().then((r) => this.update(r));

    this.searchField.onInput = () => {
      if (this.searchField.value.trim()) {
        this.resultTitle = "Результаты поиска";
        this.getSearchResult().then((results) => {
          this.update(results);
        });
      } else {
        this.resultTitle = "Обратите внимание";
        this.getRecommendations().then((r) => this.update(r));
      }
    };
  }

  async getRecommendations(): Promise<searchResult> {
    if (this.recommendationsConfig) {
      return new Promise((r) => {
        r(this.recommendationsConfig as searchResult);
      });
    } else {
      return fetch(this.recommendationsUrl)
        .then((r) => r.json() as Promise<searchResult>)
        .then((r) => {
          this.recommendationsConfig = r;
          return r;
        });
    }
  }
  async getSearchResult() {
    const value = this.searchField.value;
    const url =
      this.actionUrl +
      "?" +
      new URLSearchParams({
        q: value,
      });
    return fetch(url).then((r) => r.json());
  }

  update(config: searchResult) {
    if (this.checkEmpty(config)) return;

    const resEl = this.cardSection.cardsCtr.parentElement as HTMLElement;
    resEl.classList.add("_loading");
    const cards = config.cards;
    this.cardSection
      .fillCardsSection(cards, {
        addClasses: isMobile() ? ["prod-card_flat"] : undefined,
        slider: isMobile() ? false : true,
      })
      .then(() => {
        resEl.classList.remove("_loading");
      });

    const sugg = config.suggestions;
    this.fillSuggestions(sugg);
  }
  checkEmpty(config: searchResult) {
    const isEmpty = !config?.cards.length && !config?.suggestions.length;
    this.rootEl.classList.toggle("_nothing-found", isEmpty);
    return isEmpty;
  }
  set resultTitle(val: string) {
    const title = this.rootEl?.querySelector("[result-title]");
    if (!title) return;
    title.textContent = val;
  }
  fillSuggestions(suggestions: { text: string; href: string }[]) {
    this.suggCtrEl.innerHTML = "";
    suggestions.forEach((suggestion, i) => {
      const itemEl = this.suggItemEl.cloneNode(true) as Element;
      if (!suggestion.href) {
        console.error(i, ": не указан href");
        return;
      }
      itemEl.setAttribute("href", suggestion.href);
      if (!suggestion.text) {
        console.error(i, ": не указан text");
        return;
      }
      const itemSpan = trustedQS(itemEl, "span");
      itemSpan.textContent = suggestion.text;

      this.suggCtrEl.appendChild(itemEl);
    });
  }
}
