
function setup(AIplay) {
    // AIplay est playerNumber
    return new Promise((resolve, reject) => {
        // Promise is resolved into a position string, indicating its placement, in less than 1000ms.
        // Un move pour placer son joueur.
        const position = "11";
        resolve(position);
    });
}

function nextMove(gameState) {
    return new Promise((resolve, reject) => {
        const move = {
            action: "move",
            value: "12",
        };
        resolve(move);
    });
}

function correction(rightMove) {
    return new Promise((resolve, reject) => {
        resolve(true);
    });
}

function updateBoard(gameState) {
    return new Promise((resolve, reject) => {
        resolve(true);
    });
}

class gameState {
    opponentWalls;
    ownWalls;
    // [[String position], 0/1 orientation ]
    // La position est la position du coin supérieur gauche.
    constructor() {
        this.board = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1],// i=8,j=8
            [-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];  // i=0, j=0
    }
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;
