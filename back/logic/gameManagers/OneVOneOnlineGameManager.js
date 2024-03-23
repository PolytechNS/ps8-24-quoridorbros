const { BoardUtils } = require("../../../front/utils/utils.js");
const { Game } = require("../../../front/utils/game.js");
const { SocketMapper } = require("../../socket/socketMapper.js");
const { SocketSender } = require("../../socket/socketSender.js");

class OneVOneOnlineGameManager {
  constructor(io, roomId, idClient1, idClient2) {
    this.io = io;
    this.roomId = roomId;
    this.idClient1 = idClient1;
    this.idClient2 = idClient2;

    this.isGameFinished = false;
    this.isFirstTurn = true;

    this.game = new Game(this);
  }

  playerWon(playerNumber) {
    this.io.emit("winner", playerNumber);
  }

  initBoardPlayer1(gameState) {
    console.log("idClient1", this.idClient1);
    SocketSender.sendMessage(this.idClient1, "initBoard", gameState);
  }

  initBoardPlayer2(gameState) {
    console.log("idClient2", this.idClient2);
    SocketSender.sendMessage(this.idClient2, "initBoard", gameState);
  }

  updateGameStatePlayer1(gameState) {
    this.idClient1.emit("updatedBoard", gameState);
  }

  updateGameStatePlayer2(gameState) {
    this.idClient1.emit("updatedBoard", gameState);
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
