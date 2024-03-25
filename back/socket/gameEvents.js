function configureAiGameEvents(socket, aiGameManager) {
  socket.on("newMove", (move) => {
    aiGameManager.movePlayer1(move);
  });

  socket.on("save-game", (token) => {
    console.log(`save-game: ${socket.id}`);
    aiGameManager.saveGame(token);
  });
}

function configureOneVOneOnlineGameEvents(
  socket,
  oneVOneOnlineGameManager,
  playerNumber
) {
  if (playerNumber === 1) {
    socket.on("newMove", (move) => {
      oneVOneOnlineGameManager.movePlayer1(move);
    });

    socket.on("newMessage", (message) => {
      oneVOneOnlineGameManager.sendMessagePlayer2(message)
    });

  } else if (playerNumber === 2) {
    socket.on("newMove", (move) => {
      oneVOneOnlineGameManager.movePlayer2(move);
    });

    socket.on("newMessage", (message) => {
      oneVOneOnlineGameManager.sendMessagePlayer1(message)
    });
  }
}

exports.configureAiGameEvents = configureAiGameEvents;
exports.configureOneVOneOnlineGameEvents = configureOneVOneOnlineGameEvents;
