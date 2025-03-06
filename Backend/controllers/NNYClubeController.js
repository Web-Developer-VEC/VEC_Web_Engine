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

module.exports = {
    getNssData,
    getYrcData
}