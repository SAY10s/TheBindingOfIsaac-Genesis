class SoundManager {
  private sounds: Record<string, HTMLAudioElement> = {};

  addSound(name: string, src: string) {
    this.sounds[name] = new Audio(src);
  }
  static maxVolume = 1;

  turnVolumeUp() {
    if (SoundManager.maxVolume < 1) {
      SoundManager.maxVolume += 0.1;
    }
  }
  turnVolumeDown() {
    if (SoundManager.maxVolume > 0) {
      SoundManager.maxVolume -= 0.1;
    }
  }

  playSound(name: string, fadeIn: boolean = false, fadeInTime: number = 1000) {
    const sound = this.sounds[name];
    if (sound) {
      if (fadeIn) {
        sound.volume = 0;
        sound.play();
        const fadeInInterval = setInterval(() => {
          if (sound.volume < SoundManager.maxVolume) {
            sound.volume += SoundManager.maxVolume / 10;
          } else {
            clearInterval(fadeInInterval);
          }
        }, fadeInTime / 10);
      } else {
        sound.play();
      }
    } else {
      console.error(`Sound ${name} not found`);
    }
  }

  pauseSound(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
    } else {
      console.error(`Sound ${name} not found`);
    }
  }

  stopSound(
    name: string,
    fadeOut: boolean = false,
    fadeOutTime: number = 1000,
  ) {
    const sound = this.sounds[name];
    if (sound) {
      if (fadeOut) {
        const fadeOutInterval = setInterval(() => {
          if (sound.volume > SoundManager.maxVolume / 10) {
            sound.volume -= SoundManager.maxVolume / 10;
          } else {
            sound.volume = 0;
            sound.pause();
            clearInterval(fadeOutInterval);
          }
        }, fadeOutTime / 10);
      } else {
        sound.pause();
        sound.currentTime = 0;
      }
    }
  }
}
export const soundManager = new SoundManager();
