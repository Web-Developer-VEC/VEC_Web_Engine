// middlewares/sanitizers/nosql_injection.js
const mongoSanitize = require('express-mongo-sanitize');

// Utility: Detect $ or . in keys (recursively)
function containsNoSQLInjection(obj) {
  if (typeof obj !== 'object' || obj === null) return false;

  for (const key in obj) {
    if (key.includes('$') || key.includes('.')) return true;

    const value = obj[key];
    if (typeof value === 'object' && containsNoSQLInjection(value)) return true;
  }
  return false;
}



// Main middleware function
function secureNoSQLMiddleware(req, res, next) {
  const payloads = [req.body, req.query, req.params];

  const hasInjection = payloads.some(containsNoSQLInjection);
  if (hasInjection) {
    return res.status(400).json({ error: 'Malicious input detected (NoSQL injection attempt)' });
  }

  // Sanitize after validation
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);

  next();
}

module.exports = secureNoSQLMiddleware;
