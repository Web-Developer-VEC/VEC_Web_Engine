const { getDb } = require('../config/db');

async function getDean (req, res) {
    const db = getDb();
    const collection = db.collection('dean_and_associates');

    try {
        const deansData = await collection.find({}).toArray();
        if (deansData.length === 0) {
            return res.status(404).json({ message: 'No deans data found' });
        }
        res.status(200).json(deansData);
    } catch (error) {
        console.error('❌ Error fetching deans data:', error);
        res.status(500).json({ error: 'Error fetching deans data' });
    }
}

module.exports = { getDean }