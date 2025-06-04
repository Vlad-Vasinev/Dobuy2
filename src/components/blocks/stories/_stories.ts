import Swiper from "swiper";
import { aPixels } from "../../../js/shared/aPixels";
import { disableScroll, enableScroll } from "../../../js/shared/scroll";
import SwiperConfigured from "../../../js/shared/swiper";
import { qsUnwrapTpl } from "../../../js/shared/templates";
import { transitionProm } from "../../../js/shared/transition-promice";
import trustedQS from "../../../js/shared/trustedQS";
import { isMobile } from "../../../js/shared/check-viewport";
import { SwiperOptions } from "swiper/types/swiper-options";
import vanillaLazy, { ILazyLoadOptions } from "vanilla-lazyload";
import CancelablePromise from "cancelable-promise";
import { Autoplay } from 'swiper/modules';

type StoriesContent =
  | {
      type: "folders";
      folders: StoriesFolderContent[];
    }
  | {
      type: "singles";
      singleItems: StoriesSingleContent[];
    };
interface StoriesSingleContent {
  title: string;
  preview: string;
  item: StoriesItemContent;
}
interface StoriesFolderContent {
  icon: string;
  title: string;
  preview: string;
  items: StoriesItemContent[];
}
interface StoriesItemContent {
  type: "image" | "video";
  src: string;
  preview: string;
  desk: string;
  duration?: string;
}

const config = {
  defaultTimeOut: 30,
  // defaultTimeOut: 1000,
};

// Пользователь нажимает на историю
// Истории открываются
// Загружается конфиг
// начинается воспроизведение

function startSliderLazy(el: HTMLElement, opt?: ILazyLoadOptions) {
  const vl = new vanillaLazy({
    container: el,
    elements_selector: `.stories-item img[data-src]`,
    unobserve_entered: true,
    thresholds: "0px -5% 0px 0px",
    class_loading: "_loading",
    class_loaded: "is-loaded",
    callback_loaded: (el) => {
      el.parentElement?.classList.remove("_loading");
      setTimeout(() => {
        el.removeAttribute("data-ll-status");
        el.removeAttribute("data-src");
        el.classList.remove("entered", "is-loaded");
      }, 2000);
    },
    callback_loading: (el) => {
      el.parentElement?.classList.add("_loading");
    },
    callback_finish: () => {
      vl.destroy();
    },

    ...opt,
  });
  return vl;
}

interface StoriesConfig {
  mainSel: string;
  innerSel: string;
  previewItem: string;
}

export function initStories(
  config = {
    mainSel: ".stories",
    innerSel: ".stories__inner",
    previewItem: ".stories-pv",
  }
) {
  const el = Qs(config.mainSel);
  if (!el) return undefined;
  const url = el.dataset.content;
  if (!url) throw new Error("У историй не указана ссылка на контент");
  return new Stories(el, url, config);
}

class Stories {
  el: HTMLElement;
  content?: StoriesContent;
  fs?: StoriesFullscreen | null;
  videosOnPage?: NodeListOf<HTMLVideoElement>;

  constructor(
    el: HTMLElement,
    public contentUrl: string,
    public config: StoriesConfig
  ) {
    this.el = el;
    trustedQS(this.el, this.config.innerSel).addEventListener(
      "click",
      (event) => {
        const target = event.target as Element;
        const story = target.closest(this.config.previewItem);

        if (story) {
          const parent = story.parentNode;
          if (!parent) return;
          const storyIndex = Array.prototype.indexOf.call(
            parent.children,
            story
          );
          this.open(Math.max(storyIndex, 0));
        }
      }
    );
  }
  private async getConfig() {
    return fetch(this.contentUrl).then(
      (r) => r.json() as Promise<StoriesContent>
    );
  }
  unmuted: boolean = !isMobile();

  open(index = 0) {
    app.activeModal = this;
    this.videosOnPage = QsA("video");
    this.videosOnPage.forEach((el) => {
      !el.paused && el.pause();
    });

    const openWithConfig = (content: StoriesContent) => {
      disableScroll();
      this.fs = new StoriesFullscreen(this, content);
      this.fs.open(index);
    };

    if (!this.content) {
      this.getConfig().then((content) => {
        this.content = content;
        openWithConfig(this.content);
      });
    } else {
      openWithConfig(this.content);
    }
  }

