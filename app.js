const e = require("express");
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
  Player.list[id] = self;
  return self;
};
Player.list = {};

Player.onConnect = (socket) => {
  //   console.log("Player connected! " + socket.id);

  const player = Player(socket.id);
  socket.on("keyPress", (data) => {
    // console.log("keyPress", data.inputId, data.state);
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
};
Player.onDisconnect = (socket) => {
  delete Player.list[socket.id];
};
Player.update = () => {
  const pack = [];
  for (let i in Player.list) {
    let player = Player.list[i];
    player.update();
    pack.push({
      x: player.x,
      y: player.y,
      number: player.number,
    });
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
        //handle collision. ex. hp--
        self.toRemove = true;
      }
    }
  };
  Bullet.list[self.id] = self;
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
    } else
      pack.push({
        x: bullet.x,
        y: bullet.y,
      });
  }
  return pack;
};

const USERS = {
  // username:password
  admin: "admin",
  test: "test",
  say10s: "say10s",
};
const isValidPassword = (data) => {
  return USERS[data.username] === data.password;
};
const isUsernameTaken = (data) => {
  return USERS[data.username];
};
const addUser = (data) => {
  USERS[data.username] = data.password;
};

const io = require("socket.io")(serv, {});
io.sockets.on("connection", (socket) => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on("signIn", (data) => {
    Player.onConnect(socket);
    if (isValidPassword(data)) socket.emit("signInResponse", { success: true });
    else socket.emit("signInResponse", { success: false });
  });
  socket.on("signUp", (data) => {
    if (!isUsernameTaken(data)) {
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

setInterval(() => {
  const pack = {
    player: Player.update(),
    bullet: Bullet.update(),
  };
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("newPositions", pack);
  }
}, 1000 / 25);
