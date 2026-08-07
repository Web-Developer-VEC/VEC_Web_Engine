const { getlogDb } = require("../config/db");
const logError = require("../middlewares/logerror");
const moment = require("moment");

async function getDatabaseLogs(req, res) {
  const db = getlogDb();

  try {
    const collection = db.collection("hitlog");
    const logs_data = await collection.find({}).toArray();

    if (!logs_data.length) {
      return res.status(404).json({
        message: "No logs found",
      });
    }

    const now = moment();

    const currentMonth = now.format("MMMM");
    const previousMonth = moment().subtract(1, "month").format("MMMM");

    const currentWeek = Math.ceil(now.date() / 7);

    const enrichedLogs = logs_data.map((doc) => {
      const monthly = doc.thisYear?.monthly || {};

      const currentMonthData = monthly[currentMonth] || {};

      return {
        ...doc,

        currentDay: doc.currentDay || 0,

        lastDay: 0,

        // Display current week's count
        lastWeek: currentMonthData[`week${currentWeek}`] || 0,

        // Previous month's total
        lastMonth: monthly[previousMonth]?.overall_month_count || 0,
      };
    });
    for (const log of enrichedLogs) {
      console.log(`Endpoint: ${log.endpoint}`);
      console.log(`Current Day: ${log.currentDay}`);
      console.log(`Last Day: ${log.lastDay}`);
      console.log(`Last Week: ${log.lastWeek}`);
      console.log(`Last Month: ${log.lastMonth}`);
      console.log("---------------------------");
    }
    return res.status(200).json(enrichedLogs);
  } catch (error) {
    console.error("Error fetching logs:", error);

    await logError(req, error, "Error fetching logs data", 500);

    return res.status(500).json({
      error: "Error fetching logs data",
    });
  }
}

module.exports = {
  getDatabaseLogs,
};
