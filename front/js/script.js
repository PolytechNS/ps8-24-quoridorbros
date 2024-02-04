const PLAYER_ONE = 1;
const PLAYER_TWO = 2;
const WALL_PLAYER_ONE = -1;
const WALL_PLAYER_TWO = -2;
const FOG = 0;
const EMPTY = 3;

function isCell(x, y) {
  return x % 2 === 0 && y % 2 === 0;
}

function isWall(x, y) {
  return !isCell(x, y);
}

function isHorizontalWall(x, y) {
  return isWall() && x % 2 != 0;
}

function isVerticalWall(x, y) {
  return isWall() && y % 2 != 0;
}

//Retourne les coordonnées de la jonction liée à un mur
function getWallJunction(x, y) {
  if (isHorizontalWall(x, y)) {
    return { x: x, y: y + 1 };
  } else if (isVerticalWall(x, y)) {
    return { x: x + 1, y: y };
  } else {
    console.log("error: this wall is not horizontal nor vertical");
    return;
  }
}

//Renvoie les coordonnées du wall qui est lié à celui en (x, y)
function getNextWall(x, y) {
  if (this.isHorizontalWall(x, y)) {
    return { x: x, y: y + 2 };
  }
  return { x: x + 2, y: y };
}

function isAdjacentCells(x1, y1, x2, y2) {
  const xDelta = Math.abs(x1 - x2);
  const yDelta = Math.abs(y1 - y2);
  return (xDelta == 2 && yDelta == 0) || (xDelta == 0 && yDelta == 2);
}

function isInBoardLimits(x) {
  return x >= 0 && x <= 17;
}

/*
C'est le board côté frontend, il ne contient que les informations nécessaires pour le joueur
=> pas possible de tricher en regardant le frontend
paramètres :

*/
class ClientBoard {
  constructor(size, onCellClick, onWallClick, board, playerNumber) {
    this.size = size;
    this.onCellClick = onCellClick;
    this.onWallClick = onWallClick;
    this.element = document.getElementById(`gameBoard-${playerNumber}`);
    this.board = board;
    this.divBoard = [];
    this.isItMyTurn = playerNumber == 1;
    this.initBoard();
  }

  initBoard() {
    for (let y = 0; y < this.size * 2 - 1; y++) {
      this.divBoard[y] = [];
      for (let x = 0; x < this.size * 2 - 1; x++) {
        const div = document.createElement("div");
        this.divBoard[y][x] = div;

        if (isCell(x, y)) {
          div.classList.add("cell");
          switch (this.board[y][x]) {
            case PLAYER_TWO:
              div.setAttribute("id", "joueur-2");
              break;
            case PLAYER_ONE:
              div.setAttribute("id", "joueur-1");
              break;
            case FOG:
              div.classList.add("fog");
              break;
            default:
              break;
          }
          div.addEventListener("click", () => this.onCellClick(x, y));
        } else {
          div.classList.add("wall");

          //Si c'est un mur vertical ou horizontal
          if (y % 2 === 0 || x % 2 === 0) {
            div.addEventListener("click", () => this.onWallClick(x, y));
            div.addEventListener("mouseenter", () => this.onWallHover(x, y));
            div.addEventListener("mouseleave", () =>
              this.onWallRemoveHover(x, y)
            );

            if (y % 2 === 0) {
              div.classList.add("vertical");
            } else {
              div.classList.add("horizontal");
            }
          }
        }
        this.element.appendChild(div);
      }
    }
    if (!this.isItMyTurn) {
      this.element.style.pointerEvents = "none";
    }
  }

  updateBoard(updatedBoard) {
    this.isItMyTurn = !this.isItMyTurn;

    //Empêche le joueur de cliquer si ce n'est pas son tour
    if (!this.isItMyTurn) {
      this.element.style.pointerEvents = "none";
    } else {
      this.element.style.pointerEvents = "auto";
    }

    for (let y = 0; y < this.size * 2 - 1; y++) {
      for (let x = 0; x < this.size * 2 - 1; x++) {
        let div = this.divBoard[y][x];

        if (isCell(x, y)) {
          switch (updatedBoard[y][x]) {
            case PLAYER_TWO:
              div.setAttribute("id", "joueur-2");
              break;
            case PLAYER_ONE:
              div.setAttribute("id", "joueur-1");
              break;
            case FOG:
              div.id = "";
              div.classList.add("fog");
              break;
            case EMPTY:
              div.id = "";
              div.classList.remove("fog");
              break;
            default:
              break;
          }
        } else if (
          updatedBoard[y][x] == WALL_PLAYER_ONE ||
          updatedBoard[y][x] == WALL_PLAYER_TWO
        ) {
          div.classList.add("placed");
        }
      }
    }
  }

