/**
 * Миксин для querySelectorAll.forEach
 * По умолчанию поиск по документу, но можно указать контейнер третьим параметром
 */
export const QsAfE = <E extends Element = HTMLElement>(
  sel: string,
  callback: (element: E, index?: number, nodeList?: NodeListOf<E>) => void,
  container: Document | Element = document
): NodeListOf<E> => {
  const items = container.querySelectorAll<E>(sel); // Типизированный querySelectorAll
  items.forEach((item, index, nodeList) => callback(item, index, nodeList)); // Точный вызов callback
  return items; // Возвращаем NodeListOf<E>
};
/**
 * Миксин для querySelectorAll.forEach(el => el.addEventListener(...))
 * По умолчанию поиск по документу, но можно указать контейнер третьим параметром
 * Отлично подходит для создания простых UI элементов
 */
export const QsAfEEL = <E extends Element = HTMLElement>(
  sel: string,
  eventType: string,
  callback: (e: Event) => void,
  container: Document | Element = document
): NodeListOf<E> => {
  return QsAfE(
    sel,
    (el, index, nodeList) => {
      el.addEventListener(eventType, (e) => callback(e));
    },
    container
  );
};

/**
 * Оборачивает функцию в промис
 */
export const callItAsync = (clb: Function) => {
  return new Promise((r) => r(clb()));
};
