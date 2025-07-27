const { getDb } = require("../config/db");
const logError = require("../middlewares/logerror");

const allowedTypes = new Set([
  'academic_calendar',
  'programmes_list',
  'departments_list'
]);

// POST /academics - fetch specific academic data
async function getAcademicsData(req, res) {
  const { type } = req.body;

  if (!type || !allowedTypes.has(type)) {
    return res.status(400).json({ message: 'Invalid or missing academic data type' });
  }

  try {
    const db = getDb();
    const collection = db.collection('academics');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Academic data for '${type}' not found` });
    }

    return res.status(200).json({
      message: `${type} data fetched successfully`,
      data: document
    });

  } catch (error) {
    console.error(`Error fetching academic data for type '${req.body.type}':`, error);
    await logError(req, error, `Error fetching academic data for type '${req.body.type}'`, 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getAcademicsData };
