const { getDb } = require('../config/db');

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
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
}

async function getSpecialAnnouncement(req, res) {
    const db = getDb();
    const collection = db.collection('special_announcement');

    try {
        const nominationDetails = await collection.find({}).toArray();
        if (nominationDetails.length === 0) {
            return res.status(404).json({ message: "No special_announcement details found" });
        }
        res.status(200).json(nominationDetails);
    } catch (error) {
        console.error("❌ Error fetching special_announcement details:", error);
        res.status(500).json({ error: "Error fetching special_announcement details" });
    }
}

module.exports = {
    getAnnouncement,
    getSpecialAnnouncement
}