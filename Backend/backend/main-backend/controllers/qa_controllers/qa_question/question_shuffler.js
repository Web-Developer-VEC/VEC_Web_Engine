const { getDb } = require('../../../config/db');

/* ------------------ SHUFFLERS ------------------ */

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleChoices(question) {
  const entries = Object.entries(question.options || {});
  const shuffled = shuffleArray(entries);

  const newOptions = {};
  let newCorrect = null;

  shuffled.forEach(([key, value], idx) => {
    const newKey = String.fromCharCode(65 + idx);
    newOptions[newKey] = value;
    if (key === question.correctOption) newCorrect = newKey;
  });

  return { ...question, options: newOptions, correctOption: newCorrect };
}

/* ------------------ NORMALIZER ------------------ */

function normalizeQuestion(row) {
  const options = {};
  let correctOption = null;

  const choices = [
    row["Choice 1 is required"],
    row["Choice 2 is required"],
    row["Choice 3"],
    row["Choice 4"],
    row["Choice 5"]
  ].filter(v => v !== "" && v !== undefined);

  choices.forEach((choice, i) => {
    const key = String.fromCharCode(65 + i);
    options[key] = choice;
  });

  if (row["Correct choice is required"]) {
    const index = row["Correct choice is required"] - 1;
    correctOption = String.fromCharCode(65 + index);
  }

  return {
    question: row["Question statement is required. This is the statement that will be delivered to the participant. "] || "",
    options,
    correctOption,
    choosedoption: "",
  };
}

/* ------------------ MAIN GENERATOR ------------------ */

async function generateQuestionsForStudent(subjectCode, cie, studentIndex = 0) {
  const db = getDb();
  const questionBankDoc = await db.collection('qa_questionbank').findOne({ subjectCode });

  let qaCount, otherCount;

  if (cie === 1 || cie === 2) {
    qaCount = 30;
    otherCount = 20;
  } else if (cie === 3) {
    qaCount = 60;
    otherCount = 40;
  } else {
    throw new Error("Invalid CIE value");
  }

  const qaPool = questionBankDoc.qa?.questions || [];

  const otherSections = Object.keys(questionBankDoc)
    .filter(k => !['subjectCode','subjectName','qa','_id','createdAt','updatedAt'].includes(k));

  let otherPool = [];
  for (const sec of otherSections) {
    otherPool.push(...(questionBankDoc[sec]?.questions || []));
  }

  if (qaPool.length < qaCount || otherPool.length < otherCount) {
    throw new Error("Not enough questions in question bank");
  }

  const shuffledQA = shuffleArray(qaPool);
  const shuffledOther = shuffleArray(otherPool);

  const qaStart = (studentIndex * qaCount) % shuffledQA.length;
  const otherStart = (studentIndex * otherCount) % shuffledOther.length;

  const selectedQA = [];
  const selectedOther = [];

  for (let i = 0; i < qaCount; i++)
    selectedQA.push(shuffledQA[(qaStart + i) % shuffledQA.length]);

  for (let i = 0; i < otherCount; i++)
    selectedOther.push(shuffledOther[(otherStart + i) % shuffledOther.length]);

  const finalQuestions = shuffleArray([...selectedQA, ...selectedOther]);

  return finalQuestions.map(q => shuffleChoices(normalizeQuestion(q)));
}

module.exports = { generateQuestionsForStudent };
