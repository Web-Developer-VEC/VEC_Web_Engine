const { getDb } = require('../config/db');

async function getWebTeamData (req, res) {
    const db = getDb();
    const collection = db.collection('web_team');

    try {
        const webteamdata = await collection.find({}).toArray();
        if (webteamdata.length === 0) {
            return res.status(404).json({ message: 'No web team data found' });
        }
        res.status(200).json(webteamdata);
    } catch (error) {
        console.error('Error fetching web team data:', error);
        res.status(500).json({ error: 'Error fetching library data' });
    }
}

module.exports = { getWebTeamData }