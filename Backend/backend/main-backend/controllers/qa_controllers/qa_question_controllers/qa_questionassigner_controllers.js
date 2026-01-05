const { getDb } = require("../../../config/db");
const { getSubjectQuestions } = require("./qa_questiongenerator_controllers");

/* ---------------- SHUFFLE ---------------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* -------- OPTION SHUFFLER -------- */
function shuffleQuestionOptions(question) {
  const optionKeys = ["A", "B", "C", "D", "E"].filter(
    (k) => question[k] !== undefined && question[k] !== ""
  );

  if (optionKeys.length === 0) return question;

  const values = shuffle(optionKeys.map((k) => question[k]));
  const newQ = { ...question };

  optionKeys.forEach((k, i) => {
    newQ[k] = values[i];
  });

  return newQ;
}

/* ================= MAIN ================= */

async function generateExam(
  batch,
  department,
  cie,
  subject,
  subjectCode,
  topics,
  date
) {
  try {
    if (!batch || !department || !cie || !subject || !subjectCode || !topics) {
      throw new Error("Missing required fields");
    }

    const db = getDb();
    const examCol = db.collection("qa_exam");
    const questionCol = db.collection("qa_question");

    await getSubjectQuestions(subject);

    const examDoc = await examCol.findOne({
      subject,
      subjectCode,
      cie,
      date,
      students: { $elemMatch: { department, batch } },
    });

    if (!examDoc) throw new Error("Exam not found");

    /* -------- SUBJECT PARSE -------- */
    const subjects = subject.split("/").map((s) => s.trim());

    if (subjects.length < 1 || subjects.length > 2) {
      throw new Error("Only 1 or 2 subjects supported");
    }

    /* -------- QUESTION COUNTS -------- */
    const subjectCounts = {};

    if (subjects.length === 1) {
      subjectCounts[subjects[0]] = cie === "cie3" ? 60 : 30;
    } else {
      if (cie === "cie3") {
        subjectCounts[subjects[0]] = 60;
        subjectCounts[subjects[1]] = 40;
      } else {
        subjectCounts[subjects[0]] = 30;
        subjectCounts[subjects[1]] = 20;
      }
    }

    //SUBJECT ORDER
    let orderedSubjects = [...subjects];
    if (orderedSubjects.length === 2) {
      orderedSubjects.sort((a, b) => subjectCounts[a] - subjectCounts[b]);
    }

    const subjectState = {};

    for (const sub of subjects) {
      const doc = await questionCol.findOne({ subject_name: sub });
      if (!doc) throw new Error(`Question bank not found for ${sub}`);

      subjectState[sub] = {};
      const subTopics = topics[sub];

      if (!Array.isArray(subTopics) || subTopics.length === 0) {
        throw new Error(`No topics provided for ${sub}`);
      }

      for (const t of subTopics) {
        const block = doc.exam.find((e) => e.topic === t);
        if (!block) continue;

        subjectState[sub][t] = {
          1: shuffle(
            block.topic_question.filter((q) => q.difficulty_level == "1")
          ),
          2: shuffle(
            block.topic_question.filter((q) => q.difficulty_level == "2")
          ),
          3: shuffle(
            block.topic_question.filter((q) => q.difficulty_level == "3")
          ),
        };
      }
    }
    const poolIndex = {};

    const updatedStudents = examDoc.students.map((student) => {
      let finalQuestions = [];

      for (const sub of orderedSubjects) {
        const totalForSubject = subjectCounts[sub];
        const topicNames = Object.keys(subjectState[sub]);

        const lvlTotals = {
          1: Math.round(totalForSubject * 0.4),
          2: Math.round(totalForSubject * 0.4),
          3: totalForSubject - Math.round(totalForSubject * 0.4) * 2,
        };

        const perTopicDifficulty = {};

        ["1", "2", "3"].forEach((lvl) => {
          const base = Math.floor(lvlTotals[lvl] / topicNames.length);
          const extra = lvlTotals[lvl] % topicNames.length;

          perTopicDifficulty[lvl] = topicNames.map(
            (_, i) => base + (i < extra ? 1 : 0)
          );
        });

        let subjectQuestions = [];

        topicNames.forEach((topic, idx) => {
          ["1", "2", "3"].forEach((lvl) => {
            const need = perTopicDifficulty[lvl][idx];

            poolIndex[sub] ??= {};
            poolIndex[sub][topic] ??= { 1: 0, 2: 0, 3: 0 };

            let pool = subjectState[sub][topic][lvl];
            // let pointer = poolIndex[sub][topic][lvl];

            let selected = [];

            for (let i = 0; i < need; i++) {
              if (poolIndex[sub][topic][lvl] >= pool.length) {
                subjectState[sub][topic][lvl] = shuffle(pool);
                poolIndex[sub][topic][lvl] = 0;
              }

              selected.push(
                subjectState[sub][topic][lvl][poolIndex[sub][topic][lvl]]
              );

              poolIndex[sub][topic][lvl]++;
            }

            subjectQuestions.push(...selected.map((q) => ({ ...q, topic })));
          });
        });

        subjectQuestions = shuffle(subjectQuestions).map((q) =>
          shuffleQuestionOptions(q)
        );

        finalQuestions.push(...subjectQuestions);
      }

      return {
        ...student,
        questions: finalQuestions,
      };
    });

    await examCol.updateOne(
      { _id: examDoc._id },
      {
        $set: {
          students: updatedStudents,
          generatedAt: new Date(),
        },
      }
    );

    return {
      message: "Exam generated successfully",
      cie,
      mode: subject,
      students: updatedStudents.length,
      perStudent: Object.values(subjectCounts).reduce((a, b) => a + b, 0),
    };
  } catch (err) {
    console.error("❌ generateExam error:", err.message);
    throw err;
  }
}

module.exports = { generateExam };
