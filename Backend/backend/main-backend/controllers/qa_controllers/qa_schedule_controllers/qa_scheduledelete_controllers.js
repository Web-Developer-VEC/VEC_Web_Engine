const {getDb} = require("../../../config/db");

const deleteSchedules = async () => {
  try {

    const db = getDb();

    const collection = db.collection("qa_schedule");
    
    const tenDaysAgo = new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000
    );

    const result = await collection.deleteMany({
      status: { $in: ["inactive", "cancelled"] },
      createdAt: { $lte: tenDaysAgo }
    });

    console.log(
      `[CRON] Deleted ${result.deletedCount} old schedules`
    );
  } catch (error) {
    console.error("[CRON] Schedule cleanup failed:", error);
  }
};

module.exports = deleteSchedules;
