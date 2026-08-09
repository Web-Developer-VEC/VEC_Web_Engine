const cron = require("node-cron");
const moment = require("moment-timezone");
const { getlogDb } = require("../config/db");

function startHitResetCron() {
  // Every day at 12:00 AM IST
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        const db = getlogDb();
        const collection = db.collection("hitlog");

        const today = moment()
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD");

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
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("Hit reset cron started — 12:00 AM IST");
}

module.exports = startHitResetCron;