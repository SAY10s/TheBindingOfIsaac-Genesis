import { ImageLoader } from "./ImageLoader.js";
import { setupEventListeners } from "./EventHandlers.js";
import { Player } from "./Player.js";
import { Bullet } from "./Bullet.js";

class GameClient {
  constructor() {
    this.socket = io();
    this.selfId = null;
    this.Img = {};
    this.ctx = document.getElementById("ctx").getContext("2d");
    this.scoreboard = document.getElementById("scoreboard");
    this.init();
    setupEventListeners(this);
  }

  init() {
    this.Img = ImageLoader.loadImages();
    setInterval(() => this.updateGame(), 10);
  }

  signIn() {
    const username = document.getElementById("signDiv-username").value;
    const password = document.getElementById("signDiv-password").value;
    this.socket.emit("signIn", { username, password });
  }

  signUp() {
    const username = document.getElementById("signDiv-username").value;
    const password = document.getElementById("signDiv-password").value;
    this.socket.emit("signUp", { username, password });
  }

  handleSignInResponse(data) {
    if (data.success) {
      document.querySelector(".signDiv").style.display = "none";
      document.querySelector("#gameDiv").style.display = "inline-block";
      document.querySelector("#bgm").play();
    } else {
      document.querySelector("#signDiv-username").value = "";
      document.querySelector("#signDiv-password").value = "";
    }
  }

  handleSignUpResponse(data) {
    alert(data.success ? "Sign up successful." : "Sign up unsuccessful.");
  }

  addToChat(data) {
    const chatText = document.getElementById("chat-text");
    chatText.innerHTML += `<div>${data}</div>`;
    chatText.scrollTop = chatText.scrollHeight;
  }

  handleChatSubmit(event) {
    event.preventDefault();
    const chatInput = document.getElementById("chat-input");
    if (chatInput.value[0] === "//") {
      this.socket.emit("evalServer", chatInput.value.slice(1));
    } else if (chatInput.value.slice(0, 8).toLowerCase() === "/setname") {
      this.socket.emit("setName", chatInput.value.slice(9));
    } else {
      this.socket.emit("sendMsgToServer", chatInput.value);
    }
    chatInput.value = "";
  }

  handleInit(data) {
    if (data.selfId) this.selfId = data.selfId;
    for (let playerData of data.player) {
      new Player(playerData, this);
    }
    for (let bulletData of data.bullet) {
      new Bullet(bulletData, this);
    }
  }

  handleUpdate(data) {
    for (let pack of data.player) {
      const player = Player.list[pack.id] || new Player(pack, this);
      if (player) player.update(pack);
    }
    for (let pack of data.bullet) {
      const bullet = Bullet.list[pack.id];
      if (bullet) bullet.update(pack);
    }
  }

  handleRemove(data) {
    for (let id of data.player) {
      const playerScoreDiv = document.getElementById(id);
      if (playerScoreDiv) playerScoreDiv.remove();
      delete Player.list[id];
    }
    for (let id of data.bullet) {
      delete Bullet.list[id];
    }
  }

  updateGame() {
    if (!this.selfId) return;
    this.ctx.clearRect(0, 0, 500, 500);
    this.drawMap();
    for (let id in Player.list) {
      Player.list[id].draw();
    }
    for (let id in Bullet.list) {
      Bullet.list[id].draw();
    }
  }

  drawMap() {
    this.ctx.drawImage(this.Img.map, 0, 0, 1280, 720);
  }

  handleKeyEvent(event, type) {
    const keyMap = {
      d: "pressingRight",
      s: "pressingDown",
      a: "pressingLeft",
      w: "pressingUp",
      ArrowRight: "shootingRight",
      ArrowDown: "shootingDown",
      ArrowLeft: "shootingLeft",
      ArrowUp: "shootingUp",
    };
    if (keyMap[event.key]) {
      this.socket.emit("keyPress", {
        inputId: keyMap[event.key],
        state: type !== "up",
      });
    }
  }
}

export default GameClient;
