const { getDb } = require("../../config/db");

async function coelogin(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("coelogin");

    const { username, password } = req.body;

    // Find user
    const admin = await collection.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check password
    if (admin.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ------ CREATE SESSION ------
    req.session.username = admin.username;
    req.session.userId = admin._id;

    // Success
    return res.json({
      message: "login success",
      session: req.session.username
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}


// ======================================================
// 🔒 SECURITY CHECK FUNCTION
// Checks if session user matches allowed users
// ======================================================
async function coeloginsecuritycheck(req, res, next) {
  try {
    // If no session
    if (!req.session || !req.session.username) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    // Allowed usernames
    const allowedUsers = ["hari","coeadmin", "superadmin"];

    // Check if the session user is allowed
    if (!allowedUsers.includes(req.session.username)) {
      return res.status(403).json({
        message: "Forbidden: You are not allowed",
        user: req.session.username
      });
    }

    // Everything OK → continue to next middleware/controller
    next();

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}


module.exports = { coelogin, coeloginsecuritycheck };
