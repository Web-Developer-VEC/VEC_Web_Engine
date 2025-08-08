const sanitizeHtml = require('sanitize-html');

function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeHtml(obj[key].trim());
    } else if (typeof obj[key] === 'object') {
      obj[key] = sanitizeObject(obj[key]); // Recursive sanitization
    }
  }

  return obj;
}

module.exports = function xssSanitizer(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};
