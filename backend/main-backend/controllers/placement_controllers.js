const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

const ALLOWED_PLACEMENT_TYPES = [
  'about_placement',
  'placement_team',
  'placement_details',
  'alumini'
];

async function getPlacementsSection(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_PLACEMENT_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid placement section` });
    }

    const db = getDb();
    const collection = db.collection('placement');

    const projection = { _id: 0, type: 1, data: 1 };

    const mainDoc = await collection.findOne({ type }, { projection });

    if (!mainDoc) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    if (type === 'alumini') {
      const specialAnnouncementCollection = db.collection('landing_page_details');
      const type = 'special_announcements';

      const specialAnnouncement = await specialAnnouncementCollection.findOne(
        { type },
        { projection: { _id: 0, data: 1 } }
      );

      if (specialAnnouncement) {
        mainDoc.special_announcement = specialAnnouncement;
      }
    }

    return res.status(200).json(mainDoc);

  } catch (error) {
    console.error('Error fetching placement section:', error);
    await logError(req, error, 'Error fetching placement section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getPlacementsSection };
