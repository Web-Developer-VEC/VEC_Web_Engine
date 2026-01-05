const { getDb } = require("../../../config/db");

async function registerViolation(req, res) {
  const db = getDb();
  const sessionCol = db.collection("qa_exam_sessions");

  const { type } = req.body;
  const { registerno } = req.session.user;

  const session = await sessionCol.findOne({ registerno });

  if (!session) return res.sendStatus(404);

  const total =
    session.violations.fullscreenExit +
    session.violations.tabSwitch + 1;

  if (total >= 10) {
    await sessionCol.updateOne(
      { registerno },
      {
        $set: {
          status: "TERMINATED",
          terminatedReason: "VIOLATION_LIMIT_EXCEEDED",
          endedAt: new Date()
        }
      }
    );

    return res.status(403).json({
      terminated: true
    });
  }

  await sessionCol.updateOne(
    { registerno },
    { $inc: { [`violations.${type}`]: 1 } }
  );

  res.json({ success: true, fullscreenExit: session.violations.fullscreenExit, tabSwitch: session.violations.tabSwitch });
}

module.exports = { registerViolation }