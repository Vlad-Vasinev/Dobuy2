import { App } from "../../_app";
import { isMobile } from "../../shared/check-viewport";
import { qsUnwrapTpl } from "../../shared/templates";
import trustedQS from "../../shared/trustedQS";
import { AddressInput } from "../address-input/addressInput";

import { UserDataInput } from "./user-data-input";

export function initProfile(app: App) {
  const profile = Dc.body.querySelector<HTMLElement>(".profile");
  if (!profile) return undefined;
  const result: {
    userData?: UserData;
  } = {
    userData: undefined,
  };
  const userData = profile.querySelector<HTMLElement>(".prof-user-data");
  if (userData) {
    result.userData = new UserData(app, userData);
  }
  return result;
}
export class UserData {
  constructor(app: App, el: HTMLElement) {
    const userDataFormEl =
      el.querySelector<HTMLFormElement>(".prof-user-inputs");
    userDataFormEl && new UserDataInput(userDataFormEl);
    //
    const addressInputEl = el.querySelector<HTMLElement>(".prof-addresses");
    addressInputEl && new UserAddressManager(addressInputEl);
  }
}
class UserAddressManager {
  opt = {
    maxAmount: 3,
  };
  actionUrl: string;
  crt: Element;
  items: ProfileAddress[];
  addBtn: HTMLButtonElement;
  constructor(el: HTMLElement) {
    if (!el.dataset.action)
      throw new Error("у менеджера адресов не задан action");
    this.actionUrl = el.dataset.action;
    this.counterEl = trustedQS<Element>(el, ".prof-addresses__counter");
    this.crt = trustedQS<Element>(el, ".prof-addresses__crt");
    this.items = Array.from(
      this.crt.querySelectorAll<HTMLElement>(".prof-address")
    ).map((el) => {
      return new ProfileAddress(this, el);
    });
    this.counter = this.items.length;
    this.addBtn = trustedQS<HTMLButtonElement>(el, "[name='add-address']");
    this.addBtn.addEventListener("click", () => {
      this.addItem();
    });
  }
  toggleAddBtn() {
    const disabled = this.items.length >= this.opt.maxAmount;
    this.addBtn.disabled = disabled;
    if(!this.addBtn.parentElement) throw new Error('нет .prof-addresses__bottom')
    this.addBtn.parentElement.classList.toggle("_hidden", disabled);
  }
  private counterEl: Element;

  set counter(val: number) {
    if (this.counterEl.textContent && +this.counterEl.textContent == val)
      return;

    this.counterEl.textContent = val.toString();
  }
  get counter() {
    return +(this.counterEl.textContent || "");
  }

  addItem() {
    const tpl = this.crt.appendChild(
      qsUnwrapTpl(".tpl--profile--address-item")
    ) as HTMLElement;
    const newItem = new ProfileAddress(this, tpl);
    this.items.push(newItem);
    this.counter = this.items.length;

    newItem.title.innerText = "Адрес " + (this.counter || "");
    this.toggleAddBtn();
  }
  saveItem(item: ProfileAddress) {
    if (item.id) {
      return fetch(this.actionUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "patch",
          id: item.id,
          ...item.input.value,
        }),
      });
    } else {
      return fetch(this.actionUrl, {
        method: "POST",
        body: JSON.stringify({ action: "add", ...item.input.value }),
      })
        .then((resp) => {
          if (resp.ok) {
            resp.json().then((data) => {
              if (data.id) {
                item.id = data.id;
              } else {
                throw new Error("В ответе не было id");
              }
            });
          } else {
            throw new Error("showErr Failed to save address");
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  removeItem(item: ProfileAddress) {
    const removeItem = () => {
      const iToDelIndex = this.items.findIndex((i) => i === item);
      if (iToDelIndex < 0)
        throw new Error("showErr An error occurred while deleting the item.");
      const iToDel = this.items.splice(iToDelIndex, 1)[0];
      if (this.items.length) {
        iToDel.el.remove();
      } else {
        iToDel.el.parentElement && (iToDel.el.parentElement.innerHTML = "");
      }
      this.counter = this.items.length;
    };

    if (item.id) {
      const isConf = confirm(
        `Are you sure you want to delete the address? ${item.input.addressString} ?`
      );
      if (!isConf) return;

      return fetch(this.actionUrl, {
        method: "POST",
        body: JSON.stringify({ 
          action: "delete",
          id: item.id }),
      }).then((r) => {
        if (r.ok) {
          removeItem();
        } else {
          throw new Error("showErr Failed to delete address");
        }
      });
    } else {
      removeItem();
    }
  }
}
class ProfileAddress {
  el: HTMLElement;
  input: AddressInput;
  title: HTMLElement;

  get id() {
    return this.el.dataset.id;
  }
  set id(val: string | undefined) {
    this.el.dataset.id = val;
  }
  constructor(manager: UserAddressManager, el: HTMLElement) {
    this.el = el;

    this.input = new AddressInput(
      trustedQS(this.el, ".address-input")
    );
    this.title = trustedQS(this.el, ":scope > span");
    trustedQS(this.el, ".prof-address__del").addEventListener(
      "click",
      () => {
        manager.removeItem(this);
      }
    );
    this.input.streetModal.streetInput.opt.afterSubmit = () => {
      manager.saveItem(this);
    };
  }
}
