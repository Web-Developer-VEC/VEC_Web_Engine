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
    const year = now.format("YYYY");
    const currentMonth = now.format("MMMM");
    const previousMonth = moment().subtract(1, "month").format("MMMM");
    const currentWeek = Math.ceil(now.date() / 7);

    const enrichedLogs = logs_data.map((doc) => {
      const monthly = doc.years?.[year]?.monthly || {};
      if (!monthly[currentMonth]) {
        monthly[currentMonth] = {
          overall_month_count: "-",
          week1: "-",
          week2: "-",
          week3: "-",
          week4: "-",
          week5: "-",
        };
      }
      const currentMonthData = monthly[currentMonth] || {};

      return {
        ...doc,

        currentDay: doc.currentDay || 0,

        lastDay: doc.lastDay || 0,

        lastWeek: currentMonthData[`week${currentWeek}`] || 0,

        lastMonth: monthly[previousMonth]?.overall_month_count || 0,

        thisYear: {
          monthly,
        },
      };
    });

    return res.status(200).json(enrichedLogs);
  } catch (error) {
    console.error("Error fetching logs:", error);

    await logError(req, error, "Error fetching logs data", 500);

    return res.status(500).json({
      error: "Error fetching logs data",
    });
  }
}

// Helper to format logs cleanly
async function getEnrichedLogs() {
  const db = getlogDb();
  const collection = db.collection("hitlog");
  const logs = await collection.find({}).toArray();

  const now = moment();
  const year = now.format("YYYY");
  const currentMonth = now.format("MMMM");
  const previousMonth = moment().subtract(1, "month").format("MMMM");
  const currentWeek = Math.ceil(now.date() / 7);

  return logs.map((doc) => {
    const monthly = doc.years?.[year]?.monthly || {};
    const currentMonthData = monthly[currentMonth] || {};

    return {
      ...doc,
      currentDay: doc.currentDay || 0,
      lastDay: doc.lastDay || 0,
      lastWeek: currentMonthData[`week${currentWeek}`] || 0,
      lastMonth: monthly[previousMonth]?.overall_month_count || 0,
      thisYear: { monthly },
    };
  });
}

// Emits updated logs to all connected WebSocket clients
async function broadcastLogs(req) {
  try {
    const io = req.app.get("io");
    if (!io) return;

    const enrichedLogs = await getEnrichedLogs();
    
    io.emit("logs_updated", enrichedLogs);
  } catch (error) {
    console.error("WebSocket broadcast error:", error);
  }
}

module.exports = {
  getDatabaseLogs,
  broadcastLogs
};