  close() {
    return new Promise<void>((r) => {
      this.fs?.destroy();
      this.fs = null;
      enableScroll();
      this.videosOnPage?.forEach((el) => {
        el.paused && el.play();
      });
      r();
    });
  }
}

function loadVideo(videoEl: HTMLVideoElement) {
  videoEl.src = videoEl.dataset.src as string;
  return new CancelablePromise<boolean>((res) => {
    if (!Dc.body.contains(videoEl)) {
      res(false);
    }
    if (videoEl.readyState < 4) {
      videoEl.addEventListener(
        "loadeddata",
        () => {
          res(true);
        },
        { once: true }
      );

      videoEl.load();
    } else {
      res(true);
    }
  });
}

const unmuteVideo = (video: HTMLVideoElement) => {
  video.removeAttribute("muted");
  video.muted = false;
};

const storiesFullscreenSwiperParams: SwiperOptions = {
  slidesPerView: isMobile() ? 1 : 2.74,
  spaceBetween: isMobile() ? 0 : aPixels(336),
  wrapperClass: "stories-slider__wrapper",
  slideClass: "stories-slider__item",
  centeredSlides: true,
  navigation: {
    nextEl: ".stories-nav__next",
    prevEl: ".stories-nav__prev",
  },
  pagination: isMobile()
    ? {
        el: ".stories-nav__pag",
        bulletElement: "div",
      }
    : false,
};

class StoriesFullscreen {
  el: HTMLElement;
  slides: HTMLElement[] = [];
  slider: Swiper;
  storiesItemsStorage = new FragmentStorage();
  storiesItems: StoriesFolder[] | StoriesSingle[] = [];
  private folderTpl: Element;

  constructor(private stories: Stories, private content: StoriesContent) {
    this.el = qsUnwrapTpl(".tpl--stories--fs");
    const fsSliderEl = trustedQS(this.el, ".stories-slider");
    const fsSliderWrapperEl = trustedQS(
      fsSliderEl,
      ".stories-slider__wrapper"
    );

    const fsItem = qsUnwrapTpl(".tpl--stories--fs--item");

    if (content.type == "folders") {
      this.slides = content.folders.map((folderContent) => {
        const newItem = fsSliderWrapperEl.appendChild(
          fsItem.cloneNode(true)
        ) as HTMLElement;
        newItem.style.backgroundImage = `url(${folderContent.preview})`;
        return newItem;
      });
      this.folderTpl = qsUnwrapTpl(".tpl--stories--folder");
    } else {
      this.slides = content.singleItems.map((folderContent) => {
        const newItem = fsSliderWrapperEl.appendChild(
          fsItem.cloneNode(true)
        ) as HTMLElement;
        newItem.style.backgroundImage = `url(${folderContent.preview})`;
        return newItem;
      });
      this.folderTpl = qsUnwrapTpl(".tpl--stories--single");
    }

    Dc.body.appendChild(this.el);
    this.slider = new SwiperConfigured(fsSliderEl, {
      ...storiesFullscreenSwiperParams,
      on: {
        slideChange: (sw) => {
          this.onSlideChange(sw)
          //console.log(sw.activeIndex)

          const videoElement = fsSliderEl.querySelectorAll('.stories-slider__item')[sw.activeIndex].querySelector<HTMLVideoElement>('video');
          if (videoElement) {
              videoElement.addEventListener('ended', () => {
                videoElement.currentTime = 0
              })
              videoElement.play()
          }
        },
        slideChangeTransitionEnd: (sw) => this.onSlideTransitionEnd(sw),
      },
    });
    //
    const unmuteBtn = trustedQS(this.el, ".stories-fs__unmute");
    if (this.stories.unmuted) {
      unmuteBtn.classList.add("_hidden");
    } else {
      unmuteBtn.addEventListener("click", () => {
        this.stories.unmuted = true;
        unmuteBtn.classList.add("_hidden");
        this.currentStoriesItem?.unmute();
      });
    }
    trustedQS(this.el, ".stories-fs__close").addEventListener("click", () => {
      stories.close();
    });
  }

  private prevStoriesItem?: StoriesSingle | StoriesFolder;
  private currentStoriesItem?: StoriesSingle | StoriesFolder;