  onWallHover(x, y) {
    let nextWall = getNextWall(x, y);
    if (!isInBoardLimits(nextWall.x) || !isInBoardLimits(nextWall.y)) {
      return;
    }
    this.divBoard[y][x].classList.add("surbrillance");
    this.divBoard[nextWall.y][nextWall.x].classList.add("surbrillance");
  }

  onWallRemoveHover(x, y) {
    let nextWall = getNextWall(x, y);
    if (!isInBoardLimits(nextWall.x) || !isInBoardLimits(nextWall.y)) {
      return;
    }
    this.divBoard[y][x].classList.remove("surbrillance");
    this.divBoard[nextWall.y][nextWall.x].classList.remove("surbrillance");
  }

  playerWon(playerNumber) {
    this.element.style.pointerEvents = "none";
  }
}

/**
 * Cette classe est plateau de jeu du backend
 * Contient un tableau de 17 * 17
 *  - Les éléments du tableau étant des cases contiennent leur visibilité
 *  - Les éléments du tableau étant des murs contiennent l'état du mur
 *      Mur non posé : null
 *      Posé par joueur 1 : 1
 *      Posé par joueur 2 : 2
 */
class GameBoard {
  constructor(size) {
    this.size = size;
    this.board = [];
    this.initBoard(size);
  }

  initBoard() {
    for (let y = 0; y < this.size * 2 - 1; y++) {
      this.board[y] = []; // initialise le sous tableau
      for (let x = 0; x < this.size * 2 - 1; x++) {
        if (isCell(x, y)) {
          const initialValue = this.getInitialVisibilityValue(y);
          this.board[y][x] = initialValue;
        } else {
          this.board[y][x] = null;
        }
      }
    }
  }

  //Retoure la visibilité de cette cellule au début de la partie
  getInitialVisibilityValue(y) {
    let initialValue = 0;
    if (y < this.size - 1) {
      initialValue = -1;
    } else if (y > this.size - 1) {
      initialValue = 1;
    }
    return initialValue;
  }

  unplacePlayer(player) {
    this.removeVisibilityValueArroundPlayer(player);
  }

  placePlayer(player) {
    this.addVisibilityValueArroundPlayer(player);
  }

  addVisibilityValueArroundPlayer(player) {
    const valueToAdd = player.playerNumber === 1 ? 1 : -1;
    this.addVisibilityValueArround(player.x, player.y, valueToAdd);
  }

  removeVisibilityValueArroundPlayer(player) {
    const valueToAdd = player.playerNumber === 1 ? -1 : 1;
    this.addVisibilityValueArround(player.x, player.y, valueToAdd);
  }

  addVisibilityValueArround(x, y, valueToAdd) {
    this.board[y][x] += valueToAdd;
    if (y <= 14) {
      this.board[y + 2][x] += valueToAdd;
    }
    if (y >= 2) {
      this.board[y - 2][x] += valueToAdd;
    }
    if (x <= 14) {
      this.board[y][x + 2] += valueToAdd;
    }
    if (x >= 2) {
      this.board[y][x - 2] += valueToAdd;
    }
  }

  //Retourne si la case est visible pour le joueur
  isVisible(x, y, player) {
    if (player.playerNumber === 1) {
      return this.board[y][x] >= 0;
    } else {
      return this.board[y][x] <= 0;
    }
  }

  placeWall(x, y, playerNumber) {
    this.board[y][x] = -1 * playerNumber;
    let nextWall = getNextWall(x, y);
    this.board[nextWall.y][nextWall.x] = -1 * playerNumber;

    const valueToAdd = playerNumber === 1 ? 1 : -1;
    let wallJunction = getWallJunction(x, y);
    this.addVisibilityArroundJunction(
      wallJunction.x,
      wallJunction.y,
      valueToAdd
    );
  }

  isWallAlreadyPlaced(x, y) {
    let nextWall = getNextWall(x, y);
    return (
      this.isDemiWallAlreadyPlaced(x, y) ||
      this.isDemiWallAlreadyPlaced(nextWall.x, nextWall.y)
    );
  }

  isDemiWallAlreadyPlaced(x, y) {
    return (
      this.board[y][x] == WALL_PLAYER_ONE || this.board[y][x] == WALL_PLAYER_TWO
    );
  }

  isThereWallBetweenAdjacentsCells(x1, y1, x2, y2) {
    const positionMurX = (x1 + x2) / 2;
    const positionMurY = (y1 + y2) / 2;
    return this.isDemiWallAlreadyPlaced(positionMurX, positionMurY);
  }

