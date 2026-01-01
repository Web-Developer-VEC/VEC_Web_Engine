const { getDb } = require('../../../config/db');
const { generateQuestionsForStudent } = require('./qa_questionshuffler_controllers');
const { getOrCreateSubjectQuestions } = require('./qa_questiongenerator_controllers');

async function assignQuestionsToStudents(req, res) {
  try {
    const { subject, subjectCode, cie } = req.body;

     await getOrCreateSubjectQuestions(subjectCode, subject);

    const db = getDb();
    const examCol = db.collection("qa_exam");

    // 1️⃣ Find exam record
    const exam = await examCol.findOne({ subject, subjectCode, cie });

    if (!exam) {
      return res.status(404).json({ msg: "Exam record not found" });
    }

    // 2️⃣ Assign papers
    for (let i = 0; i < exam.students.length; i++) {
      const studentIndex = i;

      const questions = await generateQuestionsForStudent(
        subject,
        cie,
        studentIndex
      );

      exam.students[i].question = questions;
    }

    // 3️⃣ Save back (merged storage logic)
    await examCol.updateOne(
      { _id: exam._id },
      { $set: { students: exam.students } }
    );

    res.json({ msg: "Questions assigned successfully" });

  } catch (err) {
    console.error("Error in assignQuestionsToStudents:", err);
    res.status(500).json({ msg: "Server error" });
  }
}

module.exports = { assignQuestionsToStudents };
