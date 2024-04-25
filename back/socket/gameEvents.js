const {
  GameManagerMapper,
} = require("../logic/gameManagers/gameManagerMapper");
const { getIdOfUser, getProfileByUserId } = require("../mongoDB/mongoManager");
const { SocketMapper } = require("./socketMapper");
const { SocketSender } = require("./socketSender");
const { ChallengeManager } = require("../logic/matchMaking/challengeManager");

function configureAiGameEvents(socket, aiGameManager) {
  socket.on("newMove", (move) => {
    aiGameManager.movePlayer1(move);
  });

  socket.on("save-game", () => {
    aiGameManager.saveGame();
  });

  socket.on("concede", () => {
    aiGameManager.concede();
  });
}

function configureChallengeEvents(socket) {
  socket.on("challengeFriend", async (challengedUsername) => {
    const challengerUserId = SocketMapper.getUserIdBySocketId(socket.id);
    await ChallengeManager.sendChallenge(challengedUsername, challengerUserId);
  });

  socket.on("acceptChallenge", async (challengerUsername) => {
    const challengerUserId = await getIdOfUser(challengerUsername);
    await ChallengeManager.acceptChallenge(challengerUserId);
  });

  socket.on("declineChallenge", async (challengerUsername) => {
    const challengerUserId = await getIdOfUser(challengerUsername);
    await ChallengeManager.declineChallenge(challengerUserId);
  });

  socket.on("cancelChallenge", async (challengedUsername) => {
    const userId = SocketMapper.getUserIdBySocketId(socket.id);
    await ChallengeManager.cancelChallenge(userId);
  });
}

function configureOneVOneOnlineGameEvents(
  socket,
  oneVOneOnlineGameManager,
  playerNumber,
) {
  if (playerNumber === 1) {
    socket.on("newMove", (move) => {
      oneVOneOnlineGameManager.movePlayer1(move);
    });

    socket.on("newMessage", (message) => {
      oneVOneOnlineGameManager.sendMessagePlayer2(message);
    });

    socket.on("concede", () => {
      oneVOneOnlineGameManager.concede(1);
    });
  } else if (playerNumber === 2) {
    socket.on("newMove", (move) => {
      oneVOneOnlineGameManager.movePlayer2(move);
    });

    socket.on("newMessage", (message) => {
      oneVOneOnlineGameManager.sendMessagePlayer1(message);
    });

    socket.on("concede", () => {
      oneVOneOnlineGameManager.concede(2);
    });
  }
}

exports.configureAiGameEvents = configureAiGameEvents;
exports.configureOneVOneOnlineGameEvents = configureOneVOneOnlineGameEvents;
exports.configureChallengeEvents = configureChallengeEvents;
