export class ImageLoader {
  static loadImages() {
    const Img = {};
    const imagePaths = {
      player: "/client/img/isaac.png",
      playerShooting: "/client/img/isaacShooting.png",
      enemy: "/client/img/enemy.png",
      enemyShooting: "/client/img/enemyShooting.png",
      playerTear: "/client/img/playerTear.png",
      enemyTear: "/client/img/enemyTear.png",
      map: "/client/img/bg.png",
      soulFullHeart: "/client/img/soulFullHeart.png",
      soulHalfHeart: "/client/img/soulHalfHeart.png",
      redFullHeart: "/client/img/redFullHeart.png",
      redHalfHeart: "/client/img/redHalfHeart.png",
    };
    for (let key in imagePaths) {
      Img[key] = ImageLoader.loadImage(imagePaths[key]);
    }
    return Img;
  }

  static loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  }
}
