const { getDb } = require('../config/db');

async function getNssData (req, res) {
    try {
        const db = getDb();
        const nssCollection = db.collection("nss_data");
        const nss_data = await nssCollection.find({}).toArray();

        if (nss_data.length === 0) {
            return res.status(204).send();
        }

        return res.status(200).json(nss_data);
    } catch (error) {
        console.error("Error fetching NSS data:", error);
        return res.status(500).json({ error: "Internal server error" });
    } 
}

async function getYrcData (req, res) {
    try {
        const db = getDb();
        const yrcCollection = db.collection("yrc_data");
        const yrc_data = await yrcCollection.find({}).toArray();

        if (yrc_data.length === 0) {
            return res.status(204).send();
        }

        return res.status(200).json(yrc_data);
    } catch (error) {
        console.error("Error fetching NSS data:", error);
        return res.status(500).json({ error: "Internal server error" });
    } 
}

async function getArmyData (req, res) {
    const db = getDb();
    const collection = db.collection('army');
    try {
        const Data = await collection.find({}).toArray();
        if (Data.length === 0) {
            return res.status(404).json({ message: 'No navy data found' });
        }
        res.status(200).json(Data);
    } catch (error) {
        console.error('❌ Error fetching navy data:', error);
        res.status(500).json({ error: 'Error fetching armydata' });
    }
}

async function getNavyData (req, res) {
    const db = getDb();
    const collection = db.collection('navy');
    try {
        const NAVYData = await collection.find({}).toArray();
        if (NAVYData.length === 0) {
            return res.status(404).json({ message: 'No navy data found' });
        }
        res.status(200).json(NAVYData);
    } catch (error) {
        console.error('❌ Error fetching navy data:', error);
        res.status(500).json({ error: 'Error fetching navy data' });
    }
}

module.exports = {
    getNssData,
    getYrcData,
    getNavyData,
    getArmyData
}