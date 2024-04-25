const {
  GameManagerFactory,
} = require("../logic/gameManagers/gameManagerFactory.js");

const {
  configureAiGameEvents,
  configureOneVOneOnlineGameEvents,
  configureChallengeEvents,
} = require("./gameEvents.js");

const { SocketMapper } = require("./socketMapper.js");
const { getIdOfUser } = require("../mongoDB/mongoManager.js");
const { SocketSender } = require("./socketSender.js");
const {
  GameManagerMapper,
} = require("../logic/gameManagers/gameManagerMapper.js");
const { RoomManager } = require("../logic/matchMaking/roomManager");
const {getProfileOf, getProfileByUserId} = require("../mongoDB/mongoManager");
const { configureMessagesEvents } = require("./messagesEvents");

class SocketManager {
  constructor(io) {
    this.io = io;
    this.aiGameManager = null;
    this.setupListeners();
  }

  setupListeners() {
    this.io.on("connection", (socket) => {

      socket.emit("getCookie");

      socket.on("cookie", async (cookie) => {

        const userId = await getIdOfUser(cookie.user);
        SocketMapper.updateSocket(userId, socket);
        SocketSender.sendMessage(userId, "cookieReceived");
        configureChallengeEvents(socket);
        configureMessagesEvents(socket);

        //si le user était déjà en partie
        let aiGameManagerameManager =
          GameManagerMapper.getAiGameManagerByUserId(userId);
        let onlineGameInfo =
          GameManagerMapper.getOnlineGameInfoByUserId(userId);

        if (aiGameManagerameManager) {
          configureAiGameEvents(socket, aiGameManagerameManager);
        } else if (onlineGameInfo) {
          configureOneVOneOnlineGameEvents(
            socket,
            onlineGameInfo.gameManager,
            onlineGameInfo.playerNumber,
          );
        }

        SocketSender.resendAllPending(userId);
      });

      //Ai game
      socket.on("create game", (level) => {
        const userId = SocketMapper.getUserIdBySocketId(socket.id);
        const aiGameManager = GameManagerFactory.createAiGameManager(
          userId,
          level,
        );
        configureAiGameEvents(socket, aiGameManager);
      });

      socket.on("load-game", () => {

        const userId = SocketMapper.getUserIdBySocketId(socket.id);
        const aiGameManager = GameManagerFactory.createAiGameManager(
          userId,
          0,
          true,
        );
        configureAiGameEvents(socket, aiGameManager);
      });

      //Online game

      socket.on("startMatchMaking", () => {
        const userId = SocketMapper.getUserIdBySocketId(socket.id);
        RoomManager.enterMatchmaking(userId);
      });

      socket.on("quitMatchMaking", () => {
        const userId = SocketMapper.getUserIdBySocketId(socket.id);
        RoomManager.quitMatchmaking(userId);
      });

      socket.on("checkFriendConnectionStatus", async (username) => {
        const userId = await getIdOfUser(username);
        SocketMapper.mapper.forEach((value, key) => {
          if (key === userId) {
            socket.emit("friendConnected", username);
          }
        });
      });
    });
  }
}

exports.SocketManager = SocketManager;
