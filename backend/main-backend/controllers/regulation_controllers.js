const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getCurriculumandSyllabus(req, res) {
    const db = getDb();
    const collection = db.collection('curriculum_and_syllabus');

    try {
        const curriculum_and_syllabus = await collection.find({}).toArray();
        if (curriculum_and_syllabus.length === 0) {
            return res.status(404).json({ message: 'No curriculum or syllabus found' });
        }
        res.status(200).json(curriculum_and_syllabus);
    } catch (error) {
        console.error('Error fetching curriculum and syllabus', error);
        await logError(req, error, 'Error in curriculum_and_syllabus data', 500);
        res.status(500).json({ error: 'Error fetching curriculum and syllabus' });
    }
}

module.exports = { 
    getCurriculumandSyllabus
}