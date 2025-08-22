const { getlogDb } = require('../config/db')
const logError = require('../middlewares/logerror');

async function getDatabaseLogs (req, res) {
    const db = getlogDb()
    const collection = db.collection('logs');

    try {
        const logs_data = await collection.find({}).toArray();
        if (logs_data.length === 0) {
            return res.status(404).json({ message: 'No logs found' });
        }
        res.status(200).json(logs_data);
    } catch (error) {
        console.error('Error fetching logs:', error);
        await logError(req, error, 'Error fetching logs data', 500);
        res.status(500).json({ error: 'Error fetching logs data' });
    }
}

module.exports = { getDatabaseLogs }