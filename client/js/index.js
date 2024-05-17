class GameClient {
  constructor() {
    this.socket = io();
    this.selfId = null;
    this.Img = {};
    this.ctx = document.getElementById("ctx").getContext("2d");
    this.scoreboard = document.getElementById("scoreboard");
    this.init();
    this.setupEventListeners();
  }

  init() {
    this.loadImages();
    setInterval(() => this.updateGame(), 10);
  }

  loadImages() {
    const imagePaths = {
      player: "/client/img/isaac.png",
      playerShooting: "/client/img/isaacShooting.png",
      enemy: "/client/img/enemy.png",
      enemyShooting: "/client/img/enemyShooting.png",
      playerTear: "/client/img/playerTear.png",
      enemyTear: "/client/img/enemyTear.png",
      map: "/client/img/bg.png",
      soulFullHeart: "/client/img/soulFullHeart.png",
      soulHalfHeart: "/client/img/soulHalfHeart.png",
      redFullHeart: "/client/img/redFullHeart.png",
      redHalfHeart: "/client/img/redHalfHeart.png",
    };
    for (let key in imagePaths) {
      this.Img[key] = this.loadImage(imagePaths[key]);
    }
  }

  loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  setupEventListeners() {
    document.querySelector("#signDiv-signIn").onclick = () => this.signIn();
    document.querySelector("#signDiv-signUp").onclick = () => this.signUp();
    this.socket.on("signInResponse", (data) => this.handleSignInResponse(data));
    this.socket.on("signUpResponse", (data) => this.handleSignUpResponse(data));
    this.socket.on("addToChat", (data) => this.addToChat(data));
    this.socket.on("evalAnswer", (data) => console.log(data));
    this.socket.on("init", (data) => this.handleInit(data));
    this.socket.on("update", (data) => this.handleUpdate(data));
    this.socket.on("remove", (data) => this.handleRemove(data));
    document.getElementById("chat-form").onsubmit = (event) =>
      this.handleChatSubmit(event);

    document.onkeydown = (event) => this.handleKeydown(event);
    document.onkeyup = (event) => this.handleKeyup(event);

    this.socket.emit("signIn", {
      username: "test",
      password: "test",
    });
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
      document.getElementById("gameDiv").style.display = "inline-block";
    } else {
      document.getElementById("signDiv-username").value = "";
      document.getElementById("signDiv-password").value = "";
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
    // console.log(Player.list);
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

  handleKeydown(event) {
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
      this.socket.emit("keyPress", { inputId: keyMap[event.key], state: true });
    }
  }

  handleKeyup(event) {
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
        state: false,
      });
    }
  }
}

class Player {
  constructor(initPack, game) {
    this.id = initPack.id;
    this.name = initPack.name;
    this.x = initPack.x;
    this.y = initPack.y;
    this.hp = initPack.hp;
    this.hpMax = initPack.hpMax;
    this.score = initPack.score;
    this.isClosingEyes = initPack.isClosingEyes;
    this.game = game;
    if (!game.scoreboard.innerHTML.includes(this.id)) {
      game.scoreboard.innerHTML += `<div id=${this.id}>0 - ${this.name}</div>`;
    }
    Player.list[this.id] = this;
  }

  update(data) {
    // console.log(data);
    if (data.x !== undefined) this.x = data.x;
    if (data.y !== undefined) this.y = data.y;
    if (data.hp !== undefined) this.hp = data.hp;
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
    console.log(this);

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
      this.game.ctx.fillStyle = "white";
      this.game.ctx.font = "30px upheaval";
      this.game.ctx.fillText(
        this.name,
        this.x - this.name.length * 8.2,
        this.y - 95,
      );
    }

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

class Bullet {
  constructor(initPack, game) {
    this.id = initPack.id;
    this.x = initPack.x;
    this.y = initPack.y;
    this.parent = initPack.parent;
    this.game = game;
    Bullet.list[this.id] = this;
  }

  update(data) {
    if (data.x !== undefined) this.x = data.x;
    if (data.y !== undefined) this.y = data.y;
  }

  draw() {
    const width = this.game.Img.playerTear.width / 4;
    const height = this.game.Img.playerTear.height / 4;
    const tearModel =
      this.parent === this.game.selfId
        ? this.game.Img.playerTear
        : this.game.Img.enemyTear;
    this.game.ctx.drawImage(
      tearModel,
      0,
      0,
      this.game.Img.playerTear.width,
      this.game.Img.playerTear.height,
      this.x - width / 2,
      this.y - height / 2,
      width,
      height,
    );
  }
}
Bullet.list = {};

new GameClient();
