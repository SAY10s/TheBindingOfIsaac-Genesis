const express = require("express");
const { Player, Bullet } = require("./server/Player");
const {
  GAME_WINDOW_WIDTH,
  GAME_WINDOW_HEIGHT,
  EXPECTED_FPS,
} = require("./server/settings");

// ------------------------------ SERVER ------------------------------
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

// ------------------------------ END OF SERVER ------------------------------

//----------------------------- DB CONNECTION -----------------------------

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
// const {
//   isValidPassword,
//   isUsernameTaken,
//   addUser,
// } = require("./server/dbConnection");

// ------------------------------ END OF DB CONNECTION ------------------------------

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
}, 1000 / EXPECTED_FPS);

//export initPack and Player
module.exports = {
  initPack,
  Player,
};
