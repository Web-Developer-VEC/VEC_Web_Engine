const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const logsdbname =  process.env.LOGS_DB_NAME;

async function connectToDatabase() {
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db(dbName);
        logdb = client.db(logsdbname)
        console.log(`Connected to database: ${dbName}`);
        console.log(`Connected to database: ${logsdbname}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}

// Function to get the DB instance
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return db;
}

// Function to get the DB instance
function getlogDb() {
    if (!logdb) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return logdb;
}

module.exports = connectToDatabase;
module.exports.getDb = getDb;
module.exports.getlogDb = getlogDb;