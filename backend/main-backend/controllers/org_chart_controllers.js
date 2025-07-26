const { getDb } = require("../config/db");
const logError = require('../middlewares/logerror');

async function getOrgChart (req, res) {
    const db = getDb();
    const collection = db.collection('organization_chart');

    try {
        const organization_chart = await collection.find({}).toArray();
        if (organization_chart.length === 0) {
            return res.status(404).json({ message: 'No organization chart found' });
        }
        res.status(200).json(organization_chart);
    } catch (error) {
        console.error('Error fetching organization chart:', error);
        await logError(req, error, 'Error in organization chart', 500);
        res.status(500).json({ error: 'Error fetching organization chart' });
    }
}

module.exports = { getOrgChart }