import { convertToObject, isCallOrNewExpression } from "typescript";
import { isDesktop, isMobile, isTablet } from "../../shared/check-viewport";
import { aPixels } from "../../shared/aPixels";


export function initRangeSliders(){
  QsA('.range:not([ui-inited])').forEach((el) => { 
    
    rangeSlider(el as HTMLElement)
    el.setAttribute("ui-inited", "");
  })
}

export function rangeSlider (el: HTMLElement) {
  let fromSliders = el.querySelector('.fromSliders')
  let toSliders = el.querySelector('.toSliders')
  let fromInputs = el.querySelector('.fromInputs')
  let toInputs = el.querySelector('.toInputs')

  let initialMax = toInputs.innerHTML

  fillSlider(fromSliders, toSliders, '#7039B5', '#0000FF', toSliders)

  fromSliders.addEventListener('input', () => {
    controlFromSlider(fromSliders, toSliders, fromInputs, initialMax)
  })
  toSliders.addEventListener('input', () => {
    controlToSlider(fromSliders, toSliders, toInputs, initialMax)
  })
  
}
 
function controlFromSlider(fromSlider, toSlider, fromInput, initialMax) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#0000cd', toSlider);
  if (from >= to - getThumbNumber(fromSlider, toSlider, initialMax)) {
    fromSlider.value = (to - getThumbNumber(fromSlider, toSlider, initialMax))
    fromInput.innerHTML = to
  } else {
    fromInput.innerHTML = from;
  }
}

function controlToSlider(fromSlider, toSlider, toInput, initialMax) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#0000cd', toSlider);
  if (to >= from + getThumbNumber(fromSlider, toSlider, initialMax)) {
    toSlider.value = to;
    toInput.innerHTML = to;
    // if(to == initialMax) {
    //   toSlider.classList.add('thumb-transform-right')
    // }
  } else {
      toSlider.value = (from + getThumbNumber(fromSlider, toSlider, initialMax))
      toInput.innerHTML = from
  }
}

function getThumbNumber (fromSlider, toSlider, initialMax) {
  let result = undefined
  console.log(fromSlider.parentElement.parentElement.offsetWidth)
  if(isDesktop()){
    result = (initialMax * aPixels(32))/fromSlider.parentElement.parentElement.offsetWidth
  }
  else if(isTablet()) {
    result = (initialMax * aPixels(32))/fromSlider.parentElement.parentElement.offsetWidth
  }
  else if(isMobile()){
    result = (initialMax * 24)/fromSlider.parentElement.parentElement.offsetWidth
  }
  return result
}

function getParsed(currentFrom, currentTo) {
  const from = parseInt(currentFrom.value, 10);
  const to = parseInt(currentTo.value, 10);
  return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
  const rangeDistance = to.max-to.min;
  const fromPosition = from.value - to.min;
  const toPosition = to.value - to.min;
  controlSlider.style.background = `linear-gradient(
    to right,
    ${sliderColor} 0%,
    ${sliderColor} ${(fromPosition)/(rangeDistance)*100}%,
    ${'#4C00C9'} ${((fromPosition)/(rangeDistance))*100}%,
    ${'#4C00C9'} ${(toPosition)/(rangeDistance)*100}%, 
    ${sliderColor} ${(toPosition)/(rangeDistance)*100}%, 
    ${sliderColor} 100%)`;
}
