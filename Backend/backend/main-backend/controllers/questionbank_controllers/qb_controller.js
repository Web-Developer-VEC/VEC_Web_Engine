const { getDb } = require("../../config/db");

// ---------- FLATTEN ----------
function flattenQuestionsFromDB(subjectDoc) {
  const out = [];

  for (const [unit, data] of Object.entries(subjectDoc.units)) {
    for (const q of data.partA || []) {
      out.push({ 
        ... q, 
        unit: +unit, 
        mark: 2, 
        id: q.questionCode,
        group: q.group || 1,
        difficulty: q.difficulty || 1
      });
    }
    for (const q of data.partB || []) {
      out.push({ 
        ...q, 
        unit: +unit, 
        mark: 16, 
        id: q. questionCode,
        group: q.group || 1,
        difficulty: q.difficulty || 1
      });
    }
  }
  
  return out;
}

// ---------- HELPERS ----------
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

// Get all used questions across all sets EXCEPT current set FOR THE SAME EXAM TYPE
async function getAllUsedQuestions(subjectCode, examType, currentSet) {
  const col = getDb().collection("question_usage");
  
  const allSets = ['A', 'B', 'C']. filter(s => s !== currentSet);
  const usedQuestions = new Set();
  
  for (const set of allSets) {
    const docId = `${subjectCode}_${examType}_set_${set}`;
    const doc = await col.findOne({ _id: docId });
    
    if (doc && doc.usedQuestionCodes) {
      doc.usedQuestionCodes. forEach(qCode => usedQuestions.add(qCode));
    }
  }
  
  return usedQuestions;
}

// Pick question with allowReuse parameter
function pickRule(qs, group, difficulty, usedIds = new Set(), allowReuse = false) {
  let availableQs = allowReuse ? qs : qs.filter(q => !usedIds.has(q.id));
  
  // Try exact match (group + difficulty)
  let filtered = availableQs.filter(q => q.group === group && q.difficulty === difficulty);
  
  // Fallback to group only
  if (filtered.length === 0) {
    filtered = availableQs.filter(q => q.group === group);
  }
  
  // Fallback to difficulty only
  if (filtered.length === 0) {
    filtered = availableQs.filter(q => q. difficulty === difficulty);
  }
  
  // Fallback to all available
  if (filtered.length === 0) {
    filtered = availableQs;
  }
  
  if (filtered.length === 0) return null;
  
  const selected = shuffle(filtered)[0];
  usedIds. add(selected.id);
  return selected;
}

// Pick random questions with allowReuse
function pickRandom(qs, count, usedIds = new Set(), allowReuse = false) {
  const availableQs = allowReuse ?  qs : qs.filter(q => !usedIds.has(q.id));
  const shuffled = shuffle(availableQs);
  const selected = shuffled.slice(0, count);
  
  selected.forEach(q => usedIds.add(q.id));
  return selected;
}

