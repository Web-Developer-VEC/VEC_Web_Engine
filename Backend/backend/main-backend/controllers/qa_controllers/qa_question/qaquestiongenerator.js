const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { getDb } = require('../../../config/db');

async function getOrCreateSubjectQuestions(subjectCode, subjectName) {
  if (!subjectCode || !subjectName) {
    throw new Error("subjectCode and subjectName are required");
  }

  const db = getDb();
  const qaQuestionBank = db.collection('qa_questionbank');
  const examsCollection = db.collection('exams');

  // 1️⃣ Check existing
  const existing = await qaQuestionBank.findOne({ subjectCode });
  if (existing) {
    return existing;
  }

  // 2️⃣ Load config
  const examDoc = await examsCollection.findOne({ type: "questionbank" });
  if (!examDoc || !examDoc.data?.length) {
    throw new Error("Questionbank not found");
  }

  const subject = examDoc.data[0].subject.find(s => s.code === subjectCode);
  if (!subject) {
    throw new Error("Subject not found in questionbank");
  }

  if (!Array.isArray(subject.excel_path) || !subject.excel_path.length) {
    throw new Error("No excel paths found for subject");
  }

  // 3️⃣ Read Excel
  const qaData = { subjectCode, subjectName };

  for (const excelPath of subject.excel_path) {
    const filePath = path.isAbsolute(excelPath)
      ? excelPath
      : path.join(__dirname, '..', excelPath);

    if (!fs.existsSync(filePath)) continue;

    const workbook = xlsx.readFile(filePath);

    let sectionKey = path.basename(filePath, path.extname(filePath)).toLowerCase();
    if (sectionKey === 'qabs') sectionKey = 'qa';
    if (sectionKey === 'verbal') sectionKey = 'vr';

    qaData[sectionKey] ??= { questions: [] };

    workbook.SheetNames.forEach(sheetName => {
      const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
      qaData[sectionKey].questions.push(...rows);
    });
  }

  // 4️⃣ Store
  const doc = {
    ...qaData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await qaQuestionBank.insertOne(doc);
  return doc;
}

module.exports = { getOrCreateSubjectQuestions };
