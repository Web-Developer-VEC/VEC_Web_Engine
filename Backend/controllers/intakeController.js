const { getDb } = require('../config/db');

async function getUG (req, res) {
    const db = getDb();
    const collection = db.collection('Intakes');

    try {
        const data = await collection.findOne({}, { projection: { UG: 1, UG_Lateral: 1, _id: 0, Year:1 } });
        if (!data) {
            return res.status(404).json({ message: 'No UG and UG_Lateral details found' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Error fetching UG and UG_Lateral details:', error);
        res.status(500).json({ error: 'Error fetching UG and UG_Lateral details' });
    }
}

async function getPG (req, res) {
    const db = getDb();
    const collection = db.collection('Intakes');

    try {
        const data = await collection.findOne({}, { projection: { PG: 1, _id: 0 , Year:1} });
        if (!data) {
            return res.status(404).json({ message: 'No PG details found' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Error fetching PG details:', error);
        res.status(500).json({ error: 'Error fetching PG details' });
    }
}

async function getMBA (req, res) {
    const db = getDb();
    const collection = db.collection('Intakes');

    try {
        const data = await collection.findOne({}, { projection: { MBA: 1, _id: 0 , Year:1} });
        if (!data) {
            return res.status(404).json({ message: 'No MBA details found' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Error fetching MBA details:', error);
        res.status(500).json({ error: 'Error fetching MBA details' });
    }
}

module.exports = { 
    getUG,
    getPG,
    getMBA
}