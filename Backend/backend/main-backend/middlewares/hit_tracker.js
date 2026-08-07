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

  const today = now.format("YYYY-MM-DD");
  const month = now.format("MMMM");
  const year = now.format("YYYY");
  const week = `week${Math.ceil(now.date() / 7)}`;

  try {
    const doc = await collection.findOne({ endpoint });

    // Reset daily counter when date changes
    if (!doc || doc.currentDayDate !== today) {
      await collection.updateOne(
        { endpoint },
        {
          $set: {
            lastDay: doc?.currentDay || 0,
            currentDay: 0,
            currentDayDate: today,
          },
        },
        { upsert: true }
      );
    }

    await collection.findOneAndUpdate(
      { endpoint },
      {
        $inc: {
          currentDay: 1,
          overallCount: 1,

          [`years.${year}.monthly.${month}.overall_month_count`]: 1,
          [`years.${year}.monthly.${month}.${week}`]: 1,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    console.log(`Hit tracked : ${endpoint}`);
  } catch (error) {
    console.error("Error tracking hits:", error);
  }

  next();
}

module.exports = hitTracker;