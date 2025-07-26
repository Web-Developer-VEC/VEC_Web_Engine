const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  _id: String, // fixed _id to use one document
  logs: [
    {
      status: Number,
      ip: String,
      endpoint: String,
      message: String,
      timestamp: String
    }
  ]
}, { collection: 'logs', versionKey: false });

let LogModel;

const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: options.keyGenerator || ((req) =>
      req.headers['x-forwarded-for']?.split(',')[0] || req.ip
    ),

    handler: async (req, res, next, options) => {
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

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
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect('mongodb://localhost:27017/VEC', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        }

        LogModel = mongoose.models.Log || mongoose.model('Log', logSchema);

        // Append new log entry to single document with _id = 'rate_limit_log'
        await LogModel.updateOne(
          { _id: 'rate_limit_log' },
          {
            $push: {
              logs: {
                status: options.statusCode || 429,
                ip: clientIp,
                endpoint: req.originalUrl,
                message: `Rate limit exceeded`,
                timestamp: now,
              }
            }
          },
          { upsert: true } // Create the document if it doesn't exist
        );

        console.log(`[RateLimit LOGGED] ${clientIp} -> ${req.originalUrl}`);

      } catch (err) {
        console.error('[MongoDB Logging Error]', err);
      }

      const windowMinutes = (options.windowMs || 15 * 60 * 1000) / 60000;

      return res.status(options.statusCode || 429).json({
        status: 429,
        message: `You can visit this page again after ${windowMinutes} minute${windowMinutes > 1 ? 's' : ''}.`
      });
    },

    ...options,
  });
};

module.exports = createRateLimiter;
