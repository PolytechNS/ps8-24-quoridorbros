function createGame() {
  socket.emit("create game");
}

function saveGame(token) {
  socket.emit("save-game", token);
}

function loadGame(token) {
  socket.emit("load-game", token);
}
