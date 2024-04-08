class LocalGameManager {
  constructor() {
    this.game = new Game(this);
    this.isGameFinished = false;
  }

  initBoardPlayer1(gameState) {
    this.clientBoard1 = new ClientBoard(
      this.onCellClick.bind(this),
      this.onWallClick.bind(this),
      gameState,
      "gameBoard1"
    );
  }
  initBoardPlayer2(gameState) {
    this.clientBoard2 = new ClientBoard(
      this.onCellClick.bind(this),
      this.onWallClick.bind(this),
      gameState,
      "gameBoard2"
    );
    this.setBoardsVisibility();
  }

  updateGameStatePlayer1(gameState) {
    this.clientBoard1.updateBoard(gameState);
    this.setBoardsVisibility();
  }

  updateGameStatePlayer2(gameState) {
    this.clientBoard2.updateBoard(gameState);
    this.setBoardsVisibility();
  }

  playerWon(playerNumber) {
    this.isGameFinished = true;
    const gameResults = {
      type: "local"
    }
    let gameResultsString = JSON.stringify(gameResults);
    localStorage.setItem("gameResultsString", gameResultsString);
    window.location.href = "../gameFinished/gameFinished.html";
  }

  onCellClick(x, y) {
    if (this.isGameFinished) return;
    this.game.onCellClick(x, y);
  }

  onWallClick(x, y) {
    if (this.isGameFinished) return;
    this.game.onWallClick(x, y);
  }

  antiCheat(message, callback) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "black";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "999";
    overlay.innerHTML = `<div>${message}</div>`;
    overlay.addEventListener("click", function () {
      overlay.parentNode.removeChild(overlay);
      callback();
    });
    document.body.appendChild(overlay);
  }

  setBoardsVisibility() {
    if (this.clientBoard1.turnOf === 1) {
      this.clientBoard2.element.style.display = "none";
      this.antiCheat("Player 1 turn : Click anywhere", () => {
        this.clientBoard1.element.style.display = "grid";
      });
    } else {
      this.antiCheat("Player 2 turn : Click anywhere", () => {
        this.clientBoard2.element.style.display = "grid";
      });
      this.clientBoard1.element.style.display = "none";
    }
  }
}

let localGameManager = new LocalGameManager();