  //Gère la modification de visibilité liée à la pose d'un mur
  addVisibilityArroundJunction(x, y, valueToAdd) {
    //cell haut gauche
    if (y >= 1 && x >= 1) {
      this.addVisibilityValueArround(x - 1, y - 1, valueToAdd);
      this.board[y - 1][x - 1] -= valueToAdd;
    }

    //cell bas droite
    if (y <= 15 && x <= 15) {
      this.addVisibilityValueArround(x + 1, y + 1, valueToAdd);
      this.board[y + 1][x + 1] -= valueToAdd;
    }

    //cell haut droite
    if (y <= 15 && x >= 1) {
      this.addVisibilityValueArround(x - 1, y + 1, valueToAdd);
      this.board[y + 1][x - 1] -= valueToAdd;
    }

    //cell bas gauche
    if (y >= 1 && x <= 15) {
      this.addVisibilityValueArround(x + 1, y - 1, valueToAdd);
      this.board[y - 1][x + 1] -= valueToAdd;
    }
  }
}

/**
 * C'est la classe qui gère le jeu.
 */
class Game {
  constructor(size) {
    this.gameBoard = new GameBoard(size);
    this.players = [
      { x: 8, y: size * 2 - 2, playerNumber: 1, nbWalls: 10 },
      { x: 8, y: 0, playerNumber: 2, nbWalls: 10 },
    ];
    this.currentPlayer = this.players[0];
    this.placePlayers();
    this.clientBoard1 = this.generateClientBoard(this.players[0]);
    this.clientBoard2 = this.generateClientBoard(this.players[1]);
  }

  placePlayers() {
    this.players.forEach((player) => {
      this.gameBoard.placePlayer(player);
    });
  }

  onCellClick(x, y) {
    if (!this.isValidMove(this.currentPlayer, x, y)) {
      console.log("Mouvement invalide");
      return;
    }
    this.movePlayer(x, y);
    this.nextTurn();
  }

  isValidMove(player, x, y) {
    let otherPlayer = this.getOtherPlayer(this.currentPlayer);

    //Si le mouvement est un saut valide
    if (this.isValidJumpMove(player, otherPlayer, x, y)) {
      return true;
    }

    // Vérifie que le mouvement est d'une seule case
    if (Math.abs(player.x - x) != 2 && Math.abs(player.y - y) != 2) {
      return false;
    }

    // Vérifie que le mouvement est vertical ou horizontal
    if (player.x !== x && player.y !== y) {
      return false;
    }

    // Vérifie que l'autre joueur n'est pas déjà sur cette case
    if (otherPlayer.x == x && otherPlayer.y == y) {
      return false;
    }

    // Vérifie qu'il ny a pas un mur entre les cases
    if (
      this.gameBoard.isThereWallBetweenAdjacentsCells(player.x, player.y, x, y)
    ) {
      return false;
    }

    return true;
  }

  movePlayer(x, y) {
    this.gameBoard.unplacePlayer(this.currentPlayer); //enlever de la position précédente
    this.currentPlayer.x = x;
    this.currentPlayer.y = y;
    this.gameBoard.placePlayer(this.currentPlayer); //placer à la nouvelle position
    console.log(
      `Joueur ${this.currentPlayer.playerNumber} déplace à ${x}, ${y}`
    );
  }

  nextTurn() {
    this.clientBoard1.updateBoard(this.generateClientBoardTab(this.players[0]));
    this.clientBoard2.updateBoard(this.generateClientBoardTab(this.players[1]));
    if (this.isGameFinished()) {
      this.clientBoard1.playerWon(this.currentPlayer.playerNumber);
      this.clientBoard2.playerWon(this.currentPlayer.playerNumber);
      return;
    }
    this.currentPlayer = this.getOtherPlayer(this.currentPlayer);
    console.log(`Tour du joueur ${this.currentPlayer.playerNumber}`);
  }

  isGameFinished() {
    const goal_line = this.currentPlayer.playerNumber === 1 ? 0 : 16;
    return this.currentPlayer.y === goal_line;
  }

  onWallClick(x, y) {
    if (!this.isValidWallPut(this.currentPlayer, x, y)) {
      console.log("Mouvement invalide");
      return;
    }
    this.gameBoard.placeWall(x, y, this.currentPlayer.playerNumber);
    this.currentPlayer.nbWalls--;
    this.nextTurn();

    console.log("Wall clicked:", x, y);
    // Logique du jeu basée sur le clic sur une cellule
  }

