const express = require("express");
const { isBooleanObject } = require("util/types");
const app = express();
const serv = require("http").Server(app);
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
serv.listen(2000);
console.log("Server started.");

const SOCKET_LIST = {};
const PLAYER_LIST = {};

const Player = (id) => {
  const self = {
    x: 250,
    y: 250,
    id: id,
    number: "" + Math.floor(10 * Math.random()),
    pressingRight: false,
    pressingLeft: false,
    pressingUp: false,
    pressingDown: false,
    maxSpd: 10,
  };
  self.updatePosition = () => {
    if (self.pressingRight) {
      self.x += self.maxSpd;
    }
    if (self.pressingLeft) {
      self.x -= self.maxSpd;
    }
    if (self.pressingUp) {
      self.y -= self.maxSpd;
    }
    if (self.pressingDown) {
      self.y += self.maxSpd;
    }
  };
  return self;
};

const io = require("socket.io")(serv, {});
io.sockets.on("connection", (socket) => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;
  const player = Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  socket.on("disconnect", () => {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
  });
  socket.on("keyPress", (data) => {
    if (data.inputId === "left") {
      player.pressingLeft = data.state;
    } else if (data.inputId === "right") {
      player.pressingRight = data.state;
    } else if (data.inputId === "up") {
      player.pressingUp = data.state;
    } else if (data.inputId === "down") {
      player.pressingDown = data.state;
    }
  });
});

setInterval(() => {
  const pack = [];
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];
    player.updatePosition();
    pack.push({
      x: player.x,
      y: player.y,
      number: player.number,
    });
  }
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("newPositions", pack);
  }
}, 1000 / 25);
