const { getDb } = require('../../config/db');
const xlsx = require('xlsx');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function exportMarks(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_exam");

    const examDoc = await collection.findOne({});
    if (!examDoc) {
      return res.status(404).json({ message: "Exam record not found" });
    }

    const subjectName = examDoc.subject;
    const subjectCode = examDoc.subjectCode;
    const cie = examDoc.cie;

    const firstStudent = examDoc.students[0];
    const department = firstStudent.department;
    const year = firstStudent.year;

    const marksData = examDoc.students.map(student => {
      const marks = student.question.filter(
        q => q.isCorrect === true
      ).length;
      return [student.registerno, marks];
    });

    const sheetData = [
      ["Subject Name", subjectName],
      ["Subject Code", subjectCode],
      ["CIE", cie],
      ["Department", department],
      ["Year", year],
      [],
      ["Register No", "Marks"],
      ...marksData
    ];

    const worksheet = xlsx.utils.aoa_to_sheet(sheetData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Marks");

    const excelBuffer = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer'
    });

    const safeDept = department.replace(/\s+/g, "_");
    const s3Key = `static/xlsx/qa/result/marks_${safeDept}.xlsx`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: excelBuffer,
        ContentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    );

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    res.json({
      message: "Excel uploaded to S3 successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { exportMarks };
