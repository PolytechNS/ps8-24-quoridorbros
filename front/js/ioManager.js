let socket = io();
let clientBoard;
startGame();

socket.on("initBoard", (gameState) => {
  clientBoard = new ClientBoard(onCellClick, onWallClick, gameState);
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

function startGame() {
  socket.emit("create game", {});
}

function saveGameState() {
  socket.emit("save-game", {});
}

function loadGameState() {
  socket.emit("load-game", {});
}
