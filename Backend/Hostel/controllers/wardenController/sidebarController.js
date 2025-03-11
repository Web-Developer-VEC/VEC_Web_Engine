const { getDb } = require('../../config/db');

async function getWardenDetail (req, res) { 
    try {
        const db = getDb();
        const wardenCollection = db.collection("warden_database");
        const warden_id = req.session.unique_number;
        const warden_data = await wardenCollection.findOne({ unique_id : warden_id });
        res.json({
            "name" : warden_data.warden_name,
            "primary year" : warden_data.primary_year,
            "Secondary year": warden_data.secondary_year,
            "Phone number": warden_data.phone_number,
            "image_path" : warden_data.image_path,
            "Active Status": warden_data.active
        })
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getWardenDetail
}