function allowRoles(...roles) {
  return (req, res, next) => {
    const role = req.session?.user?.role;
    if (!roles.includes(role)) {
      return res.status(403).json({
        message: `Access denied. Allowed roles: ${roles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {allowRoles};
