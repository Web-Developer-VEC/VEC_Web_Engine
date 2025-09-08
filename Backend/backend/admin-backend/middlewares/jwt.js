const jwt = require("jsonwebtoken");
require('dotenv').config();

// Use your own secret key in production (store in env variables)
const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_EXPIRES_IN = "1d"; // token valid for 1 day

// 🔹 Generate JWT Token
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
module.exports = { generateToken}