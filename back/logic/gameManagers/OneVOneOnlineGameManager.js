const { BoardUtils } = require("../../../front/js/utils.js");
const { Game } = require("../../../front/js/game.js");

class OneVOneOnlineGameManager {
  constructor(io, roomId, socketClient1, socketClient2) {
    this.io = io;
    this.roomId = roomId;
    this.socketClient1 = socketClient1;
    this.socketClient2 = socketClient2;

    this.isGameFinished = false;
    this.isFirstTurn = true;

    this.game = new Game(this);
  }

  playerWon(playerNumber) {
    this.io.emit("winner", playerNumber);
  }

  initBoardPlayer1(gameState) {
    this.socketClient1.emit("initBoard", gameState);
  }

  initBoardPlayer2(gameState) {
    this.socketClient2.emit("initBoard", gameState);
  }

  updateGameStatePlayer1(gameState) {
    this.socketClient1.emit("updatedBoard", gameState);
  }

  updateGameStatePlayer2(gameState) {
    this.socketClient1.emit("updatedBoard", gameState);
  }

  playerWon(playerNumber) {
    this.isGameFinished = true;
    this.io.to(roomId).emit("winner", playerNumber);
  }

  movePlayer1(move) {
    if (this.isGameFinished) return;
    if (BoardUtils.isWall(move.x, move.y)) {
      this.game.onWallClick(move.x, move.y);
    } else {
      this.game.onCellClick(move.x, move.y);
    }
  }
  movePlayer2(move) {
    if (this.isGameFinished) return;
    if (BoardUtils.isWall(move.x, move.y)) {
      this.game.onWallClick(move.x, move.y);
    } else {
      this.game.onCellClick(move.x, move.y);
    }
  }
}

exports.OneVOneOnlineGameManager = OneVOneOnlineGameManager;
