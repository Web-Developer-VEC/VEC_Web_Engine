const { hashPassword, comparePassword } = require("../middlewares/bcrypt");
const { generateToken } = require("../middlewares/jwt");
const { getAdminDb } = require("../../main-backend/config/db");
const { roleRoutes } = require("../models/role_response_models"); 
const crypto = require("crypto");
const { sendOtpEmail } = require("../services/send_mail.service");
const bcrypt = require("bcryptjs");
require("dotenv").config();

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





const forgotpassword = async (req, res) => {
  try {
    const db = getAdminDb();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await db
      .collection("admins")
      .findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(1000, 10000).toString();

    const hashedOtp = crypto
      .createHmac("sha256", process.env.OTP_SECRET)
      .update(otp)
      .digest("hex");

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.collection("admins").updateOne(
      { email: normalizedEmail },
      {
        $set: {
          resetOtp: hashedOtp,
          resetOtpExpiry: otpExpiry,
        },
      },
    );

    await sendOtpEmail({
      to: normalizedEmail,
      otp,
    });

    res.status(200).json({
      message: "OTP sent to email successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server error",
    });
  }
};

const otpValidation = async (req, res) => {
  try {
    const { email, otp } = req.body;
     const db = getAdminDb();

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and otp is required",
      });
    }


    const normalizedEmail = email.toLowerCase();

    const hashedOtp = crypto
      .createHmac("sha256", process.env.OTP_SECRET)
      .update(otp)
      .digest("hex");

    const user = await db.collection("admins").findOne({
      email: normalizedEmail,
      resetOtp: hashedOtp,
      resetOtpExpiry: { $gt: new Date() },
    });
    


    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    await db.collection("admins").updateOne(
      { email: normalizedEmail },
      {
        $unset: {
          resetOtp: "",
          resetOtpExpiry: "",
        },
      },
    );

    res.status(200).json({
      message: "Otp is validated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const db = getAdminDb();
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Email and  password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 8 && newPassword.length > 12) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await db.collection("admins").findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.collection("admins").updateOne(
      { email: normalizedEmail },
      {
        $set: {
          password: hashedPassword,
        },
      },
    );

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = { signup, login, forgotpassword, resetPassword, otpValidation,};