// ---------- PAPER BUILDER (WITH GROUPS & DIFFICULTY) ----------
function buildCIEPaper(
  qs,
  units,
  used,
  global,
  shortCount,
  longQuestionCount,
  displayLongMark,
  isModelExam = false,
  allowReuse = false
) {
  const partA = [];
  const partB = [];

  let qNoA = 1;
  let qNoB = shortCount + 1;

  const usedIds = allowReuse ? new Set([...used]) : new Set([...used, ...global]);

  // ================= PART A =================
  
  if (isModelExam) {
    // MODEL EXAM:  2 questions per unit (1 from difficulty 1, 1 from difficulty 2)
    units.forEach(unit => {
      const unitShortQs = qs.filter(q => q.mark === 2 && q.unit === unit);

      // Take 1 from difficulty 1 (any group)
      const q1 = pickRule(unitShortQs, 1, 1, usedIds, allowReuse) || pickRule(unitShortQs, 2, 1, usedIds, allowReuse);
      
      if (q1) {
        used.add(q1.id);
        partA.push({
          "Q.no": qNoA++,
          question: q1.question,
          co: q1.co,
          "blooms level": q1.bloom,
          marks: 2,
          image: q1.imagePath
        });
      }

      // Take 1 from difficulty 2 (any group)
      const q2 = pickRule(unitShortQs, 1, 2, usedIds, allowReuse) || pickRule(unitShortQs, 2, 2, usedIds, allowReuse);
      
      if (q2) {
        used.add(q2.id);
        partA.push({
          "Q.no": qNoA++,
          question: q2.question,
          co: q2.co,
          "blooms level": q2.bloom,
          marks: 2,
          image: q2.imagePath
        });
      }

      if (! q1 || !q2) {
        throw new Error(`Not enough 2-mark questions in Unit ${unit} with proper difficulty distribution`);
      }
    });
  } else {
    // CIE-1 & CIE-2: 5 questions per unit (2 from group 1, 2 from group 2, 1 random)
    units.forEach(unit => {
      const unitShortQs = qs.filter(q => q.mark === 2 && q.unit === unit);

      // Take 2 from group 1 (difficulty 1 and 2)
      const g1q1 = pickRule(unitShortQs, 1, 1, usedIds, allowReuse);
      const g1q2 = pickRule(unitShortQs, 1, 2, usedIds, allowReuse);

      if (g1q1) {
        used.add(g1q1.id);
        partA.push({
          "Q.no": qNoA++,
          question: g1q1.question,
          co: g1q1.co,
          "blooms level": g1q1.bloom,
          marks: 2,
          image:  g1q1.imagePath
        });
      }

      if (g1q2) {
        used.add(g1q2.id);
        partA.push({
          "Q. no": qNoA++,
          question: g1q2.question,
          co: g1q2.co,
          "blooms level": g1q2.bloom,
          marks: 2,
          image: g1q2.imagePath
        });
      }

      // Take 2 from group 2 (difficulty 1 and 2)
      const g2q1 = pickRule(unitShortQs, 2, 1, usedIds, allowReuse);
      const g2q2 = pickRule(unitShortQs, 2, 2, usedIds, allowReuse);

      if (g2q1) {
        used.add(g2q1.id);
        partA.push({
          "Q.no": qNoA++,
          question: g2q1.question,
          co: g2q1.co,
          "blooms level": g2q1.bloom,
          marks: 2,
          image: g2q1.imagePath
        });
      }

      if (g2q2) {
        used.add(g2q2.id);
        partA.push({
          "Q.no": qNoA++,
          question:  g2q2.question,
          co: g2q2.co,
          "blooms level": g2q2.bloom,
          marks: 2,
          image: g2q2.imagePath
        });
      }

      // Take 1 random from remaining questions in this unit
      const randomQs = pickRandom(unitShortQs, 1, usedIds, allowReuse);
      
      if (randomQs. length > 0) {
        const q5 = randomQs[0];
        used.add(q5.id);
        partA.push({
          "Q.no": qNoA++,
          question: q5.question,
          co: q5.co,
          "blooms level": q5.bloom,
          marks: 2,
          image: q5.imagePath
        });
      }

      if (!g1q1 || !g1q2 || !g2q1 || !g2q2 || randomQs.length === 0) {
        throw new Error(`Not enough 2-mark questions in Unit ${unit} with proper group distribution`);
      }
    });
  }

  // ================= PART B (OPTION a / b) =================
  units.forEach((unit, unitIndex) => {
    if (unitIndex >= longQuestionCount) return;

    const unitLongQs = qs.filter(q => q.mark === 16 && q.unit === unit);

    // Get all bloom levels available for this unit
    const bloomLevels = [... new Set(unitLongQs.map(q => q.bloom))];

    let foundPair = false;

    // Try each bloom level to find a valid pair
    for (const bloomLevel of bloomLevels) {
      const group1Diff1 = unitLongQs.filter(
        q =>
          q.group === 1 &&
          q.bloom === bloomLevel &&
          q.difficulty === 1 &&
          (allowReuse || !usedIds.has(q.id))
      );

      const group2Diff2 = unitLongQs. filter(
        q =>
          q.group === 2 &&
          q.bloom === bloomLevel &&
          q.difficulty === 2 &&
          (allowReuse || !usedIds.has(q.id))
      );

      if (group1Diff1.length > 0 && group2Diff2.length > 0) {
        const qA = shuffle(group1Diff1)[0];
        const qB = shuffle(group2Diff2)[0];

        used.add(qA. id);
        used.add(qB.id);
        usedIds.add(qA. id);
        usedIds.add(qB.id);

        partB.push({
          "Q.no": qNoB,
          option: "a",
          question: qA.question,
          co: qA.co,
          "blooms level": qA.bloom,
          marks: displayLongMark,
          image: qA.imagePath
        });

        partB.push({
          "Q.no": qNoB,
          option: "b",
          question: qB.question,
          co: qB.co,
          "blooms level": qB.bloom,
          marks: displayLongMark,
          image: qB.imagePath
        });

        qNoB++;
        foundPair = true;
        break;
      }
    }

    if (!foundPair) {
      throw new Error(
        `Not enough 16-mark questions in Unit ${unit} with matching Bloom's level and proper group/difficulty distribution`
      );
    }
  });

  return { partA, partB };
}

