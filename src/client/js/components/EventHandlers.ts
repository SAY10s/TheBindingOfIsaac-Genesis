import GameClient from "./GameClient.js";

export function setupEventListeners(gameClient: GameClient) {
  const signInButton = document.querySelector(
    "#signDiv-signIn",
  ) as HTMLButtonElement;
  const signUpButton = document.querySelector(
    "#signDiv-signUp",
  ) as HTMLButtonElement;
  signInButton.addEventListener("click", () => gameClient.signIn());
  signUpButton.addEventListener("click", () => gameClient.signUp());

  gameClient.socket.on("signInResponse", (data: { success: boolean }) =>
    gameClient.handleSignInResponse(data),
  );
  gameClient.socket.on("signUpResponse", (data: { success: boolean }) =>
    gameClient.handleSignUpResponse(data),
  );
  gameClient.socket.on("addToChat", (data: string) =>
    gameClient.addToChat(data),
  );
  gameClient.socket.on("evalAnswer", (data: string) => console.log(data));
  gameClient.socket.on(
    "init",
    (data: {
      selfId: string | null;
      player: {
        hp: number;
        hpMax: number;
        id: string;
        isClosingEyes: false;
        name: string;
        score: number;
        x: number;
        y: number;
      }[];
      bullet: { id: string; parent: string; x: number; y: number }[];
    }) => gameClient.handleInit(data),
  );
  gameClient.socket.on(
    "update",
    (data: {
      selfId: string | null;
      player: {
        hp: number;
        id: string;
        isClosingEyes: false;
        name: string;
        score: number;
        x: number;
        y: number;
      }[];
      bullet: { id: string; x: number; y: number }[];
    }) => gameClient.handleUpdate(data),
  );
  gameClient.socket.on("remove", (data) => gameClient.handleRemove(data));

  const chatForm = document.getElementById("chat-form") as HTMLFormElement;
  chatForm.addEventListener("submit", (event) =>
    gameClient.handleChatSubmit(event),
  );

  document.onkeydown = (event) => gameClient.handleKeyEvent(event, "down");
  document.onkeyup = (event) => gameClient.handleKeyEvent(event, "up");

  // gameClient.socket.emit("signIn", {
  //   username: "test",
  //   password: "test",
  // });
}
