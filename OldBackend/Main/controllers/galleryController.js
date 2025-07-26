const { getDb } = require('../config/db')

async function getGalleryData (req, res) {
    const db = getDb()
    const collection = db.collection('gallery');

    try {
        const galleryData = await collection.find({}).toArray();
        if (galleryData.length === 0) {
            return res.status(404).json({ message: 'No gallery data found' });
        }   
        res.status(200).json(galleryData);
    } catch (error) {
        console.error('❌ Error fetching gallery data:', error);
        res.status(500).json({ error: 'Error fetching gallery data' });
    }
}

module.exports = {
    getGalleryData
}