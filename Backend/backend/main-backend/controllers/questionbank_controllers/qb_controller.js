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

function pickRule(pool, group, diff, used, global) {
  const available = pool.filter(
    q => !used.has(q.id) && !global.has(q.id)
  );

  const priority =
    available.filter(q => q.group === group && q.difficulty === diff) ||
    available.filter(q => q.group === group) ||
    available;

  if (!priority.length) return null;

  const selected = shuffle(priority)[0];
  used.add(selected.id);
  return selected;
}

// ---------- PAPER BUILDERS ----------
function buildCIEPaper(qs, units, used, global) {
  const partA = [];
  const partB = [];
  let a = 1, b = 11;

  units.forEach(u => {
    const shortQs = qs.filter(q => q.unit === u && q.mark === 2);
    const longQs = qs.filter(q => q.unit === u && q.mark === 16);

    [
      pickRule(shortQs, 1, 1, used, global),
      pickRule(shortQs, 1, 2, used, global),
      pickRule(shortQs, 2, 1, used, global),
      pickRule(shortQs, 2, 2, used, global)
    ].forEach(q => q && partA.push({
      "Q.no": a++,
      question: q.question,
      co: q.co,
      "blooms level": q.bloom,
      marks: 2,
      image: q.imagePath
    }));

    const q1 = pickRule(longQs, 1, 1, used, global);
    const q2 = pickRule(longQs, 2, 2, used, global);
    if (q1 && q2) {
      partB.push(
        { "Q.no": b, option: "a", ...q1, marks: 16 },
        { "Q.no": b++, option: "b", ...q2, marks: 16 }
      );
    }
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

  if (/cie\s?1/i.test(examType)) {
    paper = buildCIEPaper(qs, [1, 2], usedThisSet, globalUsed);
    title = "CONTINUOUS INTERNAL EXAMINATION - 1 (50 Marks)";
  } else if (/cie\s?2/i.test(examType)) {
    paper = buildCIEPaper(qs, [3, 4], usedThisSet, globalUsed);
    title = "CONTINUOUS INTERNAL EXAMINATION - 2 (50 Marks)";
  } else {
    paper = buildCIEPaper(qs, [1,2,3,4,5], usedThisSet, globalUsed);
    title = "CONTINUOUS INTERNAL EXAMINATION - 3 (100 Marks)";
  }

  await updateUsageState(subjectDoc.subjectCode, [...usedThisSet]);

  return { paper: { "PART A": paper.partA, "PART B": paper.partB }, examTypeTitle: title };
}

// ---------- USAGE ----------
async function getUsageState(subjectCode) {
  const col = getDb().collection("question_usage");
  return (
    (await col.findOne({ _id: subjectCode })) ||
    (await col.insertOne({
      _id: subjectCode,
      subjectCode,
      usedQuestionCodes: [],
      setCount: 0,
      updatedAt: new Date()
    })).ops?.[0]
  );
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
