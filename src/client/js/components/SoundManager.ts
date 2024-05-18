class SoundManager {
  private sounds: Record<string, HTMLAudioElement> = {};

  addSound(name: string, src: string) {
    const sound = new Audio(src);
    this.sounds[name] = sound;
  }

  playSound(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.play();
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

  stopSound(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    } else {
      console.error(`Sound ${name} not found`);
    }
  }
}
export const soundManager = new SoundManager();
