export function onDocLoad(clb: (e?: Event) => void) {
  if (Dc.readyState != 'complete') {
    Dc.addEventListener('DOMContentLoaded', clb);
  } else {
    clb()
  }
}
export function onWinLoad(clb: (e?: Event) => void) {
  if (Dc.readyState != 'complete') {
    window.addEventListener('load', clb);
  } else {
    clb()
  }
}

