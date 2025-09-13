const roleAccessMap = require("../models/role_access_models");

function checkRoleByCollection() {
  return (req, res, next) => {
    const admin = req.session?.admin;
    if (!admin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let docs = [];

    try {
      // ✅ Handle docs in different formats
      if (typeof req.body.docs === "string") {
        docs = JSON.parse(req.body.docs); // frontend sent stringified JSON
      } else if (Array.isArray(req.body.docs)) {
        docs = req.body.docs; // already array
      } else if (req.body.docs && typeof req.body.docs === "object") {
        docs = [req.body.docs]; // single object
      } else {
        return res.status(400).json({ error: "docs must be provided (object or array)" });
      }
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON format for docs" });
    }

    // ✅ Normalize to array
    if (!Array.isArray(docs)) {
      docs = [docs];
    }

    // ✅ Validate each doc’s collectionName
    for (const doc of docs) {
      const { collectionName } = doc;

      if (!collectionName) {
        return res.status(400).json({ error: "collectionName is required in each document" });
      }

      const allowedRoles = roleAccessMap[collectionName];
      if (!allowedRoles) {
        return res.status(400).json({ error: `Invalid collection name (${collectionName}) or no roles set` });
      }

      if (!allowedRoles.includes(admin.role)) {
        return res.status(403).json({
          error: `Access Denied: Your role (${admin.role}) is not allowed to make changes in ${collectionName}`,
        });
      }
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
