module.exports = function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }
  next();
};