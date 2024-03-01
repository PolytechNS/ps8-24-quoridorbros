const { BoardUtils } = require("../../front/js/utils");
const { GameBoard } = require("../../front/js/game");
/*

Transforme le gameState de Vella en gameState du moteur de jeu

*/
function fromVellaToOurGameState(iaGameState, playerNumber) {
  let otherPlayerNumber = BoardUtils.getOtherPlayerNumber(playerNumber);
  let ourGameState = {
    turnOf: playerNumber,
    player: {
      //player1
      x: null,
      y: null,
      playerNumber: playerNumber,
      nbWalls: 10 - iaGameState.ownWalls.length,
    },
    otherPlayer: {
      //player2
      x: null,
      y: null,
      playerNumber: otherPlayerNumber,
      nbWalls: 10 - iaGameState.opponentWalls.length,
    },
    board: null,
  };

  let gameBoard = new GameBoard();

  iaGameState.ownWalls.forEach((wall) => {
    let position = fromVellaToOurWall(wall);
    gameBoard.placeWall(position[0], position[1], playerNumber);
  });

  iaGameState.opponentWalls.forEach((wall) => {
    let position = fromVellaToOurWall(wall);
    gameBoard.placeWall(position[0], position[1], otherPlayerNumber);
  });

  for (let i = 0; i < iaGameState.board.length; i++) {
    for (let j = 0; j < iaGameState.board[i].length; j++) {
      let cellValue = iaGameState.board[i][j];
      if (cellValue === playerNumber) {
        ourGameState.player.x = j * 2;
        ourGameState.player.y = i * 2;
        gameBoard.board[i * 2][j * 2] = playerNumber;
      } else if (cellValue === otherPlayerNumber) {
        ourGameState.otherPlayer.x = j * 2;
        ourGameState.otherPlayer.y = i * 2;
        gameBoard.board[i * 2][j * 2] = otherPlayerNumber;
      } else if (cellValue === -1) {
        gameBoard.board[i * 2][j * 2] = BoardUtils.FOG;
      } else if (cellValue === 0) {
        gameBoard.board[i * 2][j * 2] = BoardUtils.EMPTY;
      }
    }
  }

  ourGameState.board = gameBoard.board;

  return ourGameState;
}

/*

Transforme le gameState du moteur de jeu en gameState de Vella 

*/
function fromOurToVellaGameState(ourGameState, playerNumber) {
  let otherPlayerNumber = BoardUtils.getOtherPlayerNumber(playerNumber);
  let iaGameState = {
    opponentWalls: [],
    ownWalls: [],
    board: initializeIaBoard(),
  };

  let visited = [];

  for (let y = 0; y < 17; y++) {
    for (let x = 0; x < 17; x++) {
      if (
        (x % 2 === 1 || y % 2 === 1) &&
        !(x % 2 === 1 && y % 2 === 1) &&
        ourGameState.board[y][x] !== null
      ) {
        if (!visited.some((coord) => coord[0] === x && coord[1] === y)) {
          let nextWall = BoardUtils.getNextWall(x, y);
          visited.push([nextWall.x, nextWall.y]);
          let wallInfo = getWallInfo(x, y, ourGameState.board[y][x]);

          if (wallInfo.playerNumber === playerNumber) {
            iaGameState.ownWalls.push(wallInfo.wallPosition);
          } else if (wallInfo.playerNumber === otherPlayerNumber) {
            iaGameState.opponentWalls.push(wallInfo.wallPosition);
          }
        }
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      let cellContent = ourGameState.board[i * 2][j * 2];
      switch (cellContent) {
        case BoardUtils.EMPTY:
          iaGameState.board[i][j] = 0;
          break;
        case BoardUtils.PLAYER_ONE:
          iaGameState.board[i][j] = 1;
          break;
        case BoardUtils.PLAYER_TWO:
          iaGameState.board[i][j] = 2;
          break;
        default:
          iaGameState.board[i][j] = -1;
          break;
      }
    }
  }

  return iaGameState;
}

function initializeIaBoard() {
  let board = [];
  for (let i = 0; i < 9; i++) {
    let row = new Array(9).fill(-1);
    board.push(row);
  }
  return board;
}

/*

Transforme une position de mur moteur de jeu en position de mur Vella 

*/

function getWallInfo(x, y, wallValue) {
  if (wallValue === null) {
    throw new Error("WallValue ne peut pas être nulle");
  }
  let orientation = BoardUtils.isHorizontalWall(x, y) ? 0 : 1;
  let wallPosition = [Math.floor(x / 2), Math.floor(y / 2)];

  let playerNumber =
    wallValue === BoardUtils.WALL_PLAYER_ONE
      ? BoardUtils.PLAYER_ONE
      : BoardUtils.PLAYER_TWO;

  return {
    playerNumber: playerNumber,
    wallPosition: [wallPosition.join(","), orientation],
  };
}

function fromOurToVellaMove(x, y) {
  if (BoardUtils.isCell(x, y)) {
    return { action: "move", value: fromOurToVellaCell(x, y) };
  } else {
    //the upper left position
    const wallInfo = getWallInfo(x, y, -1);

    return {
      action: "wall",
      value: [wallInfo.wallPosition[0], wallInfo.wallPosition[1]],
    };
  }
}

function fromVellaToOurMove(vellaMove) {
  if (vellaMove.action === "move") {
    return fromVellaToOurCell(vellaMove.value);
  } else if (vellaMove.action === "wall") {
    return fromVellaToOurWall(vellaMove.value);
  } else throw new Error("Ce type de move n'existe pas");
}

function fromOurToVellaCell(x, y) {
  return (x / 2).toString() + "," + (y / 2).toString();
}

function fromVellaToOurCell(cell) {
  const parts = cell.split(",");

  const x = parseInt(parts[0], 10) * 2;
  const y = parseInt(parts[1], 10) * 2;

  return [x, y];
}

/*

Transforme une position de mur Vella en position de mur moteur de jeu

*/

function fromVellaToOurWall(wall) {
  let [xStr, yStr] = wall[0].split(",");
  let x = parseInt(xStr) * 2 + 1;
  let y = parseInt(yStr) * 2 + 1;

  //si le mur est horizontal
  if (wall[1] === 0) {
    x--;
  } else {
    y--;
  }
  return [x, y];
}

module.exports = {
  fromVellaToOurGameState,
  fromVellaToOurWall,
  fromOurToVellaGameState,
  initializeIaBoard,
  getWallInfo,
  fromOurToVellaMove,
  fromVellaToOurMove,
};
