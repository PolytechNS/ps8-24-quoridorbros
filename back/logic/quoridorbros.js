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
let numOtherPlayer;
let wallOtherPlayer;
let tour = 0;
let colonneDetruite = false;
let goal_line;
let gameState = null;

function getInitialMove() {
  let position;
  if (numPlayer === 1) {
    position = "51";
  } else {
    position = "59";
  }
  return { action: "move", value: position };
}

let date = null;

async function setup(AIplay) {
  numPlayer = AIplay;
  numOtherPlayer = AIplay === 1 ? 2 : 1;
  wallOtherPlayer = -1 * numOtherPlayer;
  tour = 0;
  colonneDetruite = false;

  // AIplay est playerNumber
  return new Promise((resolve, reject) => {
    // Promise is resolved into a position string, indicating its placement, in less than 1000ms.
    // Un move pour placer son joueur.
    resolve(getInitialMove());
  });
}

async function nextMove(vellaGameState) {
  const startTime = Date.now();
  tour++;
  return new Promise((resolve) => {
    const gameState = fromVellaToOurGameState(vellaGameState, numPlayer);

    //si l'opponent fais un colonne
    if (!colonneDetruite && tour < 5) {
      for (let y = 0; y <= 6; y++) {
        for (let x = 1; x < 16; x += 2) {
          if (gameState.board[y][x] === wallOtherPlayer) {
            console.log("1 x y: ", x, y);
            if (gameState.board[y + 4][x] === wallOtherPlayer) {
              console.log("2 x y: ", x, y + 4);
              if (gameState.board[y + 8][x] === wallOtherPlayer) {
                console.log("3 x y: ", x, y + 4);
                console.log("4 x y: ", x - 1, y + 3);
              }
            }
          }
          if (
            gameState.board[y][x] === wallOtherPlayer &&
            gameState.board[y + 4][x] === wallOtherPlayer &&
            gameState.board[y + 8][x] === wallOtherPlayer
          ) {
            colonneDetruite = true;
            let vellaMove;
            if (y === 0) {
              vellaMove = fromOurToVellaMove(x - 1, 13);
            } else if (y === 6) {
              vellaMove = fromOurToVellaMove(x - 1, 3);
            } else {
              vellaMove = fromOurToVellaMove(x - 1, y + 3);
            }

            resolve(vellaMove);
            return;
          }
        }
      }
    }

    if (gameState.otherPlayer.x !== null && gameState.player.nbWalls > 0) {
      const deltaDistance = deltaDistanceHeuristic(gameState);
      if (deltaDistance <= 0) {
        const wallMoves = BoardUtils.getWallMoves(gameState);

        let bestMove = null;
        let maxHeuristicValue = -Infinity;

        for (const wallMove of wallMoves) {
          const newGameState = cloneAndApplyMove(
            gameState,
            wallMove[0],
            wallMove[1]
          );

          const heuristicValue = deltaDistanceHeuristic(newGameState);

          if (heuristicValue > maxHeuristicValue) {
            bestMove = wallMove;
            maxHeuristicValue = heuristicValue;
          }
          if (Date.now() - startTime >= 160) {
            const vellaMove = fromOurToVellaMove(bestMove[0], bestMove[1]);
            resolve(vellaMove);
            return;
          }
        }

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
