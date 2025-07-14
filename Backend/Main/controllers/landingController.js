const { getDb } = require('../config/db')

async function getLandingpageData (req, res) {
  try {
    const db = getDb();
    const config = await db.collection('landing_page_details').findOne({});

    if (!config) {
      return res.status(404).json({ error: 'Landing page data not found' });
    }
    const { _id, ...cleanedConfig } = config;

    res.json(cleanedConfig);
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getLandingpageData }