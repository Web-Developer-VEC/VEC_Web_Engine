const xlsx = require('xlsx');
const { getDb } = require('../../../config/db');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

async function getOrCreateSubjectQuestions(subjectCode, subjectName) {
  if (!subjectCode) throw new Error("subjectCode is required");
  if (!subjectName) throw new Error("subjectName is required");

  const db = getDb();
  const qaQuestionBank = db.collection('qa_questionbank');

  // ✅ Cache check by subjectCode (recommended unique key)
  const existing = await qaQuestionBank.findOne({ subjectCode });
  if (existing) return existing;

  // "QA/VR" → ["QA", "VR"]
  const sections = subjectName.includes('/')
    ? subjectName.split('/')
    : [subjectName];

  // ✅ Base document (NO MODIFICATION)
  const qaData = {
    subjectCode,
    subjectName
  };

  for (const section of sections) {

    const cleanSection = section.trim().toUpperCase(); // QA / VR
    const s3Key = `static/xlsx/qa/question/${cleanSection}.xlsx`;

    const s3Response = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key
      })
    );

    const buffer = await streamToBuffer(s3Response.Body);
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    // ✅ Store under EXACT keys: QA / VR
    qaData[cleanSection] ??= { questions: [] };

    workbook.SheetNames.forEach(sheetName => {
      const rows = xlsx.utils.sheet_to_json(
        workbook.Sheets[sheetName],
        { defval: "" }
      );
      qaData[cleanSection].questions.push(...rows);
    });
  }

  const doc = {
    ...qaData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await qaQuestionBank.insertOne(doc);
  return doc;
}

module.exports = { getOrCreateSubjectQuestions };
