const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const logsdbname =  process.env.LOGS_DB_NAME;
const admindbName = process.env.ADMIN_DB_NAME;

async function connectToDatabase() {
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db(dbName); // MAIN DB
        logdb = client.db(logsdbname) // LOGS DB
        admindb = client.db(admindbName) // ADMIN DB
        console.log(`Connected to database: ${dbName}`);
        console.log(`Connected to database: ${logsdbname}`);
        console.log(`Connected to database: ${admindbName}`);
        
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}


function getMainDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return db;
}

function getlogDb() {
    if (!logdb) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return logdb;
}

function getAdminDb() {
    if (!admindb) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return admindb;
}

module.exports = connectToDatabase;
module.exports.getDb = getMainDb;
module.exports.getlogDb = getlogDb;
module.exports.getAdminDb = getAdminDb;