const { getDb } = require("../../../config/db");

async function markOffline(req, res) {
  const db = getDb();
  const sessionCol = db.collection("qa_exam_sessions");

  const { registerno } = req.session.user;

  await sessionCol.updateOne(
    { registerno },
    {
      $set: {
        status: "PAUSED",
        "offline.lastDisconnectedAt": new Date()
      },
      $inc: { "offline.count": 1 }
    }
  );

  res.json({ success: true });
}

async function resumeSession(req, res) {
  const db = getDb();
  const sessionCol = db.collection("qa_exam_sessions");

  const { registerno } = req.session.user;

  const session = await sessionCol.findOne({ registerno });

  if (!session || session.status !== "PAUSED") {
    return res.status(403).json({
      status: session?.status,
      reason: session?.terminatedReason
    });
  }

  await sessionCol.updateOne(
    { registerno },
    {
      $set: {
        status: "ACTIVE",
        lastSeenAt: new Date()
      }
    }
  );

  res.json({ success: true });
}

async function getResumeData(req, res) {
  const db = getDb();
  const examCol = db.collection("qa_exam");
  const sessionCol = db.collection("qa_exam_sessions");

  const { registerno } = req.session.user;

  const session = await sessionCol.findOne({ registerno });

  if (!session) {
    return res.status(404).json({ status: "NO_SESSION" });
  }

  if (session.status !== "ACTIVE") {
    return res.status(403).json({
      status: session.status,
      reason: session.terminatedReason
    });
  }

  const examDoc = await examCol.findOne({
    "students.registerno": registerno
  });

  const student = examDoc.students.find(
    s => s.registerno === registerno
  );

  const answers = {};
  student.questions.forEach((q, index) => {
    if (q.choosedOption) {
      answers[index] = q.choosedOption;
    }
  });

  res.json({
    currentQuestionIndex: session.currentQuestionIndex,
    selectedAnswers: answers
  });
}

module.exports = { markOffline, resumeSession, getResumeData }