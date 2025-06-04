import { App } from "../../_app";
import navCounter from "../../shared/navCounter";
import { ProductCardContent } from "../product-card";
import { prodMsg } from "../snackbar/snackbar";

export class Favorites {
  actionUrl: string;
  showMsg: (item: prodMsg, type?: "cart" | "fav") => Promise<any>;
  navCounter: navCounter;

  constructor(app: App) {
    this.actionUrl = window.appConfig.favoritesAction;
    if (!this.actionUrl)
      throw Error("в документе не указан action для избранного");
    this.showMsg = (i, t) => app.modules.snackBar.showProduct(i, t);
    this.navCounter = new navCounter("[data-nav-favorites] .icon-btn-count ");
  }
  async toggleFav(target: HTMLButtonElement, id: string, card: prodMsg) {
    if (!appConfig.loggedIn) {
      app.func.openLogin(
        "Log in to your account to add the product to your favorites."
      );
      return;
    }

    const isActive = !target.classList.contains("_active");
    const req = isActive ? this.addFav(id, target) : this.removeFav(id, target);
    target.disabled = true;

    return req
      .then((r) => {
        if (r.ok) {
          QsAfE(`.prod-card[data-item-id='${id}'] .button_heart`, (el) =>
            el.classList.toggle("_active", isActive)
          );

          if (isActive) {
            this.showMsg(card, "fav");
          }
        } else {
          throw new Error("showErr Не удалось добавить товар в избранное");
        }
      })
      .catch((err) => {
        throw new Error("showErr Не удалось добавить товар в избранное");
      })
      .finally(() => {
        target.disabled = false;
      });
  }
  async addFav(id: string, target: HTMLButtonElement) {
    return fetch(this.actionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        action: "add",
        id,
      }),
    }).then((r) => {
      this.navCounter.inc();
      r.ok && target.classList.add("_active");
      return r;
    });
  }
  async removeFav(id: string, target: HTMLButtonElement) {
    return fetch(this.actionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        action: "delete",
        id,
      }),
    }).then((r) => {
      this.navCounter.dec();
      r.ok && target.classList.remove("_active");
      return r;
    });
  }
}
