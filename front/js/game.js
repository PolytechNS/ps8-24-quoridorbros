const { BoardUtils } = require("./utils.js");

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
        if (BoardUtils.isCell(x, y)) {
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
    let nextWall = BoardUtils.getNextWall(x, y);
    this.board[nextWall.y][nextWall.x] = -1 * playerNumber;

    const valueToAdd = playerNumber === 1 ? 1 : -1;
    let wallJunction = BoardUtils.getWallJunction(x, y);
    this.addVisibilityArroundJunction(
      wallJunction.x,
      wallJunction.y,
      valueToAdd
    );
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
  constructor(size, gameManager) {
    this.gameManager = gameManager;
    this.gameBoard = new GameBoard(size);
    this.players = [
      { x: 8, y: size * 2 - 2, playerNumber: 1, nbWalls: 10 },
      { x: 8, y: 0, playerNumber: 2, nbWalls: 10 },
    ];
    this.currentPlayer = this.players[0];
    this.placePlayers();
    let gameStatePlayer1 = {
      size: size,
      board: this.generateClientBoardTab(this.players[0]),
      playerNumber: 1,
    };
    let gameStatePlayer2 = {
      size: size,
      board: this.generateClientBoardTab(this.players[1]),
      playerNumber: 2,
    };
    this.gameManager.initBoardPlayer1(gameStatePlayer1);
    this.gameManager.initBoardPlayer2(gameStatePlayer2);
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
      BoardUtils.isThereWallBetweenAdjacentsCells(
        player.x,
        player.y,
        x,
        y,
        this.gameBoard.board
      )
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
    if (this.isGameFinished()) {
      this.gameManager.playerWon(this.currentPlayer.playerNumber);
      console.log(`\nLE JOUEUR ${this.currentPlayer.playerNumber} A GAGNE`);
    } else {
      this.currentPlayer = this.getOtherPlayer(this.currentPlayer);
      console.log(`\nTOUR DU JOUEUR ${this.currentPlayer.playerNumber}`);
    }

    let gameStatePlayer1 = {
      player: this.players[0],
      otherPlayerNbWalls: this.players[1].nbWalls,
      board: this.generateClientBoardTab(this.players[0]),
    };
    let gameStatePlayer2 = {
      player: this.players[1],
      otherPlayerNbWalls: this.players[0].nbWalls,
      board: this.generateClientBoardTab(this.players[1]),
    };

    this.gameManager.updateGameStatePlayer1(gameStatePlayer1);
    this.gameManager.updateGameStatePlayer2(gameStatePlayer2);
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
    if (x == this.gameBoard.size * 2 - 2 || y == this.gameBoard.size * 2 - 2) {
      return false;
    }

    // Vérifie que le mur n'est pas déjà posé
    if (BoardUtils.isWallAlreadyPlaced(x, y, this.gameBoard.board)) {
      return false;
    }
    //Vérifie que le joueur a assez de murs
    if (this.currentPlayer.nbWalls <= 0) {
      return false;
    }

    return true;
  }

  generateClientBoardTab(player) {
    let resultTab = [];

    for (let y = 0; y < this.gameBoard.size * 2 - 1; y++) {
      resultTab[y] = [];
      for (let x = 0; x < this.gameBoard.size * 2 - 1; x++) {
        if (BoardUtils.isWall(x, y)) {
          resultTab[y][x] = this.gameBoard.board[y][x];
        } else if (this.gameBoard.isVisible(x, y, player)) {
          resultTab[y][x] = BoardUtils.EMPTY;
        } else {
          resultTab[y][x] = BoardUtils.FOG;
        }
      }
    }

    //Afficher le joueur adverse si il est visible ou si il est adjacent à nous
    let otherPlayer = this.getOtherPlayer(player);
    if (
      resultTab[otherPlayer.y][otherPlayer.x] != BoardUtils.FOG ||
      BoardUtils.isAdjacentCells(
        player.x,
        player.y,
        otherPlayer.x,
        otherPlayer.y
      )
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
    if (
      BoardUtils.isAdjacentCells(
        player.x,
        player.y,
        otherPlayer.x,
        otherPlayer.y
      )
    ) {
      if (
        BoardUtils.isThereWallBetweenAdjacentsCells(
          player.x,
          player.y,
          otherPlayer.x,
          otherPlayer.y,
          this.gameBoard.board
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
        return !BoardUtils.isDemiWallAlreadyPlaced(
          potentialWallDevantX,
          potentialWallDevantY,
          this.gameBoard.board
        );
      } else if (x === cellDroiteX && y === cellDroiteY) {
        return (
          BoardUtils.isDemiWallAlreadyPlaced(
            potentialWallDevantX,
            potentialWallDevantY,
            this.gameBoard.board
          ) &&
          !BoardUtils.isDemiWallAlreadyPlaced(
            potentialWallDroiteX,
            potentialWallDroiteY,
            this.gameBoard.board
          )
        );
      } else if (x === cellGaucheX && y === cellGaucheY) {
        return (
          BoardUtils.isDemiWallAlreadyPlaced(
            potentialWallDevantX,
            potentialWallDevantY,
            this.gameBoard.board
          ) &&
          !BoardUtils.isDemiWallAlreadyPlaced(
            potentialWallGaucheX,
            potentialWallGaucheY,
            this.gameBoard.board
          )
        );
      }
    }
  }
}

if (typeof exports === "object" && exports) {
  exports.Game = Game;
}