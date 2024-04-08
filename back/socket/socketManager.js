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
const {RoomManager} = require("../logic/matchMaking/roomManager");

class SocketManager {
  constructor(io) {
    this.io = io;
    this.aiGameManager = null;
    this.setupListeners();
  }

  setupListeners() {
    this.io.on("connection", (socket) => {
      //console.log(`connection: ${socket.id}`);

      socket.emit("getCookie");

      socket.on("cookie", async (cookie) => {
        const userId = await getIdOfUser(cookie.user);
        SocketMapper.updateSocket(userId, socket);


        //si le user était déjà en partie
        let aiGameManagerameManager =
          GameManagerMapper.getAiGameManagerByUserId(userId);
        let onlineGameInfo =
          GameManagerMapper.getOnlineGameInfoByUserId(userId);

        if (aiGameManagerameManager) {
          console.log(`déjà en aiGameManagerameManager: ${aiGameManagerameManager}`);
          configureAiGameEvents(socket, aiGameManagerameManager);
        } else if (onlineGameInfo) {
          console.log(`déjà en onlineGameInfo: ${socket.id}`);
          configureOneVOneOnlineGameEvents(
            socket,
            onlineGameInfo.gameManager,
            onlineGameInfo.playerNumber
          );
        }

        SocketSender.resendAllPending(userId);

      });




      //Local game
      socket.on("create game", () => {
        console.log(`create game: ${socket.id}`);
        const userId = SocketMapper.getUserIdBySocketId(socket.id);
        const aiGameManager = GameManagerFactory.createAiGameManager(userId);
        configureAiGameEvents(socket, aiGameManager);
      });

      socket.on("load-game", () => {
        console.log(`load-game: ${socket.id}`);

        const userId = SocketMapper.getUserIdBySocketId(socket.id);
        const aiGameManager = GameManagerFactory.createAiGameManager(
          userId,
          true
        );
        configureAiGameEvents(socket, aiGameManager);
      });

      //Online game

      socket.on("quitMatchMaking", () => {
        const userId = SocketMapper.getUserIdBySocketId(socket.id);

        //console.log(`quit matchmaking: ${socket.id}`);
        RoomManager.quitMatchmaking(userId);
      });

        socket.on("challengeFriend", (username) => {
            const userId = SocketMapper.getUserIdBySocketId(socket.id);
            console.log(`challengeFriend: ${socket.id}`);
        });

        socket.on("checkFriendConnectionStatus", async (username) => {
            const userId = await getIdOfUser(username);
            console.log(`checkFriendConnectionStatus: ${socket.id} checks for ${userId}`);
            SocketMapper.mapper.forEach((value, key) => {
                if (key === userId) {
                  console.log(`friendConnected: ${username}`);
                    socket.emit("friendConnected", username);
                }
            }
            );
        });
    });
  }
}

exports.SocketManager = SocketManager;
