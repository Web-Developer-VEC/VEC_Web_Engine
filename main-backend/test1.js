const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 5000;

const uri = "mongodb://localhost:27017";  // Replace with your MongoDB connection string
const client = new MongoClient(uri);
const dbName = "VEC";    

//handbook
app.get('/api/handbook', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('handbook');

    try {
        const handbookData = await collection.find({}).toArray();
        if (handbookData.length === 0) {
            return res.status(404).json({ message: 'No handbook data found' });
        }   
        res.status(200).json(handbookData);
    } catch (error) {
        console.error('❌ Error fetching handbook data:', error);
        res.status(500).json({ error: 'Error fetching handbook data' });
    }
});

//
app.get('/api/gallery', async (req, res) => {
    const db = client.db(dbName);
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
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});