const express = require("express");
const app = express();
const serv = require("http").Server(app);
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
serv.listen(2000);
console.log("Server started.");

const DEBUG = true;

const SOCKET_LIST = {};

const Entity = () => {
  const self = {
    x: 250,
    y: 250,
    spdX: 0,
    spdY: 0,
    id: "",
  };
  self.update = () => {
    self.updatePosition();
  };
  self.updatePosition = () => {
    self.x += self.spdX;
    self.y += self.spdY;
  };
  self.getDistance = (pt) => {
    return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
  };
  return self;
};

const Player = (id) => {
  const self = Entity();
  self.id = id;
  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.pressingAttack = false;
  self.mouseAngle = 0;
  self.maxSpd = 10;
  self.hp = 10;
  self.hpMax = 10;
  self.score = 0;

  const super_update = self.update;
  self.update = () => {
    self.updateSpeed();
    super_update();

    if (self.pressingAttack) {
      self.shootBullet(self.mouseAngle);
    }
  };
  self.shootBullet = (angle) => {
    const b = Bullet(self.id, angle);
    b.x = self.x;
    b.y = self.y;
  };

  self.updateSpeed = () => {
    if (self.pressingRight) {
      self.spdX = self.maxSpd;
    } else if (self.pressingLeft) {
      self.spdX = -self.maxSpd;
    } else {
      self.spdX = 0;
    }

    if (self.pressingUp) {
      self.spdY = -self.maxSpd;
    } else if (self.pressingDown) {
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
      number: self.number,
      hp: self.hp,
      hpMax: self.hpMax,
      score: self.score,
    };
  };
  self.getUpdatePack = () => {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      hp: self.hp,
      score: self.score,
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
    if (data.inputId === "left") {
      player.pressingLeft = data.state;
    } else if (data.inputId === "right") {
      player.pressingRight = data.state;
    } else if (data.inputId === "up") {
      player.pressingUp = data.state;
    } else if (data.inputId === "down") {
      player.pressingDown = data.state;
    } else if (data.inputId === "attack") {
      player.pressingAttack = data.state;
    } else if (data.inputId === "mouseAngle") {
      player.mouseAngle = data.state;
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
    }
    super_update();

    for (let i in Player.list) {
      let p = Player.list[i];
      if (self.getDistance(p) < 32 && self.parent !== p.id) {
        p.hp -= 1;
        const shooter = Player.list[self.parent];
        if (p.hp <= 0) {
          if (shooter) shooter.score += 1;
          p.hp = p.hpMax;
          p.x = Math.random() * 500;
          p.y = Math.random() * 500;
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
    } else pack.push(bullet.getUpdatePack());
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

// ------------------------------ USER AUTHENTICATION ------------------------------
// -
// -
// -
// ------------------------------ DEBUG CODE ------------------------------

const USERS = {
  // username:password
  admin: "admin",
  test: "test",
  say10s: "say10s",
};
const isValidPassword = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USERS[data.username] === data.password);
    }, 10);
  });
};
const isUsernameTaken = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USERS[data.username]);
    }, 10);
  });
};
const addUser = (data) => {
  setTimeout(() => {
    USERS[data.username] = data.password;
  }, 10);
};

// ------------------------------ END OF DEBUG CODE------------------------------
// -
// -
// -
// ------------------------------ PROD CODE BELOW ------------------------------

// const { Client } = require("pg");

// const client = new Client({
//   host: "db",
//   port: 5432,
//   user: "postgres",
//   password: "moje_haslo",
//   database: "postgres",
// });

// client.connect((err) => {
//   if (err) {
//     console.error("Connection error", err.stack);
//   } else {
//     console.log("Connected");
//   }
// });

// const USERS = {
//   // username:password
//   admin: "admin",
//   test: "test",
//   say10s: "say10s",
// };

// const getUsers = async () => {
//   try {
//     const res = await client.query("SELECT * FROM users");
//     return res.rows;
//   } catch (err) {
//     console.error(err);
//   }
// };
// getUsers()
//   .then((users) => console.log("Users:" + users))
//   .catch((err) => console.error(err));

// const isValidPassword = async (data) => {
//   try {
//     const res = await client.query(
//       "SELECT password FROM users WHERE username = $1",
//       [data.username]
//     );
//     return res.rows.length > 0 && res.rows[0].password === data.password;
//   } catch (err) {
//     console.error(err);
//   }
// };

// const isUsernameTaken = async (data) => {
//   try {
//     const res = await client.query(
//       "SELECT username FROM users WHERE username = $1",
//       [data.username]
//     );
//     return res.rows.length > 0;
//   } catch (err) {
//     console.error(err);
//   }
// };

// const addUser = async (data) => {
//   try {
//     await client.query(
//       "INSERT INTO users (username, password) VALUES ($1, $2)",
//       [data.username, data.password]
//     );
//   } catch (err) {
//     console.error(err);
//   }
// };

// ------------------------------ END OF PROD ------------------------------

const io = require("socket.io")(serv, {});
io.sockets.on("connection", (socket) => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on("signIn", async (data) => {
    Player.onConnect(socket);
    if (await isValidPassword(data))
      socket.emit("signInResponse", { success: true });
    else socket.emit("signInResponse", { success: false });
  });
  socket.on("signUp", async (data) => {
    if (!(await isUsernameTaken(data))) {
      addUser(data);
      socket.emit("signUpResponse", { success: true });
    } else {
      socket.emit("signUpResponse", { success: false });
    }
  });
  socket.on("disconnect", () => {
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });
  socket.on("sendMsgToServer", (data) => {
    let playerName = ("" + socket.id).slice(2, 7);
    for (let i in SOCKET_LIST) {
      SOCKET_LIST[i].emit("addToChat", playerName + ": " + data);
    }
  });
  socket.on("evalServer", (data) => {
    if (!DEBUG) return;
    let res = eval(data);
    socket.emit("evalAnswer", res);
  });
});

const initPack = { player: [], bullet: [] };
const removePack = { player: [], bullet: [] };

setInterval(() => {
  const pack = {
    player: Player.update(),
    bullet: Bullet.update(),
  };
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("init", initPack);
    socket.emit("update", pack);
    socket.emit("remove", removePack);
  }
  initPack.player = [];
  initPack.bullet = [];
  removePack.player = [];
  removePack.bullet = [];
}, 1000 / 25);
