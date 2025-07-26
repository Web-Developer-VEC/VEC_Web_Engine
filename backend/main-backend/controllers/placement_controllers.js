const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

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
        console.error('Error fetching placement team data:', error);
        await logError(req, error, 'Error in placement team', 500);
        res.status(500).json({ error: 'Error fetching placement team data' });
    }
}

async function getPlacementData (req, res) {
    const db = getDb();
    const collection = db.collection('placements_data');

    try {
        const placements_data = await collection.find({}).toArray();
        if (placements_data.length === 0) {
            return res.status(404).json({ message: 'No placements data found' });
        }
        res.status(200).json(placements_data);
    } catch (error) {
        console.error('Error fetching placements data:', error);
        await logError(req, error, 'Error in placements data', 500);
        res.status(500).json({ error: 'Error fetching placements data' });
    }
}

module.exports = {
    getPlacementData,
    getPlacementTeam
}