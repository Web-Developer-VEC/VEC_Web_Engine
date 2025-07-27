const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

const allowedSections = new Set([
  'about_vec',
  'about_trust',
  'vision_and_mission',
  'Management',
  'contact_us'
]);

// POST /about_us - Fetch a specific section from About Us
async function getAboutUs(req, res) {
  const { section } = req.body;

  if (!section || !allowedSections.has(section)) {
    return res.status(400).json({ message: 'Invalid or missing section' });
  }

  const database = getDb();
  const aboutUsCollection = database.collection('about_us');

  try {
    const document = await aboutUsCollection.findOne(
      { section },
      { projection: { _id: 0, section: 1, content: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${section}' not found` });
    }

    return res.status(200).json({
      message: `'${section}' content fetched successfully`,
      data: document
    });

  } catch (error) {
    console.error(`Error fetching About Us section '${section}':`, error);
    await logError(req, error, `Error fetching About Us section '${section}'`, 500);
    return res.status(500).json({ error: 'Internal server error while fetching About Us content' });
  }
}

module.exports = { getAboutUs };
