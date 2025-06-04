
/**
 * Выполняет поиск по элементу и если не находит его - выбрасывает ошибку
 * Позволяет пропустить обработку 
 * Используй если элемент точно будет на странице 
 * То есть если блок может быть, а может нет - использовать обычный Qs
 * @param crt контейнер, в котором будет вестись поиск
 * @param sel селектор элемента
 */
export default function trustedQS<T extends Element = HTMLElement>(
  crt: Element | HTMLElement | Document,
  sel: string
) {
  const el = crt.querySelector<T>(sel);
  if (!el) {
    throw new Error(
      `can't find ${sel} element in ${
        crt instanceof Document ? "document" : crt?.classList.toString()
      }`
    );
  }
  return el;
}
