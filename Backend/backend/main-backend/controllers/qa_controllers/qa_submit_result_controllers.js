const jwt = require("jsonwebtoken");

const {getDb} = require('../../config/db')

async function qaresult(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_exam");
    const sessionCollection = db.collection("qa_exam_sessions");

    const { registerno } = req.session.user;

    const examDoc = await collection.findOne({
      "students.registerno": registerno
    });

    if (!examDoc) {
      return res.status(404).json({ message: "Exam record not found" });
    }

    const student = examDoc.students.find(
      s => s.registerno === registerno
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const totalMarks = student.questions.filter(
      q => q.isCorrect === true
    ).length;

    await collection.updateOne(
      { "students.registerno": registerno },
      {
        $set: {
          "students.$.isComplete": true
        }
      }
    );

    await sessionCollection.deleteOne({ registerno })

    res.json({
      registerno,
      name: student.name,
      department: student.department,
      year: student.year,
      totalMarks
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {qaresult}
