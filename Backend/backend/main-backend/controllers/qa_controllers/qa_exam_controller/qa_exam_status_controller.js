const { getDb } = require("../../../config/db");

async function getSessionStatus(req, res) {
  const db = getDb();
  const sessionCol = db.collection("qa_exam_sessions");

  const { registerno } = req.session.user;

  const session = await sessionCol.findOne({ registerno });

  if (!session) {
    return res.status(404).json({ status: "NOT_FOUND" });
  }

  res.json({
    status: session.status,
    reason: session.terminatedReason
  });
}

module.exports = { getSessionStatus }