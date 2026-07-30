const roleAccessMap = require("../models/role_access_models");
const jwt = require("jsonwebtoken");

function checkRoleByCollection() {
  return (req, res, next) => {
    const admin = req.session?.admin;
    if (!admin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let docs = [];

    try {
      // Use Busboy-parsed docs if available
      if (req.docsFromBusboy) {
        docs = req.docsFromBusboy;
      } else if (typeof req.body.docs === "string") {
        docs = JSON.parse(req.body.docs);
      } else if (Array.isArray(req.body.docs)) {
        docs = req.body.docs;
      } else if (req.body.docs && typeof req.body.docs === "object") {
        docs = [req.body.docs];
      } else {
        return res.status(400).json({ error: "docs must be provided (object or array)" });
      }
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON format for docs" });
    }

    if (!Array.isArray(docs)) docs = [docs];

    // Validate each doc
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
        console.log(`Failed : ${allowedRoles} - ${JSON.stringify(admin, null, 2)}`);
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
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const admin = jwt.verify(token, process.env.JWT_SECRET);

      req.admin = admin;


      if (!allowedRoles.includes(admin.role)) {
        return res.status(403).json({
          error: "Access Denied",
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

module.exports = { checkRole, checkRoleByCollection };
