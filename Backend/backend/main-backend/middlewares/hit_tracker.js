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
  const year = now.format("YYYY");
  const week = `week${Math.ceil(now.date() / 7)}`;

  const ip = (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    req.ip
  )
    .replace("::ffff:", "")
    .trim()
    .replace(/\./g, "_");

  try {
    const doc = await collection.findOne({ endpoint });

    const alreadyVisited = doc?.ipCounts?.[ip];

    const update = {
      $inc: {
        [`ipCounts.${ip}`]: 1,
      },
      $setOnInsert: {
        lastDay: 0,
        currentDayDate: now.format("YYYY-MM-DD"),
      },
    };

    if (!alreadyVisited) {
      update.$inc.currentDay = 1;
      update.$inc.overallCount = 1;
      update.$inc[`years.${year}.monthly.${month}.overall_month_count`] = 1;
      update.$inc[`years.${year}.monthly.${month}.${week}`] = 1;
    }

    await collection.updateOne({ endpoint }, update, {
      upsert: true,
    });

    console.log(`Hit tracked : ${endpoint} (${ip})`);
  } catch (error) {
    console.error("Error tracking hits:", error);
  }

  next();
}

module.exports = hitTracker;
