export default class navCounter {
  cntrs: NodeListOf<HTMLElement>;

  constructor(sel: string) {
    this.cntrs = QsA(sel);
  }
  set(fn: (prevValue: number) => number) {
    this.cntrs.forEach((el) => {
      if (!el.textContent || isNaN(+el.textContent)) {
        el.textContent = "0";
      }
      const res = fn(+el.textContent);
      if (res < 1) {
        el.textContent = "";
      }
      el.textContent = res.toString();
    });
  }
  inc() {
    this.set((prevValue) => prevValue + 1);
  }
  dec() {
    this.set((prevValue) => prevValue - 1);
  }
}
