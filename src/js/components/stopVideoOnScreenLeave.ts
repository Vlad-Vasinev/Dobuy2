/**
 * функция которая останавливает видео-баннеры и тд
 */
export function stopVideoOnScreenLeave() {
  const obs = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.paused && video.play().catch(() => { });
        } else {
          video.pause();
        }
      });
    },
    {
      threshold: 0.01,
    }
  );
  const videos = QsA(
    ".banner video, .sign-media-bg video"
  );
  videos.forEach((video) => {
    obs.observe(video);
  });
}
