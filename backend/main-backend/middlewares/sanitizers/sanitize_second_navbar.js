const sanitizeHtml = require('sanitize-html');

module.exports = function validatePostData(req, res, next) {
  const { name, phno, email, content } = req.body;

  // Helper: Detect NoSQL injection characters
  const hasNoSQLInjection = (value) => typeof value === 'string' && /[\$\.]/.test(value);

  // Validate and sanitize name
  if (typeof name !== 'string' || name.trim().length < 2 || hasNoSQLInjection(name)) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  req.body.name = sanitizeHtml(name.trim());

  // Validate and sanitize email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== 'string' || !emailPattern.test(email) || hasNoSQLInjection(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  req.body.email = sanitizeHtml(email.trim());

  // Validate phone number: 10 digits only
  const phonePattern = /^\d{10}$/;
  if (!phonePattern.test(phno)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  // Validate and sanitize content
  if (typeof content !== 'string' || hasNoSQLInjection(content)) {
    return res.status(400).json({ error: 'Invalid content' });
  }
  req.body.content = sanitizeHtml(content.trim());

  next();
};
