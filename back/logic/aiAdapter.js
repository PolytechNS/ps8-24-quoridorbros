const { BoardUtils } = require("../../front/js/utils");
const { GameBoard } = require("../../front/js/game");
/*

Transforme le gameState de l'ia en gameState du moteur de jeu

*/
function Map(iaGameState){
    let gameGameState = {
        turnOf: null,
        player: {   //player1
            x: null,
            y: null,
            playerNumber: 1,
            walls: iaGameState.ownWalls.length
        },
        otherPlayer: {  //player2
            x: null,
            y: null,
            playerNumber: 2,
            walls: iaGameState.opponentWalls.length
        },
        board: null
    };

    let gameBoard = new GameBoard();

    iaGameState.ownWalls.forEach(wall => {
        let position = parseWallPosition(wall[0]);
        gameBoard.placeWall(position.x, position.y, 1);
    });

    iaGameState.opponentWalls.forEach(wall => {
        let position = parseWallPosition(wall[0]);
        gameBoard.placeWall(position.x, position.y, 2);
    });

    for (let i = 0; i < iaGameState.board.length; i++) {
        for (let j = 0; j < iaGameState.board[i].length; j++) {
            let cellValue = iaGameState.board[i][j];
            if (cellValue === 1) { // own
                gameGameState.player.x = j;
                gameGameState.player.y = i;
            } else if (cellValue === 2) { // opponent
                gameGameState.otherPlayer.x = j;
                gameGameState.otherPlayer.y = i;
            }
            else if (cellValue === -1){
                gameBoard.board[i][j] = BoardUtils.FOG;
            }
            else if (cellValue === 0){
                gameBoard.board[i][j] = BoardUtils.EMPTY;
            }
        }
    }

    gameGameState.board = gameBoard.board;

    return gameGameState;

}

/*

Transforme une position de mur IA en position de mur moteur de jeu

*/

function parseWallPosition(positionString) {
    let [xStr, yStr] = positionString.split(',');
    let x = parseInt(xStr) * 2;
    let y = parseInt(yStr) * 2;
    return { x, y };
}

/*

Transforme le gameState du moteur de jeu en gameState de l'ia 

*/
function MapReverse(gameGameState) {
    let iaGameState = {
        opponentWalls: [],
        ownWalls: [],
        board: initializeIaBoard()
    };

    for (let y = 0; y < 17; y++) {
        for (let x = 0; x < 17; x++) {
            if (BoardUtils.isWall(x, y)) {
                let wallInfo = getWallInfo(x, y, gameGameState.board);
                if (wallInfo) {
                    if (wallInfo.playerNumber === 1) {
                        iaGameState.ownWalls.push(wallInfo.wallPosition);
                    } else if (wallInfo.playerNumber === 2) {
                        iaGameState.opponentWalls.push(wallInfo.wallPosition);
                    }
                }
            }
        }
    }

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let cellContent = gameGameState.board[i * 2][j * 2];
            switch (cellContent) {
                case BoardUtils.EMPTY:
                    iaGameState.board[i][j] = 0;
                    break;
                case BoardUtils.PLAYER_ONE:
                    iaGameState.board[i][j] = 1;
                    break;
                case BoardUtils.PLAYER_TWO:
                    iaGameState.board[i][j] = 2;
                    break;
                default:
                    iaGameState.board[i][j] = -1;
                    break;
            }
        }
    }

    return iaGameState;
}


function initializeIaBoard() {
    let board = [];
    for (let i = 0; i < 9; i++) {
        let row = new Array(9).fill(-1);
        board.push(row);
    }
    return board;
}

/*

Transforme une position de mur moteur de jeu en position de mur IA en 

*/
function getWallInfo(x, y, board) {
    let playerNumber = null;
    let orientation = BoardUtils.isHorizontalWall(x, y) ? 0 : 1;
    let wallPosition = [Math.floor(x / 2)+1, Math.floor(y / 2)+1];

    if (board[y][x] === BoardUtils.WALL_PLAYER_ONE) {
        playerNumber = BoardUtils.PLAYER_ONE;
    } else if (board[y][x] === BoardUtils.WALL_PLAYER_TWO) {
        playerNumber = BoardUtils.PLAYER_TWO;
    }

    if (playerNumber !== null) {
        return {
            playerNumber: playerNumber,
            wallPosition: [wallPosition.join(','), orientation]
        };
    }

    return null;
}

module.exports = {
    Map,
    parseWallPosition,
    MapReverse,
    initializeIaBoard,
    getWallInfo
};