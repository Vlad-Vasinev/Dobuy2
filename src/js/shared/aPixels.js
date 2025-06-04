export const aPixels = function($startSize = 0) {
  const $maxWidth = 3840
  const $maxWidthContiner = 1920
  const $minWidth = 1280
  const $minSize = ($startSize / 1920) * 1280
  const $addSize = $startSize - $minSize
  //@media ( min-width: #{$maxWidthContiner + px})

  return +(($minSize) + ($addSize) * ((window.innerWidth - $minWidth) / ($maxWidthContiner - $minWidth))).toFixed(0)
}