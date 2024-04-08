const { BoardUtils } = require("../../../front/utils/utils.js");
const { Game } = require("../../../front/utils/game.js");
const { SocketMapper } = require("../../socket/socketMapper.js");
const { SocketSender } = require("../../socket/socketSender.js");

const { saveElo } = require("../../mongoDB/mongoManager");


class OneVOneOnlineGameManager {
  constructor(idClient1, idClient2, eloClient1, eloClient2) {
    this.idClient1 = idClient1;
    this.idClient2 = idClient2;
    this.eloClient1 = eloClient1;
    this.eloClient2 = eloClient2;




    this.isGameFinished = false;
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

  sendMessagePlayer1(message){
    const messageObject = {sender: "player2", content: message};
    SocketSender.sendMessage(this.idClient1, "newMessage", messageObject);
  }

  sendMessagePlayer2(message){
    const messageObject = {sender: "player1", content: message};
    SocketSender.sendMessage(this.idClient2, "newMessage", messageObject);
  }

  playerWon(playerNumber) {
    const deltaClient1 = this.calculateRatingChange(
        this.eloClient1,
        this.eloClient2,
        (playerNumber === 1) ? 1 : 0,
        32);

    const deltaClient2 = this.calculateRatingChange(
        this.eloClient2,
        this.eloClient1,
        (playerNumber === 2) ? 1 : 0,
        32);

    saveElo(this.idClient1, this.eloClient1 + deltaClient1);
    saveElo(this.idClient2, this.eloClient2 + deltaClient2);

    const winningMessageClient1 = {
      result:(playerNumber === 1) ? true : false,
      elo: this.eloClient1 + deltaClient1,
      deltaElo: deltaClient1
    }

    const winningMessageClient2 = {
      result:(playerNumber === 2) ? true : false,
      elo: this.eloClient2 + deltaClient2,
      deltaElo: deltaClient2
    }

    this.isGameFinished = true;
    SocketSender.sendMessage(this.idClient1, "winner", winningMessageClient1);
    SocketSender.sendMessage(this.idClient2, "winner", winningMessageClient2);
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

  concede(playerNumber) {
    const otherPlayer = (playerNumber == 1)? 2 : 1;
    this.playerWon(otherPlayer);
    this.game = null;
  }
  


  calculateWinProbability(playerRating, opponentRating) {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  calculateRatingChange(playerRating, opponentRating, gameResult, kFactor) {
    const expectedScore = this.calculateWinProbability(playerRating, opponentRating);
    return parseInt(kFactor * (gameResult - expectedScore));
  }
}

exports.OneVOneOnlineGameManager = OneVOneOnlineGameManager;
