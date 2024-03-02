const { findShortestPathMove } = require("../../front/js/pathfinding.js");
const {
  fromVellaToOurGameState,
  fromOurToVellaGameState,
  fromOurToVellaMove,
  fromVellaToOurMove,
  cloneAndApplyMove,
} = require("./aiAdapter.js");

const {
  deltaDistanceHeuristic,
  deltaWallsHeuristic,
} = require("./heuristics.js");

const { BoardUtils } = require("../../front/js/utils.js");

let numPlayer;
let goal_line;
let gameState = null;

function getInitialMove() {
  let position;
  if (numPlayer === 1) {
    position = "4,8";
  } else {
    position = "4,0";
  }
  return { action: "move", value: position };
}

let date = null;

async function setup(AIplay) {
  numPlayer = AIplay;
  // AIplay est playerNumber
  return new Promise((resolve, reject) => {
    // Promise is resolved into a position string, indicating its placement, in less than 1000ms.
    // Un move pour placer son joueur.
    resolve(getInitialMove());
  });
}

async function nextMove(vellaGameState) {
  return new Promise((resolve) => {
    const gameState = fromVellaToOurGameState(vellaGameState, numPlayer);
    if (gameState.otherPlayer.x !== null && gameState.player.nbWalls > 0) {
      const deltaDistance = deltaDistanceHeuristic(gameState);
      if (deltaDistance <= 0) {
        const wallMoves = BoardUtils.getWallMoves(gameState);

        let bestMove = null;
        let maxHeuristicValue = -Infinity;

        // Iterate through all wall moves
        for (const wallMove of wallMoves) {
          // Create a copy of the gameState with the current wall move applied
          const newGameState = cloneAndApplyMove(
            gameState,
            wallMove[0],
            wallMove[1]
          );

          // Calculate the delta distance heuristic for the new gameState
          const heuristicValue = deltaDistanceHeuristic(newGameState);

          // Update the best move if the current move has a higher heuristic value
          if (heuristicValue > maxHeuristicValue) {
            bestMove = wallMove;
            maxHeuristicValue = heuristicValue;
            console.log("newbestMove");
            console.log(bestMove);
            console.log("newheuristicValue");
            console.log(maxHeuristicValue);
          }
        }

        console.log("finalbestMove");
        console.log(bestMove);

        if (bestMove !== null && bestMove !== undefined) {
          const vellaMove = fromOurToVellaMove(bestMove[0], bestMove[1]);
          resolve(vellaMove);
          return;
        }
      }
    }
    const ourMove = calculateBestMove(gameState);
    const vellaMove = fromOurToVellaMove(ourMove.x, ourMove.y);
    resolve(vellaMove);
  });
}

function calculateBestMove(gameState) {
  const possibleMoves = BoardUtils.getReachableCells(
    gameState.player,
    gameState.otherPlayer,
    gameState.board
  );
  const bestMove = findShortestPathMove(
    possibleMoves,
    gameState.board,
    numPlayer
  );

  return bestMove[0];
}

function getWallMove(gameState) {}

async function correction(rightMove) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

async function updateBoard(gameState) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

function opponentPosition(board) {
  for (let i = 0; i < board.length; i++) {
    const innerList = board[i];
    for (let j = 0; j < innerList.length; j++) {
      if (board[i][j] === 2) {
        return [i, j];
      }
    }
  }
  return null;
}

function isComputeTimeExpired() {
  return new Date() - date >= 200;
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;
