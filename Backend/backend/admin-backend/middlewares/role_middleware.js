function checkRole(allowedRoles) {
  return (req, res, next) => {
    const admin = req.session?.admin;
    if (!admin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({ error: "Access Denied: Insufficient Role" });
    }

    next();
  };
}

module.exports = { checkRole };
