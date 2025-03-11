const { getDb } = require('../config/db');

async function getIncubationData (req, res) {
    const db = getDb();
    const collection = db.collection('incubation');
    try {
        const NAVYData = await collection.find({}).toArray();
        if (NAVYData.length === 0) {
            return res.status(404).json({ message: 'No incubation data found' });
        }
        res.status(200).json(NAVYData);
    } catch (error) {
        console.error('❌ Error fetching incubation data:', error);
        res.status(500).json({ error: 'Error fetching incubation data' });
    }
}

module.exports = {
    getIncubationData
}