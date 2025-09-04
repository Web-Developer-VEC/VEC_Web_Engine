// controllers/accessController.js
const { getDb } = require("../config/db");
const { ObjectId } = require("mongodb");

function checkAccess(requiredRole) {
  return async function (req, res, next) {
    try {
      const db = getDb();
      const Admin = db.collection("admin");

      // req.user._id should come from login/session/JWT
      const admin = await Admin.findOne({ _id: new ObjectId(req.user._id) });

      if (!admin) {
        return res.status(403).json({ message: "Admin not found" });
      }

      // SUPERIOR → full access
      if (admin.role.toUpperCase() === "SUPERIOR") {
        return next();
      }

      // Department admin → only allowed if required role = DEPARTMENT
      if (requiredRole === "DEPARTMENT" && admin.role.toUpperCase() === "DEPARTMENT") {
        return next();
      }

      // Club admin → allowed only for CLUB role
      if (requiredRole === "CLUB" && admin.role.toUpperCase() === "CLUB") {
        // Optional: also check clubName match with route param
        if (req.params.clubName && admin.clubName && req.params.clubName !== admin.clubName) {
          return res.status(403).json({ message: "Access denied to this club" });
        }
        return next();
      }

      // If role mismatch → deny
      return res.status(403).json({ message: "Access denied" });
    } catch (error) {
      console.error("Access check error:", error);
      return res.status(500).json({ message: "Server error in access check" });
    }
  };
}

module.exports = { checkAccess };
