const { getDb } = require("../../../config/db");

async function getSessionStatus(req, res) {
  const db = getDb();
  const sessionCol = db.collection("qa_exam_sessions");

  const user = req.session?.user;
  
  if (!user || !user.registerno) {
    return res.status(401).json({ 
      status: "UNAUTHORIZED",
      message: "Session expired or not logged in"
    });
  }

  const { registerno } = user;
  
  const session = await sessionCol.findOne({ registerno });

  if (!session) {
    return res.status(404).json({ 
      status: "NO_SESSION",
      message: "No exam session found"
    });
  }

  res.json({
    status: session.status,
    reason: session.terminatedReason,
    endsAt: session.endsAt
  });
}

module.exports = { getSessionStatus }