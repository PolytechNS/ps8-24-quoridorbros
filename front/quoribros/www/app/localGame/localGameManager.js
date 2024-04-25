const antiCheatLocal = document.getElementById("anti-cheat-local");

class LocalGameManager {
  constructor() {
    this.game = new Game(this);
    this.isGameFinished = false;
    document
      .getElementById("concede")
      .addEventListener("click", () => this.concede());
  }

  initBoardPlayer1(gameState) {
    this.clientBoard1 = new ClientBoard(
      this.onCellClick.bind(this),
      this.onWallClick.bind(this),
      gameState,
      "gameBoard1",
    );
  }
  initBoardPlayer2(gameState) {
    this.clientBoard2 = new ClientBoard(
      this.onCellClick.bind(this),
      this.onWallClick.bind(this),
      gameState,
      "gameBoard2",
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
      type: "local",
    };
    let gameResultsString = JSON.stringify(gameResults);
    localStorage.setItem("gameResultsString", gameResultsString);
    window.location.href = "../gameFinished/gameFinished.html";
  }

  concede() {
    const playerNumber = this.game.currentPlayer.playerNumber;
    const otherPlayer = playerNumber == 1 ? 2 : 1;
    this.playerWon(otherPlayer);
  }

  onCellClick(x, y) {
    if (this.isGameFinished) return;
    this.game.onCellClick(x, y);
  }

  onWallClick(x, y) {
    if (this.isGameFinished) return;
    this.game.onWallClick(x, y);
  }

  antiCheat(message) {
    antiCheatLocal.textContent = message;
    antiCheatLocal.style.display = "flex";
  }

  setBoardsVisibility() {
    if (this.clientBoard1.turnOf === 1) {
      this.clientBoard2.element.style.display = "none";
      this.antiCheat("Player 1 turn : Click anywhere");
      this.clientBoard1.element.style.display = "grid";
    } else {
      this.clientBoard2.element.style.display = "grid";
      this.antiCheat("Player 2 turn : Click anywhere");
      this.clientBoard1.element.style.display = "none";
    }
  }
}

let localGameManager = new LocalGameManager();
window.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("click", function (event) {
    if (event.target == antiCheatLocal) {
      antiCheatLocal.style.display = "none";
    }
  });
});
