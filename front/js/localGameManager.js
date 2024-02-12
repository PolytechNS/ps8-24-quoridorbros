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
  }

  onCellClick(x, y) {
    if (this.isGameFinished) return;
    this.game.onCellClick(x, y);
  }

  onWallClick(x, y) {
    if (this.isGameFinished) return;
    this.game.onWallClick(x, y);
  }

  setBoardsVisibility() {
    if (this.clientBoard1.turnOf === 1) {
      this.clientBoard2.element.style.display = "none";
      setTimeout(() => {
        this.clientBoard1.element.style.display = "grid";
      }, 0);
    } else {
      setTimeout(() => {
        this.clientBoard2.element.style.display = "grid";
      }, 0);
      this.clientBoard1.element.style.display = "none";
    }
  }
}

let localGameManager = new LocalGameManager();
