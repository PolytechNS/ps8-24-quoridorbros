const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "maBaseDeDonnees";

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
