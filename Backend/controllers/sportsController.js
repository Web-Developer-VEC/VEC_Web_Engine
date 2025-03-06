const { getDb } = require('../config/db');

async function getSportsData(req,res) {
    const db = getDb();
    const collection = db.collection('sports_data');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No Sports data found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching Sports data:', error);
        res.status(500).json({ error: 'Error fetching Sports data' });
    }
}

module.exports = { getSportsData }