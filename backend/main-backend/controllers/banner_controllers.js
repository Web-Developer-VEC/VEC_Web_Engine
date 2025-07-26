const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getBanner (req, res) {
    const db = getDb();
    const collection = db.collection('banner');

    try {
        const bannersData = await collection.find({}).toArray();
        if (bannersData.length === 0) {
            return res.status(404).json({ message: 'No banners found' });
        }
        res.status(200).json(bannersData);
    } catch (error) {
        console.error('Error fetching banners:', error);
        await logError(req, error, 'Error fetching banner', 500);
        res.status(500).json({ error: 'Error fetching banners' });
    }
}

module.exports = { getBanner }