  isValidWallPut(player, x, y) {
    // Vérifie que le joueur n'a pas cliqué sur un des murs des extrémités
    if (x == this.size * 2 - 2 || x == this.size * 2 - 2) {
      return false;
    }

    // Vérifie que le mur n'est pas déjà posé
    if (this.gameBoard.isWallAlreadyPlaced(x, y)) {
      return false;
    }
    //Vérifie que le joueur a assez de murs
    if (this.currentPlayer.nbWalls <= 0) {
      return false;
    }

    return true;
  }

  generateClientBoard(player) {
    return new ClientBoard(
      this.gameBoard.size,
      this.onCellClick.bind(this),
      this.onWallClick.bind(this),
      this.generateClientBoardTab(player),
      player.playerNumber
    );
  }

  generateClientBoardTab(player) {
    let resultTab = [];

    for (let y = 0; y < this.gameBoard.size * 2 - 1; y++) {
      resultTab[y] = [];
      for (let x = 0; x < this.gameBoard.size * 2 - 1; x++) {
        if (isWall(x, y)) {
          resultTab[y][x] = this.gameBoard.board[y][x];
        } else if (this.gameBoard.isVisible(x, y, player)) {
          resultTab[y][x] = EMPTY;
        } else {
          resultTab[y][x] = FOG;
        }
      }
    }

    //Afficher le joueur adverse si il est visible ou si il est adjacent à nous
    let otherPlayer = this.getOtherPlayer(player);
    if (
      resultTab[otherPlayer.y][otherPlayer.x] != FOG ||
      isAdjacentCells(player.x, player.y, otherPlayer.x, otherPlayer.y)
    ) {
      resultTab[otherPlayer.y][otherPlayer.x] = otherPlayer.playerNumber;
    }

    //Afficher notre joueur
    resultTab[player.y][player.x] = player.playerNumber;
    return resultTab;
  }

  getOtherPlayer(player) {
    return player === this.players[0] ? this.players[1] : this.players[0];
  }

  isValidJumpMove(player, otherPlayer, x, y) {
    //Si les deux joueurs sont adjacents
    if (isAdjacentCells(player.x, player.y, otherPlayer.x, otherPlayer.y)) {
      if (
        this.gameBoard.isThereWallBetweenAdjacentsCells(
          player.x,
          player.y,
          otherPlayer.x,
          otherPlayer.y
        )
      ) {
        return false;
      }

      const xDelta = otherPlayer.x - player.x;
      const yDelta = otherPlayer.y - player.y;

      const potentialWallDevantX = player.x + (3 * xDelta) / 2;
      const potentialWallDevantY = player.y + (3 * yDelta) / 2;

      const cellDevantX = player.x + 2 * xDelta;
      const cellDevantY = player.y + 2 * yDelta;

      let potentialWallDroiteX = otherPlayer.x;
      let potentialWallDroiteY = otherPlayer.y;

      let cellDroiteX = otherPlayer.x;
      let cellDroiteY = otherPlayer.y;

      let potentialWallGaucheX = otherPlayer.x;
      let potentialWallGaucheY = otherPlayer.y;

      let cellGaucheX = otherPlayer.x;
      let cellGaucheY = otherPlayer.y;

      if (yDelta == 0) {
        cellDroiteY += 2;
        cellGaucheY -= 2;
        potentialWallDroiteY += 1;
        potentialWallGaucheY -= 1;
      } else if (xDelta == 0) {
        cellDroiteX += 2;
        cellGaucheX -= 2;
        potentialWallDroiteX += 1;
        potentialWallGaucheX -= 1;
      }

      if (x === cellDevantX && y === cellDevantY) {
        return !this.gameBoard.isDemiWallAlreadyPlaced(
          potentialWallDevantX,
          potentialWallDevantY
        );
      } else if (x === cellDroiteX && y === cellDroiteY) {
        return (
          this.gameBoard.isDemiWallAlreadyPlaced(
            potentialWallDevantX,
            potentialWallDevantY
          ) &&
          !this.gameBoard.isDemiWallAlreadyPlaced(
            potentialWallDroiteX,
            potentialWallDroiteY
          )
        );
      } else if (x === cellGaucheX && y === cellGaucheY) {
        return (
          this.gameBoard.isDemiWallAlreadyPlaced(
            potentialWallDevantX,
            potentialWallDevantY
          ) &&
          !this.gameBoard.isDemiWallAlreadyPlaced(
            potentialWallGaucheX,
            potentialWallGaucheY
          )
        );
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const game = new Game(9);
});
