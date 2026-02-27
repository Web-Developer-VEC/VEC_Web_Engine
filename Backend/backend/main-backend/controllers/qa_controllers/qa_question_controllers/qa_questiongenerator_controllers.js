const xlsx = require("xlsx");
const { getDb } = require("../../../config/db");
const {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

function normalizeHeader(h) {
  return String(h).replace(/\s+/g, " ").trim();
}

function normalizeQuestionText(text) {
  return String(text).trim().toLowerCase();
}

function readQuestionRows(sheet) {
  const rows = xlsx.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });

  const headerRowIndex = rows.findIndex((row) =>
    row.some((cell) => normalizeHeader(cell) === "Topic")
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

async function getSubjectQuestions(subjectName) {
  try {
    if (!subjectName) throw new Error("subjectName is required");

    const db = getDb();
    const collection = db.collection("qa_question");

    const subjects = subjectName.includes("/")
      ? subjectName.split("/")
      : [subjectName];

    const results = [];

    for (const subject of subjects) {
      const cleanSubject = subject.trim().toUpperCase();

      const existing = await collection.findOne({
        subject_name: cleanSubject,
      });
      if (existing) {
        results.push(existing);
        continue;
      }
      const globalTopicMap = {};
      const prefix = `/static/xlsx/qa/question/${cleanSubject}/`;

      const listRes = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_BUCKET_NAME,
          Prefix: prefix,
        })
      );

      const excelFiles = (listRes.Contents || [])
        .map((obj) => obj.Key)
        .filter((key) => key.endsWith(".xlsx"));

      if (excelFiles.length === 0) {
        throw new Error(`No Excel files found for ${cleanSubject}`);
      }

      const doc = {
        subject_name: cleanSubject,
        exam: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      for (const key of excelFiles) {
        const s3Response = await s3.send(
          new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          })
        );

        const buffer = await streamToBuffer(s3Response.Body);
        const workbook = xlsx.read(buffer, { type: "buffer" });

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rows = readQuestionRows(sheet);

          for (const row of rows) {
            const topic = row["Topic"]?.trim();
            const difficulty =
              row["Difficulty Level"] || row["Difficulty"] || row["difficult"];

            const questionText = row["Question"];
            if (!topic || !questionText) continue;

            if (!globalTopicMap[topic]) {
              const isQA = cleanSubject === "QA";

              globalTopicMap[topic] = {
                topic,
                topic_question: [],
                ...(isQA ? { _questionSet: new Set() } : {}),
              };
            }

            const isQA = cleanSubject === "QA";

            let normalizedQuestion;
            if (isQA) {
              normalizedQuestion = normalizeQuestionText(questionText);

              if (globalTopicMap[topic]._questionSet.has(normalizedQuestion)) {
                continue;
              }

              globalTopicMap[topic]._questionSet.add(normalizedQuestion);
            }

            const q = {
              difficulty_level: difficulty,
              question: questionText,
            };

            if (row["Option A"]) q.A = String(row["Option A"]).trim();
            if (row["Option B"]) q.B = String(row["Option B"]).trim();
            if (row["Option C"]) q.C = String(row["Option C"]).trim();
            if (row["Option D"]) q.D = String(row["Option D"]).trim();
            if (row["Option E"]) q.E = String(row["Option E"]).trim();

            const answer =
              row["Answer(No Option)"] ||
              row["Answer (No Option)"] ||
              row["Answer"];

            q.correct_option = answer ? String(answer).trim() : null;

            globalTopicMap[topic].topic_question.push(q);
          }
        }
      }
      doc.exam = Object.values(globalTopicMap).map((t) => {
        if (t._questionSet) {
          const { _questionSet, ...clean } = t;
          return clean;
        }
        return t;
      });

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
