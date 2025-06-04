export function replaceIcon(el: HTMLElement, newIcon: string) {
  if (!el || !newIcon) {
    console.error("Не получилось заменить иконку");
    return;
  }
  const iconUse = el.querySelector("svg use");
  if (iconUse) {
    const oldUrl = iconUse.getAttribute("xlink:href");
    if (!oldUrl) return;
    const newUrl = oldUrl.replace(/#.*$/, "#" + newIcon);
    iconUse.setAttribute("xlink:href", newUrl);
  } else {
    console.error("нет use");
  }
}

export function spriteSvg(name: string) {
  const svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    useElem = document.createElementNS("http://www.w3.org/2000/svg", "use");

  useElem.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    `${window.appConfig.templatePath}spriteMono.svg#${name}`
  );

  svgElem.appendChild(useElem);
  svgElem.classList.add('sprite-icon')
  return svgElem;
}
