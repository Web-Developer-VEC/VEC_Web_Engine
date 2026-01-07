const cron = require("node-cron");
const SessionClean = require("../controllers/qa_controllers/qa_schedule_controllers/qa_sessioncleaner_controllers");

cron.schedule("*/5 * * * *", async () => {
  console.log("🧹 Running session cleanup cron...");
  await SessionClean();
});

module.exports = cron;
