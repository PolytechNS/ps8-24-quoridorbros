const { MongoClient } = require("mongodb");

const url = "mongodb://mongodb:27017";
const dbName = "QuoribrosB";

let db = null;

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  console.log("Connecté à MongoDB");
  db = client.db(dbName);
}

function getDb() {
  return db;
}

module.exports = { connect, getDb };
