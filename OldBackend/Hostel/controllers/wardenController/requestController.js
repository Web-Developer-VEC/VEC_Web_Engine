const { getDb } = require('../../config/db');
const { generateQR } = require('../../services/generateQR');

async function getFoodRequestChange (req, res) {
    try {
        const unique_id = req.session.unique_number;

        if (!unique_id) {
            return res.status(400).json({ error: "warden_unique_id is required" });
        }

        const db = getDb();
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
}

async function foodChangeApprove (req, res) {
    const { registration_number, name, action } = req.body;
    const db = getDb();
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
}

async function fetchOldPassWarden (req, res) {
    try {
        const db = getDb();
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
}

async function fetchPassWarden (req, res) {
    try {
        const warden_id = req.session.unique_number;
        const db = getDb();
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
}

async function WardenAccept (req, res) {
    try {
        const warden_unique_id = req.session.unique_number;
        const { pass_id, medical_status, comment } = req.body;
        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        const db = getDb();
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
}

async function wardenReject (req, res) {
    try {
        const warden_unique_id = req.session.unique_number;
        const { pass_id, comment } = req.body;

        if (!pass_id) {
            return res.status(400).json({ error: "pass_id is required" });
        }
        const db = getDb();
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
}

module.exports = {
    getFoodRequestChange,
    foodChangeApprove,
    fetchOldPassWarden,
    fetchPassWarden,
    wardenReject,
    WardenAccept
}