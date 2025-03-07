const { getDb } = require('../../config/db');

async function getFoodCount (req, res) { 
    try {
        const db = getDb();
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
}

module.exports = {
    getFoodCount
}