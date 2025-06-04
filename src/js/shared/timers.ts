import Timer, { TimerParams } from "easytimer.js";

export function countdownTimer(el: Element, opt?: TimerParams) {
  const timer = new Timer({precision: 'seconds', countdown: true, ...opt });
  function tick() {
    el.innerHTML = timer.getTotalTimeValues().toString(['seconds']);
  }
  tick();

  // $().html();
  timer.addEventListener("secondsUpdated", tick);
  timer.addEventListener("reset", tick);
  return timer
}
