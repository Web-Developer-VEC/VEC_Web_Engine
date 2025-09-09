const roleAccessMap = require("../models/role_access_models");

function checkRoleByCollection() {
  return (req, res, next) => {
    const admin = req.session?.admin;
    if (!admin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { collectionName } = req.params;
    const allowedRoles = roleAccessMap[collectionName];

    if (!allowedRoles) {
      return res.status(400).json({ error: "Invalid collection name or no roles set" });
    }

    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({ error: "Access Denied: Your role is not allowed to make changes in this page" });
    }

    next();
  };
}

function checkRole(allowedRoles) {
  return (req, res, next) => {
    const admin = req.session?.admin;
    if (!admin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(admin.role)) {
      return res.status(403).json({ error: "Access Denied: Your role is not allowed to make changes in this page" });
    }

    next();
  };
}



module.exports = { checkRole, checkRoleByCollection };