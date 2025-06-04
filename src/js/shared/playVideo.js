function playVideo(videoEl, afterPlay = undefined) {
  const playPromise = videoEl.play();
  if (playPromise !== undefined) {
    playPromise
      .then(function () {
        videoEl.parentElement.classList?.remove("paused-video");
        afterPlay && afterPlay()
      })
      .catch(function (error) {
        videoEl.parentElement.classList?.add("paused-video");
      });
  }
}