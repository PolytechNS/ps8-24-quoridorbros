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

async function userExists(userToken) {
  try {
    const db = getDb();
    const collection = db.collection("users");
    const userDocument = await collection.findOne({ username: userToken });
    
    if (!userDocument) {
      console.log("No user found for the provided username:", userToken);
      return false;
    }

    return true;
  } catch (error) {
    console.error("An error occurred while loading user ID:", error);
    return false;
  }
}

async function areFriends(user1, user2) {
  try {
    const db = await getDb();
    const usersCollection = db.collection("users");

    const user1Document = await usersCollection.findOne({ username: user1 });
    if (!user1Document) {
      throw new Error(`User ${user1} not found.`);
    }
    const user1Friends = user1Document.friends || [];
    const areFriendsUser1 = user1Friends.includes(user2);

    const user2Document = await usersCollection.findOne({ username: user2 });
    if (!user2Document) {
      throw new Error(`User ${user2} not found.`);
    }
    const user2Friends = user2Document.friends || [];
    const areFriendsUser2 = user2Friends.includes(user1);

    return areFriendsUser1 && areFriendsUser2;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = { connect, getDb, saveGameState, loadGameState, userExists,areFriends };
