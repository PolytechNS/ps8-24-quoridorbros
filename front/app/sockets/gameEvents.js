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

socket.on("winner", (msg) => {
  socket.emit("Acknowledgement", msg.id);
  const winningMessage = msg.data;
  console.log(winningMessage);
});

function onCellClick(x, y) {
  socket.emit("newMove", { x: x, y: y });
}

function onWallClick(x, y) {
  socket.emit("newMove", { x: x, y: y });
}
