const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const twilio = require('twilio');
const moment = require("moment");
require("moment-timezone");
const multer = require('multer');
const cron = require("node-cron");

const app = express();
const port = process.env.PORT || 6000;

const storagePath = 'D:/Velammal-Engineering-College-Backend/static/student_docs';
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}
const storagePath1 = 'D:/Velammal-Engineering-College-Backend/static/images/warden_profile_images';
if (!fs.existsSync(storagePath1)) {
    fs.mkdirSync(storagePath1, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, storagePath);
    },
    filename: function (req, file, cb) {
        if (!req.session || !req.session.unique_number) {
            return cb(new Error("Session unique_number is missing"));
        }

        const uniqueNumber = req.session.unique_number;
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const extension = path.extname(file.originalname);
        const filename = `${date}-${uniqueNumber}${extension}`;

        cb(null, filename);
    }
});

const upload = multer({ storage: storage });
app.use(express.json());

app.use(
    session({
        secret: '12345678',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const client = new MongoClient(mongoUri);
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const twilioPhoneNumber = process.env.TWILIOPHONENUMBER;
const twilioClient = twilio(accountSid, authToken);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
    }
}
connectToDatabase();

//function to generate QR
async function generateQR(pass_id, registration_number) {
    try {
        const baseDir = 'D:/Velammal-Engineering-College-Backend/static/qrcodes'; // Dont forget to change this base dir
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }
        const filePath = path.join(baseDir, `${registration_number}.jpeg`);

        await QRCode.toFile(filePath, pass_id, {
            type: 'jpeg',
            width: 300,
            errorCorrectionLevel: 'H'
        });

        return filePath;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

// Function to send SMS
const sendParentApprovalSMS = async (parentPhoneNumber, name, place_to_visit, reason_for_visit, from, to, pass_id) => {
    const approvalUrl = `http://localhost:5000/api/parent_accept/${pass_id}`;
    const rejectionUrl = `http://localhost:5000/api/parent_not_accept/${pass_id}`;    
    const smsMessage = `
    📢 Pass Request Notification

    ${name}, a student of Velammal Engineering College,  
    has requested a pass to visit **${place_to_visit}**  
    for the reason: **${reason_for_visit}**.  

    📅 Duration: ${from} ➝ ${to}  

    Please review and take action:  
    ✅ Approve: ${approvalUrl}  
    ❌ Reject: ${rejectionUrl}  
    `;

    try {
        await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: parentPhoneNumber
        });
        console.log("✅ SMS sent successfully to parent");
    } catch (error) {
        console.error("❌ Error sending SMS:", error);
        throw new Error("Failed to send SMS");
    }
};

// Function to send "Reached" SMS to parent
const sendParentReachedSMS = async (parentPhoneNumber, name, reachedTime) => {  
    const smsMessage = `
    📢 Arrival Notification  

    Dear Parent,  

    Your ward **${name}** has safely returned to the hostel.  

    🏡 **Hostel Arrival Time:** ${reachedTime}  

    Thank you,  
    Velammal Engineering College  
    `;
    try {
        await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: parentPhoneNumber
        });
        console.log(`✅ SMS sent successfully to parent of ${name}`);
    } catch (error) {
        console.error("❌ Error sending SMS:", error);
        throw new Error("Failed to send SMS");
    }
};

const sendOTPForForgetPassword = async (warden_number, name , req) => {  
    const otp = Math.floor(100000 + Math.random() * 900000);
    req.session.otp = JSON.stringify(otp);
    req.session.otpExpires = Date.now() + 5 * 60 * 1000;
    const smsMessage = `
    🔐 Password Reset OTP  

    Dear ${name},  

    Your One-Time Password (OTP) for resetting your password is: **${otp}**  

    ⏳ This OTP is valid for 5 minutes. Do not share it with anyone.  

    Thank you,  
    Velammal Engineering College  
    `;

    try {
        await twilioClient.messages.create({
            body: smsMessage,
            from: twilioPhoneNumber,
            to: warden_number
        });
        console.log(`OTP sent successfully to ${name}`);
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
    }
};

