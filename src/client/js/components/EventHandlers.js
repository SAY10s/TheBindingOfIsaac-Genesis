export function setupEventListeners(gameClient) {
  document
    .querySelector("#signDiv-signIn")
    .addEventListener("click", () => gameClient.signIn());
  document
    .querySelector("#signDiv-signUp")
    .addEventListener("click", () => gameClient.signUp());

  gameClient.socket.on("signInResponse", (data) =>
    gameClient.handleSignInResponse(data),
  );
  gameClient.socket.on("signUpResponse", (data) =>
    gameClient.handleSignUpResponse(data),
  );
  gameClient.socket.on("addToChat", (data) => gameClient.addToChat(data));
  gameClient.socket.on("evalAnswer", (data) => console.log(data));
  gameClient.socket.on("init", (data) => gameClient.handleInit(data));
  gameClient.socket.on("update", (data) => gameClient.handleUpdate(data));
  gameClient.socket.on("remove", (data) => gameClient.handleRemove(data));

  document.getElementById("chat-form").onsubmit = (event) =>
    gameClient.handleChatSubmit(event);

  document.onkeydown = (event) => gameClient.handleKeyEvent(event, "down");
  document.onkeyup = (event) => gameClient.handleKeyEvent(event, "up");

  gameClient.socket.emit("signIn", {
    username: "test",
    password: "test",
  });
}
