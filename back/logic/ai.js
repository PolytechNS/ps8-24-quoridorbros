const { BoardUtils } = require("../../front/js/utils");

// This function doesn't handle walls.
class Ai {
  constructor() {
    this.isItMyTurn = false;
    this.gameState = null;
  }

  updateGameState(gameState) {
    this.gameState = gameState;
  }

  computeMove() {
    let possibleMoves = BoardUtils.getReachableCells(
      this.gameState.player,
      this.gameState.otherPlayer,
      this.gameState.board
    );

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
  }
}

exports.Ai = Ai;
