let AInumber;
let goal_line;
let gameState=null;

function setup(AIplay) {
    // AIplay est playerNumber
    return new Promise((resolve, reject) => {
        // Promise is resolved into a position string, indicating its placement, in less than 1000ms.
        // Un move pour placer son joueur.
        setTimeout(() => {
           const res = setupIA(AIplay);
           if(res!==null){resolve(res);}
           else{reject("Internal Error From IA Setup");}
        }, 950);
    });

    function setupIA(AIplay){
        let randomPosition = Math.floor(Math.random() * 9) + 1; // Génère un nombre entre 1 et 9
        let position;    
        if (AIplay === 1) {
            AInumber=1;
            goal_line=0;
            // Si AI est le premier joueur, placez-le sur la ligne du bas
            position = `${randomPosition}9`;
        } else {
            // Si AI est le deuxième joueur, placez-le sur la ligne du haut
            AInumber=2;
            goal_line=8;
            position = `${randomPosition}1`;
        }
        return position;
    }
}

function nextMove(gameState) {
    return new Promise((resolve) => { setTimeout(() => {
        let move = calculateBestMove(gameState);
        if(move!==null){resolve(move);}
        else{reject("Internal Error From IA NEXT MOVE");}
    }, 1000);
});
}

function calculateBestMove(gameState) {
    //TODO
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

function opponentPosition(board){
    for (let i = 0; i < board.length; i++) {
        const innerList = board[i];
        for (let j = 0; j < innerList.length; j++) {
            if (board[i][j] === 2){
                return [i, j];
            }
        }
    }
    return null;
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;
