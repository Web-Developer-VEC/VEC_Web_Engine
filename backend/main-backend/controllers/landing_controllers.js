const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');
const ALLOWED_TYPES = require('../models/landing_models');

// Mapping aliases to actual types
const TYPE_ALIASES = {
  announcements: ['announcements', 'special_announcements'],
  notifications: ['notifications', 'page_details']
};

async function getLandingpageData(req, res) {
  try {
    const { type } = req.body;

    if (!type || (typeof type !== 'string' && !Array.isArray(type))) {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    // Normalize to array
    const typeArray = Array.isArray(type) ? type : [type];

    // Expand aliases
    const expandedTypes = typeArray.flatMap(t => TYPE_ALIASES[t] || [t]);

    // Validate types
    const invalidTypes = expandedTypes.filter(t => !ALLOWED_TYPES.includes(t));
    if (invalidTypes.length > 0) {
      return res.status(400).json({ error: `Invalid type(s): ${invalidTypes.join(', ')}` });
    }

    const db = getDb();
    const collection = db.collection('landing_page_details');

    const documents = await collection
      .find({ type: { $in: expandedTypes } }, { projection: { _id: 0, type: 1, data: 1 } })
      .toArray();

    if (!documents.length) {
      return res.status(404).json({ message: `No content found for type(s)` });
    }

    return res.status(200).json({ data: documents });

  } catch (error) {
    console.error('Error fetching landing page data:', error);
    await logError(req, error, 'Error fetching landing page data', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getLandingpageData };
