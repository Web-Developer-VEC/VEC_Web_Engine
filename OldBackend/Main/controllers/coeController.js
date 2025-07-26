const { getDb } = require("../config/db");

async function getCoeData (req, res) {
    try {
        const db = getDb();
        const collection = db.collection('coe'); 

        const coeData = await collection.find({}).toArray();

        if (coeData.length === 0) {
            return res.status(404).json({ message: 'No COE data found' });
        }

        res.status(200).json(coeData);

    } catch (error) {
        console.error('❌ Error fetching COE data:', error);
        res.status(500).json({ error: 'Error fetching COE data' });
    }
}

module.exports = { getCoeData }