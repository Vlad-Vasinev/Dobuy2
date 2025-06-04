import Swiper from "swiper";
import SwiperConfigured from "../../shared/swiper";
import { initLazySlider, setAutoplayByVideo } from "./shared/sliders-lazyload";

async function playVideo(video: HTMLVideoElement) {
  const p = () => {
    // console.log('play video', video);

    video.play().then(() => {
      video.dataset.paused = undefined;
    });
  };
  if (video.readyState == 4) {
    p();
  } else {
    if (video.dataset.paused) return;
    video.addEventListener("loadeddata", p, {
      once: true,
    });
  }
}
function pauseVideo(video: HTMLVideoElement) {
  return new Promise<void>((r) => {
    const p = () => {
      // console.log('pause video', video);
      video.pause();
      video.dataset.paused = "true";
      r();
    };

    video.readyState == 4
      ? p()
      : video.addEventListener("loadeddata", () => setTimeout(p, 10), {
          once: true,
        });
  });
}

export default function headBannerInit() {
  const initialDelay = 60000;
  const getCurrSlideVideo = (sw: Swiper) => {
    return sw.slides[sw.activeIndex]?.querySelector<HTMLVideoElement>("video");
  };
  const getPrevSlideVideo = (sw: Swiper) => {
    return sw.slides[sw.previousIndex]?.querySelector<HTMLVideoElement>(
      "video"
    );
  };
  new SwiperConfigured(".heading-banner", {
    wrapperClass: "heading-banner__wrapper",
    slideClass: "heading-banner__item",
    slidesPerView: 1,
    speed: 500,
    autoplay: {
      delay: initialDelay,
    },
    pagination: {
      el: ".progress-pag",
      type: "bullets",
      clickable: true,
      modifierClass: "progress-pag-",
      bulletClass: "progress-pag-bullet",
      bulletActiveClass: "_active",
      renderBullet: function (i, className) {
        return `
        <span class="${className}">
          <div class="progress"></div>
        </span>`;
      },
    },
    loop: true,
    on: {
      beforeInit: (sw) => {
        initLazySlider(sw);

        sw.slides.forEach((el) => {
          el.setAttribute("draggable", "false");
        });
        sw.pagination.el?.style.setProperty("--duration", `${initialDelay}ms`);
        setAutoplayByVideo(sw);
        sw.autoplay.stop();
      },
      // init: (sw) => {},
      autoplayPause: (sw) => {
        sw.el.classList.add("_autoplay-paused");
      },
      autoplayStop: (sw) => {
        sw.el.classList.add("_autoplay-paused");
      },
      autoplayResume: (sw) => {
        sw.el.classList.remove("_autoplay-paused");
      },
      afterInit: (sw) => {
        // slidesVideoArr.push(
        //   ...sw.slides.map((el) => el.querySelector("video"))
        // );
        // ---
        const observer = new IntersectionObserver(
          (entries: IntersectionObserverEntry[]) => {
            const currVid = getCurrSlideVideo(sw);
            entries.forEach((entry) => {
              const video = entry.target as HTMLVideoElement;
              if (entry.isIntersecting) {
                sw.el.classList.remove("_autoplay-paused");
                currVid?.play();
                sw.autoplay.paused && sw.autoplay.resume();
              } else {
                sw.el.classList.add("_autoplay-paused");
                currVid?.pause();
                sw.autoplay.pause();
              }
            });
          },
          {
            threshold: 0.01,
            rootMargin: "0px",
          }
        );
        observer.observe(sw.el);
        //
        const currVid = getCurrSlideVideo(sw);
        currVid && playVideo(currVid);
      },
      slideChange: (sw) => {
        if (sw.previousIndex == sw.activeIndex) {
          // console.log("break", sw.previousIndex, sw.activeIndex)
          return;
        }
        const prevVid = getPrevSlideVideo(sw);
        if (prevVid) {
          pauseVideo(prevVid).then(() => {});
        }
        const currVid = getCurrSlideVideo(sw);
        if (currVid) {
          currVid && playVideo(currVid);
        }
      },
      slideChangeTransitionEnd: (sw) => {
        const prevVid = getPrevSlideVideo(sw);

        if (prevVid) {
          prevVid.currentTime = 0;
        }
      },
    },
  });
}
