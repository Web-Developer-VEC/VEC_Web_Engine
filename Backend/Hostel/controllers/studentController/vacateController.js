const { getDb } = require('../../config/db');

async function submitVacateForm (req, res) {
    try {
        const db = getDb();
        const studentCollection = db.collection("student_database");
        const vacateCollection = db.collection("vacate_forms");
        const wardenCollection = db.collection("warden_database");

        const { student_id, Reason, date_time , Address } = req.body;

        if (!student_id || !Reason || !date_time || !Address) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const studentData = await studentCollection.findOne({ registration_number : student_id });
        if (!studentData) {
            return res.status(404).json({ error: "Student not found" });
        }
        const vacateEntry = {
            name: studentData.name,
            registration_number: studentData.registration_number,
            dept: studentData.department,
            year: studentData.year,
            gender: studentData.gender,
            room_no: studentData.room_number,
            blockname: studentData.block_name,
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

        await wardenCollection.updateOne(
            { unique_id: "004"},
            { $set: { vacated_students: count }}
        )

        res.json({
            message: "Vacate form submitted successfully",
            count : count
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    submitVacateForm
}