const rateLimit = require('express-rate-limit');
const { getlogDb } = require('../config/db');
const crypto = require('crypto');

// Custom safe IP key generator
const safeIpKeyGenerator = (ip) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,

    // Custom key generator
    keyGenerator: options.keyGenerator || ((req, res) => {
      if (req.query.apiKey) return req.query.apiKey;

      const realIp =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

      return safeIpKeyGenerator(realIp); // hashed IP
    }),

    handler: async (req, res, next, opts) => {
      const clientIp =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

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
        const db = getlogDb();
        const logsCollection = db.collection('ratelog');

        await logsCollection.updateOne(
          { _id: 'rate_limit_log' },
          {
            $push: {
              logs: {
                status: opts.statusCode || 429,
                ip: clientIp,
                endpoint: req.originalUrl,
                message: 'Rate limit exceeded',
                timestamp: now,
              },
            },
          },
          { upsert: true }
        );

        console.log(`[RateLimit LOGGED] ${clientIp} -> ${req.originalUrl}`);
      } catch (err) {
        console.error('[MongoDB Logging Error]', err);
      }

      const windowMinutes = (opts.windowMs || 15 * 60 * 1000) / 60000;

      return res.status(opts.statusCode || 429).json({
        status: 429,
        message: `You can visit this page again after ${windowMinutes} minute${windowMinutes > 1 ? 's' : ''}.`
      });
    },

    ...options,
  });
};

module.exports = createRateLimiter;
