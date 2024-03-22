function configureAiGameEvents(socket, aiGameManager) {
  socket.on("newMove", (move) => {
    aiGameManager.movePlayer1(move);
  });

  socket.on("save-game", (token) => {
    console.log(`save-game: ${socket.id}`);
    aiGameManager.saveGame(token);
  });
}

exports.configureAiGameEvents = configureAiGameEvents;
