const { getDb } = require('../../config/db');

async function getFoodCountSuperior (req, res) { 
    try {
        const db = getDb();
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
}

module.exports = {
    getFoodCountSuperior
}