const { getDb } = require("../../../config/db");
const { getSubjectQuestions } = require("./qa_questiongenerator_controllers");

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

function getRequiredDistribution(total) {
  const l1 = Math.round(total * 0.4);
  const l2 = Math.round(total * 0.4);
  const l3 = total - l1 - l2;
  return { 1: l1, 2: l2, 3: l3 };
}

function getQuestionKey(q) {
  const keyParts = [];
  
  if (q.question && typeof q.question === 'string') {
    const normalizedQuestion = q.question
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ') 
      .replace(/[^\w\s]/g, ''); 
    
    keyParts.push(`q:${normalizedQuestion}`);
  }
  
  const optionValues = [];
  const optionKeys = ["A", "B", "C", "D", "E"];
  
  for (const opt of optionKeys) {
    if (q[opt] && typeof q[opt] === 'string' && q[opt].trim() !== '') {
      const normalizedOpt = q[opt]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '');
      optionValues.push(normalizedOpt);
    }
  }
  
  if (optionValues.length > 0) {
    keyParts.push(`opts:${optionValues.sort().join('|')}`);
  }
  
  const otherFields = ['correct_answer', 'explanation', 'hint'];
  for (const field of otherFields) {
    if (q[field] && typeof q[field] === 'string' && q[field].trim() !== '') {
      const normalized = q[field].trim().toLowerCase().replace(/\s+/g, ' ');
      keyParts.push(`${field}:${normalized}`);
    }
  }
  
  if (keyParts.length > 0) {
    return keyParts.join('||');
  }
  
  const { _id, ...rest } = q;
  return JSON.stringify(rest);
}

function pickQuestionsWithBorrowing(topicPools, requiredCounts, ctx = {}) {
  const used = new Set(); 
  const result = [];

  const pools = {
    1: shuffle([...topicPools[1]]),
    2: shuffle([...topicPools[2]]),
    3: shuffle([...topicPools[3]]),
  };

  function pickUniqueQuestion(pool, level, targetLevel) {
    for (let i = 0; i < pool.length; i++) {
      const q = pool[i];
      const key = getQuestionKey(q);
      
      if (!used.has(key)) {
        const [picked] = pool.splice(i, 1);
        used.add(key);        
        return picked;
      }
    }
    return null;
  }

  for (const targetLevel of [1, 2, 3]) {
    let need = requiredCounts[targetLevel];
    while (need > 0 && pools[targetLevel].length > 0) {
      const picked = pickUniqueQuestion(pools[targetLevel], targetLevel, targetLevel);
      if (picked) {
        result.push(picked);
        need--;
      } else {
        break;
      }
    }

    if (need > 0) {
      const otherLevels = targetLevel === 1 ? [2, 3] : 
                         targetLevel === 2 ? [1, 3] : [2, 1];
      
      for (const borrowLevel of otherLevels) {
        while (need > 0 && pools[borrowLevel].length > 0) {
          const picked = pickUniqueQuestion(pools[borrowLevel], borrowLevel, targetLevel);
          if (picked) {
            result.push(picked);
            need--;
          } else {
            break;
          }
        }
        if (need === 0) break;
      }
    }

    if (need > 0) {
      throw new Error(`Not enough unique questions for this student in ${ctx.topic || 'topic'}`);
    }

  }

  return result;
}

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

    const subjects = subject.split("/").map((s) => s.trim());

    if (subjects.length < 1 || subjects.length > 2) {
      throw new Error("Only 1 or 2 subjects supported");
    }

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

    const storageOrder = Object.entries(subjectCounts)
      .sort(([, countA], [, countB]) => countA - countB)
      .map(([subjectName]) => subjectName);

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
          1: block.topic_question.filter((q) => q.difficulty_level == "1"),
          2: block.topic_question.filter((q) => q.difficulty_level == "2"),
          3: block.topic_question.filter((q) => q.difficulty_level == "3"),
        };
      }
    }

    const updatedStudents = examDoc.students.map((student, studentIndex) => {
      
      const questionsBySubject = {};
      
      for (const sub of subjects) {
        const totalForSubject = subjectCounts[sub];
        const topicNames = Object.keys(subjectState[sub]);

        const basePerTopic = Math.floor(totalForSubject / topicNames.length);
        const remainder = totalForSubject % topicNames.length;

        const subjectQuestions = [];

        topicNames.forEach((topic, index) => {
          const topicPools = subjectState[sub][topic];
          const totalForTopic = basePerTopic + (index < remainder ? 1 : 0);

          const required = getRequiredDistribution(totalForTopic);

          const picked = pickQuestionsWithBorrowing(
            topicPools,
            required,
            {
              student: student.usn || student.rollNo || `Student_${studentIndex}`,
              subject: sub,
              topic,
            }
          ).map((q) => ({ 
            ...q, 
            topic,
            subject: sub 
          }));

          subjectQuestions.push(...picked);
        });

        questionsBySubject[sub] = subjectQuestions;
      }

      let finalQuestions = [];
      
      for (const sub of storageOrder) {
        if (questionsBySubject[sub]) {
          const shuffledSubjectQuestions = shuffle([...questionsBySubject[sub]]);
          finalQuestions.push(...shuffledSubjectQuestions);
          
        }
      }

      finalQuestions = finalQuestions.map(shuffleQuestionOptions);

      finalQuestions = finalQuestions.map((q, index) => ({
        ...q,
        questionNumber: index + 1
      }));

      let currentSubject = null;
      let subjectStart = 1;
      
      for (let i = 0; i < finalQuestions.length; i++) {
        const q = finalQuestions[i];
        if (currentSubject !== q.subject) {
          currentSubject = q.subject;
          subjectStart = i + 1;
        }
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

module.exports = {generateExam};