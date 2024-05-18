export class ImageLoader {
  static loadImages() {
    const Img: Record<string, HTMLImageElement> = {};
    const imagePaths: Record<string, string> = {
      player: "/client/img/playerModels/isaac.png",
      playerShooting: "/client/img/playerModels/isaacShooting.png",
      enemy: "/client/img/playerModels/enemy.png",
      enemyShooting: "/client/img/playerModels/enemyShooting.png",
      playerTear: "/client/img/playerTear.png",
      enemyTear: "/client/img/enemyTear.png",
      map: "/client/img/bg.png",
      soulFullHeart: "/client/img/hearts/soulFullHeart.png",
      soulHalfHeart: "/client/img/hearts/soulHalfHeart.png",
      redFullHeart: "/client/img/hearts/redFullHeart.png",
      redHalfHeart: "/client/img/hearts/redHalfHeart.png",
    };
    for (let key in imagePaths) {
      Img[key] = ImageLoader.loadImage(imagePaths[key]);
    }
    return Img;
  }

  static loadImage(src: string) {
    const img = new Image();
    img.src = src;
    return img;
  }
}
