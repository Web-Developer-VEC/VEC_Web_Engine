const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getPatent (req, res) {
    try {
        const db = getDb();
        const collection = db.collection('overall_patent');  // Replace with your collection name

        const patentData = await collection.find({}).toArray();
        if (patentData.length === 0) {
            return res.status(404).json({ message: 'No patent data found' });
        }
        res.status(200).json(patentData);

    } catch (error) {
        console.error('Error fetching patent data:', error);
        await logError(req, error, 'Error in overall patent', 500);
        res.status(500).json({ error: 'Error fetching patent data' });
    }
}

async function getConference (req, res) {
    try {
        const db = getDb();
        const collection = db.collection('overall_conference_publication');  

        const patentData = await collection.find({}).toArray();
        if (patentData.length === 0) {
            return res.status(404).json({ message: 'No overall conference publication found' });
        }
        res.status(200).json(patentData);

    } catch (error) {
        console.error('Error fetching overall conference publication:', error);
        await logError(req, error, 'Error in overall conference publication', 500);
        res.status(500).json({ error: 'Error fetching overall conference publication' });
    }
}

async function getJournal (req, res) {
    try {
        const db = getDb();
        const collection = db.collection('overall_journal_publications');  

        const patentData = await collection.find({}).toArray();
        if (patentData.length === 0) {
            return res.status(404).json({ message: 'No overall journal publications found' });
        }
        res.status(200).json(patentData);

    } catch (error) {
        console.error('Error fetching overall journal publications:', error);
        await logError(req, error, 'Error in overall journal publications', 500);
        res.status(500).json({ error: 'Error fetching overall journal publications' });
    }
}

async function getBooks (req, res) {
    try {
        const db = getDb();
        const collection = db.collection('overall_book_publication');  

        const patentData = await collection.find({}).toArray();
        if (patentData.length === 0) {
            return res.status(404).json({ message: 'No overall book publication found' });
        }
        res.status(200).json(patentData);

    } catch (error) {
        console.error('Error fetching overall book publication:', error);
        await logError(req, error, 'Error in overall book publication', 500);
        res.status(500).json({ error: 'Error fetching overall book publication' });
    }
}

module.exports = { 
    getPatent,
    getConference,
    getJournal,
    getBooks
}