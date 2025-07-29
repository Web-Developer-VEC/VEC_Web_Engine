const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');
const ALLOWED_TYPES = require('../models/landing_models');

async function getLandingpageData(req, res) {
  try {
    const { type } = req.body;

    console.log(type);
    

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    const db = getDb();
    const collection = db.collection('landing_page_details');

    // Case 1: type is a group (like 'landing_data')
    if (ALLOWED_TYPES[type]) {
      const sections = ALLOWED_TYPES[type];
      const documents = await collection
        .find({ type: { $in: sections } }, { projection: { _id: 0, type: 1, data: 1 } })
        .toArray();

      return res.status(200).json({ type, data: documents });
    }

    // Case 2: type is a valid individual section (like 'page_details')
    const allValidTypes = Object.values(ALLOWED_TYPES).flat();
    if (allValidTypes.includes(type)) {
      const document = await collection.findOne(
        { type },
        { projection: { _id: 0, type: 1, data: 1 } }
      );

      if (!document) {
        return res.status(404).json({ message: `Section '${type}' not found `});
      }

      return res.status(200).json(document);
    }

    // Invalid type
    return res.status(400).json({ error: `"${type}" is not a valid landing page section` });

  } catch (error) {
    console.error('Error fetching landing page section:', error);
    await logError(req, error, 'Error fetching landing page section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getLandingpageData };