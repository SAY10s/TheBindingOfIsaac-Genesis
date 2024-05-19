class LoadingManager {
  overlay = document.getElementById("overlay") as HTMLDivElement;
  show(
    additionalFunction = () => {},
    fadeIn = false,
    fadeInDuration = 0,
    fadeOut = false,
    fadeOutDuration = 0,
  ) {
    if (fadeIn) {
      this.overlay.style.transition = `${fadeInDuration}ms`;
    }
    this.overlay.style.opacity = "1";

    setTimeout(() => {
      additionalFunction();
      if (fadeOut) {
        this.overlay.style.transition = `${fadeOutDuration}ms`;
        this.overlay.style.opacity = "0";
      } else {
        this.overlay.style.transition = "0ms";
        this.overlay.style.opacity = "0";
      }
    }, fadeInDuration);
  }
}
export const loadingManager = new LoadingManager();
