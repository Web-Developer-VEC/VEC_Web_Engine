const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getAdministrationSections(req, res) {
  try {
    const db = getDb();
    const collection = db.collection('administration');

    const documents = await collection.find({}, { projection: { _id: 0, type: 1, data: 1 } }).toArray();

    if (!documents.length) {
      return res.status(404).json({ message: 'No administration sections found' });
    }

    const response = {};
    for (const doc of documents) {
      response[doc.type] = doc.data;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching administration sections:', error);
    await logError(req, error, 'Error fetching administration sections', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getAdministrationSections };
