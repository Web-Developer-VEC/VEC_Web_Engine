const { getDb } = require('../config/db');

async function getAlumni (req, res) {
    const db = getDb();
    const collection = db.collection('alumni');

    try {
        const alumniData = await collection.find({}).toArray();
        if (alumniData.length === 0) {
            return res.status(404).json({ message: 'No alumni data found' });
        }
        res.status(200).json(alumniData);
    } catch (error) {
        console.error('❌ Error fetching alumni data:', error);
        res.status(500).json({ error: 'Error fetching alumni data' });
    }
}

module.exports = { getAlumni }