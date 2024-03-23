const { findShortestPathMove } = require("../../../front/utils/pathfinding.js");

const {
  fromVellaToOurGameState,
  fromOurToVellaGameState,
  fromOurToVellaMove,
  fromVellaToOurMove,
  cloneAndApplyMove,
  findPlayer,
} = require("./aiAdapter.js");

const {
  deltaDistanceHeuristic,
  deltaWallsHeuristic,
} = require("./heuristics.js");

const { BoardUtils } = require("../../../front/utils/utils.js");

let numPlayer;
let numOtherPlayer;
let wallOtherPlayer;
let tour = 0;
let colonneDetruite = false;
let lastKnownPosition = { x: null, y: null };
let movesSinceLastKnownPosition = null;
let otherPlayerPreviousNbWalls = 10;
const defaultMove = { action: "move", value: "58" };

let goal_line;
let gameState = null;

function getInitialMove() {
  let position;
  if (numPlayer === 1) {
    position = "51";
  } else {
    position = "59";
  }
  return position;
}

let date = null;

async function setup(AIplay) {
  numPlayer = AIplay;
  numOtherPlayer = AIplay === 1 ? 2 : 1;
  wallOtherPlayer = -1 * numOtherPlayer;
  tour = 0;
  colonneDetruite = false;
  lastKnownPosition = { x: null, y: null };
  movesSinceLastKnownPosition = null;
  otherPlayerPreviousNbWalls = 10;

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
    if (gameState.otherPlayer.x === null && lastKnownPosition.x !== null) {
      if (gameState.otherPlayer.nbWalls === otherPlayerPreviousNbWalls) {
        movesSinceLastKnownPosition++;
      } else if (movesSinceLastKnownPosition === 0) {
        gameState.otherPlayer.x = lastKnownPosition.x;
        gameState.otherPlayer.y = lastKnownPosition.y;
      }
    }
    otherPlayerPreviousNbWalls = gameState.otherPlayer.nbWalls;

    //si l'opponent fais un colonne
    if (!colonneDetruite && tour < 6) {
      for (let y = 0; y <= 6; y++) {
        for (let x = 1; x < 16; x += 2) {
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

    if (gameState.otherPlayer.x === null) {
      let positionOtherPlayer = findPlayer(
        gameState,
        lastKnownPosition,
        movesSinceLastKnownPosition
      );
      if (positionOtherPlayer !== null) {
        gameState.otherPlayer.x = positionOtherPlayer.x;
        gameState.otherPlayer.y = positionOtherPlayer.y;
        movesSinceLastKnownPosition = 0;
      }
    } else {
      movesSinceLastKnownPosition = 0;
    }

    if (Date.now() - startTime >= 160) {
      resolve(defaultMove);
      return;
    }

    if (gameState.otherPlayer.x !== null && gameState.player.nbWalls > 0) {
      lastKnownPosition.x = gameState.otherPlayer.x;
      lastKnownPosition.y = gameState.otherPlayer.y;

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

    if (Date.now() - startTime >= 160) {
      resolve(defaultMove);
      return;
    }
    const ourMove = calculateBestMove(gameState);
    if (ourMove === null || ourMove === undefined) {
      resolve(defaultMove);
      return;
    }
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
