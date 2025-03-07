const { getDb } = require('../../config/db');

async function getStudentPass (req, res) { 
    try {
        const student_unique_id = req.session.unique_number;
        const db = getDb();
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
}

module.exports = {
    getStudentPass
}