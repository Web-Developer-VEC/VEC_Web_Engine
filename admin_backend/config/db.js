const { MongoClient } = require('mongodb');
require('dotenv').config({ quiet: true });

const client = new MongoClient(process.env.MONGO_URI);
let db = null;

async function connectToDatabase() {
  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log("Connected to MongoDB");
  return db;
}

function getDB() {
  if (!db) throw new Error("Database not initialized");
  return db;
}

module.exports = { connectToDatabase, getDB };
