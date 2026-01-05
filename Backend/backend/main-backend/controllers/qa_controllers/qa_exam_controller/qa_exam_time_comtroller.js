const { getDb } = require("../../../config/db");

async function getRemainingTime(req, res) {
  const db = getDb();
  const sessionCol = db.collection("qa_exam_sessions");

  const { registerno } = req.session.user;

  const session = await sessionCol.findOne({ registerno });

  if (!session || session.status !== "ACTIVE") {
    return res.status(403).json({
      status: session?.status,
      reason: session?.terminatedReason
    });
  }

  const now = Date.now();
  const remainingMs = new Date(session.endsAt).getTime() - now;

  if (remainingMs <= 0) {
    await sessionCol.updateOne(
      { _id: session._id },
      {
        $set: {
          status: "SUBMITTED",
          endedAt: new Date()
        }
      }
    );

    return res.status(403).json({
      status: "TIME_UP"
    });
  }

  res.json({
    remainingSeconds: Math.floor(remainingMs / 1000)
  });
}


module.exports = { getRemainingTime }