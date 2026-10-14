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

  const endpoint = req.originalUrl.split("?")[0];
  const db = getlogDb();
  const collection = db.collection("hitlog");

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
    const isLogsEndpoint = endpoint === "/api/main-backend/logs";
    const alreadyCountedLogsEndpointIp = doc?.uniqueIpCounts?.[ip];

    const alreadyVisited = doc?.ipCounts?.[ip];

    const update = {
      $setOnInsert: {
        lastDay: 0,
        currentDayDate: now.format("YYYY-MM-DD"),
      },
    };

    if (isLogsEndpoint) {
      update.$set = { [`ipCounts.${ip}`]: 1 };
    } else {
      update.$inc = { [`ipCounts.${ip}`]: 1 };
    }

    if (!isLogsEndpoint || !alreadyCountedLogsEndpointIp) {
      update.$inc = update.$inc || {};
      update.$inc.totalRequestCount = 1;
    }

    if (isLogsEndpoint && !alreadyCountedLogsEndpointIp) {
      update.$set = update.$set || {};
      update.$set[`uniqueIpCounts.${ip}`] = true;
    }

    if (!alreadyVisited) {
      update.$inc = update.$inc || {};
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
