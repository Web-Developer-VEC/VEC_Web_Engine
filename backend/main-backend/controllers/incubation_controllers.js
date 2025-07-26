const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getIncubationData (req, res) {
    const db = getDb();
    const collection = db.collection('incubation');
    try {
        const incubation = await collection.find({}).toArray();
        if (incubation.length === 0) {
            return res.status(404).json({ message: 'No incubation data found' });
        }
        res.status(200).json(incubation);
    } catch (error) {
        console.error('Error fetching incubation data:', error);
        await logError(req, error, 'Error in incubation', 500);
        res.status(500).json({ error: 'Error fetching incubation data' });
    }
}

module.exports = {
    getIncubationData
}