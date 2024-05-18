import GameClient from "./GameClient.js";

export class Bullet {
  id: string;
  x: number;
  y: number;
  parent: string;
  game: GameClient;
  static list: { [key: string]: Bullet } = {};
  constructor(
    initPack: { id: string; parent: string; x: number; y: number },
    game: GameClient,
  ) {
    this.id = initPack.id;
    this.x = initPack.x;
    this.y = initPack.y;
    this.parent = initPack.parent;
    this.game = game;
    Bullet.list[this.id] = this;
  }

  update(data: { x?: number; y?: number }) {
    if (data.x !== undefined) this.x = data.x;
    if (data.y !== undefined) this.y = data.y;
  }

  draw() {
    const width = this.game.Img.playerTear.width / 4;
    const height = this.game.Img.playerTear.height / 4;
    const tearModel =
      this.parent === this.game.selfId
        ? this.game.Img.playerTear
        : this.game.Img.enemyTear;
    this.game.ctx.drawImage(
      tearModel,
      0,
      0,
      this.game.Img.playerTear.width,
      this.game.Img.playerTear.height,
      this.x - width / 2,
      this.y - height / 2,
      width,
      height,
    );
  }
}
