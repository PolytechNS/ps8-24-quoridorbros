let socket = io();
let clientBoard;

socket.on("initBoard", (gameState) => {
  clientBoard = new ClientBoard(onCellClick, onWallClick, gameState);
});

socket.on("getCookie", () => {
  let jsonCookie = getCookie("connected");
  let cookie = JSON.parse(jsonCookie);
  socket.emit("cookie", cookie);
});

socket.on("updatedBoard", (gameState) => {
  clientBoard.updateBoard(gameState);
});

function onCellClick(x, y) {
  socket.emit("newMove", { x: x, y: y });
}

function onWallClick(x, y) {
  socket.emit("newMove", { x: x, y: y });
}

function createGame() {
  socket.emit("create game", {});
}

function saveGame(token) {
  socket.emit("save-game", token);
}

function loadGame(token) {
  socket.emit("load-game", token);
}

socket.on("RoomFull", () => {
  console.log("RoomFull");
  window.location.href = "../pages/onlineGame.html";
});

socket.on("joinedRoom", () => {
  console.log("joinedRoom");
});

function enterMatchMaking(cookie) {
  socket.emit("enter matchmaking", cookie);
}
