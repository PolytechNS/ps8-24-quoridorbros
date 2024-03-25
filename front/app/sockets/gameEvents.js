let clientBoard;

socket.on("initBoard", (msg) => {
  socket.emit("Acknowledgement", msg.id);
  const gameState = msg.data;
  clientBoard = new ClientBoard(onCellClick, onWallClick, gameState);
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
