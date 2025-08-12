module.exports = function validateDeptId(req, res, next) {
  const deptId = req.params.deptId;

  // Validate: Must be exactly 3 digits, no special characters
  const isValidFormat = /^[0-9]{3}$/.test(deptId);
  const isInRange = parseInt(deptId, 10) >= 1 && parseInt(deptId, 10) <= 17;
  const hasMongoSpecialChars = /[\$\.]/.test(deptId);

  if (!isValidFormat || !isInRange || hasMongoSpecialChars) {
    return res.status(400).json({ error: 'Invalid Department ID' });
  }
  console.log("sanitize department");
  // Optionally normalize: Keep as string like "001"
  req.params.deptId = deptId;

  next();
};
