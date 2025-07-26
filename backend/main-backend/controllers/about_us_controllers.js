const { getDb } = require('../config/db')
const logError = require('../middlewares/logerror');

async function getAbtUs (req, res) {
    const db = getDb()
    const collection = db.collection('about_us');

    try {
        const about_us = await collection.find({}).toArray();
        if (about_us.length === 0) {
            return res.status(404).json({ message: 'No about us found' });
        }
        res.status(200).json(about_us);
    } catch (error) {
        console.error('Error fetching about_us:', error);
        await logError(req, error, 'Error fetching about us', 500);
        res.status(500).json({ error: 'Error fetching about us' });
    }
}

module.exports = { getAbtUs }