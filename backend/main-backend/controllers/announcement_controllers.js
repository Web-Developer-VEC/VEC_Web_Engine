const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getAnnouncement (req, res){
    const db = getDb();
    const collection = db.collection('announcements');

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

async function getSpecialAnnouncement(req, res) {
    const db = getDb();
    const collection = db.collection('special_announcement');

    try {
        const special_announcement = await collection.find({}).toArray();
        if (special_announcement.length === 0) {
            return res.status(404).json({ message: "No special announcement details found" });
        }
        res.status(200).json(special_announcement);
    } catch (error) {
        console.error("Error fetching special announcement details:", error);
        await logError(req, error, 'Error fetching special announcement', 500);
        res.status(500).json({ error: "Error fetching special announcement details" });
    }
}

module.exports = {
    getAnnouncement,
    getSpecialAnnouncement
}