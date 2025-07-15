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

module.exports = { getAcademicCalender }