//cron job for food request updation
cron.schedule("0 * * * *", async () => {
    console.log("Checking for pending food type updates...");

    try {
        await client.connect();
        const db = client.db(dbName);
        const studentsCollection = db.collection('student_database');
        const cronCollection = db.collection('cronCollection');

        const nowUTC = new Date();
        const nowIST = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000));

        const pendingUpdates = await cronCollection.find({ updation_time: { $lte: nowIST } }).toArray();

        if (pendingUpdates.length === 0) {
            console.log("No pending food type updates at this time.");
            return;
        }

        for (const update of pendingUpdates) {
            const { registration_number, name, foodtype } = update;
            const result = await studentsCollection.updateOne(
                { registration_number },
                { $set: { foodtype } }
            );

            if (result.modifiedCount > 0) {
                console.log(`Successfully updated food type for ${name} (${registration_number}) to ${foodtype}.`);
            } else {
                console.log(`No matching student found for ${name} (${registration_number}).`);
            }
            await cronCollection.deleteOne({ registration_number, name });
        }

        console.log("Food type update process completed.");
    } catch (error) {
        console.error("Error running cron job:", error);
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
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
            redirect:`/${type}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Verify Student using mobile number
app.post('/api/verify_student', async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const db = client.db(dbName);
    const usersCollection = db.collection('student_database');
    const { phone_number_student } = req.body;
    const unique_id = req.session.unique_number;
    const user_valid = await usersCollection.findOne({registration_number : unique_id });
    if (!user_valid) {
        return res.status(401).json({ error: "Couldn't Find the User data" });
    }
    if (user_valid.phone_number_student !== phone_number_student) {
        return res.status(401).json({ error: "Enter Valid Mobile number" });
    }
    try {
        const user = await usersCollection.findOne({ phone_number_student: String(phone_number_student) });
        if (!user) {
            return res.status(404).json({ message: "No users Found for that Number" });
        }

        res.status(200).json({
            name: user.name,
            phone_number_student: user.phone_number_student,
            year: user.year,
            gender : user.gender,
            department: user.department,
            room_number: user.room_number,
            registration_number: user.registration_number,
            block_name: user.block_name,
            vacate_status : user.vacate_status
        });

    } catch (error) {
        console.error("❌ Error verifying mobile number:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to submit pass for parent approval request
app.post('/api/submit_pass_parent_approval', upload.single('file'), async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const PassCollection = db.collection('pass_details');
        const studentDatabase = db.collection('student_database');

        const {
            mobile_number, name, department_name, year, room_no, registration_number,
            block_name, pass_type, from, to, place_to_visit,
            reason_type, reason_for_visit
        } = req.body;

        if (!mobile_number) {
            return res.status(400).json({ error: "Mobile number is required" });
        }

        const student = await studentDatabase.findOne({ phone_number_student: mobile_number });

        if (!student) {
            return res.status(404).json({ error: "Student record not found" });
        }

        const parentPhoneNumber = student.phone_number_parent;
        const gender = student.gender;
        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (fromDate < new Date()) {
            return res.status(400).json({ error: "From date cannot be in the past" });
        }

        if (toDate < new Date()) {
            return res.status(400).json({ error: "To date cannot be in the past" });
        }

        if (toDate < fromDate) {
            return res.status(400).json({ error: "To date cannot be earlier than From date" });
        }

        const toHours = toDate.getUTCHours();
        const toMinutes = toDate.getUTCMinutes();
        const totalToMinutes = toHours * 60 + toMinutes;

        const maleTimeLimit = 21 * 60 + 30;
        const femaleTimeLimit = 18 * 60;

        if (pass_type.toLowerCase() === "outpass") {
            if (gender === "Male" && totalToMinutes > maleTimeLimit) {
                return res.status(400).json({ error: "For male students, outpass 'To' time cannot be later than 21:30 (9:30 PM)" });
            }
            if (gender === "Female" && totalToMinutes > femaleTimeLimit) {
                return res.status(400).json({ error: "For female students, outpass 'To' time cannot be later than 18:00 (6:00 PM)" });
            }
        }

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const activePassCount = await PassCollection.countDocuments({
            mobile_number,
            request_completed: false,
            expiry_status: false,
            request_time: { $gte: currentDate, $lt: nextDate }
        });

        if (activePassCount >= 3) {
            return res.status(400).json({ error: "Maximum of 3 active passes allowed per student for today" });
        }

        let file_path = null;
        if (req.file) {
            file_path = `/Velammal-Engineering-College-Backend/static/student_docs/${req.file.filename}`;
        }
        const yearInt = parseInt(year, 10);
        const pass_id = uuidv4();

        const PassData = {
            pass_id,
            name,
            mobile_number,
            dept: department_name,
            year: yearInt,
            room_no,
            profile_image: student.profile_photo_path,
            registration_number,
            gender,
            late_count: student.late_count,
            blockname: block_name,
            passtype: pass_type,
            from: fromDate,
            to: toDate,
            place_to_visit,
            reason_type,
            reason_for_visit,
            file_path,
            qrcode_path: null,
            parent_approval: null,
            wardern_approval: null,
            superior_wardern_approval: null,
            parent_sms_sent_status: false,
            qrcode_status: false,
            exit_time: null,
            re_entry_time: null,
            delay_status: false,
            request_completed: false,
            request_time: new Date(),
            expiry_status: false,
            request_date_time: new Date(),
            authorised_Security_id: null,
            authorised_warden_id: null,
            notify_superior: false,
            comment: null
        };
        await studentDatabase.updateOne(
            { registration_number : req.session.unique_number },
            { $set: { transit_status: false } }
        );

        await PassCollection.insertOne(PassData);
        await sendParentApprovalSMS(parentPhoneNumber, name, place_to_visit, reason_for_visit, from, to, pass_id);
        await PassCollection.updateOne(
            { pass_id },
            { $set: { parent_sms_sent_status: true } }
        );

        res.status(201).json({ message: "Visitor pass submitted and SMS sent to parent", file_path });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to submit pass with warden and superior approval request
app.post('/api/submit_pass_warden_approval', upload.single('file'), async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const PassCollection = db.collection('pass_details');
        const studentDatabase = db.collection('student_database');

        const {
            mobile_number, name, department_name, year, room_no, registration_number,
            block_name, pass_type, from, to, place_to_visit,
            reason_type, reason_for_visit, notify_superior 
        } = req.body;

        if (!mobile_number) {
            return res.status(400).json({ error: "Mobile number is required" });
        }

        const student = await studentDatabase.findOne({ phone_number_student: mobile_number });

        if (!student) {
            return res.status(404).json({ error: "Student record not found" });
        }

        const gender = student.gender;
        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (fromDate < new Date()) {
            return res.status(400).json({ error: "From date cannot be in the past" });
        }

        if (toDate < new Date()) {
            return res.status(400).json({ error: "To date cannot be in the past" });
        }

        if (toDate < fromDate) {
            return res.status(400).json({ error: "To date cannot be earlier than From date" });
        }

        const toHours = toDate.getUTCHours();
        const toMinutes = toDate.getUTCMinutes();
        const totalToMinutes = toHours * 60 + toMinutes;

        const maleTimeLimit = 21 * 60 + 30;
        const femaleTimeLimit = 18 * 60;

        if (pass_type.toLowerCase() === "outpass") {
            if (gender === "Male" && totalToMinutes > maleTimeLimit) {
                return res.status(400).json({ error: "For male students, outpass 'To' time cannot be later than 21:30 (9:30 PM)" });
            }

            if (gender === "Female" && totalToMinutes > femaleTimeLimit) {
                return res.status(400).json({ error: "For female students, outpass 'To' time cannot be later than 18:00 (6:00 PM)" });
            }
        }

        const activePassCount = await PassCollection.countDocuments({
            mobile_number,
            request_completed: false,
            expiry_status: false,
            request_time: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) }
        });

        if (activePassCount >= 3) {
            return res.status(400).json({ error: "Maximum of 3 active passes allowed per student for today" });
        }

        let file_path = null;
        if (req.file) {
            file_path = `/Velammal-Engineering-College-Backend/static/student_docs/${req.file.filename}`;
        }

        const yearInt = parseInt(year, 10);
        const pass_id = uuidv4();

        const PassData = {
            pass_id,
            name,
            mobile_number,
            dept: department_name,
            year: yearInt,
            room_no,
            registration_number,
            profile_image: student.profile_photo_path,
            gender,
            late_count: student.late_count,
            blockname: block_name,
            passtype: pass_type,
            from: fromDate,
            to: toDate,
            place_to_visit,
            reason_type,
            reason_for_visit,
            file_path,
            qrcode_path: null,
            parent_approval: null,
            wardern_approval: null,
            superior_wardern_approval: null,
            parent_sms_sent_status: false,
            qrcode_status: false,
            exit_time: null,
            re_entry_time: null,
            delay_status: false,
            request_completed: false,
            request_time: new Date(),
            expiry_status: false,
            request_date_time: new Date(),
            authorised_Security_id: null,
            authorised_warden_id: null,
            notify_superior: notify_superior === true,
            comment: null
        };
        await studentDatabase.updateOne(
            { registration_number : req.session.unique_number },
            { $set: { transit_status: false } }
        );

        await PassCollection.insertOne(PassData);
        res.status(201).json({ message: "Visitor pass submitted and Notified Warden", file_path });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Save draft endpoint
app.post('/api/save_draft', upload.single('file'), async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const DraftsCollection = db.collection('drafts_details');
        const studentDatabase = db.collection('student_database');

        const {
            mobile_number, name, department_name, year, room_no, registration_number,
            block_name, pass_type, from, to, place_to_visit,
            reason_type, reason_for_visit
        } = req.body;

        if (!mobile_number) {
            return res.status(400).json({ error: "Mobile number is required" });
        }

        const student = await studentDatabase.findOne({ phone_number_student: mobile_number });

        if (!student) {
            return res.status(404).json({ error: "Student record not found" });
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);
        const currentDate = new Date();

        if (fromDate < currentDate) {
            return res.status(400).json({ error: "From date cannot be in the past" });
        }

        if (toDate < currentDate) {
            return res.status(400).json({ error: "To date cannot be in the past" });
        }

        if (toDate < fromDate) {
            return res.status(400).json({ error: "To date cannot be earlier than From date" });
        }

        const toHours = toDate.getHours();
        const toMinutes = toDate.getMinutes();
        const totalToMinutes = toHours * 60 + toMinutes;

        const maleTimeLimit = 21 * 60 + 30;
        const femaleTimeLimit = 18 * 60;

        if (pass_type.toLowerCase() === "outpass") {
            if (student.gender === "Male" && totalToMinutes > maleTimeLimit) {
                return res.status(400).json({ error: "For male students, outpass 'To' time cannot be later than 21:30 (9:30 PM)" });
            }

            if (student.gender === "Female" && totalToMinutes > femaleTimeLimit) {
                return res.status(400).json({ error: "For female students, outpass 'To' time cannot be later than 18:00 (6:00 PM)" });
            }
        }

        let file_path = null;
        if (req.file) {
            file_path = `/Velammal-Engineering-College-Backend/static/student_docs/${req.file.filename}`;
        }

        const existingDraft = await DraftsCollection.findOne({ registration_number });
        const yearInt = parseInt(year, 10);

        const PassData = {
            pass_id: existingDraft ? existingDraft.pass_id : uuidv4(),
            name,
            mobile_number,
            dept: department_name,
            year: yearInt,
            room_no,
            registration_number,
            gender: student.gender,
            profile_image: student.profile_photo_path,
            late_count: student.late_count,
            blockname: block_name,
            passtype: pass_type,
            from: fromDate,
            to: toDate,
            place_to_visit,
            reason_type,
            reason_for_visit,
            file_path,
            qrcode_path: null,
            parent_approval: null,
            wardern_approval: null,
            superior_wardern_approval: null,
            parent_sms_sent_status: false,
            qrcode_status: false,
            exit_time: null,
            re_entry_time: null,
            delay_status: false,
            request_completed: false,
            request_time: new Date(),
            expiry_status: false,
            request_date_time: new Date(),
            authorised_Security_id: null,
            authorised_warden_id: null,
            comment: null
        };

        if (existingDraft) {
            await DraftsCollection.updateOne(
                { registration_number },
                { $set: PassData }
            );
            return res.status(200).json({ message: "Draft updated successfully" });
        } else {
            await DraftsCollection.insertOne(PassData);
            return res.status(201).json({ message: "Visitor pass saved in the draft" });
        }

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//Students Fetch drafts
app.post('/api/fetch_drafts', async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const DraftsCollection = db.collection("drafts_details");

        const registration_number = req.session.unique_number;
        if (!registration_number) {
            return res.status(400).json({ error: "Registration number is required" });
        }

        const drafts_details = await DraftsCollection.find({ registration_number }).toArray();

        if (!drafts_details || drafts_details.length === 0) {
            return res.status(404).json({ message: "No drafts found for this registration number" });
        }

        res.status(200).json({ drafts: drafts_details });

    } catch (error) {
        console.error("❌ Error fetching drafts:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

//parent Accept Endpoint
app.post('/api/parent_accept/:pass_id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection('pass_details');
        const { pass_id } = req.params;
        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        const passData = await passCollection.findOne({ pass_id: pass_id });

        if (!passData) {
            return res.status(404).json({ error: "Pass not found" });
        }
        if (passData.parent_approval !== null) {
            return res.status(400).json({
                message: `You have already ${passData.parent_approval ? "approved" : "rejected"} this request. If you haven't approved this request, please contact the warden.`,
            });
        }
        await passCollection.updateOne(
            { pass_id: pass_id },
            { $set: { parent_approval: true } }
        );
        res.status(200).json({ message: "Parent approval updated successfully" });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//parent Decline Endpoint
