const cron = require("node-cron");
const moment = require("moment");
const { getlogDb } = require("../config/db");

function startHitResetCron() {
  // Every day at 12:00 AM
  cron.schedule("0 0 * * *", async () => {
    try {
      const db = getlogDb();
      const collection = db.collection("hitlog");

      const today = moment().format("YYYY-MM-DD");

      await collection.updateMany({}, [
        {
          $set: {
            lastDay: "$currentDay",
            currentDay: 0,
            currentDayDate: today,
            ipCounts: {},
          },
        },
      ]);

      console.log(`Daily hit reset completed (${today})`);
    } catch (err) {
      console.error("Hit reset cron failed:", err);
    }
  });

  console.log("Hit reset cron started.");
}

module.exports = startHitResetCron;