  private onSlideTransitionEnd(sw: SwiperConfigured) {
    const pIndex = sw.previousIndex;
    if (this.prevStoriesItem && pIndex != undefined) {
      this.prevStoriesItem instanceof StoriesFolder &&
        this.prevStoriesItem.swiper?.destroy(true, true);
      this.storiesItems[pIndex] = this.prevStoriesItem;
      this.prevStoriesItem.el = this.storiesItemsStorage.add(
        this.prevStoriesItem.el,
        pIndex
      );
    }
  }
  private onSlideChange(sw: SwiperConfigured) {
    const aIndex = sw.activeIndex;
    const activeSlide = sw.slides[aIndex];

    const pIndex = sw.previousIndex;
    if (pIndex != undefined) {
      this.prevStoriesItem = this.currentStoriesItem;
    }
    //
    if (this.storiesItems[aIndex]) {
      // Сторис уже есть
      const storiesItem = this.storiesItems[aIndex];
      storiesItem.el = activeSlide.appendChild(
        this.storiesItemsStorage.get(aIndex) as HTMLElement
      );
      this.currentStoriesItem = storiesItem;
    } else {
      // Сторис надо создать
      if (this.content.type == "folders") {
        // сторис - папка
        const newFolder = activeSlide.appendChild(
          this.folderTpl.cloneNode(true)
        ) as HTMLElement;
        this.currentStoriesItem = new StoriesFolder(
          this,
          newFolder,
          this.content.folders[aIndex],
          {
            unmuted: this.stories.unmuted,
          }
        );
        this.currentStoriesItem.initSwiper();
      } else {
        // сторис - одно медиа
        const newFolder = activeSlide.appendChild(
          this.folderTpl.cloneNode(true)
        ) as HTMLElement;
        this.currentStoriesItem = new StoriesSingle(
          this,
          newFolder,
          this.content.singleItems[aIndex],
          {
            unmuted: this.stories.unmuted,
          }
        );
        this.currentStoriesItem.start();
      }
      this.storiesItems[aIndex] = this.currentStoriesItem;
    }
  }
  private toggleVisible(dir: boolean) {
    return transitionProm(this.el, () => {
      this.el.classList.toggle("_active", dir);
    });
  }
  //
  open(index = 0) {
    this.slider.slideTo(index, 0, true);
    index == 0 && this.onSlideChange(this.slider);

    return this.toggleVisible(true);
  }
  close() {
    return this.toggleVisible(false);
  }
  destroy() {
    this.storiesItems.forEach((item) => item.destroy());
    this.storiesItemsStorage.clear();
    this.close().then(() => {
      this.slider.destroy(true, true);
      this.el.remove();
    });
  }
}
const storiesFolderSwiperParams: SwiperOptions = {
  slidesPerView: 1,
  spaceBetween: 0,
  wrapperClass: "stories-folder__wrapper",
  slideClass: "stories-item",
  navigation: {
    nextEl: ".stories-folder__next",
    prevEl: ".stories-folder__prev",
  },
  allowTouchMove: false,
  speed: 0,
  pagination: {
    type: "bullets",
    el: ".stories-folder__pag",
    clickable: true,
    bulletElement: "div",
  },
};
class FragmentStorage<T extends HTMLElement> {
  fragment = Dc.createDocumentFragment();
  array: Array<T | undefined> = [];
  add(el: T, i: number) {
    return (this.array[i] = this.fragment.appendChild(el));
  }
  get(i: number) {
    return this.array[i];
  }
  clear() {
    while (this.fragment.lastChild) {
      this.fragment.removeChild(this.fragment.lastChild);
    }
  }
}
class videoStorage extends FragmentStorage<HTMLVideoElement> {
  unmuteAll() {
    this.array.forEach((el) => {
      el && unmuteVideo(el);
    });
  }
}
class StoriesFolder {
  swiper?: SwiperConfigured;
  descEl: any;
  videoStorage = new videoStorage();
  constructor(
    private storiesFs: StoriesFullscreen,
    public el: HTMLElement,
    content: StoriesFolderContent,
    params: {
      unmuted?: boolean;
    } = {
      unmuted: false,
    }
  ) {
    this.fillContent(content, params.unmuted);
  }
  fillContent(content: StoriesFolderContent, unmuted?: boolean) {
    this.descEl = trustedQS(this.el, ".stories-folder__desc");

    const wrapperEl = trustedQS(this.el, ".stories-folder__wrapper");
    const imgTpl = qsUnwrapTpl(".tpl--stories--item--image");
    const videoTpl = qsUnwrapTpl(".tpl--stories--item--video");
    content.items.forEach((el, i) => {
      let slide: HTMLElement;
      if (el.type == "video") {
        slide = videoTpl.cloneNode(true) as HTMLElement;
        const video = trustedQS<HTMLVideoElement>(slide, "video");
        unmuted && unmuteVideo(video);

        video.dataset.src = el.src;
        slide.style.backgroundImage = `url(${el.preview})`;
        // video.poster = el.preview;
        this.videoStorage.add(video, i);
      } else if (el.type == "image") {
        slide = imgTpl.cloneNode(true) as HTMLElement;
        const image = trustedQS<HTMLVideoElement>(slide, "img");
        image.src = el.preview;
        image.dataset.src = el.src;
        slide.dataset.duration = el.duration;
      } else {
        console.error(
          "Ошибка в конфигурации - поле type у слайда с источником:",
          el.src
        );
        console.error("unknown slide type", el.type);
        return;
      }
      const desk = trustedQS(slide, ".stories-item__desc");
      desk.innerHTML = el.desk;

      wrapperEl.appendChild(slide);
    });

    const titleCrt = trustedQS(this.el, ".stories-folder__title");
    const title = trustedQS(titleCrt, "span");
    title.innerText = content.title;
    const img = trustedQS<HTMLImageElement>(titleCrt, "img");
    img.src = content.icon;
  }
  unmute() {
    if (this.swiper) {
      this.videoStorage.unmuteAll();
    }
  }
  private slideNextTimer?: NodeJS.Timeout;
  private currentLoad?: CancelablePromise;
  initSwiper() {
    const setBulletDur = (bullet: HTMLElement, dur: number) => {
      if (!bullet.style.getPropertyValue("--dur")) {
        bullet.style.setProperty("--dur", dur + "s");
      }
    };
    const onSlideChange = (sw: SwiperConfigured) => {
      clearTimeout(this.slideNextTimer);
      this.currentLoad?.cancel();
      //
      const aIndex = sw.activeIndex;
      const pIndex = sw.previousIndex;
      // предыдущий слайд (история)
      const prevSlide = sw.slides[pIndex];
      if (prevSlide?.classList.contains("stories-item_video")) {
        const prevVideo = prevSlide?.querySelector<HTMLVideoElement>("video");
        if (prevVideo) {
          prevVideo.removeAttribute("src");
          prevVideo.load();
          this.videoStorage.add(prevVideo, pIndex);
        }
      }
      const slideNext = () => {
        // Следующий слайд в папке либо следующая папка
        if (!sw.slides) return;
        const isLast = sw.slides.length == aIndex + 1;
        isLast ? this.storiesFs.slider.slideNext() : sw.slideNext();
      };
      // текущий слайд (история)
      const activeSlide = sw.slides[aIndex];
      const activeBullet = sw.pagination.bullets[aIndex];
      activeSlide.classList.remove("_loaded");
      if (activeSlide.classList.contains("stories-item_video")) {
        console.log('current slide' + activeSlide)
        // если история - видео
        const video = this.videoStorage.get(aIndex);
        if (!video) throw new Error("");
        const videoEl = activeSlide.insertBefore(video, activeSlide.firstChild);

        activeSlide.classList.add("_loading");
        this.currentLoad = loadVideo(videoEl)
          .then((loaded) => {
            activeSlide.classList.remove("_loading");
            activeSlide.classList.add("_loaded");
            setBulletDur(activeBullet, +videoEl.duration.toFixed(2));
            this.slideNextTimer = setTimeout(() => {
              slideNext();
            }, videoEl.duration * 1000);
            return loaded;
          })
          .then((loaded) => {
            if (Dc.body.contains(videoEl) && loaded) {
              return videoEl.play();
            }
          });
      } else if (activeSlide.classList.contains("stories-item_image")) {
        const duration =
          (activeSlide.dataset.duration && +activeSlide.dataset.duration) ||
          config.defaultTimeOut;

        setBulletDur(activeBullet, duration);
        this.slideNextTimer = setTimeout(() => {
          slideNext();
        }, duration * 1000);
      }
      this.descEl.innerHTML = trustedQS(
        activeSlide,
        ".stories-item__desc"
      ).innerHTML;
    };
    //
    startSliderLazy(this.el);
    this.swiper = new SwiperConfigured(this.el, {
      ...storiesFolderSwiperParams,
      on: {
        slideChange: onSlideChange,
      },
    });
    onSlideChange(this.swiper);
  }
  destroy() {
    this.currentLoad?.cancel();
    if (this.swiper && this.swiper.activeIndex) {
      const activeSlide = this.swiper.slides[this.swiper.activeIndex];
      if (activeSlide?.classList.contains("stories-item_video")) {
        activeSlide.querySelector("video")?.removeAttribute("src");
      }
    }
    this.swiper?.destroy(true, true);
    this.el.remove();
  }
}
class StoriesSingle {
  descEl: any;
  video?: HTMLVideoElement;
  private currentLoad?: CancelablePromise;
  slide?: HTMLElement;
  constructor(
    private storiesFs: StoriesFullscreen,
    public el: HTMLElement,
    content: StoriesSingleContent,
    params: {
      unmuted?: boolean;
    } = {
      unmuted: false,
    }
  ) {
    this.fillContent(content, params.unmuted);
    this.start();
  }
  fillContent(content: StoriesSingleContent, unmuted?: boolean) {
    this.descEl = trustedQS(this.el, ".stories-folder__desc");
    const wrapperEl = trustedQS(this.el, ".stories-folder__wrapper");
    const imgTpl = qsUnwrapTpl(".tpl--stories--item--image");
    const videoTpl = qsUnwrapTpl(".tpl--stories--item--video");
    //
    const title = trustedQS(
      this.el,
      ".stories-folder__title span"
    );
    title.innerText = content.title;
    //
    const el = content.item;
    let slide: HTMLElement;
    if (el.type == "video") {
      slide = videoTpl.cloneNode(true) as HTMLElement;
      const video = trustedQS<HTMLVideoElement>(slide, "video");
      unmuted && unmuteVideo(video);

      video.setAttribute("controls", "");
      video.setAttribute(
        "controlslist",
        "nodownload nofullscreen noremoteplayback"
      );
      video.setAttribute("disablepictureinpicture", "");
      video.setAttribute("disableremoteplayback", "");

      video.dataset.src = el.src;
      slide.style.backgroundImage = `url(${el.preview})`;
      this.video = video;
    } else if (el.type == "image") {
      slide = imgTpl.cloneNode(true) as HTMLElement;
      const image = trustedQS<HTMLVideoElement>(slide, "img");
      image.src = el.preview;
      image.dataset.src = el.src;

      // slide.dataset.duration = el.duration;
    } else {
      console.error(
        "Ошибка в конфигурации - поле type у слайда с источником:",
        el.src
      );
      console.error("unknown slide type", el.type);
      return;
    }
    const desk = trustedQS(slide, ".stories-item__desc");
    desk.innerHTML = el.desk;
    this.slide = wrapperEl.appendChild(slide);
  }
  start() {
    // -- -- --
    const slide = this.slide;
    if (!slide) {
      return;
    }
    slide.classList.remove("_loaded");
    if (slide.classList.contains("stories-item_video")) {
      // если история - видео
      const video = this.video;
      if (!video) throw new Error("");
      const videoEl = slide.insertBefore(video, slide.firstChild);
      slide.classList.add("_loading");
      this.currentLoad = loadVideo(videoEl)
        .then((loaded) => {
          slide.classList.remove("_loading");
          slide.classList.add("_loaded");
          return loaded;
        })
        .then((loaded) => {
          if (Dc.body.contains(videoEl) && loaded) {
            return videoEl.play();
          }
        });
    } else if (slide.classList.contains("stories-item_image")) {
      vanillaLazy.load(trustedQS(slide, "img"), {
        class_loading: "_loading",
        class_loaded: "is-loaded",
        callback_loaded: (el) => {
          el.parentElement?.classList.remove("_loading");
          setTimeout(() => {
            el.removeAttribute("data-ll-status");
            el.removeAttribute("data-src");
            el.classList.remove("entered", "is-loaded");
          }, 2000);
        },
        callback_loading: (el) => {
          el.parentElement?.classList.add("_loading");
        },
      });
    }
    this.descEl.innerHTML = trustedQS(slide, ".stories-item__desc").innerHTML;
  }
  unmute() {
    this.video && unmuteVideo(this.video);
  }

  destroy() {
    this.currentLoad?.cancel();
    if (this.slide?.classList.contains("stories-item_video")) {
      this.slide?.querySelector("video")?.removeAttribute("src");
    }

    this.el.remove();
  }
}
