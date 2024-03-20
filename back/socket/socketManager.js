const { Socket } = require("socket.io");
const { AiGameManager } = require("../logic/gameManagers/aiGameManager.js");
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

      //Local game
      socket.on("create game", (msg) => {
        console.log(`create game: ${socket.id}`);
        this.attachAiGameManager(new AiGameManager(this));
      });

      socket.on("load-game", (token) => {
        console.log(`load-game: ${socket.id}`);
        this.attachAiGameManager(new AiGameManager(this, token));
      });

      socket.on("newMove", (move) => {
        this.aiGameManager.movePlayer1(move);
      });

      socket.on("save-game", (token) => {
        console.log(`save-game: ${socket.id}`);
        this.aiGameManager.saveGame(token);
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

  attachAiGameManager(AiGameManager) {
    this.aiGameManager = AiGameManager;
  }

  updateClientBoard(gameState) {
    this.io.emit("updatedBoard", gameState);
  }

  initClientBoard(gameState) {
    this.io.emit("initBoard", gameState);
  }

  playerWon(playerNumber) {
    this.io.emit("winner", playerNumber);
  }
}

exports.SocketManager = SocketManager;
