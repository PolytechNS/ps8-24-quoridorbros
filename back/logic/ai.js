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
    const player = this.gameState.player;
    let possibleMoves = BoardUtils.getReachableCells(
      player.x,
      player.y,
      this.gameState.board
    );

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
  }
}

exports.Ai = Ai;
