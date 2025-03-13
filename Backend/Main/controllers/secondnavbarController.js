const { getDb } = require('../config/db');

async function getNirf (req, res) {
    const db = getDb();
    const collection = db.collection('nirf');
    try {
        const NIRFData = await collection.find({}).toArray();
        if (NIRFData.length === 0) {
            return res.status(404).json({ message: 'No NIRF data found' });
        }
        res.status(200).json(NIRFData);
    } catch (error) {
        console.error('❌ Error fetching NIRF data:', error);
        res.status(500).json({ error: 'Error fetching NIRF data' });
    }
}

async function getNaac (req, res) {
    const db = getDb();
    const collection = db.collection('naac');
    try {
        const NAACData = await collection.find({}).toArray();
        if (NAACData.length === 0) {
            return res.status(404).json({ message: 'No NAAC data found' });
        }
        res.status(200).json(NAACData);
    } catch (error) {
        console.error('❌ Error fetching NAAC data:', error);
        res.status(500).json({ error: 'Error fetching NAAC data' });
    }
}

async function getNba (req, res) {
    const db = getDb();
    const collection = db.collection('nba');

    try {
        const alumniData = await collection.find({}).toArray();
        if (alumniData.length === 0) {
            return res.status(404).json({ message: 'No nba data found' });
        }
        res.status(200).json(alumniData);
    } catch (error) {
        console.error('❌ Error fetching alumni data:', error);
        res.status(500).json({ error: 'Error fetching nba data' });
    }
}

async function getiic(req, res) {
    const db = getDb();
    const collection = db.collection('iic');
    
    try {
        
        const data = await collection.findOne({}); 

        if (!data) {
            return res.status(404).json({ message: "No data found" });
        }

        return res.status(200).json(data); 
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function getIqac(req, res) {
        try {
            const db = getDb();
            const collection = db.collection("IQAC");
    
            const data = await collection.find({}).toArray();
    
            if (!data || data.length === 0) {
                return res.status(404).json({ message: "No data found" });
            }
    
            res.status(200).json({ data: data });
        } catch (error) {
            console.error("❌ Error fetching data:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

module.exports = {
    getNaac,
    getNba,
    getNirf,
    getiic,
    getIqac
}