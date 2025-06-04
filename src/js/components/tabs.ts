import trustedQS from "../shared/trustedQS";

export class TabsBlock {
  el: HTMLElement;
  body: HTMLElement;
  inputs: Record<string, HTMLElement[]> = {};
  constructor(el: HTMLElement) {
    this.el = el;
    this.body = trustedQS(this.el, ".tabs__body");
    this.el.querySelectorAll("[open-tab]").forEach((el, k, list) => {
      const name = el.getAttribute("open-tab");
      if (!name) return;
      !this.inputs[name] && (this.inputs[name] = []);
      this.inputs[name].push(el as HTMLElement);
      this.inputs.select.forEach((el) => {
        console.log(el)
        if(el.classList.contains('old-address')){

          const checkbox = this.el.querySelector('.chbox.chbox_default-checked.chbox_inline input[type="checkbox"]') as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = false;
          }
        }
        else {
          console.log('contains old')
        }
      })
      console.log(this.inputs.select)
      el.addEventListener("click", (e) => {
        console.log(el)
        if(el.classList.contains('old-address')){

          const checkbox = this.el.querySelector('.chbox.chbox_default-checked.chbox_inline input[type="checkbox"]') as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = false;
          }
        }
        else {
          console.log('contains old')
        }
        this.openTab(name);
      });
    });
    // ".tabs__head"
  }
  openTab(name: "input" | "select" | (string & {})) {
    const current = this.body.querySelector(".tabs__tab._active");
    if (current?.getAttribute("tab-name") == name) return;
    const active = this.body.querySelector(`[tab-name="${name}"]`);
    current && current?.classList.remove("_active");
    active && active?.classList.add("_active");
    //console.log(this.inputs)
    //console.log(active?.parentElement?.parentElement)
    //console.log(current)tabs__head
    this.setButtons(name);
  }
  setButtons(name: string) {
    for (const key in this.inputs) {
      const element = this.inputs[key as keyof typeof this.inputs];
      const activate = key == name;
      element.forEach((btn) => {
        btn.classList.toggle("_active", activate);
      });
    }
  }
}
