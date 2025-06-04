/**
 * создаёт цепочку из переданных функций
 * @author Ilya M
 * @example
 * // Пример использования для создания картинки без лишних переменных
 *  const myImg = fnChai
 *    // миксин для document.createElement
 *    () => DcCrEl("img"),
 *    (el) => {
 *      el.setAttribute('src', 'path/to/pic')
 *      el.setAttribute('alt', '')
 *      return el;
 *    }
 *  );
 */

function fnChain<T>(initialValue: T | (() => T), ...fns: ((arg: T) => T)[]): T {
  // Получаем начальное значение - либо вызываем функцию, либо используем как есть
  const start =
    typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;

  // Редуцируем массив функций, передавая результат каждой следующей
  return fns.reduce((acc, fn) => fn(acc), start);
}

export default fnChain;
