const cron = require("node-cron");
const SessionClean = require("../controllers/qa_controllers/qa_schedule_controllers/qa_sessioncleaner_controllers");
const deleteSchedules = require('../controllers/qa_controllers/qa_schedule_controllers/qa_scheduledelete_controllers');

cron.schedule("*/5 * * * *", async () => {
  console.log("🧹 Running session cleanup cron...");
  await SessionClean();
});

cron.schedule("0 0 * * *", async () => {
  console.log("🧹 Running schedule cleanup cron...");
  await deleteSchedules();
});



module.exports = cron;
