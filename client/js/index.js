const socket = io();

//sign
const signDiv = document.querySelector(".signDiv");
const signDivUsername = document.getElementById("signDiv-username");
const signDivPassword = document.getElementById("signDiv-password");
const signIn = document.getElementById("signDiv-signIn");
const signUp = document.getElementById("signDiv-signUp");
const gameDiv = document.getElementById("gameDiv");

signIn.onclick = () => {
  socket.emit("signIn", {
    username: signDivUsername.value,
    password: signDivPassword.value,
  });
};
signUp.onclick = () => {
  socket.emit("signUp", {
    username: signDivUsername.value,
    password: signDivPassword.value,
  });
};
socket.on("signInResponse", (data) => {
  if (data.success) {
    signDiv.style.display = "none";
    gameDiv.style.display = "inline-block";
  } else {
    signDivUsername.value = "";
    signDivPassword.value = "";
  }
});
socket.on("signUpResponse", (data) => {
  if (data.success) {
    alert("Sign up successful.");
  } else {
    alert("Sign up unsuccessful.");
  }
});

//TODO: remove
//automatic login
socket.emit("signIn", {
  username: "test",
  password: "test",
});

//chat
const chatText = document.getElementById("chat-text");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

socket.on("addToChat", (data) => {
  chatText.innerHTML += `<div>${data}</div>`;
  chatText.scrollTop = chatText.scrollHeight;
});

socket.on("evalAnswer", (data) => {
  console.log(data);
});

chatForm.onsubmit = (event) => {
  event.preventDefault();
  if (chatInput.value[0] === "/") {
    socket.emit("evalServer", chatInput.value.slice(1));
  } else {
    socket.emit("sendMsgToServer", chatInput.value);
  }
  chatInput.value = "";
};

//game
const Img = {};
Img.player = new Image();
Img.player.src = "/client/img/isaac.png";
Img.enemy = new Image();
Img.enemy.src = "/client/img/enemy.png";
Img.playerTear = new Image();
Img.playerTear.src = "/client/img/playerTear.png";
Img.enemyTear = new Image();
Img.enemyTear.src = "/client/img/enemyTear.png";
Img.map = new Image();
Img.map.src = "/client/img/bg.png";
Img.soulFullHeart = new Image();
Img.soulFullHeart.src = "/client/img/soulFullHeart.png";
Img.soulHalfHeart = new Image();
Img.soulHalfHeart.src = "/client/img/soulHalfHeart.png";
Img.redFullHeart = new Image();
Img.redFullHeart.src = "/client/img/redFullHeart.png";
Img.redHalfHeart = new Image();
Img.redHalfHeart.src = "/client/img/redHalfHeart.png";

const ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial";

const Player = (initPack) => {
  const self = {};
  self.id = initPack.id;
  self.number = initPack.number;
  self.x = initPack.x;
  self.y = initPack.y;
  self.hp = initPack.hp;
  self.hpMax = initPack.hpMax;
  self.score = initPack.score;

  self.draw = (playerModel) => {
    for (let i = 1; i <= self.hpMax; i++) {
      const fullHeartModel =
        selfId === self.id ? Img.redFullHeart : Img.soulFullHeart;
      const halfHeartModel =
        selfId === self.id ? Img.redHalfHeart : Img.soulHalfHeart;

      if (i < self.hp) {
        ctx.drawImage(
          fullHeartModel,
          self.x - 60 + (i / 2) * 30,
          self.y - 85,
          30,
          30
        );
        i++;
      } else if (i === self.hp)
        ctx.drawImage(
          halfHeartModel,
          self.x - 60 + (i / 2) * 30,
          self.y - 85,
          30,
          30
        );
    }

    const width = Img.player.width / 4;
    const height = Img.player.height / 4;

    ctx.drawImage(
      playerModel,
      0,
      0,
      Img.player.width,
      Img.player.height,
      self.x - width / 2,
      self.y - height / 2,
      width,
      height
    );
  };

  Player.list[self.id] = self;
  return self;
};
Player.list = {};

