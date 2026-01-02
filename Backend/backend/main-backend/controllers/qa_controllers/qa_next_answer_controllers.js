const { getDb } = require('../../config/db');
const jwt = require('jsonwebtoken');

async function submitAnswer(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_exam");

    const { token, question, choosedOption } = req.body;

    if (!token || !question || !choosedOption) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { registerno } = decoded;
    

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

    const q = student.question.find(
      q => q.question.trim() === question.trim()
    );

    if (!q) {
      return res.status(404).json({ message: "Question not found" });
    }

    const isCorrect =
      choosedOption.trim() === q.correctOption.trim();

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          "students.$[stu].question.$[ques].choosedOption": choosedOption,
          "students.$[stu].question.$[ques].isCorrect": isCorrect
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

    const answeredCount = updatedStudent.question.filter(
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
