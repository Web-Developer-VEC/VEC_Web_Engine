const { getDb } = require("../../../config/db");

const {getSubjectQuestions} = require('./qa_questiongenerator_controllers');

/* ---------------- SHUFFLE ---------------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* -------- ROTATING PICKER (NO SKIP) -------- */
function getNextBatch(state, count) {
  const result = [];

  while (result.length < count) {
    const remaining = state.pool.length - state.index;

    if (remaining >= count - result.length) {
      result.push(
        ...state.pool.slice(
          state.index,
          state.index + (count - result.length)
        )
      );
      state.index += count - result.length;
    } else {
      result.push(...state.pool.slice(state.index));
      state.pool = shuffle(state.pool);
      state.index = 0;
    }
  }

  return result;
}

async function generateExam(year, department, cie, subject, subjectCode, topics, date) {
  try {
    

    if ( !subject || !cie || !topics || !subjectCode || !year || !department) {
      throw new Error({ error: "Missing required fields" });
    }

    const db = getDb();
    const examCol = db.collection("qa_exam");
    const questionCol = db.collection("qa_question");

    await getSubjectQuestions(subject);

    

    const examDoc = await examCol.findOne({subject,subjectCode,cie, date, students: {$elemMatch: {department,year}}});


    if (!examDoc) {
      throw new Error("Exam not found");
    }

    const subjects = subject.split("/").map(s => s.trim());

    if (subjects.length < 1 || subjects.length > 2) {
      throw new Error( "Only 1 or 2 subjects are supported");
    }

    const subjectCounts = {};

    if (subjects.length === 1) {
      subjectCounts[subjects[0]] =
        cie === "cie3" ? 60 : 30;
    } else {
      if (cie === "cie3") {
        subjectCounts[subjects[0]] = 60;
        subjectCounts[subjects[1]] = 40;
      } else {
        subjectCounts[subjects[0]] = 30;
        subjectCounts[subjects[1]] = 20;
      }
    }

    const subjectState = {};

    for (const subject of subjects) {
      const subjectDoc = await questionCol.findOne({
        subject_name: subject
      });

      if (!subjectDoc) {
        throw new Error(`Question bank not found for ${subject}`);
      }

      subjectState[subject] = {};

      const subjectTopics = topics[subject] || [];
      if (subjectTopics.length === 0) {
        throw new Error(`No topics provided for ${subject}`);
      }

      for (const topicName of subjectTopics) {
        const topicBlock = subjectDoc.exam.find(
          t => t.topic === topicName
        );

        if (!topicBlock) continue;

        subjectState[subject][topicName] = {
          pool: shuffle(topicBlock.topic_question),
          index: 0
        };
      }
    }

const updatedStudents = examDoc.students.map(student => {
  let questions = [];

  for (const subject of subjects) {
    const totalForSubject = subjectCounts[subject];
    const topicNames = Object.keys(subjectState[subject]);

    const basePerTopic = Math.floor(
      totalForSubject / topicNames.length
    );
    const leftover = totalForSubject % topicNames.length;

    topicNames.forEach((topic, index) => {
      const countForThisTopic =
        basePerTopic + (index < leftover ? 1 : 0);

      questions.push(
        ...getNextBatch(
          subjectState[subject][topic],
          countForThisTopic
        )
      );
    });
  }

  return {
    ...student,
    questions: shuffle(questions)
  };
});


    await examCol.updateOne(
      { _id: examDoc._id },
      {
        $set: {
          students: updatedStudents,
          generatedAt: new Date()
        }
      }
    );

    return ({
      message: "Exam generated successfully",
      mode: subject,
      cie,
      perStudent: Object.values(subjectCounts).reduce(
        (a, b) => a + b,
        0
      ),
      students: updatedStudents.length
    });

  }catch (err) {
  console.error("❌ generateExam error:", err.message);
  throw err; 
}
}

module.exports = { generateExam };
