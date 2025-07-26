const { getDb } = require("../config/db");
const logError = require('../middlewares/logerror');

async function getAcademicCalender (req, res) {
      try {
        const db = getDb();
        const collection = db.collection('academic_calender');

        // Fetch the calendar document
        const calendar = await collection.findOne();

        if (!calendar || !calendar.year || calendar.year.length === 0) {
          return res.status(404).json({ message: 'No calendar data found' });
        }

        res.status(200).json(calendar);
      } catch (error) {
        console.error('Error fetching calendar:', error);
        await logError(req, error, 'Error fetching calendar', 500);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

async function getDepartment (req, res) {
    const db = getDb();
    const collection = db.collection('departments_list');

    try {
        const departments_list = await collection.find({}).toArray();
        if (departments_list.length === 0) {
            return res.status(404).json({ message: 'No departments list found' });
        }
        res.status(200).json(departments_list);
    } catch (error) {
        console.error('Error fetching departments list:', error);
        await logError(req, error, 'Error fetching departments list', 500);
        res.status(500).json({ error: 'Error fetching departments list' });
    }
}

async function getProgrammes (req, res) {
    const db = getDb();
    const collection = db.collection('programmes_list');

    try {
        const programmes_list = await collection.find({}).toArray();
        if (programmes_list.length === 0) {
            return res.status(404).json({ message: 'No programmes list found' });
        }
        res.status(200).json(programmes_list);
    } catch (error) {
        console.error('Error fetching programmes list:', error);
        await logError(req, error, 'Error fetching programmes list', 500);
        res.status(500).json({ error: 'Error fetching programmes list' });
    }
}

module.exports = { getAcademicCalender, getDepartment, getProgrammes }