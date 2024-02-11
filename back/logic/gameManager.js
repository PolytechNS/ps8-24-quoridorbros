const { BoardUtils } = require("../../front/js/utils.js");
const { Game } = require("../../front/js/game.js");
const { Ai } = require("./ai.js");
const { getDb } = require("../mongoDB/mongoManager.js");

class GameManager {
  constructor(socketManager) {
    this.socketManager = socketManager;
    this.game = new Game(9, this);
    this.ai = new Ai();
    this.isGameFinished = false;
  }

  initBoardPlayer1(gameState) {
    this.socketManager.initClientBoard(gameState);
  }
  initBoardPlayer2(gameState) {}

  updateGameStatePlayer1(gameState) {
    this.socketManager.updateClientBoard(gameState);
  }
  updateGameStatePlayer2(gameState) {
    this.ai.updateGameState(gameState);
    if (this.ai.isItMyTurn) {
      this.movePlayer2();
    }
  }
  playerWon(playerNumber) {
    this.isGameFinished = true;
    this.socketManager.playerWon(playerNumber);
  }

  movePlayer1(move) {
    if (this.isGameFinished) return;
    if (BoardUtils.isWall(move.x, move.y)) {
      this.game.onWallClick(move.x, move.y);
    } else {
      this.game.onCellClick(move.x, move.y);
    }
  }
  movePlayer2() {
    if (this.isGameFinished) return;
    const move = this.ai.computeMove();
    if (BoardUtils.isWall(move.x, move.y)) {
      this.game.onWallClick(move.x, move.y);
    } else {
      this.game.onCellClick(move.x, move.y);
    }
  }

  async saveGameState(userToken) {
    const gameState = {
      game: this.game.serialize(),
      ai: this.ai.serialize(),
      isGameFinished: this.isGameFinished,
      userToken: userToken,
    };

    try {
      const db = getDb();
      const collection = db.collection("gameStates");
      await collection.insertOne(gameState);
      console.log("Game state saved successfully");
    } catch (error) {
      console.error("Error saving game state", error);
    }
  }

  async loadGameState(userToken) {
    try {
      const db = getDb();
      const collection = db.collection("gameStates");
      const gameState = await collection.findOne({
        userToken: userToken,
        isGameFinished: false,
      });

      if (gameState) {
        this.game.deserialize(gameState.game);
        this.ai.deserialize(gameState.ai);
        this.isGameFinished = gameState.isGameFinished;
        console.log("Game state loaded successfully");
      } else {
        console.log("No unfinished game found for the user");
      }
    } catch (error) {
      console.error("Error loading game state", error);
    }
  }
}

exports.GameManager = GameManager;
