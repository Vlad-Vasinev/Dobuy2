export function qsUnwrapTpl<T extends HTMLElement>(selector: string, container?: Element) {
  const tpl: HTMLTemplateElement | null = container
    ? container.querySelector(selector)
    : Qs(selector);

  if (!tpl) {
    throw new Error(`can't find ${selector} in ${ container || "document" }`);
  }
  
  const result = tpl?.content?.firstElementChild?.cloneNode(true);
  
  if (!result) {
    throw new Error();
  }
  return result as T;
}
export function unwrapTpl(tpl: HTMLTemplateElement) {
  if (!tpl) {
    throw new Error();
  }
  const result =
    tpl.content &&
    tpl.content.firstElementChild &&
    tpl.content.firstElementChild.cloneNode(true);

  if (!result) {
    throw new Error();
  }
  return result as HTMLElement;
}
