import { qsUnwrapTpl, unwrapTpl } from "../../shared/templates";
import { Modal, ModalOptions, ModalParams } from "./modal";
import { searchController } from "./header-drop-search";
import { CardSection } from "./header-drop";
import { App } from "../../_app";
import trustedQS from "../../shared/trustedQS";
import { SearchField } from "./searchField";

interface mobileSearchParams extends ModalParams {
  innerTplSel?: string;
  searchFieldSel?: string;
}
class mobileSearchOptions extends ModalOptions {
  innerTplSel: string = "";
  searchFieldSel: string = "";
  cardsCtrSel: string = "";
}
class mobileSearchDefaults {
  innerTplSel = ".tpl--mobile--search-modal-inner ";
  searchFieldSel = ".search-field";
  cardsCtrSel = ".search-inner__cards";
}

export class mobileSearchModal extends Modal {
  override opt: mobileSearchOptions;
  controller: searchController;
  innerEl: HTMLElement;
  cardsCtr: Element;
  cardSection: CardSection;
  constructor(app: App, params: mobileSearchParams) {
    const defaults = new mobileSearchDefaults();
    super(params);
    this.opt = {
      ...new mobileSearchOptions(),
      ...new mobileSearchDefaults(),
    };
    const innerEl = qsUnwrapTpl(this.opt.innerTplSel);
    this.innerEl = this.bodyEl.appendChild(innerEl) as HTMLElement;

    this.cardsCtr = trustedQS(innerEl, this.opt.cardsCtrSel);
    this.cardSection = new CardSection(app, this.cardsCtr);

    this.controller = new searchController(this.innerEl, {
      suggItemSel: ".tpl--search-query",
      suggCtrSel: ".search-inner__queries .search-inner__queries-ctr",
      searchFieldSel: ".search-inner__search .search-field",
      cardSection: this.cardSection,
      flat: true,
    });

    this.controller.searchField.beforeClear = () => {
      !this.controller.searchField.value && this.close();
    };
    this.opt.on.firstOpen = () => {
      this.controller.init();
    };
  }
  override close(params?: { enScroll: boolean }): Promise<void> {
    return super.close()?.then(() => {
      this.controller.searchField.blur();
      this.controller.searchField.clearInput();
    });
  }
}
