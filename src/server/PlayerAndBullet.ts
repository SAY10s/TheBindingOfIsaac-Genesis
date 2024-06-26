import Entity from "./Entity.js";
import { initPack, removePack } from "./Packs.js";
import { GAME_WINDOW_WIDTH, GAME_WINDOW_HEIGHT } from "./settings.js";
import { Socket } from "socket.io";

// ------------------------------ PLAYER CLASS ------------------------------

class Player extends Entity {
  name: string;
  pressingRight: boolean;
  pressingLeft: boolean;
  pressingUp: boolean;
  pressingDown: boolean;
  pressingAttack: boolean;
  shootingRight: boolean;
  shootingLeft: boolean;
  shootingUp: boolean;
  shootingDown: boolean;
  mouseAngle: number;
  isAttackOnCooldown: boolean;
  maxSpd: number;
  hp: number;
  hpMax: number;
  score: number;
  isClosingEyes: boolean;

  static list: { [id: string]: Player } = {};
  constructor(id: string) {
    super();
    this.id = id;
    this.name = `ISAAC ${Math.floor(Math.random() * 100)}`;
    this.mouseAngle = 0;
    this.isAttackOnCooldown = false;
    this.maxSpd = 5;
    this.hp = 5;
    this.hpMax = 5;
    this.score = 0;
    this.isClosingEyes = false;
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.pressingAttack = false;
    this.shootingRight = false;
    this.shootingLeft = false;
    this.shootingUp = false;
    this.shootingDown = false;
  }

  resetControls() {
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.pressingAttack = false;
    this.shootingRight = false;
    this.shootingLeft = false;
    this.shootingUp = false;
    this.shootingDown = false;
  }

  update() {
    this.updateSpeed();
    super.update();

    if (this.pressingAttack) this.shootBullet(this.mouseAngle);
    if (this.shootingRight) this.shootBullet(0);
    if (this.shootingLeft) this.shootBullet(180);
    if (this.shootingUp) this.shootBullet(270);
    if (this.shootingDown) this.shootBullet(90);
  }

  shootBullet(angle: number) {
    if (this.isAttackOnCooldown) return;

    const b = new Bullet(this.id, angle);
    b.x = this.x;
    b.y = this.y;
    this.isAttackOnCooldown = true;
    this.isClosingEyes = true;

    setTimeout(() => {
      this.isClosingEyes = false;
    }, 300);
    setTimeout(() => {
      this.isAttackOnCooldown = false;
    }, 500);
  }

  updateSpeed() {
    this.spdX =
      this.pressingRight && this.x < GAME_WINDOW_WIDTH - 180
        ? this.maxSpd
        : this.pressingLeft && this.x > 180
          ? -this.maxSpd
          : 0;
    this.spdY =
      this.pressingUp && this.y > 140
        ? -this.maxSpd
        : this.pressingDown && this.y < GAME_WINDOW_HEIGHT - 200
          ? this.maxSpd
          : 0;
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name,
      hp: this.hp,
      hpMax: this.hpMax,
      score: this.score,
      isClosingEyes: this.isClosingEyes,
    };
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      name: this.name,
      hp: this.hp,
      score: this.score,
      isClosingEyes: this.isClosingEyes,
    };
  }

  static onConnect(socket: Socket, username: string) {
    const player = new Player(socket.id);
    Player.list[socket.id] = player;
    Player.list[socket.id].name = username;
    socket.on("keyPress", ({ inputId, state }) => {
      if ((player as any)[inputId] !== undefined) {
        (player as any)[inputId] = state;
      }
    });

    socket.emit("init", {
      selfId: socket.id,
      player: Player.getAllInitPack(),
      bullet: Bullet.getAllInitPack(),
    });
  }

  static onDisconnect(socket: Socket) {
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
  }

  static update() {
    return Object.values(Player.list).map((player) => {
      player.update();
      return player.getUpdatePack();
    });
  }

  static getAllInitPack() {
    return Object.values(Player.list).map((player) => player.getInitPack());
  }
}

// ------------------------------ BULLET CLASS ------------------------------

class Bullet extends Entity {
  parent: string;
  timer: number;
  toRemove: boolean;
  static list: { [id: string]: Bullet } = {};
  constructor(parent: string, angle: number) {
    super();
    this.id = Math.random().toString();
    this.spdX = Math.cos((angle * Math.PI) / 180) * 10;
    this.spdY = Math.sin((angle * Math.PI) / 180) * 10;
    this.parent = parent;
    this.timer = 0;
    this.toRemove = false;
    Bullet.list[this.id] = this;

    initPack.bullet.push(this.getInitPack());
  }

  update() {
    if (
      this.timer++ > 100 ||
      this.x < 100 ||
      this.x > GAME_WINDOW_WIDTH - 100 ||
      this.y < 100 ||
      this.y > GAME_WINDOW_HEIGHT - 100
    ) {
      this.toRemove = true;
    }
    super.update(7);

    for (const player of Object.values(Player.list)) {
      if (this.getDistance(player) < 64 && this.parent !== player.id) {
        player.hp -= 1;
        const shooter = Player.list[this.parent];
        if (player.hp <= 0) {
          if (shooter) shooter.score += 1;
          player.hp = player.hpMax;
          player.x = Math.random() * 1000 + 100;
          player.y = Math.random() * 500 + 100;
        }
        this.toRemove = true;
      }
    }
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      parent: this.parent,
    };
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }

  static update() {
    return Object.entries(Bullet.list).reduce(
      (
        pack: {
          id: string;
          x: number;
          y: number;
        }[],
        [id, bullet],
      ) => {
        bullet.update();
        if (bullet.toRemove) {
          delete Bullet.list[id];
          removePack.bullet.push(id);
        } else {
          pack.push(bullet.getUpdatePack());
        }
        return pack;
      },
      [],
    );
  }

  static getAllInitPack() {
    return Object.values(Bullet.list).map((bullet) => bullet.getInitPack());
  }
}

export { Player, Bullet };
