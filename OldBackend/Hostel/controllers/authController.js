const { getDb } = require('../config/db');
const bcrypt = require('bcrypt');
const { sendOTPForForgetPassword } = require('../services/sendSMS')

async function Login (req, res) {
    try {
        const db = getDb();
        const { registration_number, password, type } = req.body;
        if (!registration_number || !password || !type) {
            return res.status(400).json({ error: "All fields (registration_number, password, type) are required" });
        }
        let collectionName;
        if (type === "student") {
            collectionName = "student_database";
            query = { registration_number };
        } else if (type === "warden") {
            collectionName = "warden_database";
            query = { unique_id: registration_number , category : "assistant" };
        } else if (type === "superior") {
            collectionName = "warden_database";
            query = { unique_id: registration_number , category : "head" };
        } else if (type === "security") {
            collectionName = "security_database";
            query = { unique_id: registration_number };
        } else {
            return res.status(400).json({ error: "Invalid user type" });
        }
        const collection = db.collection(collectionName);
        const user = await collection.findOne(query);
        if (!user) {
            return res.status(404).json({ error: 'User Not Found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        req.session.studentauth = false;
        req.session.wardenauth = false;
        req.session.superiorauth = false;
        if (type === "student") {
            req.session.studentauth = true;
        } else if (type === "warden") {
            req.session.wardenauth = true;
        } else if (type === "superior") {
            req.session.superiorauth = true;
        } else if (type === "security") {
            req.session.securityauth = true;
        }
        req.session.unique_number = registration_number;
        res.status(200).json({ 
            message: 'Sign-in successful', 
            user: {
                userid: user.userid,
                name: user.name,
                type
            },
            redirect:`/hostel/${type}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

function Logout (req, res) {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: "Failed to log out" });
            }
            res.clearCookie('connect.sid');
            return res.json({ message: "Logged out successfully", redirect: "/hostel/login" });
        });
    } else {
        return res.status(400).json({ error: "No active session" });
    }
}

async function sendOTP (req, res) {
    try {
        const db = getDb();
        const { warden_id } = req.body;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });
        if (!warden_data) {
            return res.status(404).json({ error: "Warden not found" });
        }
        await sendOTPForForgetPassword(warden_data.phone_number, warden_data.warden_name, req);

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function validateOTP (req, res) {
    try {
        const { otp } = req.body;
        if (!req.session.otp || !req.session.otpExpires) {
            return res.status(400).json({ error: "OTP not found or expired" });
        }
        if (Date.now() > req.session.otpExpires) {
            delete req.session.otp;
            delete req.session.otpExpires;
            return res.status(400).json({ error: "OTP has expired" });
        }

        if (otp !== req.session.otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        delete req.session.otp;
        delete req.session.otpExpires;

        res.status(200).json({ message: "OTP validated successfully" , redirect : '/chnage_password' });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function setNewPassword (req, res) {
    try {
        const { new_password } = req.body;

        if (!new_password || new_password.length < 4) {
            return res.status(400).json({ error: "Password must be at least 4 characters long" });
        }
        const hashedPassword = await bcrypt.hash(new_password, 10);

        await client.connect();
        const db = client.db(dbName);
        const warden_id = req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const updateResult = await wardenCollection.updateOne(
            { registration_number: warden_id },
            { $set: { password: hashedPassword } }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({ error: "Failed to update password. Warden not found or same password used." });
        }

        res.status(200).json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error" });

    }
}

async function DeleteWarden_Student (req, res) {
    const { registration_number, type } = req.body;

    if (!registration_number) {
        return res.status(400).json({ error: "Registration number is required" });
    }

    try {
        const db = getDb();
        const studentDatabase = db.collection("student_database");
        const wardenCollection = db.collection("warden_database");

        let result;

        if (type === "student") {
            result = await studentDatabase.deleteOne({ registration_number });
        } else if (type === "warden") {
            result = await wardenCollection.deleteOne({ unique_id: registration_number });
        } else {
            return res.status(400).json({ error: "Invalid type. Must be 'student' or 'warden'." });
        }

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "No record found with the given registration number." });
        }

        res.status(200).json({ message: `${type} record deleted successfully.` });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { 
    Login,
    Logout,
    sendOTP,
    validateOTP,
    setNewPassword,
    DeleteWarden_Student
}