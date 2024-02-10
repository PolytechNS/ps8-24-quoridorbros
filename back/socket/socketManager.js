const { GameManager } = require("../logic/gameManager.js");

class SocketManager {
  constructor(io) {
    this.io = io;
    this.gameManager = null;
    this.setupListeners();
  }

  setupListeners() {
    this.io.on("connection", (socket) => {
      console.log(`New connection: ${socket.id}`);

      socket.on("create game", (msg) => {
        console.log(`Create game: ${socket.id}`);
        this.attachGameManager(new GameManager(this));
      });

      socket.on("newMove", (move) => {
        this.gameManager.movePlayer1(move);
      });
    });
  }

  attachGameManager(gameManager) {
    this.gameManager = gameManager;
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
