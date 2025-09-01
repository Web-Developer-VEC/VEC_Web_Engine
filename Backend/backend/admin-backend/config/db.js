const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.ADMIN_DB_NAME;
const logsdbname =  process.env.LOGS_DB_NAME;

async function connectToAdminDatabase() {
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        admindb = client.db(dbName);
        logdb = client.db(logsdbname);
        console.log(`Connected to Admin database: ${dbName}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}

// Function to get the AdminDB instance
function getAdminDb() {
    if (!admindb) {
        throw new Error('Database not initialized. Call connectToAdminDatabase first.');
    }
    return admindb;
}

function getlogDb() {
    if (!logdb) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return logdb;
}

module.exports = connectToAdminDatabase;
module.exports.getAdminDb = getAdminDb;
module.exports.getlogDb = getlogDb;