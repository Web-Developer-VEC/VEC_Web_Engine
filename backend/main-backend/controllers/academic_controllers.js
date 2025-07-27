const { getDb } = require("../config/db");
const logError = require("../middlewares/logerror");

async function getAcademicsData(req, res) {
  try {
    const db = getDb();
    const collection = db.collection('academics');

    const requiredTypes = ['academic_calendar', 'programmes_list', 'departments_list'];
    const documents = await collection.find({ type: { $in: requiredTypes } }).toArray();

    const response = {
      academic_calendar: null,
      programmes_list: [],
      departments_list: [],
    };

    for (const document of documents) {
      switch (document.type) {
        case 'academic_calendar':
          response.academic_calendar = document.data;
          break;
        case 'programmes_list':
          response.programmes_list = document.data;
          break;
        case 'departments_list':
          response.departments_list = document.data;
          break;
      }
    }

    if (!response.academic_calendar || response.programmes_list.length === 0 || response.departments_list.length === 0) {
      return res.status(404).json({ message: 'Some academic data not found' });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching academics data:', error);
    await logError(req, error, 'Error fetching academics data', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getAcademicsData };
