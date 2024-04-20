const {
  fromVellaToOurGameState,
  fromOurToVellaGameState,
  fromOurToVellaMove,
  fromVellaToOurMove,
  cloneAndApplyMove,
  findPlayer,
} = require("./aiAdapter.js");

const { BoardUtils } = require("../../../front/utils/utils.js");

let numPlayer;

function getInitialMove() {
  let position;
  if (numPlayer === 1) {
    position = "51";
  } else {
    position = "59";
  }
  return position;
}

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
    const possibleMoves = BoardUtils.getReachableCells(
      gameState.player,
      gameState.otherPlayer,
      gameState.board,
    );
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const ourMove = possibleMoves[randomIndex];
    const vellaMove = fromOurToVellaMove(ourMove.x, ourMove.y);
    resolve(vellaMove);
  });
}

exports.setup = setup;
exports.nextMove = nextMove;
