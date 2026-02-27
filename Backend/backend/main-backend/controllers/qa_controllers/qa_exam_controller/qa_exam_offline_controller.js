const { getDb } = require("../../../config/db");

async function markOffline(req, res) {
  console.log("OFFLINE");
  
  const db = getDb();
  const sessionCol = db.collection("qa_exam_sessions");

  const { registerno } = req.session.user;

  console.log(`📴 Marking ${registerno} offline...`); 

  const result = await sessionCol.updateOne(
    { registerno, status: "ACTIVE" },
    {
      $set: {
        status: "PAUSED",
        "offline.lastDisconnectedAt": new Date(),
        isOnline: false,
        lastSeenAt: new Date()
      },
      $inc: { "offline.count": 1 }
    }
  );

  console.log(`✅ Update result:`, result.modifiedCount); // ← Log result

  // Even if update fails, return success (beacon might retry)
  res.status(200).json({ success: true });
}

async function resumeSession(req, res) {
  const db = getDb();
  const sessionCol = db.collection("qa_exam_sessions");

  const { registerno } = req.session.user;

  const session = await sessionCol.findOne({ registerno });

  if (!session || !["PAUSED"].includes(session.status)) {
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
        isOnline: true,
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

async function getResumeQuestions(req, res) {
  const db = getDb();
  const examCol = db.collection("qa_exam");
  const sessionCol = db.collection("qa_exam_sessions");

  const { registerno } = req.session.user;

  const session = await sessionCol.findOne({ registerno });

  if (!session || session.status !== "ACTIVE") {
    return res.status(403).json({ message: "Session not active" });
  }

  const exam = await examCol.findOne({
    _id: session.examId,
    "students.registerno": registerno
  });

  const student = exam.students.find(
    s => s.registerno === registerno
  );

  res.json({
    subject: exam.subject,
    subjectCode: exam.subjectCode,
    questions: student.questions.map(q => ({
      question: q.question,
      A: q.A,
      B: q.B,
      C: q.C,
      D: q.D
    }))
  });
}

module.exports = { markOffline, resumeSession, getResumeData, getResumeQuestions }