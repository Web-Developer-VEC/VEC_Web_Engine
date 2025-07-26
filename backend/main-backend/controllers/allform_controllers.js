const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror')

async function getAllForms (req, res) {
    const db = getDb();
    const collection = db.collection('all_forms');

    try {
        const all_forms = await collection.find({}).toArray();
        if (all_forms.length === 0) {
            return res.status(404).json({ message: 'No all forms found' });
        }
        res.status(200).json(all_forms);
    } catch (error) {
        console.error('Error fetching all forms:', error);
        await logError(req, error, 'Error fetching admin office', 500);
        res.status(500).json({ error: 'Error fetching all forms' });
    }
}

module.exports = { getAllForms }