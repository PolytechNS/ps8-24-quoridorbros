let socket = io();
let clientBoard;
startGame();

socket.on("initBoard", (msg) => {
  clientBoard = new ClientBoard(
    onCellClick,
    onWallClick,
    msg.board,
    msg.playerNumber
  );
});

socket.on("updatedBoard", (msg) => {
  clientBoard.updateBoard(msg);
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
