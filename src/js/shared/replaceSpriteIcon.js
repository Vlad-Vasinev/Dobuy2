export function replaceIcon(el, newIcon){
  if(!el || !newIcon){
    console.error('Не получилось заменить иконку')
    return
  }
  const iconUse = el.querySelector('svg use')
  if(iconUse){
    const oldUrl = iconUse.getAttribute('xlink:href')
    const newUrl = oldUrl.replace(/#.*$/, '#' + newIcon)
    iconUse.setAttribute('xlink:href', newUrl)
  }
  else{
    console.error('нет use')
  }

}