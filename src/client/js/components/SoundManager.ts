class SoundManager {
  private sounds: Record<string, string> = {};
  private playingSounds: Record<string, HTMLAudioElement> = {};

  addSound(name: string, src: string) {
    this.sounds[name] = src;
  }
  static maxVolume = 0.1;

  volumeUp() {
    if (SoundManager.maxVolume < 0.94) {
      SoundManager.maxVolume += 0.05;
    } else {
      SoundManager.maxVolume = 1;
    }
    for (const name in this.playingSounds) {
      const sound = this.playingSounds[name];
      if (sound) {
        sound.volume = SoundManager.maxVolume;
      }
    }
  }
  volumeDown() {
    if (SoundManager.maxVolume > 0.06) {
      SoundManager.maxVolume -= 0.05;
    } else {
      SoundManager.maxVolume = 0;
    }
    for (const name in this.playingSounds) {
      const sound = this.playingSounds[name];
      if (sound) {
        sound.volume = SoundManager.maxVolume;
      }
    }
  }

  playSound(name: string, fadeIn: boolean = false, fadeInTime: number = 1000) {
    const src = this.sounds[name];
    if (src) {
      const sound = new Audio(src);
      sound.volume = SoundManager.maxVolume;
      this.playingSounds[name] = sound;
      if (fadeIn) {
        sound.volume = 0;
        sound.play();
        const fadeInInterval = setInterval(() => {
          if (sound.volume <= SoundManager.maxVolume - 0.1) {
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

  stopSound(
    name: string,
    fadeOut: boolean = false,
    fadeOutTime: number = 1000,
  ) {
    const sound = this.playingSounds[name];
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
    } else {
      console.error(`Sound ${name} not found`);
    }
  }
}
export const soundManager = new SoundManager();
