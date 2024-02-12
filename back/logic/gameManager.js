const { BoardUtils } = require("../../front/js/utils.js");
const { Game } = require("../../front/js/game.js");
const { Ai } = require("./ai.js");
const { saveGameState, loadGameState } = require("../mongoDB/mongoManager.js");

class GameManager {
  constructor(socketManager, loadGame) {
    this.socketManager = socketManager;
    this.ai = new Ai();
    this.isGameFinished = false;
    if (loadGame) {
    } else {
      this.game = new Game(this);
    }
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
    if (gameState.turnOf === 2) {
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
      console.log("x: ", move.x, "y: ", move.y);
      this.game.onWallClick(move.x, move.y);
    } else {
      this.game.onCellClick(move.x, move.y);
    }
  }

  async saveGame(userToken) {
    const gameState = this.game.generateGameState();
    saveGameState(userToken, gameState);
  }

  async loadGame(userToken) {
    const gameState = loadGameState(userToken);
  }
}

exports.GameManager = GameManager;
