const { BoardUtils } = require("../../front/js/utils.js");
const { Game } = require("../../front/js/game.js");
const { Ai } = require("./ai.js");
const { saveGameState, loadGameState } = require("../mongoDB/mongoManager.js");
const {
  fromVellaToOurGameState,
  fromOurToVellaGameState,
} = require("./aiAdapter.js");

class GameManager {
  constructor(socketManager, userToken) {
    this.socketManager = socketManager;
    this.ai = new Ai();
    this.isGameFinished = false;
    const initializeGame = async () => {
      if (userToken) {
        let gameState = await loadGameState(userToken);
        this.game = new Game(this, gameState);
      } else {
        this.game = new Game(this);
      }
    };

    // Call the async function
    initializeGame();
  }

  initBoardPlayer1(gameState) {
    this.socketManager.initClientBoard(gameState);
  }
  initBoardPlayer2(gameState) {}

  updateGameStatePlayer1(gameState) {
    if (gameState.turnOf === 1) {
      let ourGameState = this.transformGameState(gameState, 1);
    }

    this.socketManager.updateClientBoard(gameState);
  }
  updateGameStatePlayer2(gameState) {
    this.ai.updateGameState(gameState);
    if (gameState.turnOf === 2) {
      let ourGameState = this.transformGameState(gameState, 2);
      this.movePlayer2();
    }
  }
  playerWon(playerNumber) {
    this.isGameFinished = true;
    this.socketManager.playerWon(playerNumber);
  }

  movePlayer1(move) {
    if (this.isGameFinished) return;
    if (BoardUtils.isWall(move.x, move.y)) {
      this.game.onWallClick(move.x, move.y);
    } else {
      this.game.onCellClick(move.x, move.y);
    }
  }
  movePlayer2() {
    if (this.isGameFinished) return;
    const move = this.ai.computeMove();
    if (BoardUtils.isWall(move.x, move.y)) {
      console.log("x: ", move.x, "y: ", move.y);
      this.game.onWallClick(move.x, move.y);
    } else {
      this.game.onCellClick(move.x, move.y);
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

  async saveGame(userToken) {
    const gameState = this.game.generateGameState();
    saveGameState(userToken, gameState);
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
      } else {
        if (value1 !== value2) {
          differences.push({
            path: [...path, key],
            obj1Value: value1,
            obj2Value: value2,
          });
        }
      }
    }
  }

  compareObjects(obj1, obj2);
  return differences;
}

exports.GameManager = GameManager;
