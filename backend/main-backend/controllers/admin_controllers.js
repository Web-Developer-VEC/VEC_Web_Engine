const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror')

async function getAdmin (req, res) {
    const db = getDb();
    const collection = db.collection('admin_office');

    try {
        const admin_office = await collection.find({}).toArray();
        if (admin_office.length === 0) {
            return res.status(404).json({ message: 'No admin office found' });
        }
        res.status(200).json(admin_office);
    } catch (error) {
        console.error('Error fetching admin office:', error);
        await logError(req, error, 'Error fetching admin office', 500);
        res.status(500).json({ error: 'Error fetching admin office' });
    }
}

module.exports = { getAdmin }