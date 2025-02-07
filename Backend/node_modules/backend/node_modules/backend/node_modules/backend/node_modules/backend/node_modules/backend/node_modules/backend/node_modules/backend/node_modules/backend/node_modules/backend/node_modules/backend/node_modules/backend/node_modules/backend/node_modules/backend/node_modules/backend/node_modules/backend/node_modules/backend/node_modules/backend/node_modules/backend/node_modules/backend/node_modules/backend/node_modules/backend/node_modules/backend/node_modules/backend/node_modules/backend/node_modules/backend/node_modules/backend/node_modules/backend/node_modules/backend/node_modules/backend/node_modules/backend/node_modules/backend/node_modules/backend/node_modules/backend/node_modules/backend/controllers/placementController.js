const { getDb } = require('../config/db');

async function getPlacementTeam (req, res) {
    const db = getDb();
    const collection = db.collection('placement_team');

    try {
        const placementTeam = await collection.find({}).toArray();
        if (placementTeam.length === 0) {
            return res.status(404).json({ message: 'No placement team data found' });
        }
        res.status(200).json(placementTeam);
    } catch (error) {
        console.error('❌ Error fetching placement team data:', error);
        res.status(500).json({ error: 'Error fetching placement team data' });
    }
}

async function getPlacementData (req, res) {
    const db = getDb();
    const collection = db.collection('placements_data');

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

module.exports = {
    getPlacementData,
    getPlacementTeam
}