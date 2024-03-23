function findShortestPathMove(possibleMoves, board, playerNumber) {
  let bestMove = possibleMoves[0];
  let shortestPath = Infinity;

  for (const move of possibleMoves) {
    const simulatedPlayer = {
      x: move.x,
      y: move.y,
      playerNumber: playerNumber,
    };
    let distance = computeDistanceOfShortestPath(board, simulatedPlayer);
    //console.log(simulatedPlayer.x, simulatedPlayer.y, "distance: ", distance);
    if (distance < shortestPath) {
      shortestPath = distance;
      bestMove = move;
    }
  }

  return [bestMove, shortestPath];
}

function arrayContainsArray(superset, subset) {
  for (var i = 0; i < superset.length; i++) {
    if (superset[i][0] === subset[0] && superset[i][1] === subset[1]) {
      return true;
    }
  }
  return false;
}

function computeDistanceOfShortestPath(gameBoard, player) {
  var queue = [];
  var visited = [];
  var position = [player.y, player.x, 0];
  queue.push(position);
  while (queue.length > 0) {
    let current = queue.shift();
    let x = current[1];
    let y = current[0];
    let distance = current[2];
    if (
      (y === 0 && player.playerNumber === 1) ||
      (y === 16 && player.playerNumber === 2)
    ) {
      return distance + 1;
    }
    if (arrayContainsArray(visited, current) || queue.includes(current)) {
      continue;
    }
    visited.push(current);
    if (y + 2 <= 16 && gameBoard[y + 1][x] === null) {
      if (!arrayContainsArray(visited, [y + 2, x])) {
        queue.push([y + 2, x, distance + 1]);
      }
    }
    if (y - 2 > -1 && gameBoard[y - 1][x] === null) {
      if (!arrayContainsArray(visited, [y - 2, x])) {
        queue.push([y - 2, x, distance + 1]);
      }
    }
    if (x + 2 <= 16 && gameBoard[y][x + 1] === null) {
      if (!arrayContainsArray(visited, [y, x + 2])) {
        queue.push([y, x + 2, distance + 1]);
      }
    }
    if (x - 2 > -1 && gameBoard[y][x - 1] === null) {
      if (!arrayContainsArray(visited, [y, x - 2])) {
        queue.push([y, x - 2, distance + 1]);
      }
    }
  }
  return 81;
}

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
        (y === 0 && player.playerNumber === 1) ||
        (y === 16 && player.playerNumber === 2)
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
}

if (typeof exports === "object" && exports) {
  exports.PathFinding = PathFinding;
  exports.findShortestPathMove = findShortestPathMove;
}
