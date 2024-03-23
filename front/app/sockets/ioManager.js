let socket = io();
let clientBoard;

let jsonCookie = getCookie("connected");
let cookie = JSON.parse(jsonCookie);

socket.on("initBoard", (msg) => {
  socket.emit("Acknowledgement", msg.id);
  const gameState = msg.data;
  clientBoard = new ClientBoard(onCellClick, onWallClick, gameState);
});

socket.on("getCookie", () => {
  socket.emit("cookie", cookie);
});

socket.on("updatedBoard", (msg) => {
  socket.emit("Acknowledgement", msg.id);
  const gameState = msg.data;
  clientBoard.updateBoard(gameState);
});

function onCellClick(x, y) {
  socket.emit("newMove", { x: x, y: y });
}

function onWallClick(x, y) {
  socket.emit("newMove", { x: x, y: y });
}

function createGame() {
  socket.emit("create game", cookie);
}

function saveGame(token) {
  socket.emit("save-game", token);
}

function loadGame(token) {
  socket.emit("load-game", token);
}

socket.on("RoomFull", (msg) => {
  //socket.emit("Acknowledgement", msg.id);
  console.log("RoomFull");
  window.location.href = "../onlineGame/onlineGame.html";
});

socket.on("joinedRoom", () => {
  socket.emit("Acknowledgement", msg.id);
  console.log("joinedRoom");
});

function enterMatchMaking(cookie) {
  socket.emit("enter matchmaking", cookie);
}
