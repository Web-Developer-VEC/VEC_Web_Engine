const cron = require('node-cron');
const { getDb } = require('../../config/db');
const moment = require('moment');
const logError = require('../logerror');

const scheduleResetCounters = () => {
  cron.schedule('0 0 * * *', async () => { 
    const db = getDb();
    const collection = db.collection('logs');
    const now = moment();

    const today = now.format('YYYY-MM-DD');
    const currentDayOfWeek = now.day(); 
    const currentMonth = now.format('MMMM');
    const lastMonth = now.clone().subtract(1, 'month').format('MMMM');

    const startOfMonth = now.clone().startOf('month');
    const weekNumber = Math.ceil((now.date() + startOfMonth.day()) / 7);

    try {
    const allDocs = await collection.find({}).toArray();
    const excludedIds = ['mongo_health_log', 'rate_limit_log', 'error_log'];

    for (const doc of allDocs) {
      if (excludedIds.includes(doc._id)) continue;

      const lastDay = doc.currentDay || 0;
      const thisYear = doc.thisYear || {};
      const monthly = thisYear.monthly || {};
      const currentMonth = now.format('MMMM');
      const lastMonth = now.clone().subtract(1, 'month').format('MMMM');
      const currentMonthData = monthly[currentMonth] || {};
      const lastMonthData = monthly[lastMonth] || {};

      const updatedFields = {
        lastDay,
        currentDay: 0
      };

      const startOfMonth = now.clone().startOf('month');
      const weekNumber = Math.ceil((now.date() + startOfMonth.day()) / 7);

      if (weekNumber > 1) {
        const previousWeekKey = `week${weekNumber - 1}`;
        updatedFields.lastWeek = currentMonthData[previousWeekKey] || 0;
      } else {
        updatedFields.lastWeek = lastMonthData['week4'] || 0;
      }

      if (now.date() === 1 && lastMonthData) {
        updatedFields.lastMonth = lastMonthData.overall_month_count || 0;
      }

      await collection.updateOne(
        { _id: doc._id },
        { $set: updatedFields }
      );
    }

    console.log(`[${now.format()}] Rotation complete`);
    console.log(`Today is: ${now.format('dddd')} | Day of week: ${now.day()}`);
  } catch (error) {
    await logError(req, error, 'Error in reset counter', 500);
    console.error('Error rotating counters:', error);
  }

  });
};

module.exports = scheduleResetCounters;
