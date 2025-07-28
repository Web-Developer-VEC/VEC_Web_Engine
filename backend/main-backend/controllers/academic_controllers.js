const { getDb } = require("../config/db");
const logError = require("../middlewares/logerror");

const allowedTypes = new Set([
  'academic_calendar',
  'programmes_list',
  'departments_list'
]);

async function getAcademicsData(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!allowedTypes.has(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid admissions section` });
    }

    const db = getDb();
    const collection = db.collection('academics');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching academics section:', error);
    await logError(req, error, 'Error fetching academics section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getAcademicsData };
