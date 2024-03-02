const { findShortestPathMove } = require("../../front/js/pathfinding.js");
const {
  fromVellaToOurGameState,
  fromOurToVellaGameState,
  fromOurToVellaMove,
  fromVellaToOurMove,
} = require("./aiAdapter.js");

let numPlayer;
let numOtherPlayer;
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
  numOtherPlayer = AIplay === 1 ? 2 : 1;
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
  for (let i = 0; i <= 16; i += 2) {
    for (let j = 0; j <= 16; j += 2) {}
  }
}

function isComputeTimeExpired() {
  return Date.now() - date >= 180;
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;
