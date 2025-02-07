const { getDb } = require('../config/db');

async function getRegulation (req, res) {
    const db = getDb();
    const collection = db.collection('regulation');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
}

async function getCurriculumandSyllabus(req, res) {
    const db = getDb();
    const collection = db.collection('curriculum_and_syllabus');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No curriculum or syllabus found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching curriculum and syllabus', error);
        res.status(500).json({ error: 'Error fetching curriculum and syllabus' });
    }
}

module.exports = { 
    getRegulation,
    getCurriculumandSyllabus
}