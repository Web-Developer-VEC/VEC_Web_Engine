const { getDb } = require("../../config/db");

// ---------- FLATTEN ----------
function flattenQuestionsFromDB(subjectDoc) {
  const out = [];

  for (const [unit, data] of Object.entries(subjectDoc.units)) {
    for (const q of data.partA || []) {
      out.push({ ...q, unit: +unit, mark: 2, id: q.questionCode });
    }
    for (const q of data.partB || []) {
      out.push({ ...q, unit: +unit, mark: 16, id: q.questionCode });
    }
  }
  return out;
}

// ---------- HELPERS ----------
const shuffle = arr => arr.sort(() => Math.random() - 0.5);

// ---------- PAPER BUILDER (METHOD-1) ----------
function buildCIEPaper(
  qs,
  units,
  used,
  global,
  shortCount,
  longQuestionCount,
  displayLongMark,
  isModelExam = false
) {
  const partA = [];
  const partB = [];

  let qNoA = 1;
  let qNoB = shortCount + 1;

  // ================= PART A =================
  if (isModelExam) {
    // 🔥 MODEL EXAM STRICT UNIT–NUMBER MAPPING
    units.forEach(unit => {
      const unitShortQs = qs.filter(
        q =>
          q.mark === 2 &&
          q.unit === unit &&
          !used.has(q.id) &&
          !global.has(q.id)
      );

      if (unitShortQs.length < 2) {
        throw new Error(`Not enough 2-mark questions in Unit ${unit}`);
      }

      shuffle(unitShortQs)
        .slice(0, 2)
        .forEach(q => {
          used.add(q.id);
          partA.push({
            "Q.no": qNoA++, // Q1–Q10 in correct order
            question: q.question,
            co: q.co,
            "blooms level": q.bloom,
            marks: 2,
            image: q.imagePath
          });
        });
    });
  } else {
    // 🔹 CIE-1 & CIE-2 (5 per unit)
    const shortPerUnit = shortCount / units.length;

    units.forEach(unit => {
      const unitShortQs = qs.filter(
        q =>
          q.mark === 2 &&
          q.unit === unit &&
          !used.has(q.id) &&
          !global.has(q.id)
      );

      if (unitShortQs.length < shortPerUnit) {
        throw new Error(`Not enough 2-mark questions in Unit ${unit}`);
      }

      shuffle(unitShortQs)
        .slice(0, shortPerUnit)
        .forEach(q => {
          used.add(q.id);
          partA.push({
            "Q.no": qNoA++,
            question: q.question,
            co: q.co,
            "blooms level": q.bloom,
            marks: 2,
            image: q.imagePath
          });
        });
    });
  }

  // ================= PART B (OPTION a / b) =================
  let questionIndex = 0;

  units.forEach(unit => {
    if (questionIndex >= longQuestionCount) return;

    const unitLongQs = qs.filter(
      q =>
        q.mark === 16 &&
        q.unit === unit &&
        !used.has(q.id) &&
        !global.has(q.id)
    );

    if (unitLongQs.length < 2) return;

    shuffle(unitLongQs)
      .slice(0, 2)
      .forEach((q, i) => {
        used.add(q.id);
        partB.push({
          "Q.no": qNoB,
          option: i === 0 ? "a" : "b",
          question: q.question,
          co: q.co,
          "blooms level": q.bloom,
          marks: displayLongMark,
          image: q.imagePath
        });
      });

    qNoB++;
    questionIndex++;
  });

  return { partA, partB };
}


// ---------- MAIN ----------
async function generateQuestionBankFromDB(subjectDoc, examType) {
  const qs = flattenQuestionsFromDB(subjectDoc);
  const usage = await getUsageState(subjectDoc.subjectCode);

  const globalUsed =
    usage.setCount < 3 ? new Set(usage.usedQuestionCodes) : new Set();

  const usedThisSet = new Set();
  let paper, title;

  // ---------- CIE 1 ----------
  if (/cie\s?1/i.test(examType)) {
    paper = buildCIEPaper(
      qs,
      [1, 2],
      usedThisSet,
      globalUsed,
      10,
      2,
      15
    );
    title = "CONTINUOUS INTERNAL EXAMINATION - 1 (50 Marks)";
  }

  // ---------- CIE 2 ----------
  else if (/cie\s?2/i.test(examType)) {
    paper = buildCIEPaper(
      qs,
      [3, 4],
      usedThisSet,
      globalUsed,
      10,
      2,
      15
    );
    title = "CONTINUOUS INTERNAL EXAMINATION - 2 (50 Marks)";
  }

  // ---------- MODEL / CIE 3 ----------
  else {
    paper = buildCIEPaper(
      qs,
      [1, 2, 3, 4, 5],
      usedThisSet,
      globalUsed,
      10,
      5,
      16
    );
    title = "CONTINUOUS INTERNAL EXAMINATION - 3 (100 Marks)";
  }

  await updateUsageState(subjectDoc.subjectCode, [...usedThisSet]);

  return {
    paper: {
      "PART A": paper.partA,
      "PART B": paper.partB
    },
    examTypeTitle: title
  };
}

// ---------- USAGE ----------
async function getUsageState(subjectCode) {
  const col = getDb().collection("question_usage");
  const doc = await col.findOne({ _id: subjectCode });

  if (doc) return doc;

  const res = await col.insertOne({
    _id: subjectCode,
    subjectCode,
    usedQuestionCodes: [],
    setCount: 0,
    updatedAt: new Date()
  });

  return res.ops[0];
}

async function updateUsageState(subjectCode, used) {
  const col = getDb().collection("question_usage");
  const doc = await col.findOne({ _id: subjectCode });

  const setCount = doc.setCount >= 3 ? 1 : doc.setCount + 1;
  const usedCodes = doc.setCount >= 3 ? [] : doc.usedQuestionCodes;

  await col.updateOne(
    { _id: subjectCode },
    {
      $set: {
        setCount,
        usedQuestionCodes: [...new Set([...usedCodes, ...used])],
        updatedAt: new Date()
      }
    }
  );
}

module.exports = {
  flattenQuestionsFromDB,
  generateQuestionBankFromDB
};
