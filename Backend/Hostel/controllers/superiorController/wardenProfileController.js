const { getDb } = require('../../config/db');
const bcrypt = require('bcrypt');

async function getWardenDetails (req, res) {
    try {
        const db = getDb();
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
}

async function wardenDoInactive (req, res) {
    try {
        const db = getDb();
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
}

async function wardenDoActive (req, res) {
    try {
        const db = getDb();
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
}

async function addWarden (req, res) {
    try {
        const { name, primary_year, phone_number, password, gender, joined_date } = req.body;
        
        if (!name || !primary_year || !phone_number || !password || !gender  || !joined_date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const db = getDb();
        const wardenCollection = db.collection("warden_database");
        const primary_year1 = JSON.parse(primary_year);

        const existingWarden = await wardenCollection.findOne({ phone_number });
        if (existingWarden) {
            return res.status(409).json({ error: "Phone number already exists" });
        }
        const wardenCount = await wardenCollection.countDocuments({ category: "assistant" });
        const unique_id = String(wardenCount + 1).padStart(3, '0');

        let file_path = req.file ? `/storage/images/warden_profile_images/${req.file.filename}` : null;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newWarden = {
            unique_id,
            warden_name : name,
            primary_year : primary_year1,
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
}

async function updatewarden (req, res) {
    try {
        const db = getDb();
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
}

async function fetchDetailsForReallocation (req, res) {
    try {
        const db = getDb();
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
}

async function fetchWardensLog (req, res) { 
    try {
        const db = getDb();
        const logsCollection = db.collection("warden_logs");
        const logs = await logsCollection.find().sort({ deactivated_date: -1 }).toArray();

        res.json({logs : logs});

    } catch (err) {
        console.error("❌ Error fetching logs:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getWardenDetails,
    wardenDoActive,
    wardenDoInactive,
    addWarden,
    updatewarden,
    fetchDetailsForReallocation,
    fetchWardensLog
}