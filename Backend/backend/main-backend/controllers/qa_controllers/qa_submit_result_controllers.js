const { getDb } = require("../../config/db");
const { ObjectId } = require("mongodb");


async function qaresult(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_exam");
    const sessionCollection = db.collection("qa_exam_sessions");

    if (!req.session.user) {
  return res.status(401).json({ message: "Session expired / not logged in" });
}

    const { registerno } = req.session.user;
    
    const { scheduleId } = req.body;  

    const scheduleObjectId = new ObjectId(scheduleId);


    if (!scheduleId) {
      return res.status(400).json({
        message: "scheduleId is required"
      });
    }

    // 🎯 Find EXACT exam
    const examDoc = await collection.findOne({
      scheduleId:scheduleObjectId,
      "students.registerno": registerno
    });

    if (!examDoc) {
      return res.status(404).json({
        message: "Exam record not found for this schedule"
      });
    }

    const student = examDoc.students.find(
      s => s.registerno === registerno
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found in this exam"
      });
    }

    // ✅ Calculate marks
    const totalMarks = student.questions.filter(
      q => q.isCorrect === true
    ).length;

    // 🔒 Mark completion ONLY for this exam
    await collection.updateOne(
      {
        scheduleId,
        "students.registerno": registerno
      },
      {
        $set: {
          "students.$.isComplete": true,
          "students.$.completedAt": new Date()
        }
      }
    );

    // 🧹 Delete ONLY this exam session
    await sessionCollection.deleteOne({
      scheduleId,
      registerno
    });

    res.json({
      scheduleId,
      registerno,
      name: student.name,
      department: student.department,
      batch: student.batch,
      subject: examDoc.subject,
      cie: examDoc.cie,
      totalMarks
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { qaresult };