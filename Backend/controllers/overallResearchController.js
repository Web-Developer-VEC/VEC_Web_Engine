const { getDb } = require('../config/db');

async function getOverallResearchData (req, res) {
    const { category } = req.body;

    if (!category) {
        return res.status(400).json({ error: "Category is required" });
    }
    try {
        const db = getDb();
        const collection = db.collection("overall_research");
        const result = await collection.findOne({}, { projection: { [category]: 1, _id: 0 } });

        if (!result || !result[category]) {
            return res.status(404).json({ error: "Category not found" });
        }

        return res.status(200).json(result[category]);
    } catch (error) {
        console.error("Error fetching research data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getOverallResearchData }