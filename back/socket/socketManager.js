const {
  GameManagerFactory,
} = require("../logic/gameManagers/gameManagerFactory.js");

const {
  configureAiGameEvents,
  configureOneVOneOnlineGameEvents,
} = require("./gameEvents.js");

const { SocketMapper } = require("./socketMapper.js");
const { getIdOfUser } = require("../mongoDB/mongoManager.js");
const { SocketSender } = require("./socketSender.js");
const {
  GameManagerMapper,
} = require("../logic/gameManagers/gameManagerMapper.js");
const { RoomManager } = require("../logic/matchMaking/roomManager");
const {getProfileOf, getProfileByUserId} = require("../mongoDB/mongoManager");

class SocketManager {
  constructor(io) {
    this.io = io;
    this.aiGameManager = null;
    this.setupListeners();

  }

  setupListeners() {
    this.io.on("connection", (socket) => {
      console.log(`connection: ${socket.id}`);

      socket.emit("getCookie");

      socket.on("cookie", async (cookie) => {
        console.log(`cookie receive: ${socket.id}`);

        const userId = await getIdOfUser(cookie.user);
        SocketMapper.updateSocket(userId, socket);
        SocketSender.sendMessage(userId, "cookieReceived");

        //si le user était déjà en partie
        let aiGameManagerameManager =
          GameManagerMapper.getAiGameManagerByUserId(userId);
        let onlineGameInfo =
          GameManagerMapper.getOnlineGameInfoByUserId(userId);

        if (aiGameManagerameManager) {
          console.log(
            `déjà en aiGameManagerameManager: ${aiGameManagerameManager}`,
          );
          configureAiGameEvents(socket, aiGameManagerameManager);
        } else if (onlineGameInfo) {
          console.log(`déjà en onlineGameInfo: ${socket.id}`);
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
        console.log(`create game: ${socket.id}`);
        const userId = SocketMapper.getUserIdBySocketId(socket.id);
        const aiGameManager = GameManagerFactory.createAiGameManager(
          userId,
          level,
        );
        configureAiGameEvents(socket, aiGameManager);
      });

      socket.on("load-game", () => {
        console.log(`load-game: ${socket.id}`);

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

        //console.log(`quit matchmaking: ${socket.id}`);
        RoomManager.quitMatchmaking(userId);
      });

      socket.on("challengeFriend", async (challengedUsername) => {
        const challengedId = await getIdOfUser(challengedUsername);
        const challengerId = SocketMapper.getUserIdBySocketId(socket.id);
        const challengerProfile = await getProfileByUserId(challengerId);
        console.log(`${challengerProfile} challenges ${challengedUsername}`);
        SocketMapper.getSocketById(challengedId).emit("receiveChallenge", challengerProfile);


      });

      socket.on("checkFriendConnectionStatus", async (username) => {
        const userId = await getIdOfUser(username);
        console.log(
          `checkFriendConnectionStatus: ${socket.id} checks for ${userId}`,
        );
        SocketMapper.mapper.forEach((value, key) => {
          if (key === userId) {
            console.log(`friendConnected: ${username}`);
            socket.emit("friendConnected", username);
          }
        });
      });

    });
  }
}

exports.SocketManager = SocketManager;
