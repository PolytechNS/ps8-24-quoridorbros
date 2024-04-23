/*
C'est le board côté frontend, il ne contient que les informations nécessaires pour le joueur
=> pas possible de tricher en regardant le frontend
paramètres :

*/

const YOUR_TURN_TEXT = "YOUR TURN";
const NOT_YOUR_TURN_TEXT = "YOUR OPPONENT TURN";
const TOUR_DURATION = 60;

class ClientBoard {
  constructor(onCellClick, onWallClick, gameState, elementId = "gameBoard") {
    this.onCellClick = onCellClick;
    this.onWallClick = onWallClick;
    this.element = document.getElementById(elementId);
    this.board = gameState.board;
    this.divBoard = [];
    this.turnOf = gameState.turnOf;
    this.playerNumber = gameState.playerNumber;
    this.timerPlayer = new Timer("timer-player");
    this.timerOpponent = new Timer("timer-opponent");
    this.initBoard();
  }

  initBoard() {
    for (let y = 0; y < BoardUtils.BOARD_SIZE * 2 - 1; y++) {
      this.divBoard[y] = [];
      for (let x = 0; x < BoardUtils.BOARD_SIZE * 2 - 1; x++) {
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
              this.onWallRemoveHover(x, y),
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
    if (this.turnOf !== this.playerNumber) {
      this.timerOpponent.start();
      this.element.style.pointerEvents = "none";
    } else {
      this.timerPlayer.start();
    }
  }

  updateBoard(gameState) {
    //Empêche le joueur de cliquer si ce n'est pas son tour
    this.turnOf = gameState.turnOf;
    this.timerPlayer.reset();
    this.timerOpponent.reset();

    if (this.turnOf !== this.playerNumber) {
      this.timerOpponent.start();
      this.element.style.pointerEvents = "none";
    } else {
      this.timerPlayer.start();
      this.element.style.pointerEvents = "auto";
    }

    for (let y = 0; y < BoardUtils.BOARD_SIZE * 2 - 1; y++) {
      for (let x = 0; x < BoardUtils.BOARD_SIZE * 2 - 1; x++) {
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

class Timer {
  constructor(timerId) {
    this.timerInterval = null;
    this.texte = document.getElementById(timerId);
    this.texte.style.display = "none";
  }

  start() {
    this.seconds = TOUR_DURATION;
    this.texte.style.display = "block";
    this.timerInterval = setInterval(() => {
      this.update();
    }, 1000);
  }

  stop() {
    clearInterval(this.timerInterval);
  }

  reset() {
    this.texte.style.display = "none";
    clearInterval(this.timerInterval);
    this.seconds = 0;
  }

  update() {
    this.seconds--;
    if (this.seconds < 0) {
      this.stop();
    } else {
      this.texte.textContent = this.seconds + " sec";
    }
  }
}
