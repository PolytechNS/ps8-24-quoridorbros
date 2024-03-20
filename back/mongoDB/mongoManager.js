const { MongoClient } = require("mongodb");

const url = "mongodb://mongodb:27017";
const dbName = "QuoribrosB";

let db = null;

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  console.log("Connected to MongoDB");
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
    await collection.updateOne(
      { token: userToken },
      { $set: save },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error saving game state", error);
  }
}

async function loadGameState(userToken) {
  try {
    const db = getDb();
    const collection = db.collection("gameStates");
    const save = await collection.findOne({
      token: userToken,
    });
    if (!save) {
      console.log("No game state found for this user token");
      return null;
    }
    console.log(save.game);
    return save.game;
  } catch (error) {
    console.error("Error loading game state", error);
    return null;
  }
}

async function getIdOfUser(username) {
  try {
    const db = getDb();
    const collection = db.collection("users");
    const userDocument = await collection.findOne({ username });

    if (!userDocument) {
      console.log("No user found for the provided username:", username);
      return null;
    }

    return userDocument._id.toString();
  } catch (error) {
    console.error("An error occurred while loading user ID:", error);
    return null;
  }
}

module.exports = { connect, getDb, saveGameState, loadGameState, getIdOfUser };
