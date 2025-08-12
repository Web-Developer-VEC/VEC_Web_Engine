const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');
const allowedSections = require('../models/about_us_models');
// POST /about_us - Fetch a specific section from About Us
async function getAboutUs(req, res) {
  const { type } = req.body;

  console.log(type);

  if (!type || !allowedSections.has(type)) {
    return res.status(400).json({ message: 'Invalid or missing section' });
  }

  const database = getDb();
  const aboutUsCollection = database.collection('about_us');

  try {
    const document = await aboutUsCollection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found` });
    }

    return res.status(200).json( document );
  } 
  catch (error) {
  await logError(req, error, `Error fetching About Us section '${type}'`, 500);
  return res.status(500).json({ error: 'Internal server error while fetching About Us content' });
  }
}

module.exports = { getAboutUs };
