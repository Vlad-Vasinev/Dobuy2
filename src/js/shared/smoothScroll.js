/**
 * scroll smoothly to a element in the DOM.
 * @param elem element to scroll to
 * @param offset int offset pixels from element (default is 0)
 * @returns promise that gets resolved when scrolling is complete
 */
export function smoothScroll(elem, offset = 0) {
  const rect = elem.getBoundingClientRect();
  let targetPosition = rect.top + self.scrollY + offset;
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
  
  return new Promise((resolve, reject) => {
    const failed = setTimeout(() => {
      reject();
    }, 2000);

    const scrollHandler = () => {
      if (self.scrollY === targetPosition) {
        window.removeEventListener("scroll", scrollHandler);
        clearTimeout(failed);
        resolve();
      }
    };
    if (self.scrollY === targetPosition) {
      clearTimeout(failed);
      resolve();
    } else {
      window.addEventListener("scroll", scrollHandler);
    }
  });
}