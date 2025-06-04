import { App } from "../../_app";
import { qsUnwrapTpl, unwrapTpl } from "../../shared/templates";

import { menuRowContent, HeaderConfig } from "./header";
import { headerDrop, headerDropOptions, headerDropParams } from "./header-drop";

export interface menuRowMapItem {
  name: string;
  li?: Element | HTMLAnchorElement;
  subUl?: Element;
  subList: menuRowMapItem[];
  cards: string[];
  brands?: { img: string; href: string }[];
}

interface headerDropCatalogOptions {
  logoCtrSel: string;
  tplBrandLogoSel: string;
  tplDropListSel: string;
  tplDropListItemBase: string;
}

export class headerDropCatalog extends headerDrop {
  catalogOpt: headerDropCatalogOptions;
  private configUrl: string;
  private config?: HeaderConfig;
  brandsCtr?: Element;
  dropMap: menuRowMapItem[] = [];
  activeLists: Element[] = [];

  constructor(app: App, params: headerDropParams = {}) {
    super(app, {
      mainSel: ".hdr-drop_catalog",
      ...params,
    });
    this.catalogOpt = {
      logoCtrSel: ".hdr-drop__brands",
      tplBrandLogoSel: ".tpl-drop-brand-item",
      tplDropListSel: ".tpl-drop-list",
      tplDropListItemBase: ".tpl-drop-item-",
    };

    const config = this.dropEl.dataset.config;
    if (!config) throw new Error("у каталога в шапке не указан data-config");
    this.configUrl = config;

    if (!this.catalogOpt.logoCtrSel)
      throw new Error("logoCtrSel is " + this.catalogOpt.logoCtrSel);
    const brandsCtr = this.dropEl.querySelector(this.catalogOpt.logoCtrSel);

    if (!brandsCtr) throw new Error("can't find " + this.catalogOpt.logoCtrSel);
    this.brandsCtr = brandsCtr;

    this.opt.on.firstOpen = () => {
      this.init();
    };
  }
  async init() {
    this.getConfig().then((config: HeaderConfig) => {
      this.config = config;
      this.fillMenu(this.config.list);
      // отвечает за первую открываемую категорию 
      this.bulkSetActiveSubList(0, 0);
    });
  }
  async getConfig() {
    return fetch(this.configUrl).then((r) => r.json());
  }

  clearBrands() {
    if (this.brandsCtr) {
      this.brandsCtr.innerHTML = "";
    }
  }
  fillBrands(brandsArr: { img: string; href: string }[]) {
    const itemTpl = qsUnwrapTpl(this.catalogOpt.tplBrandLogoSel);
    if (!itemTpl) {
      return;
    }
    this.clearBrands();
    const images = brandsArr.forEach((imgItem) => {
      const item = itemTpl.cloneNode(true) as Element;
      const img = item.querySelector("img");
      if (item && img) {
        item.setAttribute("href", imgItem.href);
        img.setAttribute("src", imgItem.img);

        this.brandsCtr && this.brandsCtr.appendChild(item);
      }
    });
  }
  clearActiveLists() {
    this.activeLists.forEach((el) => {
      el?.classList.remove("_active");
    });
    this.clearBrands();
  }
  fillMenu(config: menuRowContent[]) {
    // отвечает за построение несколько-уровневого меню
    const mainUl = this.dropEl.querySelector("ul.hdr-drop__list");
    if (!mainUl) throw new Error();
    config.forEach((el, i) => {
      this.fillList(el, this.dropMap, i, mainUl);
    });
  }
  // TODO распутать тут все
  fillList(
    listItem: menuRowContent,
    map: menuRowMapItem[],
    itemIndex: number,
    parentUl: Element,
    listLevel = 0
  ) {
    const itemTpl = this.dropEl.querySelector<HTMLTemplateElement>(
      this.catalogOpt.tplDropListItemBase + listLevel
    );
    if (!itemTpl) throw new Error();
    const itemEl = unwrapTpl(itemTpl) as Node;

    const li = parentUl.appendChild(itemEl) as HTMLAnchorElement;

    const liInnerSpan = li.querySelector("[tpl-name]") as HTMLElement;
    if (liInnerSpan) {
      liInnerSpan.innerText = listItem.name;
    }
    if (listItem.href) {
      li.href = listItem.href;
    }

    map[itemIndex] = { name: listItem.name, li: li } as menuRowMapItem;

    if (listItem.subList) {
      if (!this.catalogOpt.tplDropListSel) throw Error();
      const ulTpl = this.dropEl.querySelector<HTMLTemplateElement>(
        this.catalogOpt.tplDropListSel
      );
      if (!ulTpl) throw new Error();
      const ul = unwrapTpl(ulTpl) as Node;

      const subUl = li.appendChild(ul) as Element;

      if (map[itemIndex]) {
        map[itemIndex].subUl = subUl;
        map[itemIndex].subList = [];

        if (listLevel == 1) {
          const itemTpl = qsUnwrapTpl(
            this.catalogOpt.tplDropListItemBase + (listLevel + 1),
            this.dropEl
          ) as Node;
          const li = subUl.appendChild(itemTpl) as HTMLAnchorElement;

          const liInnerSpan = li.querySelector("[tpl-name]") as HTMLElement;
          if (liInnerSpan) {
            liInnerSpan.innerText = "See all";
          }
          if (listItem.href) {
            li.href = listItem.href;
          }
        }

        listItem.subList.forEach((el, i, arr) => {
          this.fillList(el, map[itemIndex].subList, i, subUl, listLevel + 1);
        });
      } else {
        listItem.subList.forEach((el, i, arr) => {
          this.fillList(el, map, i, subUl, listLevel + 1);
        });
      }
    }
    if (listItem.brands) {
      map[itemIndex].brands = listItem.brands;
    }
    if (listItem.cards) {
      map[itemIndex].cards = listItem.cards;
    }

    li.addEventListener("mouseover", (e: Event) => {
      e.stopPropagation();
      this.setActiveSubList(map[itemIndex], listLevel);
    });
  }

  setActiveSubList(item: menuRowMapItem, lvl: number) {
    if (this.activeLists[lvl] !== item.subUl) {
      this.activeLists[lvl] &&
        this.activeLists[lvl].classList.remove("_active");
      if (item.subUl) {
        this.activeLists[lvl] = item.subUl as Element;
        this.activeLists[lvl].classList.add("_active");
      }
      if (item.brands) {
        this.fillBrands(item.brands);
      }
      if (item.cards && item.cards.length) {
        this.cardSection?.fillCardsSection(item.cards);
      } else {
        this.cardSection?.clearCardsSection();
      }
    }
  }
  bulkSetActiveSubList(lvl1I: number, lvl2I: number) {
    this.setActiveSubList(this.dropMap[lvl1I], 0);
    this.setActiveSubList(this.dropMap[lvl1I].subList[lvl2I], 1);
  }
}

export class multiLevelList {
  constructor() {}
}
