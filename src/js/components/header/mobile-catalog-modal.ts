import { qsUnwrapTpl, unwrapTpl } from "../../shared/templates";
import { ModalStepMenu, StepMenuOptions, StepMenuParams } from "./step-menu";
import { HeaderConfig, menuRowContent, menuRowContentSpecial } from "./header";
import { isMobile } from "../../shared/check-viewport";
import { App } from "../../_app";

interface mobileCatalogModalParams extends StepMenuParams {}
class mobileCatalogModalOptions extends StepMenuOptions {}

//Максимальный уровень вложенности списка (с нуля)
const maxLevel = 1;
//

export class mobileCatalogModal extends ModalStepMenu {
  override opt: mobileCatalogModalOptions = new mobileCatalogModalOptions();
  constructor(app: App, params?: mobileCatalogModalParams) {
    const options = { ...new mobileCatalogModalOptions(), ...params };
    super(app, { ...options });
    this.opt = options;

    this.stepEl = qsUnwrapTpl(".tpl--mobile--hdr-ctlg-list");
    this.itemEl = qsUnwrapTpl(".tpl--mobile--hdr-ctlg-list-item");
    this.brandEl = qsUnwrapTpl(".tpl--mobile--hdr-ctlg-list-brand");

    if (!this.el.dataset.config) {
      throw new Error("no mobile catalog config");
    }
    this.configUrl = this.el.dataset.config;
    this.opt.on.firstOpen = () => {
      this.fillContent().then(() => {
        this.init();
        app.func.updateLazy()
      });
    };
  }
  config?: HeaderConfig;
  configUrl: string;
  async fillContent() {
    return this.getConfig().then((config: HeaderConfig) => {
      this.config = config;
      this.fillMenu(this.config);
    });
  }
  async getConfig() {
    return fetch(this.configUrl).then((r) => r.json());
  }
  stepEl: Node;
  itemEl: Node;
  brandEl: Node;
  fillBrands(ctr: Element, list: { img: string; href: string }[]) {
    list.forEach((item) => {
      const brand = this.brandEl.cloneNode(true) as HTMLAnchorElement;
      const img = brand.querySelector("[tpl-img]") as HTMLElement;
      if (img) {
        img.dataset.src = item.img;
      }
      brand.href = item.href;

      ctr.appendChild(brand);
    });
  }
  fillMenu(config: HeaderConfig) {
    const step = this.addStep(this.stepEl.cloneNode(true) as HTMLElement);

    step.dataset.stepTitle = "Каталог товаров";
    step.setAttribute("default-step", "");

    // Убираем смотреть позже из первого раздела каталога
    const viewAll = step.querySelector(".hdr-ctlg-list__view-all");
    viewAll && viewAll.remove();

    if (config.brands) {
      const brandsCtr = step.querySelector(
        ".hdr-ctlg-list__brands .hdr-ctlg-list__brands-ctr"
      );
      brandsCtr && this.fillBrands(brandsCtr, config.brands);
    } else {
      step.querySelector(".hdr-ctlg-list__brands")?.remove();
    }

    const iconContainer = step.querySelector(".hdr-ctlg-list__icons");
    config.list.forEach((el, i) => {
      this.fillList(el, i, iconContainer as Element);
    });
  }
  map?: {};
  getListItemSpecialParam(item: menuRowContent, prop: menuRowContentSpecial) {
    return item.special && isMobile()
      ? item.special &&
          item.special.mob?.length &&
          item.special.mob.includes(prop)
      : item.special &&
          item.special.dsk?.length &&
          item.special.dsk.includes(prop);
  }
  fillList(
    listItem: menuRowContent,
    itemIndex: number,
    parentUl: Element,
    listLevel = 0
  ) {
    const li = parentUl.appendChild(
      this.itemEl.cloneNode(true)
    ) as HTMLAnchorElement;
    const noTitle = this.getListItemSpecialParam(listItem, "no-title");
    if (listItem.name && !noTitle) {
      const liInnerSpan = li.querySelector("[tpl-name]") as HTMLElement;
      liInnerSpan.innerText = listItem.name;
    }
    const noImage = this.getListItemSpecialParam(listItem, "no-image");
    if (listItem.image && !noImage) {
      const liInnerImg = li.querySelector("[tpl-img]") as HTMLImageElement;
      liInnerImg.dataset.src = listItem.image;
    }

    if (listItem.subList && listLevel < maxLevel) {
      const step = this.addStep(this.stepEl.cloneNode(true) as HTMLElement);

      step.dataset.stepTitle = listItem.name;
      const viewAll = step.querySelector<HTMLAnchorElement>(
        ".hdr-ctlg-list__view-all"
      );
      if (viewAll && listItem.href) {
        viewAll.href = listItem.href;
      }
      if (listItem.brands) {
        const brandsCtr = step.querySelector(
          ".hdr-ctlg-list__brands .hdr-ctlg-list__brands-ctr"
        );
        brandsCtr && this.fillBrands(brandsCtr, listItem.brands);
      } else {
        step.querySelector(".hdr-ctlg-list__brands")?.remove();
      }

      const iconContainer = step.querySelector(".hdr-ctlg-list__icons");
      listItem.subList.forEach((el, i, arr) => {
        this.fillList(el, i, iconContainer as Element, listLevel + 1);
      });

      li.addEventListener("click", (e: Event) => {
        e.stopPropagation();
        this.goToStep(step);
      });
    } else {
      listItem.href && (li.href = listItem.href);
    }
  }
}
