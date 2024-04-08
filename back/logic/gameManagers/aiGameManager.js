const { BoardUtils } = require("../../../front/utils/utils.js");
const { Game } = require("../../../front/utils/game.js");
const {
  saveGameState,
  loadGameState,
} = require("../../mongoDB/mongoManager.js");
const {
  fromVellaToOurGameState,
  fromOurToVellaGameState,
  fromOurToVellaMove,
  fromVellaToOurMove,
} = require("../ai/aiAdapter.js");

const {
  deltaDistanceHeuristic,
  deltaWallsHeuristic,
} = require("../ai/heuristics.js");

const {
  setup,
  nextMove,
  correction,
  updateBoard,
} = require("../ai/quoridorbros.js");
const { SocketSender } = require("../../socket/socketSender.js");
const {GameManagerMapper} = require("./gameManagerMapper");

class AiGameManager {
  constructor(userId, loadGame = false) {
    this.userId = userId;
    this.isGameFinished = false;
    const initializeGame = async () => {
      if (loadGame) {
        let gameState = await loadGameState(userId);
        this.game = new Game(this, gameState);
      } else {
        this.game = new Game(this);
      }
    };
    this.isFirstTurn = true;

    // Call the async function
    initializeGame();
  }

  initBoardPlayer1(gameState) {
    SocketSender.sendMessage(this.userId, "initBoard", gameState);
  }
  initBoardPlayer2(gameState) {}

  updateGameStatePlayer1(gameState) {
    if (gameState.turnOf === 1) {
      this.transformGameState(gameState, 1);
    }
    SocketSender.sendMessage(this.userId, "updatedBoard", gameState);
  }
  updateGameStatePlayer2(gameState) {
    if (gameState.turnOf === 2) {
      this.movePlayer2(gameState);
    }
  }
  playerWon(playerNumber) {
    this.isGameFinished = true;
    GameManagerMapper.removeAiGameManagerByUserId(this.userId);
    this.game = null;

    const winningMessageClient = {
      type: "ai",
      result:(playerNumber === 1) ? true : false,
    }

    SocketSender.sendMessage(this.userId, "winner", winningMessageClient);
  }

  movePlayer1(move) {
    if (this.isGameFinished) return;
    if (BoardUtils.isWall(move.x, move.y)) {
      this.game.onWallClick(move.x, move.y);
    } else {
      this.game.onCellClick(move.x, move.y);
    }
  }
  async movePlayer2(gameState) {
    if (this.isGameFinished) return;

    const vellaGameState = fromOurToVellaGameState(gameState, 2);

    if (this.isFirstTurn) {
      this.isFirstTurn = false;
      const startTime = Date.now();
      const vellaMove = await setup(2);
      const endTime = Date.now();
      console.log("time ");
      console.log(endTime - startTime);
      const ourMove = fromVellaToOurMove(vellaMove);
      this.game.onCellClick(ourMove.x, ourMove.y);
    } else {
      const startTime = Date.now();
      const vellaMove = await nextMove(vellaGameState);
      const endTime = Date.now();
      console.log("time ");
      console.log(endTime - startTime);
      const ourMove = fromVellaToOurMove(vellaMove);

      if (BoardUtils.isWall(ourMove.x, ourMove.y)) {
        this.game.onWallClick(ourMove.x, ourMove.y);
      } else {
        this.game.onCellClick(ourMove.x, ourMove.y);
      }
    }
  }

  logHeuristicValues(gameState) {
    if (gameState.otherPlayer.x !== null) {
      console.log("delta distance :");
      console.log(deltaDistanceHeuristic(gameState));
      console.log("delta walls :");
      console.log(deltaWallsHeuristic(gameState));
    }
  }

  transformGameState(gameState, playerNumber) {
    /*console.log("gamestate :");
    console.log(gameState, "\n");*/
    let vellaGameState = fromOurToVellaGameState(gameState, playerNumber);
    /*console.log("vellaGameState: ");
    console.log(vellaGameState, "\n");*/

    let ourGameState = fromVellaToOurGameState(vellaGameState, playerNumber);
    /*console.log("ourGameState: ");
    console.log(ourGameState, "\n");*/
    console.log("differences:");
    console.log(findDifferences(gameState, ourGameState), "\n");

    return ourGameState;
  }

  transformMoves(move) {
    /*console.log("move :");
    console.log(move, "\n");*/
    let vellaMove = fromOurToVellaMove(move.x, move.y);
    /*console.log("vellaMove: ");
    console.log(vellaMove, "\n");*/

    let ourMove = fromVellaToOurMove(vellaMove);
    /*console.log("ourMove: ");
    console.log(ourMove, "\n");
    console.log("differences:");
    console.log(findDifferences([move.x, move.y], ourMove), "\n");*/

    return ourMove;
  }

  async saveGame(userId) {
    const gameState = this.game.generateGameState();
    saveGameState(userId, gameState);
  }
}

function findDifferences(obj1, obj2) {
  const differences = [];

  function compareObjects(obj1, obj2, path = []) {
    for (const key in obj1) {
      const value1 = obj1[key];
      const value2 = obj2[key];

      if (typeof value1 === "object" && typeof value2 === "object") {
        compareObjects(value1, value2, [...path, key]);
      } else if (value1 !== value2) {
          differences.push({
            path: [...path, key],
            obj1Value: value1,
            obj2Value: value2,
          });
        }
    }
  }

  compareObjects(obj1, obj2);
  return differences;
}

exports.AiGameManager = AiGameManager;
