
module.exports = function validateUniqueId(req, res, next) {
  const uniqueId = req.params.unique_id;

  // Allow pattern: VEC-001-01-001 (alphanumeric and dashes)
  const uniqueIdPattern = /^VEC-\d{3}-\d{2}-\d{3}$/;

  // Prevent NoSQL injection operators like $ and .
  if (
    typeof uniqueId !== 'string' ||
    !uniqueIdPattern.test(uniqueId) ||
    /[\$\.]/.test(uniqueId)
  ) {
    return res.status(400).json({ error: 'Invalid unique ID format' });
  }

  // Optional: sanitize further (if you want to normalize or trim)
  req.params.unique_id = uniqueId.trim();

  next();
};
