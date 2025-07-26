const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getCommittee (req, res) {
    const db = getDb();
    const collection = db.collection('committee');

    try {
        const committee = await collection.find({}).toArray();
        if (committee.length === 0) {
            return res.status(404).json({ message: 'No committee found' });
        }
        return res.status(200).json(committee);
    } catch (error) {
        console.error('Error fetching committee:', error);
        await logError(req, error, 'Error fetching committee', 500);
        res.status(500).json({ error: 'Error fetching committee' });
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
        console.error('Error fetching handbook data:', error);
        await logError(req, error, 'Error fetching handbook', 500);
        res.status(500).json({ error: 'Error fetching handbook data' });
    }
}

module.exports = { getCommittee, getHandbook }