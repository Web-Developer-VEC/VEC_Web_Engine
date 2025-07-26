const { getDb } = require('../config/db')
const logError = require('../middlewares/logerror');

async function getAbtUs (req, res) {
    const db = getDb()
    const collection = db.collection('about_us');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        await logError(req, error, 'Error fetching announcements', 500);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
}

module.exports = { getAbtUs }