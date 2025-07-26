const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getHostelDetails (req, res) {
    const db = getDb();
    const collection = db.collection('hostel_menu');

    try {
        const hostel_menu = await collection.find({}).toArray();
        if (hostel_menu.length === 0) {
            return res.status(404).json({ message: 'No hostel menu found' });
        }
        res.status(200).json(hostel_menu);
    } catch (error) {
        console.error('Error fetching hostel menu:', error);
        await logError(req, error, 'Error in hostel menu', 500);
        res.status(500).json({ error: 'Error fetching hostel menu' });
    }
}

module.exports = { getHostelDetails }