// ---------- MAIN ----------
async function generateQuestionBankFromDB(subjectDoc, examType, setNumber) {
  const qs = flattenQuestionsFromDB(subjectDoc);
  const normalizedExamType = String(examType).toLowerCase().trim().replace(/\s+/g, '');
  
  // Get used questions from other sets OF THE SAME EXAM TYPE
  const otherSetsUsed = await getAllUsedQuestions(subjectDoc.subjectCode, normalizedExamType, setNumber);
  const globalUsed = new Set(otherSetsUsed);
  const usedThisSet = new Set();
  let paper, title;

  try {
    let allowReuse = false;

    // ---------- CIE 1 ----------
    if (normalizedExamType. includes('cie1')) {
      paper = buildCIEPaper(
        qs,
        [1, 2],
        usedThisSet,
        globalUsed,
        10,
        2,
        15,
        false,
        allowReuse
      );
      title = "CONTINUOUS INTERNAL EXAMINATION - 1 (50 Marks)";
    }
    // ---------- CIE 2 ----------
    else if (normalizedExamType.includes('cie2')) {
      paper = buildCIEPaper(
        qs,
        [3, 4],
        usedThisSet,
        globalUsed,
        10,
        2,
        15,
        false,
        allowReuse
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
        16,
        true,
        allowReuse
      );
      title = "CONTINUOUS INTERNAL EXAMINATION - 3 (100 Marks)";
    }

    await updateUsageState(subjectDoc. subjectCode, normalizedExamType, setNumber, [... usedThisSet]);

    return {
      paper:  {
        "PART A": paper.partA,
        "PART B":  paper.partB
      },
      examTypeTitle: title,
      setNumber: setNumber,
      questionsReused: allowReuse
    };

  } catch (error) {
    if (error.message.includes("Not enough")) {
      usedThisSet.clear();
      let allowReuse = true;

      try {
        // ---------- CIE 1 ----------
        if (normalizedExamType.includes('cie1')) {
          paper = buildCIEPaper(
            qs,
            [1, 2],
            usedThisSet,
            globalUsed,
            10,
            2,
            15,
            false,
            allowReuse
          );
          title = "CONTINUOUS INTERNAL EXAMINATION - 1 (50 Marks)";
        }
        // ---------- CIE 2 ----------
        else if (normalizedExamType.includes('cie2')) {
          paper = buildCIEPaper(
            qs,
            [3, 4],
            usedThisSet,
            globalUsed,
            10,
            2,
            15,
            false,
            allowReuse
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
            16,
            true,
            allowReuse
          );
          title = "CONTINUOUS INTERNAL EXAMINATION - 3 (100 Marks)";
        }

        await updateUsageState(subjectDoc. subjectCode, normalizedExamType, setNumber, [...usedThisSet]);

        return {
          paper: {
            "PART A": paper.partA,
            "PART B":  paper.partB
          },
          examTypeTitle: title,
          setNumber: setNumber,
          questionsReused: allowReuse
        };

      } catch (retryError) {
        throw retryError;
      }
    } else {
      throw error;
    }
  }
}

// ---------- USAGE (EXAM-TYPE + SET-BASED) ----------
async function getUsageState(subjectCode, examType, setNumber) {
  const col = getDb().collection("question_usage");
  const docId = `${subjectCode}_${examType}_set_${setNumber}`;
  
  const doc = await col.findOne({ _id: docId });

  if (doc) {
    return doc;
  }

  const newDoc = {
    _id: docId,
    subjectCode,
    examType,
    setNumber,
    usedQuestionCodes: [],
    generationCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await col.insertOne(newDoc);
  return newDoc;
}

async function updateUsageState(subjectCode, examType, setNumber, usedQuestions) {
  const col = getDb().collection("question_usage");
  const docId = `${subjectCode}_${examType}_set_${setNumber}`;
  
  const doc = await col.findOne({ _id: docId });

  if (! doc) {
    const newDoc = {
      _id: docId,
      subjectCode,
      examType,
      setNumber,
      usedQuestionCodes: usedQuestions,
      generationCount: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await col.insertOne(newDoc);
    return;
  }
  
  await col.updateOne(
    { _id: docId },
    {
      $set: {
        usedQuestionCodes: usedQuestions,
        generationCount: (doc.generationCount || 0) + 1,
        updatedAt: new Date()
      }
    }
  );
}

module.exports = {
  flattenQuestionsFromDB,
  generateQuestionBankFromDB
};