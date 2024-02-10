/*
C'est le board côté frontend, il ne contient que les informations nécessaires pour le joueur
=> pas possible de tricher en regardant le frontend
paramètres :

*/
class ClientBoard {
  constructor(
    size,
    onCellClick,
    onWallClick,
    board,
    playerNumber,
    elementId = "gameBoard"
  ) {
    this.size = size;
    this.onCellClick = onCellClick;
    this.onWallClick = onWallClick;
    this.element = document.getElementById(elementId);
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

        if (BoardUtils.isCell(x, y)) {
          div.classList.add("cell");
          switch (this.board[y][x]) {
            case BoardUtils.PLAYER_TWO:
              div.setAttribute("id", "joueur-2");
              break;
            case BoardUtils.PLAYER_ONE:
              div.setAttribute("id", "joueur-1");
              break;
            case BoardUtils.FOG:
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

  updateBoard(gameState) {
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

        if (BoardUtils.isCell(x, y)) {
          switch (gameState.board[y][x]) {
            case BoardUtils.PLAYER_TWO:
              div.setAttribute("id", "joueur-2");
              break;
            case BoardUtils.PLAYER_ONE:
              div.setAttribute("id", "joueur-1");
              break;
            case BoardUtils.FOG:
              div.id = "";
              div.classList.add("fog");
              break;
            case BoardUtils.EMPTY:
              div.id = "";
              div.classList.remove("fog");
              break;
            default:
              break;
          }
        } else if (
          gameState.board[y][x] == BoardUtils.WALL_PLAYER_ONE ||
          gameState.board[y][x] == BoardUtils.WALL_PLAYER_TWO
        ) {
          div.classList.add("placed");
        }
      }
    }
  }

  onWallHover(x, y) {
    let nextWall = BoardUtils.getNextWall(x, y);
    if (
      !BoardUtils.isInBoardLimits(nextWall.x) ||
      !BoardUtils.isInBoardLimits(nextWall.y)
    ) {
      return;
    }
    this.divBoard[y][x].classList.add("surbrillance");
    this.divBoard[nextWall.y][nextWall.x].classList.add("surbrillance");
  }

  onWallRemoveHover(x, y) {
    let nextWall = BoardUtils.getNextWall(x, y);
    if (
      !BoardUtils.isInBoardLimits(nextWall.x) ||
      !BoardUtils.isInBoardLimits(nextWall.y)
    ) {
      return;
    }
    this.divBoard[y][x].classList.remove("surbrillance");
    this.divBoard[nextWall.y][nextWall.x].classList.remove("surbrillance");
  }

  playerWon(playerNumber) {
    this.element.style.pointerEvents = "none";
  }
}
