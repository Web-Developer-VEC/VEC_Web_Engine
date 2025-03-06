const { getDb } = require('../config/db');

async function getLibraryData (req, res) {
    const db = getDb();
    const collection = db.collection('library');

    try {
        const libraryData = await collection.find({}).toArray();
        if (libraryData.length === 0) {
            return res.status(404).json({ message: 'No library data found' });
        }
        res.status(200).json(libraryData);
    } catch (error) {
        console.error('❌ Error fetching library data:', error);
        res.status(500).json({ error: 'Error fetching library data' });
    }
}

module.exports = { getLibraryData }