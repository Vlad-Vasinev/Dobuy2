export const disableScroll = () => {
  // console.info('dis scroll');
  const pagePosition = window.scrollY;
  const paddingOffset = window.innerWidth - document.body.offsetWidth;

  const fixBlocks = document?.querySelectorAll('.fixed-block, [fixed-block]');
  fixBlocks.forEach(el => {
    el.style.paddingRight =
      ((+window.getComputedStyle(el).paddingRight.replace(/px/g, '')) + paddingOffset) + 'px';
    document.documentElement.style.scrollBehavior = 'none';
  });
  // --- Нужно для прилипающего меню, вне doBuy можно удалить 
  const isMobile = window.innerWidth < 768
  if(!isMobile && window.stickyMenu == undefined){
    window.stickyMenu = document.querySelector('.sticky-menu .sticky-menu__side')
  }
  if(!isMobile && window.stickyMenu){
    const menu = window.stickyMenu
    const rect = menu.getBoundingClientRect()
    menu.style.setProperty('--beforeSDTop', rect.top.toFixed() + "px")
    menu.style.setProperty('--beforeSDLeft', rect.left.toFixed() + "px")
    menu.classList.add("_fixed")
  }
  // ---
  document.body.style.paddingRight = paddingOffset + 'px';
  document.body.style.setProperty('height', '100%');
  document.body.style.setProperty('overflow', 'hidden');

  if (isMobile) {
    document.body.style.setProperty('padding-top', '60px');
  }
  // document.body.dataset.position = pagePosition;
  // document.body.style.top = ${-pagePosition + 60}px;
  // document.body.style.setProperty('--fixedOffset', ${pagePosition}px)
  // document.body.classList.add('dis-scroll');
  document.body.querySelector('header')
      .style.setProperty('position', 'fixed');
}
export const enableScroll = () => {

  const fixBlocks = document?.querySelectorAll('.fixed-block, [fixed-block]');
  const body = document.body;
  const pagePosition = parseInt(document.body.dataset.position, 10);
  fixBlocks.forEach(el => { el.style.paddingRight = ''; });
  // ---
  if(window.stickyMenu){
    setTimeout(() => { window.stickyMenu.classList.remove("_fixed") }, 50)
  }
  // ---
  document.body.style.paddingRight = '0px';
  document.body.style.setProperty('--fixedOffset', null)
  document.body.style.top = null;
  document.body.classList.remove('dis-scroll');
  pagePosition && window.scroll({
    top: pagePosition,
    left: 0
  });
  document.body.removeAttribute('data-position');

  const isMobile = window.innerWidth < 768
  if (isMobile) {
    document.body.style.removeProperty('padding-top');
  }
  document.body.style.removeProperty('height');
  document.body.style.removeProperty('overflow');
  document.body.querySelector('header')
      .style.removeProperty('position', 'fixed');
}