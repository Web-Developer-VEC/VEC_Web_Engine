const xlsx = require("xlsx");
const { getDb } = require("../../../config/db");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");


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

function normalizeHeader(h) {
  return String(h).replace(/\s+/g, " ").trim();
}

function readQuestionRows(sheet) {
  const rows = xlsx.utils.sheet_to_json(sheet, {
    header: 1,
    defval: ""
  });

  const headerRowIndex = rows.findIndex(row =>
    row.some(cell => normalizeHeader(cell) === "Topic")
  );

  if (headerRowIndex === -1) {
    throw new Error("Header row not found (Topic column missing)");
  }

  const headers = rows[headerRowIndex].map(normalizeHeader);

  return rows.slice(headerRowIndex + 1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
}

function mapAnswerValueToOption(answerValue, q) {
  if (!answerValue) return null;

  const ans = String(answerValue).trim();

  for (const opt of ["A", "B", "C", "D", "E"]) {
    if (
      q[opt] !== undefined &&
      String(q[opt]).trim() === ans
    ) {
      return opt;
    }
  }

  return null; 
}


async function getSubjectQuestions(subjectName) {
  try {
    if (!subjectName) {
      throw new Error("subjectName is required");
    }

    const db = getDb();
    const collection = db.collection("qa_question");

    const subjects = subjectName.includes("/")
      ? subjectName.split("/")
      : [subjectName];

    const results = [];

    for (const subject of subjects) {
      const cleanSubject = subject.trim().toUpperCase();

      const existing = await collection.findOne({
        subject_name: cleanSubject
      });
      if (existing) {
        results.push(existing);
        continue;
      }

      const s3Key = `/static/xlsx/qa/question/${cleanSubject}/${cleanSubject}.xlsx`;

      const s3Response = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key
        })
      );

      const buffer = await streamToBuffer(s3Response.Body);
      const workbook = xlsx.read(buffer, { type: "buffer" });

      const doc = {
        subject_name: cleanSubject,
        exam: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const rows = readQuestionRows(sheet);

        const topicMap = {};

        for (const row of rows) {
          const topic = row["Topic"]?.trim();
          const questionText = row["Question"];

          if (!topic || !questionText) continue;

          if (!topicMap[topic]) {
            topicMap[topic] = {
              topic,
              topic_question: []
            };
          }

          const q = { question: questionText };

          if (row["Option A"] !== "") q.A = String(row["Option A"]).trim();
          if (row["Option B"] !== "") q.B = String(row["Option B"]).trim();
          if (row["Option C"] !== "") q.C = String(row["Option C"]).trim();
          if (row["Option D"] !== "") q.D = String(row["Option D"]).trim();
          if (row["Option E"] !== "") q.E = String(row["Option E"]).trim();

          const answerValue =
            row["Answer(No Option)"] ||
            row["Answer (No Option)"] ||
            row["Answer"];

          q.correct_option = mapAnswerValueToOption(answerValue, q);

          topicMap[topic].topic_question.push(q);
        }

        doc.exam.push(
          ...Object.values(topicMap).filter(
            t => t.topic_question.length > 0
          )
        );
      }

      await collection.insertOne(doc);
      results.push(doc);
    }

    return results;

  } catch (err) {
    console.error(err);
    throw new Error("Internal server error");
  }
}

module.exports = { getSubjectQuestions };
