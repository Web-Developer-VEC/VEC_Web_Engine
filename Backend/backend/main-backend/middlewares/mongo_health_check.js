// middleware/mongoHealthCheck.js
const { getlogDb } = require('../config/db');

async function mongoHealthCheck() {
  const db = getlogDb();
  const collection = db.collection('mongolog');

  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  try {
    const status = await db.admin().serverStatus();

    const logPayload = {
      host: status.host,
      version: status.version,
      uptime: status.uptime,
      connections: status.connections,
      mem: status.mem,
      opcounters: status.opcounters,
      timestamp: now,
    };

    await collection.updateOne(
      { _id: 'mongo_health_log' },
      { $push: { logs: logPayload } },
      { upsert: true }
    );

    console.log(`[MongoDB HEALTH LOGGED] at ${now}`);
  } catch (err) {
    console.error('[MongoDB Health Check Error]', err.message);
  }
}

module.exports = mongoHealthCheck;
