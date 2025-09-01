const AdminModel = require("../models/admin_models");
const { hashPassword, comparePassword } = require("../middlewares/bcrypt");
const { generateToken } = require("../middlewares/jwt");

// 🔹 Signup Controller
async function signup(req, res) {
    try {
        const { name, role, email, password, phone_no } = req.body;

        // check if exists
        const existingAdmin = await AdminModel.findByEmail(email);
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // hash and save
        const hashedPassword = await hashPassword(password);
        await AdminModel.createAdmin({
            name,
            role,
            email,
            password: hashedPassword,
            phone_no
        });

        res.status(201).json({ message: "Signup successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

// 🔹 Login Controller (with session)
async function login(req, res) {
    try {
        
        const { email, password } = req.body;

        const admin = await AdminModel.findByEmail(email);
        
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const isMatch = await comparePassword(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        
        const token = generateToken({ id: admin._id, email: admin.email, role: admin.role });

        // 🔹 Server-side session
        req.session.admin = {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            phone_no: admin.phone_no,
            token
        };

        // 🔹 Send response with data 
        res.json({
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone_no: admin.phone_no
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

module.exports = { signup, login };
