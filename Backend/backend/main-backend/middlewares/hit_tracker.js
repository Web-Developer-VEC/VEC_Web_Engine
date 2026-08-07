const { getlogDb } = require("../config/db");
const moment = require("moment");

const recentHits = new Map();

function shouldTrack(clientIp, endpoint) {
  if (endpoint.includes("/landing_page_data")) {
    if (recentHits.has(`${clientIp}-landing`)) {
      return false;
    }
    recentHits.set(`${clientIp}-landing`, true);
    return true;
  }
  return true;
}
async function hitTracker(req, res, next) {
  if (
    req.originalUrl === "/favicon.ico" ||
    req.originalUrl.endsWith(".png") ||
    req.originalUrl.endsWith(".jpg") ||
    req.originalUrl.endsWith(".jpeg") ||
    req.originalUrl.endsWith(".gif") ||
    req.originalUrl.endsWith(".css") ||
    req.originalUrl.endsWith(".js")
  ) {
    return next();
  }

  const db = getlogDb();
  const collection = db.collection("hitlog");

  const endpoint = req.originalUrl.split("?")[0];
  const now = moment();

  const month = now.format("MMMM");
  const week = `week${Math.ceil(now.date() / 7)}`;
  const currentYear = now.year();
  const today = moment().format("YYYY-MM-DD");

  try {
    const doc = await collection.findOne({ endpoint });
    if (!doc || doc.currentDayDate !== today) {
      await collection.updateOne(
        { endpoint },
        {
          $set: {
            currentDay: 0,
            currentDayDate: today,
          },
        },
        { upsert: true },
      );
    }

    const result = await collection.findOneAndUpdate(
      { endpoint: endpoint },
      {
        $inc: {
          currentDay: 1,
          overallCount: 1,
          [`thisYear.monthly.${month}.overall_month_count`]: 1,
          [`thisYear.monthly.${month}.${week}`]: 1,
        },
      },

      { upsert: true, returnDocument: "after" },
    );
    console.log(`Hit tracked for: ${endpoint}`);
  } catch (error) {
    console.error("Error tracking hits:", error);
  }

  next();
}

module.exports = hitTracker;
