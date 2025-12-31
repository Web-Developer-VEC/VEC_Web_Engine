const jwt = require("jsonwebtoken");

const {getDb} = require('../../config/db')

async function qaresult(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_exam");

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const registerno = decoded.registerno;

    const examDoc = await collection.findOne({});
    if (!examDoc) {
      return res.status(404).json({ message: "Exam record not found" });
    }

    const student = examDoc.students.find(
      s => s.registerno === registerno
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const totalMarks = student.question.filter(
      q => q.isCorrect === true
    ).length;

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
