const { getAdminDb } = require("../../main-backend/config/db");

async function authMiddleware(req, res, next) {
  try {
    if (!req.session?.admin) {
      return res.status(401).json({
        error: "Unauthenticated user request! Login again."
      });
    }
    
    const email = req.session?.admin?.email;
    if (!email) return res.status(401).json({ error: "No email provided" });

    const db = getAdminDb();
    const admin = await db.collection("admins").findOne({ email });
    if (!admin) return res.status(401).json({ error: "Invalid admin" });

    req.session.admin = {
      id: admin._id,
      name: admin.name,
      role: admin.role,
      email: admin.email,
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


module.exports = authMiddleware;
