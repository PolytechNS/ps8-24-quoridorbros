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

  initBoardPlayer1(gameState) {
    console.log("idClient1", this.idClient1);
    SocketMapper.removeSocketById(this.idClient1);
    SocketSender.sendMessage(this.idClient1, "initBoard", gameState);
  }

  initBoardPlayer2(gameState) {
    console.log("idClient2", this.idClient2);
    SocketMapper.removeSocketById(this.idClient2);
    SocketSender.sendMessage(this.idClient2, "initBoard", gameState);
  }

  updateGameStatePlayer1(gameState) {
    SocketSender.sendMessage(this.idClient1, "updatedBoard", gameState);
  }

  updateGameStatePlayer2(gameState) {
    SocketSender.sendMessage(this.idClient2, "updatedBoard", gameState);
  }

  playerWon(playerNumber) {
    this.isGameFinished = true;
    SocketSender.sendMessage(this.idClient1, "winner", playerNumber);
    SocketSender.sendMessage(this.idClient2, "winner", playerNumber);
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
