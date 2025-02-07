const { getDb } = require('../config/db');

async function getPrincipalData(req, res) {
    const db = getDb();
    const collection = db.collection('principal_data');

    try {
        const principalDetails = await collection.findOne({});
        if (!principalDetails) {
            return res.status(404).json({ message: "Principal details not found" });
        }
        res.status(200).json(principalDetails);
    } catch (error) {
        console.error("❌ Error fetching principal details:", error);
        res.status(500).json({ error: "Error fetching principal details" });
    }
}

module.exports = { getPrincipalData }