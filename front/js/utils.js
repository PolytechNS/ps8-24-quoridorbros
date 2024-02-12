class BoardUtils {
  static BOARD_SIZE = 9;
  static PLAYER_ONE = 1;
  static PLAYER_TWO = 2;
  static WALL_PLAYER_ONE = -1;
  static WALL_PLAYER_TWO = -2;
  static FOG = 0;
  static EMPTY = 3;

  static isCell(x, y) {
    return x % 2 === 0 && y % 2 === 0;
  }

  static isWall(x, y) {
    return !this.isCell(x, y);
  }

  static isHorizontalWall(x, y) {
    return this.isWall(x, y) && x % 2 !== 0;
  }

  static isVerticalWall(x, y) {
    return this.isWall(x, y) && y % 2 !== 0;
  }

  static getWallJunction(x, y) {
    if (this.isHorizontalWall(x, y)) {
      return { x: x, y: y + 1 };
    } else if (this.isVerticalWall(x, y)) {
      return { x: x + 1, y: y };
    } else {
      console.log("error: this wall is not horizontal nor vertical");
      return;
    }
  }

  static getNextWall(x, y) {
    if (this.isHorizontalWall(x, y)) {
      return { x: x, y: y + 2 };
    }
    return { x: x + 2, y: y };
  }

  static isAdjacentCells(x1, y1, x2, y2) {
    const xDelta = Math.abs(x1 - x2);
    const yDelta = Math.abs(y1 - y2);
    return (xDelta === 2 && yDelta === 0) || (xDelta === 0 && yDelta === 2);
  }

  static isInBoardLimits(x) {
    return x >= 0 && x < 17;
  }

  static isWallAlreadyPlaced(x, y, board) {
    let nextWall = this.getNextWall(x, y);
    return (
      this.isDemiWallAlreadyPlaced(x, y, board) ||
      this.isDemiWallAlreadyPlaced(nextWall.x, nextWall.y, board)
    );
  }

  static isDemiWallAlreadyPlaced(x, y, board) {
    return (
      board[y][x] == this.WALL_PLAYER_ONE || board[y][x] == this.WALL_PLAYER_TWO
    );
  }

  static isThereWallBetweenAdjacentsCells(x1, y1, x2, y2, board) {
    const positionMurX = (x1 + x2) / 2;
    const positionMurY = (y1 + y2) / 2;
    return this.isDemiWallAlreadyPlaced(positionMurX, positionMurY, board);
  }

  static getReachableCells(player, otherPlayer, board) {
    let possibleMoves = [];
    possibleMoves.push({ x: player.x, y: player.y + 2 }); // bas
    possibleMoves.push({ x: player.x, y: player.y - 2 }); // haut
    possibleMoves.push({ x: player.x - 2, y: player.y }); // gauche
    possibleMoves.push({ x: player.x + 2, y: player.y }); // droite

    possibleMoves = possibleMoves.filter(
      (move) => this.isInBoardLimits(move.x) && this.isInBoardLimits(move.y)
    );

    possibleMoves = possibleMoves.filter((move) => {
      return (
        board[move.y][move.x] != this.PLAYER_ONE &&
        board[move.y][move.x] != this.PLAYER_TWO
      );
    });

    possibleMoves = possibleMoves.filter(
      (move) =>
        !this.isThereWallBetweenAdjacentsCells(
          move.x,
          move.y,
          player.x,
          player.y,
          board
        )
    );

    //si l'autre joueur est visible
    if (otherPlayer.x !== null) {
      possibleMoves = possibleMoves.concat(
        this.getJumpableCells(player, otherPlayer, board)
      );
    }
    return possibleMoves;
  }

  static getJumpableCells(player, otherPlayer, board) {
    let jumpableCells = [];
    //Si les deux joueurs ne sont pas adjacents
    if (
      !this.isAdjacentCells(player.x, player.y, otherPlayer.x, otherPlayer.y)
    ) {
      return jumpableCells;
    }

    //Si il y a un mur entre les deux joueurs
    if (
      this.isThereWallBetweenAdjacentsCells(
        player.x,
        player.y,
        otherPlayer.x,
        otherPlayer.y,
        board
      )
    ) {
      return jumpableCells;
    }

    const xDelta = otherPlayer.x - player.x;
    const yDelta = otherPlayer.y - player.y;

    const potentialWallDevantX = player.x + (3 * xDelta) / 2;
    const potentialWallDevantY = player.y + (3 * yDelta) / 2;

    const cellDevantX = player.x + 2 * xDelta;
    const cellDevantY = player.y + 2 * yDelta;
    /*
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
    */

    if (
      this.isInBoardLimits(potentialWallDevantX) &&
      this.isInBoardLimits(potentialWallDevantY) &&
      !this.isDemiWallAlreadyPlaced(
        potentialWallDevantX,
        potentialWallDevantY,
        board
      )
    ) {
      jumpableCells.push({ x: cellDevantX, y: cellDevantY });
    }

    /*
    else {
      if (
        !this.isDemiWallAlreadyPlaced(
          potentialWallDroiteX,
          potentialWallDroiteY,
          board
        )
      ) {
        jumpableCells.push({ x: cellDroiteX, y: cellDroiteY });
      }
      if (
        !this.isDemiWallAlreadyPlaced(
          potentialWallGaucheX,
          potentialWallGaucheY,
          board
        )
      ) {
        jumpableCells.push({ x: cellGaucheX, y: cellGaucheY });
      }
    }
    */
    return jumpableCells;
  }
}

if (typeof exports === "object" && exports) {
  exports.BoardUtils = BoardUtils;
}
