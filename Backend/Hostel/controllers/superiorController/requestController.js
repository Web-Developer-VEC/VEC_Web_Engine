const { getDb } = require('../../config/db');
const { generateQR } = require('../../services/generateQR')

async function profileChangeRequestSuperior (req, res) {
    try {
        const unique_id = req.session.unique_number;
        if (!unique_id) {
            return res.status(400).json({ error: "warden_unique_id is required" });
        }

        const db = getDb();
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
}

async function profileUpdate (req, res) {
    const unique_id = req.session.unique_number;
    try {
        const { registration_number, action } = req.body;
        const db = getDb();
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
}

async function fetchPassSuperior (req, res) {
    try {
        const db = getDb();
        const passCollection = db.collection("pass_details");

        const passData = await passCollection.find({
            request_completed: false,
            expiry_status: false,
            qrcode_status: false,
            wardern_approval: null,
            superior_wardern_approval: null,
            notify_superior: true
        }).toArray();

        res.status(200).json({ passes: passData });

    } catch (error) {
        console.error("Error fetching passes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function superiorAccept (req, res) {
    try {
        const superior_unique_id = req.session.unique_number;
        const { pass_id, medical_status, comment } = req.body;

        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        const db = getDb();
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
}

async function superiordecline (req, res) {
    try {
        const superior_unique_id = req.session.unique_number;
        const { pass_id, comment } = req.body;

        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        const db = getDb();
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
}

async function getOldPassSuperior (req, res) {
    try {
        const db = getDb();
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
}

async function getVacateFormRequest (req, res) {
    try {
        const db = getDb();
        const vacateCollection = db.collection("vacate_forms");

        const vacateForms = await vacateCollection.find().toArray();

        res.json({ vacate_forms: vacateForms });
    } catch (err) {
        console.error("Error fetching vacate forms:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function confirmVacate (req, res) {
    try {
        const db = getDb();
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
}

module.exports = {
    profileChangeRequestSuperior,
    profileUpdate,
    fetchPassSuperior,
    superiorAccept,
    superiordecline,
    getOldPassSuperior,
    getVacateFormRequest,
    confirmVacate
}