const { getDb } = require("../../main-backend/config/db");
const ExcelJS = require("exceljs");
const axios = require("axios");


async function questionbank_form(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("exams");  // change if needed

    // Fetch the document that contains type="questionbank"
    const result = await collection.findOne({ type: "questionbank" });

    if (!result) {
      return res.status(404).json({ message: "Question Bank not found" });
    }

    // Return only the questionbank data
    res.json({
      message: "success",
      data: result.data
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}





function cleanQuestion(cell) {
  if (!cell) return "";
  if (typeof cell === "string") return cell.trim();
  if (cell.richText) return cell.richText.map(t => t.text).join("").trim();
  return String(cell).trim();
}

async function downloadFromS3Url(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000
    });
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Error downloading file from S3 URL: ${error.message}`);
  }
}

async function extractImages(workbook) {
    const imageMap = {}; // key: "row-col", value: base64 image

    workbook.eachSheet(sheet => {
        sheet.getImages().forEach(img => {
            const image = workbook.getImage(img.imageId);
            if (!image) return;

            const { tl } = img.range; // top-left cell of image
            const row = tl.row + 1;   // ExcelJS index fix
            const col = tl.col + 1;

            const ext = image.extension;
            const base64 = image.buffer.toString("base64");

            imageMap[`${row}-${col}`] = `data:image/${ext};base64,${base64}`;
        });
    });

    return imageMap;
}


async function loadQuestions(s3Url) {
    const buffer = await downloadFromS3Url(s3Url);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];

    // Extract all pasted images
    const imageMap = await extractImages(workbook);

    const q = [];
    let columnMapping = {};
    let headerRowIndex = 0;

    // Detect headers
    for (let rowIndex = 1; rowIndex <= sheet.rowCount; rowIndex++) {
        const row = sheet.getRow(rowIndex);
        let foundHeaders = 0;
        let tempMapping = {};

        row.eachCell((cell, col) => {
            if (!cell.value) return;
            const header = String(cell.value).toLowerCase().trim();

            if (header === "unit") tempMapping.unit = col;
            if (header === "group") tempMapping.group = col;
            if (header === "difficulty level") tempMapping.difficulty = col;
            if (header === "question") tempMapping.question = col;
            if (header === "diagram") tempMapping.image = col;  // <- NEW
            if (header === "co") tempMapping.co = col;
            if (header === "mark") tempMapping.mark = col;
            if (header === "blooms level") tempMapping.bloom = col;

            if (["unit", "group", "difficulty level", "question"].includes(header))
                foundHeaders++;
        });

        if (foundHeaders >= 4) {
            columnMapping = tempMapping;
            headerRowIndex = rowIndex;
            break;
        }
    }

    // Validate required columns
    const missing = ["unit", "group", "difficulty", "question", "co", "mark", "bloom"]
        .filter(k => !columnMapping[k]);

    if (missing.length > 0) {
        throw new Error("Missing required Excel columns: " + missing.join(", "));
    }

    // Read data rows
    sheet.eachRow((row, index) => {
        if (index <= headerRowIndex) return;

        const imgKey = `${index}-${columnMapping.image}`; // row-col
        const base64Image = imageMap[imgKey] || null;

        const questionData = {
            id: `${index}_${Date.now()}_${Math.random()}`,
            unit: Number(row.getCell(columnMapping.unit).value) || 0,
            group: Number(row.getCell(columnMapping.group).value) || 0,
            difficulty: Number(row.getCell(columnMapping.difficulty).value) || 0,
            question: cleanQuestion(row.getCell(columnMapping.question).value),
            image: base64Image, // <-- INCLUDE IMAGE IN OUTPUT
            co: row.getCell(columnMapping.co).value || "",
            mark: Number(row.getCell(columnMapping.mark).value) || 0,
            bloom: row.getCell(columnMapping.bloom).value || ""
        };

        if (questionData.unit > 0 && questionData.question) {
            q.push(questionData);
        }
    });

    return q;
}


const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

function pickRule(qs, group, difficulty, usedIds = new Set()) {
  let availableQs = qs.filter(q => !usedIds.has(q.id));
  
  let a = availableQs.filter(q => q.group === group && q.difficulty === difficulty);
  if (a.length === 0) a = availableQs.filter(q => q.group === group);
  if (a.length === 0) a = availableQs;
  
  if (a.length === 0) return null;
  
  const selected = shuffle(a)[0];
  usedIds.add(selected.id);
  return selected;
}

function pickRandom(qs, count, usedIds = new Set()) {
  const availableQs = qs.filter(q => !usedIds.has(q.id));
  const shuffled = shuffle(availableQs);
  const selected = shuffled.slice(0, count);
  
  selected.forEach(q => usedIds.add(q.id));
  return selected;
}

function formatQuestionPartA(question, questionNumber, marks = null) {
  if (!question) return null;
  
  return {
    "Q.no": questionNumber,
    "question": question. question,
    "diagram": question.image,
    "co": question.co,
    "blooms level": question.bloom,
    "marks": marks !== null ? marks : question.mark
  };
}

function formatQuestionPartB(questionA, questionB, questionNumber, marks = null) {
  const result = [];
  
  if (questionA) {
    result.push({
      "Q.no": questionNumber,
      "option": "a",
      "question": questionA.question,
      "diagram": questionA.image,
      "co":  questionA.co,
      "blooms level": questionA.bloom,
      "marks": marks !== null ? marks : questionA.mark
    });
  }
  
  if (questionB) {
    result.push({
      "Q.no": questionNumber,
      "option": "b",
      "question": questionB. question,
      "diagram": questionB.image,
      "co": questionB.co,
      "blooms level": questionB.bloom,
      "marks": marks !== null ? marks : questionB.mark
    });
  }
  
  return result;
}

function buildAllPapers(q) {
  const papers = {};
  papers.CIE1 = buildCIEPaper(q, [1, 2]);
  papers.CIE2 = buildCIEPaper(q, [3, 4]);
  papers.MODEL = buildModelPaper(q);
  return papers;
}

function buildCIEPaper(q, units) {
  const usedQuestionIds = new Set();
  
  const partA = [];
  let partAQuestionNo = 1;

  units.forEach(unit => {
    const U = q.filter(x => x.unit === unit && x.mark === 2);
    const questions = [
      pickRule(U, 1, 1, usedQuestionIds),
      pickRule(U, 1, 2, usedQuestionIds),
      pickRule(U, 2, 1, usedQuestionIds),
      pickRule(U, 2, 2, usedQuestionIds),
      pickRandom(U. filter(x => !usedQuestionIds.has(x.id)), 1, usedQuestionIds)[0]
    ];

    questions.forEach(q => {
      if (q) {
        partA.push(formatQuestionPartA(q, partAQuestionNo++, 2));
      }
    });
  });

  const partB = [];
  const longQs = q.filter(x => x.mark === 16);
  let partBQuestionNo = 11;

  units. forEach(unit => {
    const U = longQs.filter(x => x.unit === unit);
    const g1 = pickRule(U, 1, 1, usedQuestionIds) || pickRule(U, 1, 2, usedQuestionIds);
    const g2 = pickRule(U, 2, 1, usedQuestionIds) || pickRule(U, 2, 2, usedQuestionIds);

    if (g1 && g2) {
      const optionQuestions = formatQuestionPartB(g1, g2, partBQuestionNo++, 15);
      partB.push(... optionQuestions);
    }
  });

  return {
    "PART A": partA.filter(q => q !== null),
    "PART B": partB.filter(q => q !== null)
  };
}

function buildModelPaper(q) {
  const usedQuestionIds = new Set();
  
  const partA = [];
  let partAQuestionNo = 1;

  for (let u = 1; u <= 5; u++) {
    const U = q.filter(x => x.unit === u && x.mark === 2);
    const q1 = pickRule(U, 1, 1, usedQuestionIds);
    const q2 = pickRule(U, 2, 2, usedQuestionIds);
    
    if (q1) partA.push(formatQuestionPartA(q1, partAQuestionNo++, 2));
    if (q2) partA.push(formatQuestionPartA(q2, partAQuestionNo++, 2));
  }

  const partB = [];
  const LQs = q.filter(x => x.mark === 16);
  let partBQuestionNo = 11;

  for (let u = 1; u <= 5; u++) {
    const U = LQs.filter(x => x.unit === u);
    const q1 = pickRule(U, 1, 1, usedQuestionIds);
    const q2 = pickRule(U, 2, 2, usedQuestionIds);
    
    if (q1 && q2) {
      const optionQuestions = formatQuestionPartB(q1, q2, partBQuestionNo++, 15);
      partB.push(...optionQuestions);
    }
  }

  return {
    "PART A":  partA.filter(q => q !== null),
    "PART B": partB.filter(q => q !== null)
  };
}

async function questionbank_generator(req, res) {
  try {
    const { examType, subjectcode } = req.body;

    if (!examType) {
      return res.status(400).json({
        success: false,
        error: "examType is required in request body"
      });
    }

    if (!subjectcode) {
      return res.status(400).json({
        success: false,
        error: "subjectcode is required in request body"
      });
    }

    const db = getDb();
    const examsCollection = db.collection("exams");

    const questionBankDoc = await examsCollection.findOne({
      type: "questionbank"
    });

    if (!questionBankDoc) {
      return res.status(404).json({
        success: false,
        error: "Question bank collection not found in database"
      });
    }

    let subjectRecord = null;
    
    if (questionBankDoc.data && questionBankDoc.data.length > 0) {
      const questionBankData = questionBankDoc. data[0];
      
      if (questionBankData.subject && Array.isArray(questionBankData.subject)) {
        subjectRecord = questionBankData. subject.find(subject => 
          subject.code && (
            subject.code.toLowerCase() === subjectcode.toLowerCase() ||
            subject.code.toUpperCase() === subjectcode.toUpperCase() ||
            subject.code === subjectcode
          )
        );
      }
    }

    if (!subjectRecord) {
      let availableSubjects = [];
      if (questionBankDoc.data && questionBankDoc.data.length > 0) {
        const questionBankData = questionBankDoc.data[0];
        if (questionBankData.subject && Array.isArray(questionBankData.subject)) {
          availableSubjects = questionBankData.subject
            .filter(subject => subject. code)
            .map(subject => ({
              code: subject.code,
              name: subject.name
            }));
        }
      }

      return res.status(404).json({
        success: false,
        error: `Question bank not found for subject code: ${subjectcode}`,
        availableSubjects: availableSubjects
      });
    }

    const filePath = subjectRecord.excel_path;
    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: "Excel file path not found for this subject",
        subjectRecord: subjectRecord
      });
    }

    const baseUrl = process.env.STATIC_FILES_BASE_URL;
    if (!baseUrl) {
      return res.status(500).json({
        success: false,
        error: "STATIC_FILES_BASE_URL environment variable not configured"
      });
    }

    const fullFileUrl = `${baseUrl}${filePath}`;
    const questions = await loadQuestions(fullFileUrl);
    let paper = null;
    let examTypeTitle = "";

    if (examType.toLowerCase() === 'cie1' || examType.toLowerCase() === 'cie 1') {
      paper = buildCIEPaper(questions, [1, 2]);
      examTypeTitle = "CONTINUOUS INTERNAL EXAMINATION - 1";
    } else if (examType. toLowerCase() === 'cie2' || examType.toLowerCase() === 'cie 2') {
      paper = buildCIEPaper(questions, [3, 4]);
      examTypeTitle = "CONTINUOUS INTERNAL EXAMINATION - 2";
    } else if (examType.toLowerCase() === 'cie3' || examType.toLowerCase() === 'cie 3' || examType.toLowerCase() === 'model') {
      paper = buildModelPaper(questions);
      examTypeTitle = "CONTINUOUS INTERNAL EXAMINATION - 3";
    } else if (examType.toLowerCase() === 'all') {
      const papers = buildAllPapers(questions);
      return res.json({
        success: true,
        message: "All papers generated successfully",
        sourceFile: fullFileUrl,
        subjectcode: subjectcode,
        subjectName: subjectRecord.name,
        examType: "ALL EXAM PAPERS",
        papers: papers
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid examType. Valid options are: 'cie1', 'cie2', 'cie3', 'model', 'all'"
      });
    }

    return res.json({ 
      success: true,
      message: "Paper generated successfully",
      sourceFile: fullFileUrl,
      subjectcode: subjectcode,
      subjectName: subjectRecord.name,
      examType: examTypeTitle,
      paper: paper
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}



module.exports = { questionbank_form, questionbank_generator };
