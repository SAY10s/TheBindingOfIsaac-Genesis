class LoadingManager {
  overlay = document.getElementById("overlay") as HTMLDivElement;
  show(
    additionalFunction = () => {},
    fadeIn = false,
    fadeInDuration = 0,
    fadeOut = false,
    fadeOutDuration = 0,
    loadingDuration = 0,
  ) {
    this.overlay.style.opacity = "1";

    this.overlay.style.background =
      "radial-gradient(circle at center, rgba(0, 0, 0, 0.6) 0%, black 100%)";

    if (fadeIn) {
      this.overlay.style.transition = `${fadeInDuration}ms`;
    }
    this.overlay.style.background = "black";
    this.overlay.style.opacity = "1";

    setTimeout(() => {
      additionalFunction();
      setTimeout(() => {
        if (fadeOut) {
          this.overlay.style.transition = `${fadeOutDuration}ms`;
          this.overlay.style.opacity = "0";
        } else {
          this.overlay.style.transition = "0ms";
          this.overlay.style.opacity = "0";
        }
      }, loadingDuration);
    }, fadeInDuration);
  }
}
export const loadingManager = new LoadingManager();
