const { getDb } = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const { 
    sendParentReachedSMS,
 } = require('../../services/sendSMS');
 const path = require('path');
 const fs = require('fs');
const { error } = require('console');

const submitPassParentApproval = async (req, res) => {
    try {
        const db = getDb();
        const PassCollection = db.collection('pass_details');
        const studentDatabase = db.collection('student_database');

        const { mobile_number, name, department_name, year, room_no, registration_number, block_name, pass_type, from, to, place_to_visit, reason_type, reason_for_visit } = req.body;

        if (!mobile_number) return res.status(400).json({ error: "Mobile number is required" });

        if (!name || !department_name || !year || !room_no || !registration_number || !block_name || !pass_type || !from || !to || !place_to_visit || !reason_type) {
            return res.status(400).json({ error: "Fill all the fields"})
        }

        const student = await studentDatabase.findOne({ phone_number_student: mobile_number });
        if (!student) return res.status(404).json({ error: "Student record not found" });

        const parentPhoneNumber = student.phone_number_parent;
        const gender = student.gender;
        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (fromDate < new Date()) return res.status(400).json({ error: "From date cannot be in the past" });
        if (toDate < new Date()) return res.status(400).json({ error: "To date cannot be in the past" });
        if (toDate < fromDate) return res.status(400).json({ error: "To date cannot be earlier than From date" });

        const toHours = toDate.getUTCHours();
        const totalToMinutes = toHours * 60 + toDate.getUTCMinutes();
        const maleTimeLimit = 21 * 60 + 30;
        const femaleTimeLimit = 18 * 60;

        if (pass_type.toLowerCase() === "outpass") {
            if (gender === "Male" && totalToMinutes > maleTimeLimit) return res.status(400).json({ error: "Male students' outpass cannot be later than 21:30" });
            if (gender === "Female" && totalToMinutes > femaleTimeLimit) return res.status(400).json({ error: "Female students' outpass cannot be later than 18:00" });
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

        if (activePassCount >= 3) return res.status(400).json({ error: "Maximum 3 active passes per student per day" });

        let file_path = req.file ? `/storage/student_docs/${req.file.filename}` : null;
        const pass_id = uuidv4();

        const PassData = {
            pass_id,
            name,
            mobile_number,
            dept: department_name,
            year: parseInt(year, 10),
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
            { registration_number: req.session.unique_number },
            { $set: { transit_status: false } }
        );

        await PassCollection.insertOne(PassData);
        await sendParentReachedSMS(parentPhoneNumber, name, place_to_visit, reason_for_visit, from, to, pass_id);
        await PassCollection.updateOne({ pass_id }, { $set: { parent_sms_sent_status: true } });

        res.status(201).json({ message: "Visitor pass submitted, SMS sent to parent", file_path });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

async function submitPassWardenApproval (req, res) {
    try {
        const db = getDb();
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

        if (!name || !department_name || !year || !room_no || !registration_number || !block_name || !pass_type || !from || !to || !place_to_visit || !reason_type) {
            return res.status(400).json({ error: "Fill all the fields"})
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

        let file_path = req.file ? `/storage/student_docs/${req.file.filename}` : null;

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
            notify_superior: false,
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
}

async function submitPassSuperiorWardenApproval (req, res) {
    try {
        const db = getDb();
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

        if (!name || !department_name || !year || !room_no || !registration_number || !block_name || !pass_type || !from || !to || !place_to_visit || !reason_type) {
            return res.status(400).json({ error: "Fill all the fields"})
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

        let file_path = req.file ? `/storage/student_docs/${req.file.filename}` : null;

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
            notify_superior: true,
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
}

async function saveDraftData(req, res) {
    try {
        const db = getDb();
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

        if (!name || !department_name || !year || !room_no || !registration_number || !block_name || !pass_type || !from || !to || !place_to_visit || !reason_type) {
            return res.status(400).json({ error: "Fill all the fields"})
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

        let file_path = req.file ? `/storage/student_docs/${req.file.filename}` : null;

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
}

async function fetchDraft (req, res) {
    try {
        const db = getDb();
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
}

async function getPassDetailsByPassID (req, res) {
    try {
        const { pass_id } = req.body;

        const db = getDb();
        const passCollection = db.collection("pass_details");

        const pass_details = await passCollection.findOne({ pass_id });

        if (!pass_details) {
            return res.status(404).json({ error: "Pass details not found" });
        }

        res.json(pass_details);

    } catch (err) {
        console.error("Error fetching pass details:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function EditPassDetails (req, res) {
    try {
        const { pass_id, passtype, from, to, place_to_visit, reason_type, reason_for_visit } = req.body;
        
        if (!pass_id) {
            return res.status(400).json({ error: "Pass ID is required" });
        }

        if (!passtype || !from || !to || !place_to_visit || !reason_type) {
            return res.status(400).json({ error: "Fill all the field to update the pass details"})
        }

        const db = getDb();
        const passCollection = db.collection("pass_details");

        const pass_details = await passCollection.findOne({ pass_id });

        if (!pass_details) {
            return res.status(404).json({ error: "Pass details not found" });
        }

        let file_path = pass_details.file_path; // Keep old file if no new file is uploaded

        // If a new file is uploaded, replace the old file
        if (req.file) {
            file_path = req.file ? `/storage/student_docs/${req.file.filename}` : null;
            
            // Delete the old file
            const oldFilePath = path.join(__dirname, pass_details.file_path);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        await passCollection.updateOne(
            { pass_id },
            {
                $set: {
                    file_path,
                    passtype,
                    from,
                    to,
                    place_to_visit,
                    reason_type,
                    reason_for_visit
                }
            }
        );

        res.json({ message: "Student pass updated successfully", file_path });

    } catch (err) {
        console.error("Error updating pass details:", err);
        res.status(500).json({ error: "Server error" });
    }
}

async function verifyStudent (req, res) {
    const db = getDb();
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
            vacate_status: user.vacate_status
        });

    } catch (error) {
        console.error("❌ Error verifying mobile number:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    verifyStudent,
    submitPassParentApproval,
    submitPassWardenApproval,
    submitPassSuperiorWardenApproval,
    fetchDraft,
    saveDraftData,
    getPassDetailsByPassID,
    EditPassDetails
}