app.post('/api/parent_not_accept/:pass_id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection('pass_details');
        const { pass_id } = req.params;
        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        const passData = await passCollection.findOne({ pass_id: pass_id });

        if (!passData) {
            return res.status(404).json({ error: "Pass not found" });
        }
        if (passData.parent_approval !== null) {
            return res.status(400).json({
                message: `You have already ${passData.parent_approval ? "approved" : "rejected"} this request. If you haven't approved this request, please contact the warden.`,
            });
        }
        await passCollection.updateOne(
            { pass_id: pass_id },
            { $set: { parent_approval: false } }
        );
        res.status(200).json({ message: "Parent rejection updated successfully" });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//student request for food type change
app.post('/api/change_food_type', async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    const registration_number = req.session.unique_number;
    const db = client.db(dbName);
    const studentsCollection = db.collection('student_database');
    const requestsCollection = db.collection('food_change_requests');
    const wardensCollection = db.collection('warden_database');

    try {
        const student = await studentsCollection.findOne({ registration_number });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const newFoodType = student.foodtype === 'Veg' ? 'Non-Veg' : 'Veg';

        let warden = await wardensCollection.findOne({ 
            primary_year: { $in: [student.year] }, 
            gender: student.gender,
            active: true 
        });
        
        if (!warden) {
            warden = await wardensCollection.findOne({ 
                secondary_year: { $in: [student.year] }, 
                gender: student.gender,
                active: true 
            });
        }        
        if (!warden) {
            return res.status(403).json({ message: 'No active warden found for this student year' });
        }

        await requestsCollection.insertOne({ 
            registration_number, 
            name : student.name,
            previous_foodtype: student.foodtype,
            requested_foodtype: newFoodType, 
            room_number: student.room_number,
            department: student.department,
            gender: student.gender,
            status: null,
            year: student.year, 
            assigned_warden: warden.warden_name
        });
        await studentsCollection.updateOne(
            { registration_number },
            { 
                $set: { edit_status: null },
                $push: {
                    changes: `food_type: ${newFoodType}`
                }
            }
        );        

        res.status(200).json({ message: 'Request submitted for approval', requested_foodtype: newFoodType });
    } catch (error) {
        console.error('❌ Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Warden fetches pending food requests
app.get('/api/food_requests_changes', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        const unique_id = req.session.unique_number;

        if (!unique_id) {
            return res.status(400).json({ error: "warden_unique_id is required" });
        }

        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection('warden_database');
        const requestsCollection = db.collection('food_change_requests');

        const warden = await wardenCollection.findOne({ unique_id , active:true });

        if (!warden) {
            return res.status(404).json({ error: "Warden not found" });
        }

        const primary_years = warden.primary_year;
        const warder_handling_gender = warden.gender;
        const requests = await requestsCollection.find({ year: { $in: primary_years } , gender: warder_handling_gender }).toArray();

        res.status(200).json({ requests });
    } catch (error) {
        console.error('❌ Error fetching requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Warden approves or declines the request
app.post('/api/approve_food_change', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const { registration_number, name, action } = req.body;
    const db = client.db(dbName);
    const studentsCollection = db.collection('student_database');
    const requestsCollection = db.collection('food_change_requests');
    const cronCollection = db.collection('cronCollection');

    try {
        const request = await requestsCollection.findOne({ registration_number, name });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        let updateMessage = 'Food type change request declined';
        const currentTime = new Date();
        const istTime = new Date(currentTime.getTime() + (5.5 * 60 * 60 * 1000));
        const updateTimeIST = new Date(istTime.getTime() + (24 * 60 * 60 * 1000));

        if (action === "approve") {
            await cronCollection.insertOne({
                registration_number,
                name,
                foodtype: request.requested_foodtype,
                updation_time: updateTimeIST,
            });

            updateMessage = `Food type change approved. It will be effective on ${updateTimeIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.`;
        }
        await requestsCollection.deleteOne({ registration_number, name });
        const student = await studentsCollection.findOne({ registration_number });
        const changesArray = student?.changes || [];

        const hasOtherChanges = changesArray.some(change =>
            ["name:", "room_number:", "phone_number_student:", "phone_number_parent:"].some(key => change.includes(key))
        );
        let editStatus = hasOtherChanges ? null : action === "approve" ? true : false;

        await studentsCollection.updateOne(
            { registration_number },
            {
                $set: { edit_status: editStatus },
                $pull: { changes: { $regex: `^food_type: ` } }
            }
        );

        return res.status(200).json({
            message: updateMessage,
            newFoodType: action === "approve" ? request.requested_foodtype : undefined,
            effectiveDate: action === "approve" ? updateTimeIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : undefined
        });

    } catch (error) {
        console.error('❌ Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Requesting for profile update
app.post('/api/request_profile_update', async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        const { phone_number_student, phone_number_parent , name } = req.body;

        await client.connect();
        const db = client.db(dbName);
        const studentCollection = db.collection('student_database');
        const tempRequestCollection = db.collection('profile_change_requests');
        const registration_number = req.session.unique_number;
        const profile = await studentCollection.findOne({ registration_number });
        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }
        const fromData = {
            name: profile.name,
            phone_number_student: profile.phone_number_student,
            phone_number_parent: profile.phone_number_parent
        };
        const toData = {
            name: name || profile.name,
            phone_number_student: phone_number_student || profile.phone_number_student,
            phone_number_parent: phone_number_parent || profile.phone_number_parent
        };
        const changes = [];
        for (const key in fromData) {
            if (fromData[key] !== toData[key]) {
                changes.push(`${key}: ${toData[key]}`);
            }
        }
        const updateRequest = {
            registration_number,
            name: toData.name,
            room_number: profile.room_number,
            year:profile.year,
            department: profile.department,
            phone_number_student: toData.phone_number_student,
            phone_number_parent: toData.phone_number_parent,
            from_data: fromData,
            to_data: toData,
            edit_status: null,
            created_at: new Date(),
            gender: profile.gender
        };
        await tempRequestCollection.insertOne(updateRequest);
        await studentCollection.updateOne(
            { registration_number },
            { 
                $set: { edit_status: null },
                $push: { changes: { $each: changes } }
            }
        );

        res.json({
            message: "Profile update requested. Waiting for approval from wardens.",
            request: updateRequest
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//Superior wardern fetch for profile change requests
app.get('/api/profile_request_changes', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        const unique_id = req.session.unique_number;
        if (!unique_id) {
            return res.status(400).json({ error: "warden_unique_id is required" });
        }

        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection('warden_database');
        const requestsCollection = db.collection('profile_change_requests');

        const warden = await wardenCollection.findOne({ unique_id , active:true });

        if (!warden) {
            return res.status(404).json({ error: "Warden not found" });
        }

        const primary_year = warden.profile_years;
        const requests = await requestsCollection.find({ year: { $in: primary_year } }).toArray();

        res.status(200).json({ requests });
    } catch (error) {
        console.error('❌ Error fetching requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Superior Warden Profile Update Handling
app.post('/api/handle_request', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    const unique_id = req.session.unique_number;
    try {
        const { registration_number, action } = req.body;
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection('warden_database');
        const studentCollection = db.collection('student_database');
        const tempRequestCollection = db.collection('profile_change_requests');
        const warden = await wardenCollection.findOne({ unique_id });
        if (!warden) {
            return res.status(404).json({ error: "Warden not found" });
        }
        const updateRequest = await tempRequestCollection.findOne({ registration_number });
        if (!updateRequest) {
            return res.status(404).json({ error: "Request not found" });
        }

        const student = await studentCollection.findOne({ registration_number });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        const changesArray = student?.changes || [];
        const hasFoodTypeChange = changesArray.some(change => /^food_type: /.test(change));
        if (action === "approve") {
            await studentCollection.updateOne(
                { registration_number: updateRequest.registration_number },
                {
                    $set: {
                        name: updateRequest.name,
                        phone_number_student: updateRequest.phone_number_student,
                        phone_number_parent: updateRequest.phone_number_parent,
                        edit_status: true
                    },
                    $pull: {
                        changes: {
                            $in: [
                                `name: ${updateRequest.name}`,
                                `phone_number_student: ${updateRequest.phone_number_student}`,
                                `phone_number_parent: ${updateRequest.phone_number_parent}`
                            ]
                        }
                    }
                }
            );
            await tempRequestCollection.updateOne(
                { registration_number },
                { $set: { edit_status: true } }
            );
            if (hasFoodTypeChange) {
                await studentCollection.updateOne(
                    { registration_number },
                    { $set: { edit_status: null } }
                );
            }
            res.json({
                message: "Request approved and profile updated",
                approved_by: warden.name
            });
        } else if (action === "reject") {
            await tempRequestCollection.updateOne(
                { registration_number },
                { $set: { edit_status: false } }
            );
            await studentCollection.updateOne(
                { registration_number: updateRequest.registration_number },
                {
                    $set: { edit_status: false },
                    $pull: {
                        changes: {
                            $in: [
                                `name: ${updateRequest.name}`,
                                `phone_number_student: ${updateRequest.phone_number_student}`,
                                `phone_number_parent: ${updateRequest.phone_number_parent}`
                            ]
                        }
                    }
                }
            );
            if (hasFoodTypeChange) {
                await studentCollection.updateOne(
                    { registration_number },
                    { $set: { edit_status: null } }
                );
            }
            res.json({
                message: "Request rejected",
                rejected_by: warden.name
            });
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }
        await tempRequestCollection.deleteOne({ registration_number });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//fetch student profiles for warden
app.get('/api/get_student_details', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    let clientInstance;
    try {
        const warden_unique_id = req.session.unique_number;
        clientInstance = await client.connect();
        const db = clientInstance.db(dbName);
        const wardenCollection = db.collection("warden_database");
        const studentCollection = db.collection("student_database");
        const passCollection = db.collection("pass_details");

        const warden = await wardenCollection.findOne({ unique_id: warden_unique_id });

        if (!warden) {
            return res.status(404).json({ error: "Warden not found" });
        }
        if (!warden.primary_year) {
            return res.status(400).json({ error: "Warden primary year not found" });
        }

        const student_data = await studentCollection.find({
            year: { $in: warden.primary_year },
            gender: warden.gender
        }).toArray();

        if (student_data.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        const students_with_pass_data = await Promise.all(student_data.map(async (student) => {
            let pass_info = {
                from: null,
                to: null,
                passtype: null
            };

            if (student.transit_status === true) {
                const pass_data = await passCollection.findOne({
                    registration_number: student.registration_number,
                    request_completed: false
                });

                if (pass_data) {
                    pass_info = {
                        from: pass_data.from,
                        to: pass_data.to,
                        passtype: pass_data.passtype
                    };
                }
            }

            return {
                ...student,
                pass_info
            };
        }));

        res.json({ students: students_with_pass_data });

    } catch (err) {
        console.error("❌ Error fetching student details:", err);
        res.status(500).json({ error: "Server error" });
    } finally {
        if (clientInstance) {
            await clientInstance.close();
        }
    }
});

//fetch all the pending passes for the warden
app.get('/api/fetch_pending_passes_warden', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        const warden_id = req.session.unique_number;
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection("pass_details");
        const wardenCollection = db.collection("warden_database");

        const warden_data = await wardenCollection.findOne({ unique_id : warden_id });
        const warden_primary_year = warden_data.primary_year;
        
        const pendingPasses = await passCollection.find({ 
            request_completed: false,
            expiry_status: false,
            gender : warden_data.gender,
            qrcode_status: false,
            wardern_approval: null,
            superior_wardern_approval: null,
            notify_superior: false,
            parent_approval: { $ne: false},
            year: { $in: warden_primary_year } 
        }).toArray();

        if (pendingPasses.length === 0) {
            return res.status(404).json({ message: "No pending passes found" });
        }
        
        res.json({ pendingPasses });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Warden Accept Endpoint (Updated with Comment Handling)
app.post('/api/warden_accept', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        const warden_unique_id = req.session.unique_number;
        const { pass_id, medical_status, comment } = req.body;
        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection('pass_details');
        const wardenCollection = db.collection('warden_database');

        const warden_data = await wardenCollection.findOne({ unique_id: warden_unique_id });
        if (!warden_data) {
            return res.status(404).json({ error: "Warden not found" });
        }
        const passData = await passCollection.findOne({ pass_id: pass_id });
        if (!passData) {
            return res.status(404).json({ error: "Pass not found" });
        }
        if (passData.wardern_approval !== null) {
            return res.status(400).json({
                message: `The following warden ${passData.authorised_warden_id} has already ${passData.wardern_approval ? "approved" : "rejected"} this request. If you haven't approved this request, please contact the warden.`,
            });
        }
        if (!warden_data.primary_year.includes(passData.year)) {
            return res.status(400).json({ error: "Warden is accessing the wrong year" });
        }

        const student_registration_number = passData.registration_number;
        const qrPath = await generateQR(pass_id, student_registration_number);

        const updateData = {
            wardern_approval: true,
            qrcode_path: qrPath,
            qrcode_status: true,
            authorised_warden_id: warden_unique_id,
        };
        if (medical_status === true) {
            updateData.reason_type = "medical";
        }

        if (comment && typeof comment === "string") {
            updateData.comment = comment;
        }

        await passCollection.updateOne({ pass_id: pass_id }, { $set: updateData });

        res.status(200).json({ 
            message: "Warden approval updated successfully", 
            qrcode_path: qrPath 
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Warden Decline Endpoint (Updated with Comment Handling)
app.post('/api/warden_not_accept', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        const warden_unique_id = req.session.unique_number;
        const { pass_id, comment } = req.body;

        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection('pass_details');
        const wardenCollection = db.collection('warden_database');

        const warden_data = await wardenCollection.findOne({ unique_id: warden_unique_id });
        if (!warden_data) {
            return res.status(404).json({ error: "Warden not found" });
        }
        const passData = await passCollection.findOne({ pass_id: pass_id });
        if (!passData) {
            return res.status(404).json({ error: "Pass not found" });
        }

        if (!warden_data.primary_year.includes(passData.year)) {
            return res.status(400).json({ error: "Warden is accessing the wrong year" });
        }

        if (passData.wardern_approval !== null) {
            return res.status(400).json({
                message: `The following warden ${passData.authorised_warden_id} has already ${passData.wardern_approval ? "approved" : "rejected"} this request. If you haven't approved this request, please contact the warden.`,
            });
        }

        const updateData = {
            wardern_approval: false,
            authorised_warden_id: warden_unique_id,
        };

        if (comment && typeof comment === "string") {
            updateData.comment = comment; 
        }

        await passCollection.updateOne({ pass_id: pass_id }, { $set: updateData });

        res.status(200).json({ message: "Warden rejection updated successfully" });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Superior Warden Accept Endpoint (Updated with Comment)
app.post('/api/superior_accept', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        const superior_unique_id = req.session.unique_number;
        const { pass_id, medical_status, comment } = req.body;

        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection('pass_details');
        const wardenCollection = db.collection('warden_database');

        const superior_data = await wardenCollection.findOne({ unique_id: superior_unique_id });
        if (!superior_data) {
            return res.status(404).json({ error: "Superior Warden not found" });
        }
        const passData = await passCollection.findOne({ pass_id: pass_id });
        if (!passData) {
            return res.status(404).json({ error: "Pass not found" });
        }
        if (passData.superior_wardern_approval !== null) {
            return res.status(400).json({
                message: `You have already ${passData.superior_wardern_approval ? "approved" : "rejected"} this request. If you haven't approved this request, please contact the warden.`,
            });
        }
        const student_registration_number = passData.registration_number;
        const qrPath = await generateQR(pass_id, student_registration_number);

        const updateData = {
            superior_wardern_approval: true,
            qrcode_path: qrPath,
            qrcode_status: true,
            authorised_warden_id: superior_unique_id,
        };

        if (medical_status === true) {
            updateData.reason_type = "medical";
        }

        if (comment && typeof comment === "string") {
            updateData.comment = comment;
        }

        await passCollection.updateOne({ pass_id: pass_id }, { $set: updateData });

        res.status(200).json({ message: "Superior Warden approval updated successfully", qrcode_path: qrPath });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Superior Warden Decline Endpoint (Updated with Comment)
app.post('/api/superior_decline', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        const superior_unique_id = req.session.unique_number;
        const { pass_id, comment } = req.body;

        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection('pass_details');
        const wardenCollection = db.collection('warden_database');

        const superior_data = await wardenCollection.findOne({ unique_id: superior_unique_id });
        if (!superior_data) {
            return res.status(404).json({ error: "Superior Warden not found" });
        }
        const passData = await passCollection.findOne({ pass_id: pass_id });
        if (!passData) {
            return res.status(404).json({ error: "Pass not found" });
        }
        if (passData.superior_wardern_approval !== null) {
            return res.status(400).json({
                message: `You have already ${passData.superior_wardern_approval ? "approved" : "rejected"} this request. If you haven't approved this request, please contact the warden.`,
            });
        }

        const updateData = {
            superior_wardern_approval: false,
            qrcode_path: null,
            qrcode_status: false,
            authorised_warden_id: superior_unique_id,
        };

        if (comment && typeof comment === "string") {
            updateData.comment = comment;
        }

        await passCollection.updateOne({ pass_id: pass_id }, { $set: updateData });

        res.status(200).json({ message: "Superior Warden rejection updated successfully" });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//food type count warden
app.get('/api/food_count_warden', async (req, res) => { 
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const unique_id = req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const studentCollection = db.collection("student_database");

        const warden_data = await wardenCollection.findOne({ unique_id });
        const target_years = warden_data.primary_year;

        let foodCounts = {};

        for (const year of target_years) {
            const vegCount = await studentCollection.countDocuments({ foodtype: "Veg", year , gender:warden_data.gender });
            const nonVegCount = await studentCollection.countDocuments({ foodtype: "Non-Veg", year , gender:warden_data.gender });

            foodCounts[year] = { veg_count: vegCount, non_veg_count: nonVegCount };
        }

        res.json(foodCounts);
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Food Type Count for Superior (Grouped by Gender)
app.get('/api/food_count_superior', async (req, res) => { 
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const studentCollection = db.collection("student_database");
        const genders = ["Male", "Female"];
        const target_years = [1, 2, 3, 4];
        let foodCounts = {};
        for (const gender of genders) {
            foodCounts[gender] = {};
            let totalVegCount = 0;
            let totalNonVegCount = 0;
            for (const year of target_years) {
                const vegCount = await studentCollection.countDocuments({ foodtype: "Veg", year, gender });
                const nonVegCount = await studentCollection.countDocuments({ foodtype: "Non-Veg", year, gender });
                foodCounts[gender][year] = { veg_count: vegCount, non_veg_count: nonVegCount };
                totalVegCount += vegCount;
                totalNonVegCount += nonVegCount;
            }
            foodCounts[gender]["Overall"] = { veg_count: totalVegCount, non_veg_count: totalNonVegCount };
        }
        res.json(foodCounts);
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});
//warden sidebar
app.get('/api/sidebar_warden', async (req, res) => { 
    if (!req.session || (!req.session.wardenauth && !req.session.superiorauth)) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_database");
        const warden_id = req.session.unique_number;
        const warden_data = await wardenCollection.findOne({ unique_id : warden_id });
        res.json({
            "name" : warden_data.warden_name,
            "primary year" : warden_data.primary_year,
            "Secondary year": warden_data.secondary_year,
            "Phone number": warden_data.phone_number,
            "image_path" : warden_data.image_path,
            "Active Status": warden_data.active
        })
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Fetch Warden Logs (Recent First)
app.get('/api/fetch_logs', async (req, res) => { 
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const logsCollection = db.collection("warden_logs");
        const logs = await logsCollection.find().sort({ deactivated_date: -1 }).toArray();

        res.json({logs : logs});

    } catch (err) {
        console.error("❌ Error fetching logs:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Fetch student passes in stored date order (recent first) for the student
app.get('/api/get_student_pass', async (req, res) => { 
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        const student_unique_id = req.session.unique_number;
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection("pass_details");

        const passes = await passCollection
            .find({ registration_number: student_unique_id })
            .sort({ request_date_time: -1 })
            .toArray();

        if (passes.length === 0) {
            return res.status(404).json({ message: "No passes found" });
        }

        res.json({ passes });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Fetch warden data for superior
app.get('/api/fetch_warden_details', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_database");

        const warden_details = await wardenCollection.find({ category: "assistant" }).toArray();

        if (!warden_details || warden_details.length === 0) {
            return res.status(404).json({ message: "No assistant wardens found" });
        }

        res.status(200).json({ wardens: warden_details });

    } catch (error) {
        console.error("❌ Error fetching warden details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch warden details for reallocation
app.post('/api/fetch_warden_details_reallocation', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_database");
        const { target_warden_id } = req.body;
        if (!target_warden_id) {
            return res.status(400).json({ error: "Missing target_warden_id" });
        }
        const target_warden_data = await wardenCollection.findOne({ unique_id: target_warden_id });

        if (!target_warden_data) {
            return res.status(404).json({ error: "Target warden not found" });
        }
        const primary_years = target_warden_data.primary_year;
        const target_warden_gender = target_warden_data.gender;
        const warden_details = await wardenCollection.find({
            active: true,
            gender: target_warden_gender,
            category: "assistant",
            unique_id: { $ne: target_warden_id }
        }).toArray();

        const superior_warden_data = await wardenCollection.findOne({ category: "head" });

        if (!superior_warden_data) {
            return res.status(404).json({ error: "Superior warden not found" });
        }
        const superior_warden_name = superior_warden_data.warden_name;

        const warden_names = warden_details.map(warden => warden.warden_name);
        warden_names.push(superior_warden_name);

        res.status(200).json({ warden_names, primary_years });

    } catch (error) {
        console.error("Error fetching warden details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Warden Inactive Status Handling with Logging
app.post('/api/warden_inactive_status_handling', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_database");
        const logsCollection = db.collection("warden_logs");
        const { warden_name, inactive_warden_id, year } = req.body;

        if (!warden_name || !inactive_warden_id || !year) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const inactive_warden = await wardenCollection.findOne({ unique_id: inactive_warden_id });
        if (!inactive_warden) {
            return res.status(404).json({ message: "Inactive warden not found" });
        }

        const new_warden = await wardenCollection.findOne({ warden_name: warden_name });
        if (!new_warden) {
            return res.status(404).json({ message: "New warden not found" });
        }
        await wardenCollection.updateOne(
            { unique_id: inactive_warden_id },
            { $set: { active: false } }
        );

        await wardenCollection.updateOne(
            { warden_name: warden_name },
            { $addToSet: { primary_year: year } }
        );

        const log_entry = {
            inactive_warden_id,
            inactive_warden_name: inactive_warden.warden_name,
            deactivated_date: new Date(),
            new_warden_id: new_warden.unique_id,
            new_warden_name: warden_name,
            transferred_year: year,
            log_status: "active"
        };

        await logsCollection.insertOne(log_entry);

        res.json({ message: "Warden status updated, year transferred, and log recorded successfully" });

    } catch (error) {
        console.error("❌ Error handling warden status:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Warden Active Status Handling with Logging
app.post('/api/warden_active_status_handling', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_database");
        const logsCollection = db.collection("warden_logs");
        const { warden_id } = req.body;

        if (!warden_id) {
            return res.status(400).json({ error: "Missing warden_id" });
        }
        const warden_details = await wardenCollection.findOne({ unique_id: warden_id });
        if (!warden_details) {
            return res.status(404).json({ message: "Warden not found" });
        }

        const primary_years = warden_details.primary_year || [];

        const active_logs = await logsCollection.find({ inactive_warden_id: warden_id, log_status: "active" }).toArray();

        if (active_logs.length === 0) {
            return res.status(404).json({ message: "No active logs found for this warden" });
        }

        await wardenCollection.updateMany(
            { unique_id: { $ne: warden_id } ,  gender : warden_details.gender },
            { $pull: { primary_year: { $in: primary_years } } }
        );

        const updateResult = await wardenCollection.updateOne(
            { unique_id: warden_id },
            { $set: { active: true } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: "Warden not found or not updated" });
        }

        for (const log of active_logs) {
            await logsCollection.updateOne(
                { _id: log._id },
                {
                    $set: {
                        log_status: "resolved",
                        activated_date: new Date(),
                        returned_years: log.transferred_year
                    }
                }
            );
        }

        res.json({ message: "Warden activated, years updated, and logs resolved successfully" });

    } catch (error) {
        console.error("❌ Error handling warden status:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update Student Details Endpoint
app.post('/api/update_student_by_warden', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) { 
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const studentCollection = db.collection("student_database");

        const { registration_number, ...updateFields } = req.body;

        if (!registration_number) {
            return res.status(400).json({ error: "Registration number is required" });
        }
        const restrictedFields = ["registration_number", "password", "_id"];
        restrictedFields.forEach(field => delete updateFields[field]);

        const updateResult = await studentCollection.updateOne(
            { registration_number: registration_number },
            { $set: updateFields }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.status(200).json({
            message: "Student details updated successfully",
            registration_number: registration_number,
            updated_fields: updateFields
        });

    } catch (error) {
        console.error("❌ Error updating student details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update Warden Details Endpoint (Only by Superior Warden)
app.post('/api/update_warden_by_superior', upload.single('file'), async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) { 
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_database");

        let file_path = null;
        if (req.file) {
            file_path = `/Velammal-Engineering-College-Backend/static/images/warden_profile_images/${req.file.filename}`;
        }

        const { unique_id, ...updateFields } = req.body;
        if (!unique_id) {
            return res.status(400).json({ error: "Warden unique ID is required" });
        }

        if (file_path) {
            updateFields.file_path = file_path;
        }

        const updateResult = await wardenCollection.updateOne(
            { unique_id: unique_id },
            { $set: updateFields }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Warden not found" });
        }

        res.status(200).json({
            message: "Warden details updated successfully",
            unique_id: unique_id,
            updated_fields: updateFields
        });

    } catch (error) {
        console.error("❌ Error updating warden details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//student profile fetch his own profile
app.get('/api/fetch_student_profile', async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
      await client.connect();
      const db = client.db(dbName);
      const profilesCollection = db.collection("student_database");
      const unique_id = req.session.unique_number;
      const profile = await profilesCollection.findOne({ registration_number: unique_id });
  
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      return res.status(200).json(profile);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

//fetch pass details for security
app.post('/api/fetch_pass_details', async (req, res) => {
    if (!req.session || req.session.securityauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection("pass_details");

        const { pass_unique_id } = req.body;
        if (!pass_unique_id) {
            return res.status(400).json({ message: "Pass ID is required" });
        }

        const pass_data = await passCollection.findOne({ 
            pass_id: pass_unique_id,
            $or: [
                { wardern_approval: true },
                { superior_wardern_approval: true }
            ]
        });
        
        if (!pass_data) {
            return res.status(404).json({ message: "No pass details found for the given ID" });
        }
        return res.status(200).json(pass_data);
    } catch (error) {
        console.error('❌ Error fetching pass details:', error);
        return res.status(500).json({ message: "Server error" });
    }
});

// Security accept endpoint
app.post('/api/security_accept', async (req, res) => {
    if (!req.session || req.session.securityauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection("pass_details");
        const studentCollection = db.collection("student_database");

        const { pass_id } = req.body;
        if (!pass_id) {
            return res.status(400).json({ error: "Pass ID is required" });
        }
        const pass_details = await passCollection.findOne({ pass_id: pass_id });
        if (!pass_details) {
            return res.status(404).json({ error: "Pass not found" });
        }

        const security_id = req.session.unique_number;
        const student_data = await studentCollection.findOne({ registration_number : pass_details.registration_number});
        if (!pass_details.exit_time) {
            const exitTime = new Date();
            await passCollection.updateOne(
                { pass_id: pass_id },
                { 
                    $set: { 
                        exit_time: exitTime,
                        authorised_Security_id: security_id
                    }
                }
            );
            await studentCollection.updateOne(
                { registration_number : pass_details.registration_number },
                {
                    $set: {
                        transit_status: true
                    }
                }
            );

            return res.status(200).json({
                message: "Exit time updated successfully",
                pass_id: pass_id,
                exit_time: exitTime,
                authorised_Security_id: security_id
            });
        }
        if (pass_details.exit_time && !pass_details.re_entry_time) {
            const reEntryTime = new Date();
            const returnDeadline = new Date(pass_details.to);
            const delayStatus = reEntryTime > returnDeadline;

            let updateFields = {
                re_entry_time: reEntryTime,
                request_completed: true,
                expiry_status: true,
                delay_status: delayStatus
            };
            if (delayStatus || pass_details.passtype == "outpass") {
                await studentCollection.updateOne(
                    { phone_number_student: pass_details.mobile_number },
                    { $inc: { late_count: 1 } }
                );
            }

            await passCollection.updateOne(
                { pass_id: pass_id },
                { $set: updateFields }
            );
            await studentCollection.updateOne(
                { registration_number : pass_details.registration_number },
                {
                    $set: {
                        transit_status: false
                    }
                }
            );
            await sendParentReachedSMS(
                student_data.phone_number_parent, 
                pass_details.name, 
                reEntryTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
            );

            return res.status(200).json({
                message: "Re-entry time updated successfully",
                pass_id: pass_id,
                re_entry_time: reEntryTime,
                authorised_Security_id: security_id,
                delay_status: delayStatus
            });
        }

    } catch (error) {
        console.error("❌ Error updating security pass:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Security Decline Endpoint
app.post('/api/security_decline', async (req, res) => {
    if (!req.session || req.session.securityauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection("pass_details");

        const { pass_id } = req.body;
        if (!pass_id) {
            return res.status(400).json({ error: "Pass ID is required" });
        }

        const pass_details = await passCollection.findOne({ pass_id: pass_id });
        if (!pass_details) {
            return res.status(404).json({ error: "Pass not found" });
        }

        const security_id = req.session.unique_number;
        let updateFields = { 
            authorised_Security_id: security_id,
            request_completed: true
        };
        if (pass_details.exit_time && !pass_details.re_entry_time) {
            updateFields.re_entry_time = null;
            updateFields.expiry_status = true;
        } else {
            updateFields.exit_time = null;
        }
        const updateResult = await passCollection.updateOne(
            { pass_id: pass_id },
            { $set: updateFields }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Pass not found" });
        }

        res.status(200).json({
            message: "Pass request declined successfully",
            pass_id: pass_id,
            authorised_Security_id: security_id
        });

    } catch (error) {
        console.error("❌ Error declining pass request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//warden change food type directly
app.post('/api/warden_change_foodtype', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    const { registration_number } = req.body;

    if (!registration_number) {
        return res.status(400).json({ error: "Registration number is required" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const studentCollection = db.collection("student_database"); 

        const student = await studentCollection.findOne({ registration_number });

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        const newFoodType = student.foodtype === "Veg" ? "Non-Veg" : "Veg";
        await studentCollection.updateOne(
            { registration_number },
            { $set: { foodtype: newFoodType } }
        );

        res.json({ message: `Food type updated to ${newFoodType}`, foodtype: newFoodType });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Fetch waiting members name list with pass type
app.post("/api/fetch_waiting_members", async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection("pass_details");
        const unique_id = req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id });

        if (!warden_data || !warden_data.primary_year || !Array.isArray(warden_data.primary_year)) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const warden_handling_gender = warden_data.gender;
        const { target_year1 } = req.body;
        let target_year;
        if (target_year1=="overall"){
            target_year = target_year1;
        } else {
            target_year = parseInt(target_year1);
        }
        if (unique_id === "004") {
            target_year = warden_data.profile_years;
        }

        let query = {
            re_entry_time: null,
            request_completed: false,
            qrcode_status: true,
            gender: warden_handling_gender,
            exit_time: { $ne: null }
        };
        
        if (target_year === "overall") {
            query.year = { $in: warden_data.primary_year };
        } else {
            query.year = target_year;
        }

        const waiting_data = await passCollection.find(query).toArray();

        const waiting_members = waiting_data.map(member => ({
            name: member.name,
            pass_type: member.passtype
        }));

        res.status(200).json({ waiting_members });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch late members name list
app.post("/api/fetch_late_members", async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const unique_id = req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id });

        if (!warden_data || !warden_data.primary_year || !Array.isArray(warden_data.primary_year)) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const warden_handling_gender = warden_data.gender;
        const passCollection = db.collection("pass_details");
        const { target_year1 } = req.body;
        let target_year;
        if (target_year1=="overall"){
            target_year = target_year1;
        } else {
            target_year = parseInt(target_year1);
        }
        if (unique_id === "004") {
            target_year = warden_data.profile_years;
        }

        const currentTime = new Date();
        const istTime = new Date(currentTime.getTime() + (5.5 * 60 * 60 * 1000));

        let query = {
            re_entry_time: null,
            request_completed: false,
            qrcode_status:true,
            gender: warden_handling_gender,
            exit_time: { $ne: null }
        };
        if (target_year === "overall") {
            query.year = { $in: warden_data.primary_year };
        } else {
            query.year = target_year;
        }

        const late_members = await passCollection.find(query).toArray();

        const lateList = late_members
            .map(member => {
                if (!member.to) return null;

                const toTime = new Date(member.to);
                if (isNaN(toTime)) return null;

                if (toTime < istTime) {
                    const diffMs = istTime - toTime;
                    const diffMinutes = Math.floor(diffMs / 60000);
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = diffMinutes % 60;

                    return {
                        name: member.name,
                        late_by: `${hours} hours ${minutes} minutes`
                    };
                }
                return null;
            })
            .filter(member => member !== null);

        res.status(200).json({ late_members: lateList });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Analytics - Pass Measures
app.get("/api/pass_measures_warden", async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("pass_details");
        const warden_id = req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });

        if (!warden_data || !warden_data.primary_year) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const warden_handling_gender = warden_data.gender;
        const primary_years = warden_data.primary_year;
        if (!Array.isArray(primary_years) || primary_years.length === 0) {
            return res.status(400).json({ error: "Primary years must be an array with at least one value." });
        }

        const currentDate = moment().utc().startOf("day").toDate();
        const nextDate = moment().utc().endOf("day").toDate();
        const now = moment().tz("Asia/Kolkata").toDate();
        const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

        const passTypes = ["od", "outpass", "staypass", "leave"];

        let results = {};
        let overall = {
            exitTimeCount: 0,
            reEntryTimeCount: 0,
            activeOutsideCount: 0,
            overdueReturnCount: 0,
            activeOutsideDetails: { names: [], passtypes: [] },  // ✅ Added
            overdueReturnDetails: { names: [], late_by: [] },  // ✅ Added
            passTypeCounts: {}
        };

        for (const type of passTypes) {
            overall.passTypeCounts[type] = { count: 0, names: [] };
        }

        for (const year of primary_years) {
            const yearFilter = { year, gender: warden_handling_gender, qrcode_status: true, exit_time: { $ne: null } };

            // Measure 1: Exit Time Count
            const exitTimeData = await collection.find({
                ...yearFilter,
                $or: [
                    { from: { $lte: currentDate }, to: { $gte: currentDate } },
                    { from: { $gte: currentDate, $lt: nextDate } },
                    { to: { $gte: currentDate, $lt: nextDate } }
                ]
            }).project({ name: 1, _id: 0 }).toArray();
            const exitTimeCount = exitTimeData.length;

            // Measure 2: Re-entry Time Count
            const reEntryTimeData = await collection.find({
                re_entry_time: { $gte: currentDate, $lt: nextDate },
                ...yearFilter
            }).project({ name: 1, _id: 0 }).toArray();
            const reEntryTimeCount = reEntryTimeData.length;

            // Measure 3: Active Outside Count (with passtype)
            const activeOutsideData = await collection.find({
                exit_time: { $exists: true },
                to: { $gt: istTime },
                re_entry_time: { $in: [null, ""] },
                ...yearFilter
            }).project({ name: 1, passtype: 1, _id: 0 }).toArray();
            const activeOutsideCount = activeOutsideData.length;
            const activeOutsideDetails = {
                names: activeOutsideData.map(p => p.name),
                passtypes: activeOutsideData.map(p => p.passtype)
            };

            // Measure 4: Overdue Return Count (with late_by)
            const overdueReturnData = await collection.find({
                exit_time: { $exists: true },
                to: { $lt: istTime },
                re_entry_time: { $in: [null, ""] },
                ...yearFilter
            }).project({ name: 1, to: 1, _id: 0 }).toArray();
            const overdueReturnCount = overdueReturnData.length;

            // Calculate late_by (hours and minutes)
            const overdueReturnProcessed = {
                names: overdueReturnData.map(entry => entry.name),
                late_by: overdueReturnData.map(entry => {
                    const toTime = new Date(entry.to);
                    const lateByMs = istTime - toTime;
                    const lateHours = Math.floor(lateByMs / (1000 * 60 * 60));
                    const lateMinutes = Math.floor((lateByMs % (1000 * 60 * 60)) / (1000 * 60));

                    return `${lateHours} hours ${lateMinutes} minutes`;
                })
            };

            let passTypeCounts = {};
            for (const type of passTypes) {
                const passData = await collection.find({
                    passtype: type,
                    ...yearFilter
                }).project({ name: 1, _id: 0 }).toArray();
                passTypeCounts[type] = { count: passData.length, names: passData.map(p => p.name) };

                overall.passTypeCounts[type].count += passData.length;
                overall.passTypeCounts[type].names.push(...passData.map(p => p.name));
            }

            results[year] = {
                exitTimeCount,
                exitTimeDetails: { names: exitTimeData.map(p => p.name) },
                reEntryTimeCount,
                reEntryTimeDetails: { names: reEntryTimeData.map(p => p.name) },
                activeOutsideCount,
                activeOutsideDetails,
                overdueReturnCount,
                overdueReturnDetails: overdueReturnProcessed,
                passTypeCounts,
                currentDate,
                nextDate,
                now,
                istTime
            };

            overall.exitTimeCount += exitTimeCount;
            overall.reEntryTimeCount += reEntryTimeCount;
            overall.activeOutsideCount += activeOutsideCount;
            overall.overdueReturnCount += overdueReturnCount;
            
            // ✅ Append Active Outside details to overall section
            overall.activeOutsideDetails.names.push(...activeOutsideDetails.names);
            overall.activeOutsideDetails.passtypes.push(...activeOutsideDetails.passtypes);

            // ✅ Append Overdue Return details to overall section
            overall.overdueReturnDetails.names.push(...overdueReturnProcessed.names);
            overall.overdueReturnDetails.late_by.push(...overdueReturnProcessed.late_by);
        }

        results["overall"] = overall;

        res.json({
            primary_years,
            data: results
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



//pass analysis 2
app.post("/api/pass_analysis_warden", async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("pass_details");

        const { type, year } = req.body;
        if (!type) {
            return res.status(400).json({ error: "Missing 'type' parameter in query" });
        }
        

        const warden_id=req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });

        if (!warden_data || !warden_data.primary_year) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const warden_handling_gender = warden_data.gender;
        const primary_years = warden_data.primary_year;
        if (!Array.isArray(primary_years) || primary_years.length === 0) {
            return res.status(400).json({ error: "Primary years must be an array with at least one value." });
        }

        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const formattedDate = now.toISOString().split("T")[0];

        let yearFilter;
        if (["1", "2", "3", "4"].includes(year)) {
            yearFilter = { year: parseInt(year) };
        } else if (year === "overall") {
            yearFilter = { year: { $in: primary_years } };
        } else {
            return res.status(400).json({ error: "Invalid year value." });
        }

        const commonFilters = {
            passtype: type,
            gender: warden_handling_gender,
            qrcode_status:true,
            ...yearFilter
        };

        const firstMeasureDocs = await collection.find({
            ...commonFilters,
            $or: [
                { from: { $lte: now }, to: { $gte: now } },
                { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
            ]
        }).project({ name: 1, _id: 0 }).toArray();

        const secondMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) }
        }).project({ name: 1, _id: 0 }).toArray();

        const thirdMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $lt: istTime },
            re_entry_time: { $in: [null, ""] }
        }).project({ name: 1, _id: 0 }).toArray();

        const reasonCategories = {
            outpass: ["shopping", "classes", "internship", "medical"],
            staypass: ["holiday", "weekend holiday", "semester holiday", "festival holiday"],
            od: ["internship", "symposium", "sports", "hackathon"],
            leave: ["function", "medical", "exams", "emergency"]
        };
        
        const validReasons = reasonCategories[type.toLowerCase()] || [];
        const fourthMeasureAggregation = await collection.aggregate([
            {
                $match: {
                    ...commonFilters,
                    reason_for_visit: { $exists: true, $ne: null },
                    $or: [
                        { from: { $lte: now }, to: { $gte: now } },
                        { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                        { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $in: ["$reason_type", validReasons] },
                            then: "$reason_type",
                            else: "Others"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        const fourthMeasureCounts = fourthMeasureAggregation.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});        

        res.json({
            activePasses: {
                count: firstMeasureDocs.length,
                names: firstMeasureDocs.map(doc => doc.name)
            },
            toFieldMatch: {
                count: secondMeasureDocs.length,
                names: secondMeasureDocs.map(doc => doc.name)
            },
            overduePasses: {
                count: thirdMeasureDocs.length,
                names: thirdMeasureDocs.map(doc => doc.name)
            },
            reasonTypeCounts: fourthMeasureCounts,
            now
        });

    } catch (error) {
        console.error("Error fetching pass analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//analysis by date - 3
app.post("/api/pass_analysis_by_date_warden", async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("pass_details");

        const { type, year,date } = req.body;
        if (!type) {
            return res.status(400).json({ error: "Missing 'type' parameter in query" });
        }
        

        const warden_id=req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });

        if (!warden_data || !warden_data.primary_year) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const warden_handling_gender = warden_data.gender;
        const primary_years = warden_data.primary_year;
        if (!Array.isArray(primary_years) || primary_years.length === 0) {
            return res.status(400).json({ error: "Primary years must be an array with at least one value." });
        }

        const now = new Date(`${date}T00:00:00.000Z`);
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const formattedDate = now.toISOString().split("T")[0];

        let yearFilter;
        if (["1", "2", "3", "4"].includes(year)) {
            yearFilter = { year: parseInt(year) };
        } else if (year === "overall") {
            yearFilter = { year: { $in: primary_years } };
        } else {
            return res.status(400).json({ error: "Invalid year value." });
        }

        const commonFilters = {
            passtype: type,
            gender: warden_handling_gender,
            qrcode_status:true,
            ...yearFilter
        };
        const firstMeasureDocs = await collection.find({
            ...commonFilters,
            $or: [
                { from: { $lte: now }, to: { $gte: now } },
                { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
            ]
        }).project({ name: 1, _id: 0 }).toArray();
        const secondMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) }
        }).project({ name: 1, _id: 0 }).toArray();
        const thirdMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $lt: istTime },
            re_entry_time: { $in: [null, ""] }
        }).project({ name: 1, _id: 0 }).toArray();
        const reasonCategories = {
            outpass: ["shopping", "classes", "internship", "medical"],
            staypass: ["holiday", "weekend holiday", "semester holiday", "festival holiday"],
            od: ["internship", "symposium", "sports", "hackathon"],
            leave: ["function", "medical", "exams", "emergency"]
        };
        
        const validReasons = reasonCategories[type.toLowerCase()] || [];
        const fourthMeasureAggregation = await collection.aggregate([
            {
                $match: {
                    ...commonFilters,
                    reason_for_visit: { $exists: true, $ne: null },
                    $or: [
                        { from: { $lte: now }, to: { $gte: now } },
                        { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                        { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $in: ["$reason_type", validReasons] },
                            then: "$reason_type",
                            else: "Others"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        const fourthMeasureCounts = fourthMeasureAggregation.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});        

        res.json({
            activePasses: {
                count: firstMeasureDocs.length,
                names: firstMeasureDocs.map(doc => doc.name)
            },
            toFieldMatch: {
                count: secondMeasureDocs.length,
                names: secondMeasureDocs.map(doc => doc.name)
            },
            overduePasses: {
                count: thirdMeasureDocs.length,
                names: thirdMeasureDocs.map(doc => doc.name)
            },
            reasonTypeCounts: fourthMeasureCounts
        });

    } catch (error) {
        console.error("Error fetching pass analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//pass measures for superior
app.get("/api/pass_measures_superior", async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("pass_details");
        const warden_id = req.session.unique_number;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });

        if (!warden_data || !warden_data.profile_years) {
            return res.status(400).json({ error: "Invalid warden data." });
        }

        const primary_years = warden_data.profile_years;
        if (!Array.isArray(primary_years) || primary_years.length === 0) {
            return res.status(400).json({ error: "Primary years must be an array with at least one value." });
        }

        const currentDate = moment().utc().startOf("day").toDate();
        const nextDate = moment().utc().endOf("day").toDate();
        const now = moment().tz("Asia/Kolkata").toDate();
        const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

        const passTypes = ["od", "outpass", "staypass", "leave"];

        let results = {
            male: {},
            female: {}
        };

        for (const gender of ["Male", "Female"]) {
            let overall = {
                exitTimeNames: [],
                exitTimeCount: 0,
                reEntryTimeNames: [],
                reEntryTimeCount: 0,
                activeOutsideNames: [],
                activeOutsideCount: 0,
                activeOutsidePassTypes: [],
                overdueReturnNames: [],
                overdueReturnCount: 0,
                overdueReturnLateBy: [],
                passTypeNames: {},
                passTypeCounts: {}
            };

            for (const type of passTypes) {
                overall.passTypeNames[type] = [];
                overall.passTypeCounts[type] = 0;
            }

            results[gender] = {};

            for (const year of primary_years) {
                const yearFilter = { year, gender, qrcode_status: true, exit_time: { $ne: null } };

                // Fetch exit time users
                const exitTimeUsers = await collection
                    .find({
                        ...yearFilter,
                        $or: [
                            { from: { $lte: currentDate }, to: { $gte: currentDate } },
                            { from: { $gte: currentDate, $lt: nextDate } },
                        ]
                    })
                    .project({ name: 1, _id: 0 })
                    .toArray();
                const exitTimeNames = exitTimeUsers.map(doc => doc.name);
                const exitTimeCount = exitTimeNames.length;

                // Fetch re-entry time users
                const reEntryTimeUsers = await collection
                    .find({
                        re_entry_time: { $gte: currentDate, $lte: nextDate },
                        ...yearFilter
                    })
                    .project({ name: 1, _id: 0 })
                    .toArray();
                const reEntryTimeNames = reEntryTimeUsers.map(doc => doc.name);
                const reEntryTimeCount = reEntryTimeNames.length;

                // Fetch active outside users
                const activeOutsideList = await collection
                    .find({
                        exit_time: { $exists: true },
                        to: { $gt: istTime },
                        re_entry_time: { $in: [null, ""] },
                        ...yearFilter
                    })
                    .project({ name: 1, passtype: 1, _id: 0 })
                    .toArray();
                const activeOutsideNames = activeOutsideList.map(doc => doc.name);
                const activeOutsidePassTypes = activeOutsideList.map(doc => doc.passtype);
                const activeOutsideCount = activeOutsideNames.length;

                // Fetch overdue return users
                const overdueReturnList = await collection
                    .find({
                        exit_time: { $exists: true },
                        to: { $lt: istTime },
                        re_entry_time: { $in: [null, ""] },
                        ...yearFilter
                    })
                    .project({ name: 1, to: 1, _id: 0 })
                    .toArray();
                const overdueReturnNames = overdueReturnList.map(doc => doc.name);
                const overdueReturnCount = overdueReturnNames.length;
                const overdueReturnLateBy = overdueReturnList.map(doc => {
                    const minutesLate = Math.round((istTime - doc.to) / (1000 * 60));
                    const hours = Math.floor(minutesLate / 60);
                    const minutes = minutesLate % 60;
                    return `${hours} hours ${minutes} minutes`;
                });

                // Fetch pass type users
                let passTypeNames = {};
                let passTypeCounts = {};
                for (const type of passTypes) {
                    passTypeNames[type] = await collection
                        .find({
                            passtype: type,
                            ...yearFilter
                        })
                        .project({ name: 1, _id: 0 })
                        .toArray();
                    passTypeNames[type] = passTypeNames[type].map(doc => doc.name);
                    passTypeCounts[type] = passTypeNames[type].length;

                    overall.passTypeNames[type] = overall.passTypeNames[type].concat(passTypeNames[type]);
                    overall.passTypeCounts[type] += passTypeCounts[type];
                }

                results[gender][year] = {
                    exitTimeNames,
                    exitTimeCount,
                    reEntryTimeNames,
                    reEntryTimeCount,
                    activeOutsideNames,
                    activeOutsidePassTypes,
                    activeOutsideCount,
                    overdueReturnNames,
                    overdueReturnCount,
                    overdueReturnLateBy,
                    passTypeNames,
                    passTypeCounts,
                    currentDate,
                    nextDate,
                    now
                };

                overall.exitTimeNames = overall.exitTimeNames.concat(exitTimeNames);
                overall.exitTimeCount += exitTimeCount;
                overall.reEntryTimeNames = overall.reEntryTimeNames.concat(reEntryTimeNames);
                overall.reEntryTimeCount += reEntryTimeCount;
                overall.activeOutsideNames = overall.activeOutsideNames.concat(activeOutsideNames);
                overall.activeOutsidePassTypes = overall.activeOutsidePassTypes.concat(activeOutsidePassTypes);
                overall.activeOutsideCount += activeOutsideCount;
                overall.overdueReturnNames = overall.overdueReturnNames.concat(overdueReturnNames);
                overall.overdueReturnCount += overdueReturnCount;
                overall.overdueReturnLateBy = overall.overdueReturnLateBy.concat(overdueReturnLateBy);
            }

            results[gender]["overall"] = overall;
        }

        res.json({
            primary_years,
            data: results
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//pass analysis 2
app.post("/api/pass_analysis_superior", async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("pass_details");

        const { type, year, gender} = req.body;
        if (!type) {
            return res.status(400).json({ error: "Missing 'type' parameter in query" });
        }

        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const formattedDate = now.toISOString().split("T")[0];
        const primary_years = ["1", "2", "3", "4"]
        let yearFilter;
        if (["1", "2", "3", "4"].includes(year)) {
            yearFilter = { year: parseInt(year) };
        } else if (year === "overall") {
            yearFilter = { year: { $in: primary_years.map(y => parseInt(y)) } };
        } else {
            return res.status(400).json({ error: "Invalid year value." });
        }

        const commonFilters = {
            passtype: type,
            gender: gender,
            qrcode_status:true,
            ...yearFilter
        };

        const firstMeasureDocs = await collection.find({
            ...commonFilters,
            $or: [
                { from: { $lte: now }, to: { $gte: now } },
                { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
            ]
        }).project({ name: 1, _id: 0 }).toArray();

        const secondMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) }
        }).project({ name: 1, _id: 0 }).toArray();

        const thirdMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $lt: istTime },
            re_entry_time: { $in: [null, ""] }
        }).project({ name: 1, _id: 0 }).toArray();

        const reasonCategories = {
            outpass: ["shopping", "classes", "internship", "medical"],
            staypass: ["holiday", "weekend holiday", "semester holiday", "festival holiday"],
            od: ["internship", "symposium", "sports", "hackathon"],
            leave: ["function", "medical", "exams", "emergency"]
        };
        
        const validReasons = reasonCategories[type.toLowerCase()] || [];
        const fourthMeasureAggregation = await collection.aggregate([
            {
                $match: {
                    ...commonFilters,
                    reason_type: { $exists: true, $ne: null }, // Ensure reason_type exists
                    $or: [
                        { from: { $lte: now }, to: { $gte: now } },
                        { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                        { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: validReasons.length > 0 && { $in: ["$reason_type", validReasons] },
                            then: "$reason_type",
                            else: "Others"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        const fourthMeasureCounts = fourthMeasureAggregation.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});        

        res.json({
            activePasses: {
                count: firstMeasureDocs.length,
                names: firstMeasureDocs.map(doc => doc.name)
            },
            toFieldMatch: {
                count: secondMeasureDocs.length,
                names: secondMeasureDocs.map(doc => doc.name)
            },
            overduePasses: {
                count: thirdMeasureDocs.length,
                names: thirdMeasureDocs.map(doc => doc.name)
            },
            reasonTypeCounts: fourthMeasureCounts,
            now
        });

    } catch (error) {
        console.error("Error fetching pass analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//analysis by date - 3
app.post("/api/pass_analysis_by_date_superior", async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("pass_details");

        const { type, year,date, gender } = req.body;
        if (!type) {
            return res.status(400).json({ error: "Missing 'type' parameter in query" });
        }

        const now = new Date(`${date}T00:00:00.000Z`);
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const formattedDate = now.toISOString().split("T")[0];
        const primary_years = ["1", "2", "3", "4"]


        let yearFilter;
        if (["1", "2", "3", "4"].includes(year)) {
            yearFilter = { year: parseInt(year) };
        } else if (year === "overall") {
            yearFilter = { year: { $in: primary_years.map(y => parseInt(y)) } };
        } else {
            return res.status(400).json({ error: "Invalid year value." });
        }

        const commonFilters = {
            passtype: type,
            gender: gender,
            qrcode_status:true,
            ...yearFilter
        };
        const firstMeasureDocs = await collection.find({
            ...commonFilters,
            $or: [
                { from: { $lte: now }, to: { $gte: now } },
                { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
            ]
        }).project({ name: 1, _id: 0 }).toArray();
        const secondMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) }
        }).project({ name: 1, _id: 0 }).toArray();
        const thirdMeasureDocs = await collection.find({
            ...commonFilters,
            to: { $lt: istTime },
            re_entry_time: { $in: [null, ""] }
        }).project({ name: 1, _id: 0 }).toArray();
        const reasonCategories = {
            outpass: ["shopping", "classes", "internship", "medical"],
            staypass: ["holiday", "weekend holiday", "semester holiday", "festival holiday"],
            od: ["internship", "symposium", "sports", "hackathon"],
            leave: ["function", "medical", "exams", "emergency"]
        };
        
        const validReasons = reasonCategories[type.toLowerCase()] || [];
        const fourthMeasureAggregation = await collection.aggregate([
            {
                $match: {
                    ...commonFilters,
                    reason_for_visit: { $exists: true, $ne: null },
                    $or: [
                        { from: { $lte: now }, to: { $gte: now } },
                        { from: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } },
                        { to: { $gte: new Date(`${formattedDate}T00:00:00.000Z`), $lt: new Date(`${formattedDate}T23:59:59.999Z`) } }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $in: ["$reason_type", validReasons] },
                            then: "$reason_type",
                            else: "Others"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        const fourthMeasureCounts = fourthMeasureAggregation.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});        

        res.json({
            activePasses: {
                count: firstMeasureDocs.length,
                names: firstMeasureDocs.map(doc => doc.name)
            },
            toFieldMatch: {
                count: secondMeasureDocs.length,
                names: secondMeasureDocs.map(doc => doc.name)
            },
            overduePasses: {
                count: thirdMeasureDocs.length,
                names: thirdMeasureDocs.map(doc => doc.name)
            },
            reasonTypeCounts: fourthMeasureCounts,
            now,
            formattedDate,
            istTime
        });

    } catch (error) {
        console.error("Error fetching pass analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch Warden Active Year
app.get('/api/fetch_warden_year', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const unique_id = req.session.unique_number;
        const wardenCollection = db.collection("warden_database");

        const warden_data = await wardenCollection.findOne({ unique_id });

        if (!warden_data || !warden_data.primary_year) {
            return res.status(400).json({ error: "Invalid Warden Data" });
        }
        res.json({ primary_years: warden_data.primary_year });
    } catch (error) {
        console.error("Error fetching Warden Years:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete Student or Warden by superior
app.post('/api/delete_student', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }

    const { registration_number, type } = req.body;

    if (!registration_number) {
        return res.status(400).json({ error: "Registration number is required" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
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
});


// Fetch All passes for superior warden
app.get('/api/fetch_passes_for_superior', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection("pass_details");

        const passData = await passCollection.find({
            request_completed: false,
            expiry_status: false,
            qrcode_status: false,
            wardern_approval: null,
            superior_wardern_approval: null,
            parent_approval: { $ne : false},
            notify_superior: true
        }).toArray();

        res.status(200).json({ passes: passData });

    } catch (error) {
        console.error("Error fetching passes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch All student details for superior warden (sorted)
app.get('/api/fetch_student_details_superior', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }

    let clientInstance;
    try {
        clientInstance = await client.connect();
        const db = clientInstance.db(dbName);
        const studentsCollection = db.collection("student_database");
        const passCollection = db.collection("pass_details");

        let student_data = await studentsCollection.find({}).toArray();

        const students_with_pass_data = await Promise.all(student_data.map(async (student) => {
            let pass_info = {
                from: null,
                to: null,
                passtype: null
            };

            if (student.transit_status === true) {
                const pass_data = await passCollection.findOne({
                    registration_number: student.registration_number,
                    request_completed: false
                });

                if (pass_data) {
                    pass_info = {
                        from: pass_data.from,
                        to: pass_data.to,
                        passtype: pass_data.passtype
                    };
                }
            }

            return {
                ...student,
                pass_info
            };
        }));
        students_with_pass_data.sort((a, b) => {
            if (b.year !== a.year) {
                return b.year - a.year;
            }
            return a.gender === "Male" ? -1 : 1;
        });
        res.status(200).json({ students: students_with_pass_data });

    } catch (error) {
        console.error("❌ Error fetching student details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch the old passes for the warden
app.post('/api/fetch_old_passes_for_warden', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_database");
        const passCollection = db.collection("pass_details");

        const warden_id = req.session.unique_number;
        const { date } = req.body;
        const targetDate = date ? new Date(date) : new Date();

        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });
        if (!warden_data) {
            return res.status(404).json({ error: "Warden not found" });
        }

        const target_years = warden_data.primary_year;
        const pass_data = await passCollection.find({
            request_completed: true,
            gender: warden_data.gender,
            year: { $in: target_years },
            request_time: { $gte: startOfDay, $lte: endOfDay }
        }).toArray();

        res.status(200).json({ message: "Old passes fetched successfully", data: pass_data });

    } catch (error) {
        console.error("❌ Error fetching old passes:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Fetch the old passes for the superior warden
app.post('/api/fetch_old_passes_for_superior', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_database");
        const passCollection = db.collection("pass_details");

        const superior_id = req.session.unique_number;
        const { date, warden_id } = req.body;
        const targetDate = date ? new Date(date) : new Date();

        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        const superior_data = await wardenCollection.findOne({ unique_id: superior_id });

        if (!superior_data) {
            return res.status(404).json({ error: "Superior Warden not found" });
        }

        let filterQuery = {
            request_completed: true,
            request_time: { $gte: startOfDay, $lte: endOfDay }
        };

        if (warden_id && warden_id !== "overall") {
            filterQuery.authorised_warden_id = warden_id;
        } else {
            filterQuery.year = { $in: superior_data.profile_years };
        }

        const pass_data = await passCollection.find(filterQuery).toArray();

        res.status(200).json({ message: "Old passes fetched successfully", data: pass_data });

    } catch (error) {
        console.error("Error fetching old passes:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Edit Room Student number by Warden or Superior
app.post('/api/edit_student_room_number', async (req, res) => {
    if (!req.session || (!req.session.wardenauth && !req.session.superiorauth)) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }

    try {
        const { student_id, new_room_number } = req.body;
        if (!student_id || !new_room_number) {
            return res.status(400).json({ error: "Missing student_id or new_room_number" });
        }

        await client.connect();
        const db = client.db(dbName);
        const studentCollection = db.collection("student_database");

        const updateResult = await studentCollection.updateOne(
            { registration_number: student_id },
            { $set: { room_number: new_room_number } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.status(200).json({ message: "Room number updated successfully" });
    } catch (error) {
        console.error("Error Editing Room Number:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Add New Warden
app.post('/api/add_warden', upload.single('file'), async (req, res) => {
    if (!req.session || (!req.session.wardenauth && !req.session.superiorauth)) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        const { name, primary_year, phone_number, password, gender, joined_date } = req.body;
        
        if (!name || !primary_year || !phone_number || !password || !gender || !category || !joined_date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await client.connect();
        const db = client.db(dbName);
        const wardenCollection = db.collection("warden_database");
        primary_year = JSON.parse(primary_year);

        const existingWarden = await wardenCollection.findOne({ phone_number });
        if (existingWarden) {
            return res.status(409).json({ error: "Phone number already exists" });
        }
        const wardenCount = await wardenCollection.countDocuments({ category: "assistant" });
        const unique_id = String(wardenCount + 1).padStart(3, '0');

        let file_path = null;
        if (req.file) {
            file_path = `/Velammal-Engineering-College-Backend/static/images/warden_profile_images/${req.file.filename}`;
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newWarden = {
            unique_id,
            warden_name : name,
            primary_year : primary_year,
            phone_number,
            password: hashedPassword,
            gender,
            category : "assistant",
            joined_date,
            active: true,
            image_path: file_path
        };

        await wardenCollection.insertOne(newWarden);

        res.status(201).json({ message: "Warden added successfully", unique_id });

    } catch (error) {
        console.error("Error Adding New Warden:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Increment Student Year for a Given Batch
app.post('/api/increment_student_year', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized Access" });
    }
    try {
        const { batch } = req.body;
        if (!batch) {
            return res.status(400).json({ error: "Missing batch" });
        }

        await client.connect();
        const db = client.db(dbName);
        const studentCollection = db.collection("student_database");

        const students = await studentCollection.find({ batch: batch, year: { $lt: 4 } }).toArray();

        if (students.length === 0) {
            return res.status(404).json({ error: "No eligible students found in this batch" });
        }
        await studentCollection.updateMany(
            { batch: batch, year: { $lt: 4 } },
            { $inc: { year: 1 } }
        );

        res.status(200).json({ 
            message: "Student years incremented successfully", 
            updated_students: students.length 
        });

    } catch (error) {
        console.error("❌ Error Incrementing Student Year:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//activate vacate status for student
app.post('/api/mark_student_vacate', async (req, res) => {
    if (!req.session || req.session.wardenauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const studentCollection = db.collection("student_database");

        const { student_id } = req.body;
        if (!student_id) {
            return res.status(400).json({ error: "Missing student_id" });
        }

        const updateResult = await studentCollection.updateOne(
            { registration_number : student_id },
            { $set: { vacate_status: true } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({ message: "Student marked for vacating successfully" });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//student submit vacate forms
app.post('/api/submit_vacate_form', async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try {
        await client.connect();
        const db = client.db(dbName);
        const studentCollection = db.collection("student_database");
        const vacateCollection = db.collection("vacate_forms");
        const wardenCollection = db.collection("warden_database");

        const { student_id, Reason, date_time , Address } = req.body;

        if (!student_id || !reason_for_leave || !last_date_of_stay || !any_dues_pending || !room_condition || !feedback) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const studentData = await studentCollection.findOne({ registration_number : student_id });
        if (!studentData) {
            return res.status(404).json({ error: "Student not found" });
        }
        const vacateEntry = {
            name: studentData.name,
            registration_number: studentData.registration_number,
            dept: studentData.dept,
            year: studentData.year,
            gender: studentData.gender,
            room_no: studentData.room_no,
            blockname: studentData.blockname,
            Reason,
            date_time,
            Address,
            vacate_date: new Date()
        };
        await vacateCollection.insertOne(vacateEntry);
        await studentCollection.updateOne(
            { registration_number : student_id },
            { $set: { vacate_status: false } }
        );
        const warden_data = await wardenCollection.findOne({ unique_id : "004" });
        const count = warden_data.vacated_students + 1;

        res.json({
            message: "Vacate form submitted successfully",
            count : count
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//superior to fetch all the vacate forms
app.get('/api/get_all_vacate_forms', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const vacateCollection = db.collection("vacate_forms");

        const vacateForms = await vacateCollection.find().toArray();

        res.json({ vacate_forms: vacateForms });
    } catch (err) {
        console.error("Error fetching vacate forms:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//archive student
app.post('/api/archive_student', async (req, res) => {
    if (!req.session || req.session.superiorauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const studentCollection = db.collection("student_database");
        const vacateCollection = db.collection("vacate_forms");
        const archiveCollection = db.collection("student_archive");

        const { student_id, action } = req.body;
        if (!student_id || !action) {
            return res.status(400).json({ error: "Missing student_id or action" });
        }

        if (action === 'approve') {
            const studentData = await studentCollection.findOne({ registration_number: student_id });
            if (!studentData) {
                return res.status(404).json({ error: "Student not found in database" });
            }

            await archiveCollection.insertOne(studentData);
            await studentCollection.deleteOne({ registration_number: student_id });
            await vacateCollection.deleteOne({ registration_number: student_id });

            return res.json({ message: "Student archived and removed from student database & vacate forms" });
        } 
        
        if (action === 'decline') {
            await vacateCollection.deleteOne({ registration_number: student_id });
            return res.json({ message: "Student vacate request declined, removed from vacate forms" });
        }

        res.status(400).json({ error: "Invalid action" });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


//logout
app.get('/api/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: "Failed to log out" });
            }
            res.clearCookie('connect.sid');
            return res.json({ message: "Logged out successfully", redirect: "/login" });
        });
    } else {
        return res.status(400).json({ error: "No active session" });
    }
});

//Send OTP for forget password warden
app.post('/api/send_otp', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const { warden_id } = req.body;
        const wardenCollection = db.collection("warden_database");
        const warden_data = await wardenCollection.findOne({ unique_id: warden_id });
        if (!warden_data) {
            return res.status(404).json({ error: "Warden not found" });
        }
        await sendOTPForForgetPassword(warden_data.phone_number, warden_data.warden_name , req);
        req.session.unique_number = warden_id

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//otp validation
app.post('/api/otp_validation', async (req, res) => {
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
});

//set new password
app.post('/api/set_new_password', async (req, res) => {
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
});

//fetch student passes for editing
app.post('/api/fetch_pass_details_for_edit', async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }
    try{
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection("pass_details");
        const { pass_id } = req.body;

        const student_data = await passCollection.findOne({
            pass_id : pass_id,
            request_completed : false
        });
        res.json(student_data)
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//edit student documents
app.post('/api/edit_student_pass', upload.single('file'), async (req, res) => {
    if (!req.session || req.session.studentauth !== true) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const {
            pass_id , 
            passtype , 
            from , 
            to , 
            place_to_visit , 
            reason_type , 
            reason_for_visit
        } = req.body;
        const file_path = `/Velammal-Engineering-College-Backend/static/images/student_docs/${req.file.filename}`;
        await client.connect();
        const db = client.db(dbName);
        const passCollection = db.collection("pass_details");
        const pass_details = await passCollection.findOne({ pass_id });

        if (pass_details && pass_details.file_path) {
            const oldFilePath = path.join(__dirname, pass_details.file_path);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }
        await passCollection.updateOne(
            { pass_id },
            { $set: { 
                file_path,
                passtype,
                from,
                to,
                place_to_visit,
                reason_type,
                reason_for_visit
            } }
        );

        res.json({ message: "Student pass file updated successfully", file_path });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//to fetch all the active sessions
app.get('/api/session', (req, res) => {
    if (!req.session) {
        return res.status(500).json({ error: "Session not initialized" });
    }
    res.status(200).json({
        session_data: req.session
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
