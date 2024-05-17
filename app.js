import express from "express";
import { Player, Bullet } from "./server/Player.js";
import { initPack, removePack } from "./server/Packs.js";
import {
  GAME_WINDOW_WIDTH,
  GAME_WINDOW_HEIGHT,
  EXPECTED_FPS,
} from "./server/settings.js";
import { Server } from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ------------------------------ SERVER ------------------------------
const app = express();
const serv = Server(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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

// TESTING WITHOUT DB CONNECTION
import {
  isValidPassword,
  isUsernameTaken,
  addUser,
} from "./test/testDbConnection.js";

// TESTING WITH DB CONNECTION
// const {
//   isValidPassword,
//   isUsernameTaken,
//   addUser,
// } = require("./server/dbConnection");

// ------------------------------ END OF DB CONNECTION ------------------------------

// ------------------------------------- SOCKET -------------------------------------

import { Server as socketServer } from "socket.io";
const io = new socketServer(serv, {});
io.sockets.on("connection", (socket) => {
  let id = Math.random();
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
    delete SOCKET_LIST[id];
    console.log("Player disconnected." + id);
    Player.onDisconnect(socket);
  });
  socket.on("sendMsgToServer", (data) => {
    let playerName = Player.list[id].name;
    for (let i in SOCKET_LIST) {
      SOCKET_LIST[i].emit("addToChat", playerName + ": " + data);
    }
  });
  socket.on("evalServer", (data) => {
    if (!DEBUG) return;
    let res = eval(data);
    socket.emit("evalAnswer", res);
  });
  socket.on("setName", (data) => {
    Player.list[id].name = data;
    console.log(Player.list[id].name);
  });
});

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
