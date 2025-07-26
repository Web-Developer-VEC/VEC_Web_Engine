const sanitizeHtml = require('sanitize-html');

module.exports = function validateGrievance(req, res, next) {
  const {
    name,
    email,
    contact_number,
    query_about,
    category,
    original_captcha,
    entered_captcha,
    content,
  } = req.body;

  // Helper: Check for NoSQL injection symbols
  const hasNoSQLInjection = (value) => typeof value === 'string' && /[\$\.]/.test(value);

  // 1. Validate & sanitize name
  if (typeof name !== 'string' || hasNoSQLInjection(name) || name.trim().length < 2) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  req.body.name = sanitizeHtml(name.trim());

  // 2. Validate & sanitize email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== 'string' || !emailPattern.test(email) || hasNoSQLInjection(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  req.body.email = sanitizeHtml(email.trim());

  // 3. Validate contact number: exactly 10 digits
  const contactPattern = /^\d{10}$/;
  if (!contactPattern.test(contact_number)) {
    return res.status(400).json({ error: 'Invalid contact number' });
  }

  // 4. Validate category
  const validCategories = ['Alumni', 'Student', 'Parent', 'Industry Partner', 'Others'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  // 5. Validate query_about
  const validQueries = ['Admission', 'Hostel', 'Department', 'Controller of Examination', 'Others'];
  if (!validQueries.includes(query_about)) {
    return res.status(400).json({ error: 'Invalid query_about value' });
  }

  // 6. Captcha validation - just ensure they are strings and not malicious
  if (
    typeof original_captcha !== 'string' ||
    typeof entered_captcha !== 'string' ||
    hasNoSQLInjection(original_captcha) ||
    hasNoSQLInjection(entered_captcha)
  ) {
    return res.status(400).json({ error: 'Invalid captcha data' });
  }

  // 7. Sanitize content
  if (typeof content !== 'string' || hasNoSQLInjection(content)) {
    return res.status(400).json({ error: 'Invalid content' });
  }
  req.body.content = sanitizeHtml(content.trim());

  next();
};
