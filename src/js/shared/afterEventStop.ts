export function afterEventStop<T>(el: Element, eventName: string, callback: (e: Event | T)=> void, timeout=500) {
  var inputTimeout: number;
  function searchInputListener(event: Event) {
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(callback, timeout, event);
  }
  el.addEventListener(eventName, searchInputListener);
}
