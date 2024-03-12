const { AiGameManager } = require("../logic/gameManagers/aiGameManager.js");
const { RoomManager } = require("../online/roomManager.js");

class SocketManager {
  constructor(io) {
    this.io = io;
    this.aiGameManager = null;
    this.roomManager = new RoomManager(io);
    this.setupListeners();
  }

  setupListeners() {
    this.io.on("connection", (socket) => {
      console.log(`New connection: ${socket.id}`);

      //Local game
      socket.on("create game", (msg) => {
        console.log(`Create game: ${socket.id}`);
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
      socket.on("enter matchmaking", (playertoken) => {
        console.log(`enter matchmaking: ${socket.id}`);
        this.roomManager.matchmaking(socket,playertoken);
      });

      socket.on("create room", (playertoken) => {
        console.log(`create room: ${socket.id}`);
        this.roomManager.createRoomAndJoin(socket,playertoken);
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
