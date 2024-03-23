const {
  GameManagerFactory,
} = require("../logic/gameManagers/gameManagerFactory.js");

const { configureAiGameEvents } = require("./gameEvents.js");

const { RoomManager } = require("../online/roomManager.js");
const { SocketMapper } = require("./socketMapper.js");
const { getIdOfUser } = require("../mongoDB/mongoManager.js");
const { SocketSender } = require("./socketSender.js");

class SocketManager {
  constructor(io) {
    this.io = io;
    this.aiGameManager = null;
    this.roomManager = new RoomManager(io);
    this.setupListeners();
  }

  setupListeners() {
    this.io.on("connection", (socket) => {
      console.log(`connection: ${socket.id}`);

      socket.emit("getCookie");

      socket.on("cookie", async (cookie) => {
        const userId = await getIdOfUser(cookie.user);
        SocketMapper.updateSocket(userId, socket);
        SocketSender.resendAllPending(userId);
      });

      socket.on("Acknowledgement", (messageId) => {
        const userId = SocketMapper.getUserIdBySocketId(socket.id);
        console.log(`Acknowledgement socketid: ${socket.id}`);
        console.log(`Acknowledgement userid: ${userId}`);
        console.log(`id   message: ${messageId}`);

        SocketSender.handleAcknowledgement(userId, messageId);
      });

      //Local game
      socket.on("create game", async (cookie) => {
        console.log(`create game: ${socket.id}`);
        const userId = await getIdOfUser(cookie.user);
        const aiGameManager = GameManagerFactory.createAiGameManager(userId);
        configureAiGameEvents(socket, aiGameManager);
      });

      socket.on("load-game", async (cookie) => {
        console.log(`load-game: ${socket.id}`);
        const userId = await getIdOfUser(cookie.user);
        const aiGameManager = GameManagerFactory.createAiGameManager(
          userId,
          true
        );
        configureAiGameEvents(socket, aiGameManager);
      });

      //Online game
      socket.on("enter matchmaking", async (cookie) => {
        const userId = await getIdOfUser(cookie.user);
        console.log(`enter matchmaking: ${userId}`);
        this.roomManager.enterMatchmaking(userId);
      });

      socket.on("quit matchmaking", (playertoken) => {
        console.log(`quit matchmaking: ${socket.id}`);
        this.roomManager.quitMatchmaking(socket, playertoken);
      });
    });
  }
}

exports.SocketManager = SocketManager;
