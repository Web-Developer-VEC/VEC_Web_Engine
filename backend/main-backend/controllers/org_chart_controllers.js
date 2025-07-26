const { getDb } = require("../config/db");

async function getOrgChart (req, res) {
    const db = getDb();
    const collection = db.collection('organization_chart');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No organization chart found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching organization chart:', error);
        res.status(500).json({ error: 'Error fetching organization chart' });
    }
}

module.exports = { getOrgChart }