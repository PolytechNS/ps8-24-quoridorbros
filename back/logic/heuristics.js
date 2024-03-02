const { findShortestPathMove } = require("../../front/js/pathfinding.js");
const { BoardUtils } = require("../../front/js/utils.js");

function deltaDistanceHeuristic(gameState) {
  const possibleMovesPlayer = BoardUtils.getReachableCells(
    gameState.player,
    gameState.otherPlayer,
    gameState.board
  );
  const bestMovePlayer = findShortestPathMove(
    possibleMovesPlayer,
    gameState.board,
    gameState.player.playerNumber
  );

  const possibleMovesOtherPlayer = BoardUtils.getReachableCells(
    gameState.otherPlayer,
    gameState.player,
    gameState.board
  );
  const bestMoveOtherPlayer = findShortestPathMove(
    possibleMovesOtherPlayer,
    gameState.board,
    gameState.otherPlayer.playerNumber
  );

  return bestMoveOtherPlayer[1] - bestMovePlayer[1];
}

function deltaWallsHeuristic(gameState) {
  return gameState.player.nbWalls - gameState.otherPlayer.nbWalls;
}

exports.deltaDistanceHeuristic = deltaDistanceHeuristic;
exports.deltaWallsHeuristic = deltaWallsHeuristic;
