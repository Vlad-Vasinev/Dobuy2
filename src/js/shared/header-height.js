
export const getHeaderHeight = () => {
  try {
    const headerHeight = document?.querySelector('.header__inner').offsetHeight;
    if (isMobile()) {
      document.body.style.setProperty('--header-height', `${headerHeight}px`)
    }
    else {
      document.body.style.setProperty('--header-height', `${(headerHeight / window.innerWidth * 100)?.toFixed(3)}vw`);
    }
    
  } catch (error) {
    
  }
}
