import { afterEventStop } from "../../shared/afterEventStop";
import trustedQS from "../../shared/trustedQS";
import { getUiInputBlock } from '../forms';
import { Modal } from "../header/modal";

import { highlightText } from "./suggestionDropdown";



export class cityInputCDEKModal extends Modal {
  // value: string;
  get value() {
    return this.cityInput.inputValue;
  }
  resultInput?: HTMLInputElement;
  cityInput: cityInputCDEK;
  cityCode?: number;
  cityCoords?: {
    longitude: number;
    latitude: number;
  };
  pvzListArray = [];
  currentPvz?: any;
  mapDataSource?: any;
  mapLayer?: any;

  constructor() {
    super({
      container: ".city-input-cdek-modal",
      fromTemplate: true,
      selMainTpl: ".tpl--city-cdek-input",
    });
    this.resultInput = trustedQS<HTMLInputElement>(
        document,
        '[name="city-input-cdek"]'
    ) as HTMLInputElement;
    this.cityInput = new cityInputCDEK(this, trustedQS(this.bodyEl, ".city-cdek-form"));
    this.opt.on.afterOpen = () => {
      this.cityInput.input.focus();
    };
    this.cityCode = undefined;
  }

  clear() {
    this.cityInput.clear();
    this.resultInput?.dispatchEvent(new Event("change"));
  }
}

export class cityInputCDEK {
  opt = {
    afterSubmit: (ci: cityInputCDEK) => {},
  };
  el: HTMLElement;
  input: HTMLInputElement;
  suggCrt: HTMLElement;
  suggestionUrl: string;
  constructor(cityCDEKModal: cityInputCDEKModal, el: HTMLElement) {
    this.el = el;

    if (!this.el.dataset.suggestion)
      throw new Error("У ввода адреса не указан data-suggestion");
    this.suggestionUrl = this.el.dataset.suggestion;
    this.input = trustedQS<HTMLInputElement>(this.el, 'input[name="city"]');
    this.suggCrt = trustedQS(this.el, ".city-form__sugg-crt");
    afterEventStop(this.input, "input", () => {
      this.valid = false;
      if (this.input.value.trim()) {
        console.log(this.input.value);
        this.getSuggestions().then((data) => {
          console.log(data);
        //   console.log(data);
          this.fillList(data);
        });
      } else {
        this.active = false;
        this.suggCrt.innerHTML = "";
      }
    });
    this.el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const suggest = (e.target as HTMLElement).closest("li");
      if (suggest && suggest.textContent) {
        this.inputValue = suggest.textContent;
        console.log(suggest);
        this.valid = true;
        this.active = false;
        this.suggCrt.innerHTML = "";
        cityCDEKModal.cityCode = +suggest.getAttribute('data-city-code');

        if (!cityCDEKModal.resultInput) {
          console.error("Не передан resultInput");
          return;
        }
        this.getCity(`${cityCDEKModal.cityCode}`)
            .then(data => {
              const cityInfo = data[0];
              console.log(cityInfo);
              cityCDEKModal.cityCoords = {
                latitude: cityInfo.latitude,
                longitude: cityInfo.longitude,
              };

              cityCDEKModal.resultInput!.value = this.inputValue;
              cityCDEKModal.resultInput!.closest(".ui-input")?.classList.add("is-focused");
              cityCDEKModal.resultInput!.dispatchEvent(
                  new Event("change", { bubbles: true })
              );

              const pvzList = this.getPvzList(0, 500, `${cityCDEKModal.cityCode}`);
              pvzList.then((result) => {
                const headers = result.headers;
                console.log(headers);

                result.json().then(data => {
                  cityCDEKModal.pvzListArray = data;
                })
              });

              getUiInputBlock(cityCDEKModal.resultInput)!.querySelector('.ui-input__float-label_error')?.remove()
              this.opt.afterSubmit && this.opt.afterSubmit(this);
            });
      }
    });
  }

  fillList(data: any[]) {
    const createItem = () => {
      const el = DcCrEl("li");
      // el.classList.add("sugg-drop__item");
      return el;
    };

    if (data.length) {
      const elements = data.map((el, i) => {
        const sugg = createItem();
        sugg.innerHTML = highlightText(el.full_name, this.inputValue);
        sugg.setAttribute('data-city-code', el.code);
        return sugg;
      });
      this.suggCrt.innerHTML = "";
      this.suggCrt.append(...elements);
    } else {
      const nothingFound = createItem();
      nothingFound.innerHTML = "Такого города не найдено";
      this.suggCrt.innerHTML = "";
      this.suggCrt.append(nothingFound);
    }
    this.active = true;
  }
  async getSuggestions() {
    console.log(this.suggestionUrl);
    // return new Promise((resolve, reject) => {
    //   resolve([{
    //     city_uuid: "01581370-81f3-4322-9a28-3418adfabd97",
    //     code: 44,
    //     full_name: "Москва, Россия",
    //   }]);
    // });
    // is_handout=true&action=offices&page=0&size=500&city_code=146
    //     ?action=cities&name=%D1%8F%D1%80%D0%BE%D1%81 такой запросы на города выходит

    return fetch(
      this.suggestionUrl +
        "?" +
        new URLSearchParams({
          is_handout: true,
          action: 'cities',
          name: this.input.value,
        })
    ).then((r) => r.json() as Promise<any[]>);

    // return fetch(
    //     this.suggestionUrl +
    //     "?" +
    //     new URLSearchParams({
    //       is_handout: true,
    //       action: 'offices',
    //       page: 0,
    //       size: 500,
    //       city_code:
    //     })
    // ).then((r) => r.json() as Promise<string[]>);
  }
  async getCity(code: string) {
    // return new Promise((resolve, reject) => {
    //   resolve([{
    //     code: 146,
    //     city_uuid: "d12accda-7d2c-4e07-9e13-ca8a6da6e308",
    //     city: "Ярославль",
    //     fias_guid: "6b1bab7d-ee45-4168-a2a6-4ce2880d90d3",
    //     country_code: "RU",
    //     country: "Россия",
    //     region: "Ярославская область",
    //     region_code: 35,
    //     fias_region_guid: "a84b2ef4-db03-474b-b552-6229e801ae9b",
    //     sub_region: "городской округ Ярославль",
    //     longitude: 39.893813,
    //     latitude: 57.626559,
    //     time_zone: "Europe/Moscow",
    //     payment_limit: -1,
    //   }]);
    // });

    return fetch(
        this.suggestionUrl +
        "?" +
        new URLSearchParams({
          is_handout: true,
          action: 'city',
          code: code
        })
    ).then((r) => r.json() as Promise<any[]>);
  }
  async getPvzList(page: number, size = 500, code: string) {
    // https://dev.dobuy.ru/local/cdek/?is_handout=true&action=offices&page=0&size=500&city_code=146
    try {
      const response = await fetch(
          // 'http://localhost:3000/api/pvz-list.json' +
          this.suggestionUrl +
          "?" +
          new URLSearchParams({
            is_handout: true,
            action: 'offices',
            page,
            city_code: code
          })
      );

      return response;
    } catch (error) {
      console.error("Error:", error);
    }
  }
  set active(isEmpty: boolean) {
    this.el.classList.toggle("_active", isEmpty);
  }
  set inputValue(value: string) {
    this.input.value = value;
  }
  get inputValue() {
    return this.input.value;
  }
  set valid(isValid: boolean) {
    isValid
      ? this.input.setAttribute("valid", "")
      : this.input.removeAttribute("valid");
  }
  get isValid() {
    return this.input.hasAttribute("valid");
  }
  clear() {
    this.inputValue = "";
  }
}
