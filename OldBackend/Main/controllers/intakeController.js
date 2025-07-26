const { getDb } = require('../config/db');

async function getUG (req, res) {
    const db = getDb();
    const collection = db.collection('Intakes');

    try {
        const data = await collection.findOne({}, { projection: { UG: 1, UG_Lateral: 1, _id: 0, Year:1, link: 1 } });
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

async function getAdmisionTeam (req, res) {
    const db = getDb();
    const collection = db.collection('admission_team');

    try {
        const admission_team = await collection.find({}).toArray();
        if (admission_team.length === 0) {
            return res.status(404).json({ message: 'No admission team data  found' });
        }
        res.status(200).json(admission_team);
    } catch (error) {
        console.error('❌ Error fetching admission team:', error);
        res.status(500).json({ error: 'Error fetching admission team' });
    }
}

module.exports = { 
    getUG,
    getPG,
    getMBA,
    getAdmisionTeam
}