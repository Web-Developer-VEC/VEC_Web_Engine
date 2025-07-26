const cron = require('node-cron');
const { getDb } = require('../config/db');
const moment = require('moment');

const scheduleResetCounters = () => {
  cron.schedule('* * * * *', async () => { // Use '0 0 * * *' in production
    const db = getDb();
    const collection = db.collection('hits_logs');
    const now = moment();

    const today = now.format('YYYY-MM-DD');
    const currentDayOfWeek = now.day(); // Sunday = 0
    const currentMonth = now.format('MMMM');
    const lastMonth = now.clone().subtract(1, 'month').format('MMMM');

    // Determine the current week of the month (1 to 5)
    const startOfMonth = now.clone().startOf('month');
    const weekNumber = Math.ceil((now.date() + startOfMonth.day()) / 7);

    try {
      const allDocs = await collection.find({}).toArray();

      for (const doc of allDocs) {
        const lastDay = doc.currentDay || 0;
        const thisYear = doc.thisYear || {};
        const monthly = thisYear.monthly || {};
        const currentMonthData = monthly[currentMonth] || {};
        const lastMonthData = monthly[lastMonth] || {};
        const updatedFields = {
          lastDay,
          currentDay: 0 // still track today fresh
        };

        // 🔁 Last Week Handling
        if (weekNumber > 1) {
          const previousWeekKey = `week${weekNumber - 1}`;
          updatedFields.lastWeek = currentMonthData[previousWeekKey] || 0;
        } else {
          // If it's week 1 → get week4 of last month
          updatedFields.lastWeek = lastMonthData['week4'] || 0;
        }

        // 🔁 Last Month Handling (on 1st of current month)
        if (now.date() === 1 && lastMonthData) {
          updatedFields.lastMonth = lastMonthData.overall_month_count || 0;
        }

        await collection.updateOne(
          { _id: doc._id },
          { $set: updatedFields }
        );
      }

      console.log(`[${now.format()}] ✅ Rotation complete`);
      console.log(`Today is: ${now.format('dddd')} | Day of week: ${currentDayOfWeek}`);

    } catch (error) {
      console.error('❌ Error rotating counters:', error);
    }
  });
};

module.exports = scheduleResetCounters;
