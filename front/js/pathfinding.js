class PathFinding {
  static checkPathPlayers(gameBoard, players) {
    let possible = false;
    for (var i = 0; i < 2; i++) {
      if (this.checkPath(gameBoard, players[i])) {
        possible = true;
      } else {
        return false;
      }
    }
    return possible;
  }

  static arrayContainsArray(superset, subset) {
    for (var i = 0; i < superset.length; i++) {
      if (superset[i][0] === subset[0] && superset[i][1] === subset[1]) {
        return true;
      }
    }
    return false;
  }

  static checkPath(gameBoard, player) {
    var queue = [];
    var visited = [];
    var position = [player.y, player.x];
    queue.push(position);
    while (queue.length > 0) {
      var current = queue.shift();
      var x = current[1];
      var y = current[0];
      if (
        (y === 0 && player.playerNumber === 2) ||
        (y === 16 && player.playerNumber === 1)
      ) {
        return true;
      }
      if (
        this.arrayContainsArray(visited, current) ||
        queue.includes(current)
      ) {
        continue;
      }
      visited.push(current);
      if (y + 2 <= 16 && gameBoard[y + 1][x] === null) {
        if (!this.arrayContainsArray(visited, [y + 2, x])) {
          queue.push([y + 2, x]);
        }
      }
      if (y - 2 > -1 && gameBoard[y - 1][x] === null) {
        if (!this.arrayContainsArray(visited, [y - 2, x])) {
          queue.push([y - 2, x]);
        }
      }
      if (x + 2 <= 16 && gameBoard[y][x + 1] === null) {
        if (!this.arrayContainsArray(visited, [y, x + 2])) {
          queue.push([y, x + 2]);
        }
      }
      if (x - 2 > -1 && gameBoard[y][x - 1] === null) {
        if (!this.arrayContainsArray(visited, [y, x - 2])) {
          queue.push([y, x - 2]);
        }
      }
    }
    return false;
  }

  static testPathfinding() {
    let gameBoard = [];
    let initialValue = 0;
    for (let y = 0; y < 17; y++) {
      gameBoard[y] = []; // initialise le sous tableau
      for (let x = 0; x < 17; x++) {
        if (x % 2 === 0 && y % 2 === 0) {
          initialValue = 0;
          if (y < 8) {
            initialValue = -1;
          } else if (y > 8) {
            initialValue = 1;
          }
          gameBoard[y][x] = initialValue;
        } else {
          gameBoard[y][x] = null;
        }
      }
    }
    var player1 = { x: 8, y: 0, playerNumber: 1 };
    var player2 = { x: 8, y: 16, playerNumber: 2 };

    console.log(this.checkPathPlayers(gameBoard, [player1, player2]));
    for (let i = 0; i < 17; i++) {
      gameBoard[9][i] = 1;
    }
    console.log(this.checkPathPlayers(gameBoard, [player1, player2]));
    gameBoard[9][12] = null;
    for (let j = 9; j < 17; j++) {
      gameBoard[j][11] = 1;
      gameBoard[j][13] = 1;
    }
    console.log(this.checkPathPlayers(gameBoard, [player1, player2]));
    //call this for testing
  }
}

if (typeof exports === "object" && exports) {
  exports.PathFinding = PathFinding;
}
