import { isMobile } from "../../shared/check-viewport";
import { headerDropCatalog } from "./header-drop-catalog";
import { mobileCatalogModal } from "./mobile-catalog-modal";

import { headerDropSearch } from "./header-drop-search";
import { mobileSearchModal } from "./mobile-search-modal";

import { App } from "../../_app";

// Возможные параметры для выделения мобильного и десктопа
// (Например: на десктопе выводится имя, а на телефоне только картинка)
export type menuRowContentSpecial = "no-title" | "no-image";

export interface menuRowContent {
  image: string;
  name: string;
  href: string;
  subList: menuRowContent[];
  cards: string[];
  brands?: { img: string; href: string }[];
  special?: {
    mob?: menuRowContentSpecial[];
    dsk?: menuRowContentSpecial[];
  };
}

export interface HeaderConfig {
  list: menuRowContent[];
  brands: { img: string; href: string }[];
}

function initHeaderDrops(app: App) {
  return {
    catalog: Qs(".hdr-drop_catalog")
      ? new headerDropCatalog(app, {
          openTriggers:
            QsA("[catalog-open]") || undefined,
        })
      : undefined,
    search: Qs(".hdr-drop_search")
      ? new headerDropSearch(app, {
          openTriggers: QsA("[search-open]") || undefined,
        })
      : undefined,
  };
}
function initHeaderModals(app: App) {
  return {
    catalog: Qs(".mobile-catalog-modal")
      ? new mobileCatalogModal(app, {
          container: ".mobile-catalog-modal",
          openTriggers:
            QsA("[catalog-open]") || undefined,
          init: false,
          fromTemplate: true,
        })
      : undefined,
    search: Qs(".mobile-catalog-modal")
      ? new mobileSearchModal(app, {
          title: "Поиск",
          container: ".mobile-search-modal",
          openTriggers: QsA("[search-open]") || undefined,
          fromTemplate: true,
        })
      : undefined,
  };
}

export class HeaderComponent {
  drops: {
    catalog?: headerDropCatalog;
    search?: headerDropSearch;
  };
  modals: {
    catalog?: mobileCatalogModal;
    search?: mobileSearchModal;
  };

  constructor(app: App) {
    // На мобильном каталог
    this.drops = !isMobile() ? initHeaderDrops(app) : {};
    this.modals = isMobile() ? initHeaderModals(app) : {};
  }
}
