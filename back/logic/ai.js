const { BoardUtils } = require("../../front/js/utils");
const { Map, parseWallPosition, MapReverse, initializeIaBoard, getWallInfo } = require('./aiAdapter.js');


// This function doesn't handle walls.
class Ai {
  constructor() {
    this.isItMyTurn = false;
    this.gameState = null;
  }

  updateGameState(gameState) {
    this.gameState = gameState;
    let iaGameState = MapReverse(this.gameState);
    let newgameState = Map(iaGameState);
    console.log("Map: " +iaGameState);
    console.log(iaGameState);
    console.log("MapReverse: ");
    console.log(newgameState);
    console.log("this.gamesate: " +this.gameState);
    console.log(this.gameState);
  }

  computeMove() {
    if (this.gameState.player.x === null) {
      let randomX = Math.floor(Math.random() * (BoardUtils.BOARD_SIZE - 1)) * 2;
      return { x: randomX, y: 0 };
    }
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
