const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getSportsData(req,res) {
    const db = getDb();
    const collection = db.collection('sports_data');

    try {
        const sports_data = await collection.find({}).toArray();
        if (sports_data.length === 0) {
            return res.status(404).json({ message: 'No Sports data found' });
        }
        res.status(200).json(sports_data);
    } catch (error) {
        console.error('Error fetching Sports data:', error);
        await logError(req, error, 'Error in sports data', 500);
        res.status(500).json({ error: 'Error fetching Sports data' });
    }
}

module.exports = { getSportsData }