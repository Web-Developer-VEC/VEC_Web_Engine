const { getDb } = require("../config/db");

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
        console.error('❌ Error fetching calendar:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

async function getDepartment (req, res) {
    const db = getDb();
    const collection = db.collection('departments_list');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No announcements found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching announcements:', error);
        res.status(500).json({ error: 'Error fetching announcements' });
    }
}

async function getProgrammes (req, res) {
    const db = getDb();
    const collection = db.collection('programmes_list');

    try {
        const announcements = await collection.find({}).toArray();
        if (announcements.length === 0) {
            return res.status(404).json({ message: 'No programmes list found' });
        }
        res.status(200).json(announcements);
    } catch (error) {
        console.error('❌ Error fetching programmes list:', error);
        res.status(500).json({ error: 'Error fetching programmes list' });
    }
}

module.exports = { getAcademicCalender, getDepartment, getProgrammes }