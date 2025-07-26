const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getWrdenData (req, res) {
    try {
        const db = getDb();
        const wardenCollection = db.collection("warden_profile");

        const warden_details = await wardenCollection.find({}).toArray();

        if (!warden_details || warden_details.length === 0) {
            return res.status(404).json({ message: "No wardens found" });
        }

        res.status(200).json({ wardens: warden_details });

    } catch (error) {
        console.error("Error fetching data:", error);
        await logError(req, error, 'Error in warden profile data', 500);
        return res.status(500).json({ error: "Error fetching warden profile data" });
    }
}

module.exports = { getWrdenData }