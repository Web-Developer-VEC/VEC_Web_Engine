const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

const ALLOWED_TYPES = [
  'page_details',
  'banner',
  'department_banner',
  'notifications',
  'announcements',
  'special_announcements',
  'events'
];

async function getLandingpageData(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid admissions section` });
    }

    const db = getDb();
    const collection = db.collection('landing_page_details');

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching landing page section:', error);
    await logError(req, error, 'Error fetching landing page section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getLandingpageData }