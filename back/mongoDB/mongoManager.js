const { MongoClient } = require("mongodb");

const url = "mongodb://mongodb:27017";
const dbName = "QuoribrosB";

let db = null;

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  console.log("Connected à MongoDB");
  db = client.db(dbName);
}

function getDb() {
  return db;
}

async function saveGameState(userToken, gameState) {
  const save = {
    token: userToken,
    game: gameState,
  };
  try {
    const db = getDb();
    const collection = db.collection("gameStates");
    await collection.insertOne(save);
    console.log("Game state saved successfully");
  } catch (error) {
    console.error("Error saving game state", error);
  }
}

async function loadGameState(userToken) {
  try {
    const db = getDb();
    const collection = db.collection("gameStates");
    const gameState = await collection.findOne({
      userToken: userToken,
    });

    return gameState;
  } catch (error) {
    console.error("Error loading game state", error);
  }
}
module.exports = { connect, getDb, saveGameState, loadGameState };
