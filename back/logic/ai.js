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
    console.log(MapReverse(this.gameState));
  }

  arrayContainsArray(superset, subset) {
    for (var i = 0; i < superset.length; i++) {
      if (superset[i][0] === subset[0] && superset[i][1] === subset[1]) {
        return true;
      }
    }
    return false;
  }
  enqueueIfValid(queue, gameBoard, position, distance) {
    const [y, x] = position;
    if (
        y >= 0 &&
        y < gameBoard.length &&
        x >= 0 &&
        x < gameBoard[0].length &&
        gameBoard[y][x] === null
    ) {
      queue.push([y, x, distance]);
    }
  }
  computeDistanceOfShortestPath(gameBoard, player) {
    const queue = [];
    const visited = [];
    const position = [player.y, player.x, 0];
    queue.push(position);

    while (queue.length > 0) {
      const current = queue.shift();
      const x = current[1];
      const y = current[0];
      const distance = current[2];
      if (
          (y === 0 && player.playerNumber === 1) ||
          (y === gameBoard.length - 1 && player.playerNumber === 2)
      ) {
        return distance;
      }
      if (
          this.arrayContainsArray(visited, [y, x]) ||
          queue.some(([queueY, queueX]) => queueY === y && queueX === x)
      ) {
        continue;
      }
      visited.push([y, x]);
      this.enqueueIfValid(queue, gameBoard, [y + 2, x], distance + 1);
      this.enqueueIfValid(queue, gameBoard, [y - 2, x], distance + 1);
      this.enqueueIfValid(queue, gameBoard, [y, x + 2], distance + 1);
      this.enqueueIfValid(queue, gameBoard, [y, x - 2], distance + 1);
    }

    return 90;
  }
  findShortestPathMove(possibleMoves) {
    let bestMove = possibleMoves[0];
    let shortestPath = Infinity;

    for (const move of possibleMoves) {
      const simulatedPlayer = { x: move.x, y: move.y, playerNumber: this.gameState.player.playerNumber };
      let distance = this.computeDistanceOfShortestPath(this.gameState.board, simulatedPlayer);
      if (distance < shortestPath) {
        shortestPath = distance;
        bestMove = move;
      }
    }

    return bestMove;
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

    let bestMove = this.findShortestPathMove(possibleMoves);
    return bestMove;
  }
}

exports.Ai = Ai;
