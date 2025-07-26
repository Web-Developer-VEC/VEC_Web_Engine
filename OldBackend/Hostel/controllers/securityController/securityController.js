const { getDb } = require('../../config/db');
const { sendParentReachedSMS } = require('../../services/sendSMS');

async function getPassDetails (req, res) {
    try {
        const db = getDb();
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
            ],
            re_entry_time: { $eq: null}
        });
        
        if (!pass_data) {
            return res.status(404).json({ message: "No pass details found for the given ID" });
        }
        return res.status(200).json(pass_data);
    } catch (error) {
        console.error('❌ Error fetching pass details:', error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function passAccept (req, res) {
    try {
        const db = getDb();
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
}

async function PassDecline(req, res) {
    try {
        const db = getDb();
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
}

module.exports = {
    getPassDetails,
    passAccept,
    PassDecline
}