const Bullet = (initPack) => {
  const self = {};
  self.id = initPack.id;
  self.x = initPack.x;
  self.y = initPack.y;
  self.parent = initPack.parent;

  self.draw = () => {
    const width = Img.playerTear.width / 4;
    const height = Img.playerTear.height / 4;

    const tearModel = self.parent === selfId ? Img.playerTear : Img.enemyTear;
    ctx.drawImage(
      tearModel,
      0,
      0,
      Img.playerTear.width,
      Img.playerTear.height,
      self.x - width / 2,
      self.y - height / 2,
      width,
      height
    );
  };

  Bullet.list[self.id] = self;
  return self;
};
Bullet.list = {};

let selfId = null;

socket.on("init", (data) => {
  if (data.selfId) selfId = data.selfId;
  for (let i = 0; i < data.player.length; i++) {
    Player(data.player[i]);
  }
  for (let i = 0; i < data.bullet.length; i++) {
    Bullet(data.bullet[i]);
  }
});

socket.on("update", (data) => {
  for (let i = 0; i < data.player.length; i++) {
    const pack = data.player[i];
    const p = Player.list[pack.id];
    if (p) {
      if (pack.x !== undefined) p.x = pack.x;
      if (pack.y !== undefined) p.y = pack.y;
      if (pack.hp !== undefined) p.hp = pack.hp;
      if (pack.score !== undefined) p.score = pack.score;
    }
  }
  for (let i = 0; i < data.bullet.length; i++) {
    const pack = data.bullet[i];
    const b = Bullet.list[data.bullet[i].id];
    if (b) {
      if (pack.x !== undefined) b.x = pack.x;
      if (pack.y !== undefined) b.y = pack.y;
    }
  }
});
socket.on("remove", (data) => {
  for (let i = 0; i < data.player.length; i++) {
    delete Player.list[data.player[i]];
  }
  for (let i = 0; i < data.bullet.length; i++) {
    delete Bullet.list[data.bullet[i]];
  }
});

setInterval(() => {
  if (!selfId) return;
  ctx.clearRect(0, 0, 500, 500);
  drawMap();
  drawScore();
  for (let i in Player.list) {
    const playerModel = Player.list[i].id === selfId ? Img.player : Img.enemy;
    Player.list[i].draw(playerModel);
  }
  for (let i in Bullet.list) {
    Bullet.list[i].draw();
  }
}, 10);
const drawMap = () => {
  ctx.drawImage(Img.map, 0, 0, 1280, 720);
};
const drawScore = () => {
  ctx.fillStyle = "white";
  ctx.fillText(Player.list[selfId].score, 0, 30);
};

document.onkeydown = (event) => {
  if (event.key === "d")
    socket.emit("keyPress", { inputId: "right", state: true });
  else if (event.key === "s")
    socket.emit("keyPress", { inputId: "down", state: true });
  else if (event.key === "a")
    socket.emit("keyPress", { inputId: "left", state: true });
  else if (event.key === "w")
    socket.emit("keyPress", { inputId: "up", state: true });
  else if (event.key === "ArrowRight")
    socket.emit("keyPress", { inputId: "shootRight", state: true });
  else if (event.key === "ArrowDown")
    socket.emit("keyPress", { inputId: "shootDown", state: true });
  else if (event.key === "ArrowLeft")
    socket.emit("keyPress", { inputId: "shootLeft", state: true });
  else if (event.key === "ArrowUp")
    socket.emit("keyPress", { inputId: "shootUp", state: true });
};
document.onkeyup = (event) => {
  if (event.key === "d")
    socket.emit("keyPress", { inputId: "right", state: false });
  else if (event.key === "s")
    socket.emit("keyPress", { inputId: "down", state: false });
  else if (event.key === "a")
    socket.emit("keyPress", { inputId: "left", state: false });
  else if (event.key === "w")
    socket.emit("keyPress", { inputId: "up", state: false });
  else if (event.key === "ArrowRight")
    socket.emit("keyPress", { inputId: "shootRight", state: false });
  else if (event.key === "ArrowDown")
    socket.emit("keyPress", { inputId: "shootDown", state: false });
  else if (event.key === "ArrowLeft")
    socket.emit("keyPress", { inputId: "shootLeft", state: false });
  else if (event.key === "ArrowUp")
    socket.emit("keyPress", { inputId: "shootUp", state: false });
};
