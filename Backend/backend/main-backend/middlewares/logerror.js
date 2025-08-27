// middleware/logError.js
const { getlogDb } = require('../config/db');

const logError = async (req, error, message = 'Unhandled error', status = 500) => {
  const db = getlogDb();
  const collection = db.collection('errorlog');

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
    await collection.updateOne(
      { _id: 'error_log' },
      {
        $push: {
          logs: {
            status,
            message,
            error: error?.stack || error?.message || 'Unknown error',
            endpoint: req.originalUrl,
            method: req.method,
            ip: req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
            timestamp: now,
          },
        },
      },
      { upsert: true }
    );

    console.log(`[Error LOGGED] ${req.originalUrl} (${req.method})`);
  } catch (err) {
    console.error('[MongoDB Error Logging Failed]', err.message);
  }
};

module.exports = logError;
