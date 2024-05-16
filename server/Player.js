const Entity = require("./Entity");
const { initPack, removePack } = require("./Packs");
const { GAME_WINDOW_WIDTH, GAME_WINDOW_HEIGHT } = require("./settings");

const Player = (id) => {
  const self = Entity();
  self.id = id;
  self.name = "ISAAC " + Math.floor(Math.random() * 100);
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.pressingAttack = false;
  self.shootingRight = false;
  self.shootingLeft = false;
  self.shootingUp = false;
  self.shootingDown = false;
  self.mouseAngle = 0;
  self.isAttackOnCooldown = false;
  self.maxSpd = 5;
  self.hp = 5;
  self.hpMax = 5;
  self.score = 0;
  self.isClosingEyes = false;

  const super_update = self.update;
  self.update = () => {
    self.updateSpeed();
    super_update();

    if (self.pressingAttack) {
      self.shootBullet(self.mouseAngle);
    }
    if (self.shootingRight) {
      self.shootBullet(0);
    }
    if (self.shootingLeft) {
      self.shootBullet(180);
    }
    if (self.shootingUp) {
      self.shootBullet(270);
    }
    if (self.shootingDown) {
      self.shootBullet(90);
    }
  };
  self.shootBullet = (angle) => {
    if (!self.isAttackOnCooldown) {
      const b = Bullet(self.id, angle);
      b.x = self.x;
      b.y = self.y;
      self.isAttackOnCooldown = true;
      self.isClosingEyes = true;
      setTimeout(() => {
        self.isClosingEyes = false;
      }, 300);
      setTimeout(() => {
        self.isAttackOnCooldown = false;
      }, 500);
    }
  };

  self.updateSpeed = () => {
    if (self.pressingRight && self.x < GAME_WINDOW_WIDTH - 150) {
      self.spdX = self.maxSpd;
    } else if (self.pressingLeft && self.x > 150) {
      self.spdX = -self.maxSpd;
    } else {
      self.spdX = 0;
    }

    if (self.pressingUp && self.y > 100) {
      self.spdY = -self.maxSpd;
    } else if (self.pressingDown && self.y < GAME_WINDOW_HEIGHT - 170) {
      self.spdY = self.maxSpd;
    } else {
      self.spdY = 0;
    }
  };

  self.getInitPack = () => {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      name: self.name,
      hp: self.hp,
      hpMax: self.hpMax,
      score: self.score,
      isClosingEyes: self.isClosingEyes,
    };
  };
  self.getUpdatePack = () => {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      name: self.name,
      hp: self.hp,
      score: self.score,
      isClosingEyes: self.isClosingEyes,
    };
  };

  Player.list[id] = self;

  initPack.player.push(self.getInitPack());
  return self;
};
Player.list = {};

Player.onConnect = (socket) => {
  const player = Player(socket.id);
  socket.on("keyPress", (data) => {
    const { inputId, state } = data;
    switch (inputId) {
      case "left":
        player.pressingLeft = state;
        break;
      case "right":
        player.pressingRight = state;
        break;
      case "up":
        player.pressingUp = state;
        break;
      case "down":
        player.pressingDown = state;
        break;
      case "attack":
        player.pressingAttack = state;
        break;
      case "mouseAngle":
        player.mouseAngle = state;
        break;
      case "shootRight":
        player.shootingRight = state;
        break;
      case "shootLeft":
        player.shootingLeft = state;
        break;
      case "shootUp":
        player.shootingUp = state;
        break;
      case "shootDown":
        player.shootingDown = state;
        break;
    }
  });

  socket.emit("init", {
    selfId: socket.id,
    player: Player.getAllInitPack(),
    bullet: Bullet.getAllInitPack(),
  });
};

Player.getAllInitPack = () => {
  const players = [];
  for (let i in Player.list) {
    players.push(Player.list[i].getInitPack());
  }
  return players;
};

Player.onDisconnect = (socket) => {
  delete Player.list[socket.id];
  removePack.player.push(socket.id);
};

Player.update = () => {
  const pack = [];
  for (let i in Player.list) {
    let player = Player.list[i];
    player.update();
    pack.push(player.getUpdatePack());
  }
  return pack;
};

// ------------------------------------ BULLET -----------------------------------

const Bullet = (parent, angle) => {
  const self = Entity();
  self.id = Math.random();
  self.spdX = Math.cos((angle / 180) * Math.PI) * 10;
  self.spdY = Math.sin((angle / 180) * Math.PI) * 10;
  self.parent = parent;
  self.timer = 0;
  self.toRemove = false;
  const super_update = self.update;

  self.update = () => {
    if (self.timer++ > 100) {
      self.toRemove = true;
    } else if (
      self.x < 100 ||
      self.x > GAME_WINDOW_WIDTH - 100 ||
      self.y < 100 ||
      self.y > GAME_WINDOW_HEIGHT - 100
    ) {
      self.toRemove = true;
    }
    super_update(7);

    for (let i in Player.list) {
      let p = Player.list[i];
      if (self.getDistance(p) < 64 && self.parent !== p.id) {
        p.hp -= 1;
        const shooter = Player.list[self.parent];
        if (p.hp <= 0) {
          if (shooter) shooter.score += 1;
          p.hp = p.hpMax;
          p.x = Math.random() * 1000 + 100;
          p.y = Math.random() * 500 + 100;
        }
        self.toRemove = true;
      }
    }
  };

  self.getInitPack = () => {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      number: self.number,
      parent: self.parent,
    };
  };
  self.getUpdatePack = () => {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
    };
  };

  Bullet.list[self.id] = self;

  initPack.bullet.push(self.getInitPack());
  return self;
};
Bullet.list = {};

Bullet.update = () => {
  const pack = [];
  for (let i in Bullet.list) {
    let bullet = Bullet.list[i];
    bullet.update();
    if (bullet.toRemove) {
      delete Bullet.list[i];
      removePack.bullet.push(bullet.id);
    } else {
      pack.push(bullet.getUpdatePack());
    }
  }
  return pack;
};

Bullet.getAllInitPack = () => {
  const bullets = [];
  for (let i in Bullet.list) {
    bullets.push(Bullet.list[i].getInitPack());
  }
  return bullets;
};

module.exports = {
  Player,
  Bullet,
};
