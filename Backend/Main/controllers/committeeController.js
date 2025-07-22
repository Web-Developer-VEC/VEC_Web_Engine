const { getDb } = require('../config/db');

async function getCommittee (req, res) {
    const db = getDb();
    const collection = db.collection('committee');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        return res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
}

async function getHandbook (req, res) {
    const db = getDb();
    const collection = db.collection('handbook');

    try {
        const handbookData = await collection.find({}).toArray();
        if (handbookData.length === 0) {
            return res.status(404).json({ message: 'No handbook data found' });
        }   
        res.status(200).json(handbookData);
    } catch (error) {
        console.error('❌ Error fetching handbook data:', error);
        res.status(500).json({ error: 'Error fetching handbook data' });
    }
}

module.exports = { getCommittee, getHandbook }