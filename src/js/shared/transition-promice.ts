export function transitionProm(el: HTMLElement, clb: () => void) {
  let alternate: NodeJS.Timeout 

  function onTransitionEnd(resolve: (val: unknown) => void) {
    el.removeEventListener("transitionend", onTransitionEnd);
    clearTimeout(alternate)
    resolve(true);
  }

  return new Promise((resolve, reject) => {
    const listener = () => onTransitionEnd(resolve)
    el.addEventListener("transitionend", listener, false);
    setTimeout(() => {
      // действие которое запустит переход
      clb()
    }, 20);
     alternate = setTimeout(() => { 
      el.removeEventListener("transitionend", listener);
      clearTimeout(alternate)
      resolve(true)
    }, 1000)
  });
}
