const { hashPassword, comparePassword } = require("../middlewares/bcrypt");
const { generateToken } = require("../middlewares/jwt");
const { getAdminDb } = require("../../main-backend/config/db");
const { roleRoutes } = require("../models/role_response_models"); 

// 🔹 Signup
async function signup(req, res) {
  try {
    const db = getAdminDb();
    const collection = db.collection("admins");

    const { name, role, email, password, phone_no } = req.body;

    // check if exists
    const existingAdmin = await collection.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // assign routes based on role
    const routes = roleRoutes[role] || [];

    // save admin
    await collection.insertOne({
      name,
      role,
      email,
      password: hashedPassword,
      phone_no,
      routes,
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// 🔹 Login
async function login(req, res) {
  try {
    const db = getAdminDb();
    const collection = db.collection("admins");

    const { email, password } = req.body;

    const admin = await collection.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    // attach session
    req.session.admin = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      phone_no: admin.phone_no,
      routes: admin.routes || roleRoutes[admin.role] || [],
      token,
    };

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone_no: admin.phone_no,
        routes: admin.routes || roleRoutes[admin.role] || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { signup, login };
