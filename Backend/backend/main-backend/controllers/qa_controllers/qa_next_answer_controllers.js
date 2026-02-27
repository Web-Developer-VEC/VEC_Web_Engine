const { getDb } = require('../../config/db');
const jwt = require('jsonwebtoken');

async function submitAnswer(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_exam");
    const sessionCol = db.collection("qa_exam_sessions");

    const { question, choosedOption, questionIndex } = req.body;    

    if (!question || !choosedOption) {
      return res.status(400).json({ message: "Missing fields" });
    }
    
    const { registerno } = req.session.user;
    
    const session = await sessionCol.findOne({ registerno });

    if (!session) return res.sendStatus(404);

    if (session.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Session not active"
      });
    }

    await sessionCol.updateOne(
      { registerno },
      {
        $set: {
          currentQuestionIndex: questionIndex + 1, // move forward
          lastSeenAt: new Date()
        }
      }
    );

    const doc = await collection.findOne({
      "students.registerno": registerno
    });

    if (!doc) {
      return res.status(404).json({ message: "Exam record not found" });
    }

    const student = doc.students.find(
      s =>
        s.registerno === registerno
    );
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const q = student.questions.find(
      q => q.question.trim() === question.trim()
    );

    if (!q) {
      return res.status(404).json({ message: "Question not found" });
    }

    const isCorrect =
      q.correct_option.trim() === choosedOption.trim();

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          "students.$[stu].questions.$[ques].choosedOption": choosedOption,
          "students.$[stu].questions.$[ques].isCorrect": isCorrect
        }
      },
      {
        arrayFilters: [
          { "stu.registerno": registerno },
          { "ques.question": q.question }
        ]
      }
    );

    const updatedDoc = await collection.findOne({ _id: doc._id });
    const updatedStudent = updatedDoc.students.find(
      s => s.registerno === registerno
    );

    const answeredCount = updatedStudent.questions.filter(
      q => q.choosedOption && q.choosedOption.trim() !== ""
    ).length;

    res.json({
      message: "Answer updated successfully",
      answeredCount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { submitAnswer };
