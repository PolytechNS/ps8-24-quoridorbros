function createGame(level) {
  console.log("createGame", level);
  socket.emit("create game", level);
}

function saveGame() {
  socket.emit("save-game");
}

function loadGame() {
  socket.emit("load-game");
}
