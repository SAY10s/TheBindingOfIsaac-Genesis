export class Player {
  constructor(initPack, game) {
    this.id = initPack.id;
    this.name = initPack.name;
    this.x = initPack.x;
    this.y = initPack.y;
    this.hp = initPack.hp;
    this.hpMax = 5;
    this.score = initPack.score;
    this.isClosingEyes = initPack.isClosingEyes;
    this.game = game;
    if (!game.scoreboard.innerHTML.includes(this.id)) {
      game.scoreboard.innerHTML += `<div id=${this.id}>0 - ${this.name}</div>`;
    }
    Player.list[this.id] = this;
  }

  update(data) {
    if (data.x !== undefined) this.x = data.x;
    if (data.y !== undefined) this.y = data.y;
    if (data.hp !== undefined) this.hp = data.hp;
    if (data.hpMax !== undefined) this.hpMax = data.hpMax;
    if (data.name !== undefined) this.name = data.name.slice(0, 20);
    if (data.score !== undefined) {
      const playerScoreDiv = document.getElementById(this.id);
      if (playerScoreDiv) {
        playerScoreDiv.innerHTML = `${data.score} - ${this.name}`;
      }
      this.score = data.score;
    }
    if (data.isClosingEyes !== undefined)
      this.isClosingEyes = data.isClosingEyes;
  }

  draw() {
    for (let i = 1; i <= this.hpMax; i++) {
      const fullHeartModel =
        this.game.selfId === this.id
          ? this.game.Img.redFullHeart
          : this.game.Img.soulFullHeart;
      const halfHeartModel =
        this.game.selfId === this.id
          ? this.game.Img.redHalfHeart
          : this.game.Img.soulHalfHeart;

      if (i < this.hp) {
        this.game.ctx.drawImage(
          fullHeartModel,
          this.x - 60 + (i / 2) * 30,
          this.y - 85,
          30,
          30,
        );
        i++;
      } else if (i === this.hp)
        this.game.ctx.drawImage(
          halfHeartModel,
          this.x - 60 + (i / 2) * 30,
          this.y - 85,
          30,
          30,
        );
    }
    this.game.ctx.fillStyle = "white";
    this.game.ctx.font = "30px upheaval";
    this.game.ctx.fillText(
      this.name,
      this.x - this.name.length * 8.2,
      this.y - 95,
    );
    const width = this.game.Img.player.width / 4;
    const height = this.game.Img.player.height / 4;
    const playerModel =
      this.id === this.game.selfId
        ? this.isClosingEyes
          ? this.game.Img.playerShooting
          : this.game.Img.player
        : this.isClosingEyes
          ? this.game.Img.enemyShooting
          : this.game.Img.enemy;

    this.game.ctx.drawImage(
      playerModel,
      0,
      0,
      this.game.Img.player.width,
      this.game.Img.player.height,
      this.x - width / 2,
      this.y - height / 2,
      width,
      height,
    );
  }
}
Player.list = {};
