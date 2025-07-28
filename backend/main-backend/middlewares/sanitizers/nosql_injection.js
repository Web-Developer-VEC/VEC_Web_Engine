const mongoSanitize = require('express-mongo-sanitize');

// Sanitize req.body, req.query, and req.params by replacing prohibited characters like $ and .
module.exports = mongoSanitize({
  replaceWith: '_', // Replaces keys like "$ne" with "_ne"
});
