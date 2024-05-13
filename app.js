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

const io = require("socket.io")(serv, {});
io.sockets.on("connection", (socket) => {
  console.log("socket connection");

  socket.on("heyyo", () => {
    console.log("YO BROSKIE");
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected");
  });
});
