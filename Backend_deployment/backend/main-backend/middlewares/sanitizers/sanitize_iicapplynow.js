const sanitizeHtml = require('sanitize-html');

module.exports = function validateIICApplyForm(req, res, next) {
  const { name, phno, email, content, original_captcha, entered_captcha } = req.body;

  // FIXED: Only block `$`, allow `.`
  const hasNoSQLInjection = (value) =>
    typeof value === 'string' && /\$/.test(value);

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phonePattern = /^\d{10}$/;

  // Name
  if (typeof name !== 'string' || name.trim().length < 2 || hasNoSQLInjection(name)) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  req.body.name = sanitizeHtml(name.trim());

  // Phone
  if (!phonePattern.test(phno)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  // Email — FIXED: No longer rejects valid emails
  if (typeof email !== 'string' || !emailPattern.test(email.trim()) || hasNoSQLInjection(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  req.body.email = sanitizeHtml(email.trim());

  // Content
  if (typeof content !== 'string' || content.trim().length === 0 || hasNoSQLInjection(content)) {
    return res.status(400).json({ error: 'Invalid content' });
  }
  req.body.content = sanitizeHtml(content.trim());

  // Captcha
  if (
    typeof original_captcha !== 'string' ||
    typeof entered_captcha !== 'string' ||
    hasNoSQLInjection(original_captcha) ||
    hasNoSQLInjection(entered_captcha)
  ) {
    return res.status(400).json({ error: 'Invalid captcha input' });
  }

  if (original_captcha.trim().toLowerCase() !== entered_captcha.trim().toLowerCase()) {
    return res.status(400).json({ error: 'Captcha does not match' });
  }

  next();
};
