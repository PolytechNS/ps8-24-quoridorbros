const { findShortestPathMove } = require("../../front/js/pathfinding.js");
const { BoardUtils } = require("../../front/js/utils.js");
const {
  fromVellaToOurGameState,
  fromOurToVellaGameState,
  fromOurToVellaMove,
  fromVellaToOurMove,
} = require("./aiAdapter.js");

const {
  deltaDistanceHeuristic,
  deltaWallsHeuristic,
} = require("./heuristics.js");

let numPlayer;
let numOtherPlayer;

function getInitialMove() {
  let position;
  if (numPlayer === 1) {
    position = "4,8";
  } else {
    position = "4,0";
  }
  return { action: "move", value: position };
}

let date = null;
const mcts = new MCTS();

async function setup(AIplay) {
  numPlayer = AIplay;
  numOtherPlayer = AIplay === 1 ? 2 : 1;

  return new Promise((resolve, reject) => {
    mcts.initializeRoot(null);

    // Promise is resolved into a position string, indicating its placement, in less than 1000ms.
    // Un move pour placer son joueur.
    resolve(getInitialMove());
  });
}

async function nextMove(vellaGameState) {
  return new Promise((resolve) => {
    const gameState = fromVellaToOurGameState(vellaGameState, numPlayer);
    mcts.updateTreeWithnewGameState(gameState);
    const ourMove = mcts.runMCTS(1000);
    //const ourMove = calculateBestMove(gameState);
    const vellaMove = fromOurToVellaMove(ourMove.x, ourMove.y);
    resolve(vellaMove);
  });
}

function calculateBestMove(gameState) {
  const possibleMoves = BoardUtils.getReachableCells(
    gameState.player,
    gameState.otherPlayer,
    gameState.board
  );
  const bestMove = findShortestPathMove(
    possibleMoves,
    gameState.board,
    numPlayer
  );

  return bestMove[0];
}

async function correction(rightMove) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

async function updateBoard(gameState) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

function opponentPosition(board) {
  for (let i = 0; i <= 16; i += 2) {
    for (let j = 0; j <= 16; j += 2) {}
  }
}

function isComputeTimeExpired() {
  return Date.now() - date >= 180;
}

class Node {
  constructor(gameState, parent = null, lastAppliedMove = null) {
    this.gameState = gameState;
    this.parent = parent;
    this.children = [];
    this.visits = 0;
    this.wins = 0;
    this.lastAppliedMove = lastAppliedMove;
  }

  selectChild() {
    // Implémentation de la politique de sélection UCT (Upper Confidence Bounds for Trees)
    // Vous pouvez ajuster les paramètres C et le choix de la fonction de score UCB en fonction de votre jeu
    const C = Math.sqrt(2.0);
    return this.children.reduce(
      (selected, child) =>
        child.getUCBScore(C) > selected.getUCBScore(C) ? child : selected,
      this.children[0]
    );
  }

  getUCBScore(C) {
    if (this.visits === 0) {
      return Infinity; // Assure la sélection des nœuds non explorés en priorité
    }
    const exploitation = this.wins / this.visits;
    const exploration =
      C * Math.sqrt(Math.log(this.parent.visits) / this.visits);
    return exploitation + exploration;
  }

  expand() {
    // Expand le nœud en ajoutant tous les enfants possibles
    const possibleMoves = BoardUtils.getReachableCells(
      this.gameState.player,
      this.gameState.otherPlayer,
      this.gameState.board
    );
    possibleMoves.forEach((move) => {
      const newGameState = this.gameState.cloneAndApplyMove(move);
      const childNode = new Node(newGameState, this, move);
      this.children.push(childNode);
    });
  }

  simulate() {
    // Simulation d'un jeu aléatoire depuis cet état
    let currentState = this.gameState.clone();
    while (!currentState.isTerminal()) {
      const randomMove = currentState.getRandomMove();
      currentState = currentState.cloneAndApplyMove(randomMove);
    }
    return getHeuristicValue(currentState);
  }

  backpropagate(result) {
    // Backpropagation des résultats de la simulation vers le nœud racine
    let currentNode = this;
    while (currentNode !== null) {
      currentNode.visits++;
      currentNode.wins += result;
      currentNode = currentNode.parent;
    }
  }
}

class MCTS {
  constructor() {
    this.root = null;
  }

  initializeRoot(gameState) {
    this.root = new Node(gameState);
  }

  updateTreeWithnewGameState(newGameState) {
    // Mettez à jour l'arbre MCTS avec le nouvel état de jeu
    const matchingChild = this.root.children.find(
      (child) => child.gameState.equals(newGameState) // Assumez que vous avez une méthode equals dans votre GameState
    );

    if (matchingChild) {
      // Si l'état de l'adversaire correspond à un enfant existant, définissez cet enfant comme nouveau nœud racine
      this.root = matchingChild;
      this.root.parent = null; // Le nouveau nœud racine n'a pas de parent
    } else {
      // Si l'état de jeu ne correspond à aucun enfant existant, réinitialisez l'arbre
      this.initializeRoot(newGameState);
    }
  }

  runMCTS(maxComputeTime) {
    const startTime = Date.now();
    for (let i = 0; Date.now() - startTime < maxComputeTime; i++) {
      let currentNode = this.root;
      // Sélection
      while (currentNode.children.length !== 0) {
        currentNode = currentNode.selectChild();
      }

      // Expansion
      if (!currentNode.gameState.isTerminal()) {
        currentNode.expand();
      }

      // Simulation
      const simulationResult = currentNode.simulate();

      // Backpropagation
      currentNode.backpropagate(simulationResult);
    }

    // Sélection du meilleur enfant après les itérations
    const bestChild = this.root.children.reduce(
      (selected, child) => (child.visits > selected.visits ? child : selected),
      this.root.children[0]
    );

    return bestChild.lastAppliedMove; // Retourne le meilleur coup trouvé
  }
}

function getHeuristicValue(gameState) {
  return deltaDistanceHeuristic(gameState) + deltaWallsHeuristic(gameState);
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;
