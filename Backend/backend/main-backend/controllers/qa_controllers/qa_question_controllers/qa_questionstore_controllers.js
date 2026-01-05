const { s3, bucketName } = require("../../../config/s3");
const { getDb } = require("../../../config/db");
const Busboy = require("busboy");
const path = require("path");
const { ListObjectsCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const ExcelJS = require("exceljs");
const XLSX = require("xlsx");

// Allowed file types and corresponding S3 directories
const TYPE_PATHS = {
  qa: "static/xlsx/qa/question/QA/",
  vr: "static/xlsx/qa/question/VR/",
  bs: "static/xlsx/qa/question/BS/",
};

// Map file types to collection names
const COLLECTION_MAP = {
  qa: "qa_question",
  vr: "qa_question",
  bs: "qa_question",
};

// Supported file extensions for conversion
const SUPPORTED_EXTENSIONS = [
  '. xlsx', '.xls', '.csv', '. ods', '.xlsb', '.xlsm',
  '.txt', '.tsv', '.xml', '.html', '.htm'
];

// Define required columns for valid data
const REQUIRED_COLUMNS = ['question', 'option a', 'option b', 'option c', 'option d', 'answer','topic','Difficulty level'];
const OPTIONAL_COLUMNS = ['option e', 'images', 'image', 'difficulty', 'difficulty level'];

// Convert various file formats to XLSX buffer
async function convertToXlsxBuffer(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();
  
  try {
    // For native XLSX files, return as-is
    if (ext === '. xlsx') {
      return buffer;
    }

    // Use XLSX library to read various formats
    let workbook;
    
    if (ext === '.csv' || ext === '.txt' || ext === '.tsv') {
      // Handle text-based formats
      const content = buffer.toString('utf8');
      const delimiter = ext === '.tsv' ? '\t' : ',';
      workbook = XLSX.read(content, { type: 'string', raw: true, FS: delimiter });
    } else {
      // Handle binary formats (xls, ods, xlsb, xlsm, etc.)
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }

    // Convert to XLSX format using ExcelJS for consistency
    const excelJsWorkbook = new ExcelJS. Workbook();
    
    // Iterate through all sheets
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        raw: false,
        defval: ''
      });
      
      // Create worksheet in ExcelJS
      const excelSheet = excelJsWorkbook. addWorksheet(sheetName);
      
      // Add data to worksheet
      jsonData.forEach((row, rowIndex) => {
        if (Array.isArray(row) && row.length > 0) {
          excelSheet.getRow(rowIndex + 1).values = row;
        }
      });
      
      // Auto-fit columns
      excelSheet.columns.forEach((column, colIndex) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: false }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 10;
          maxLength = Math. max(maxLength, cellLength);
        });
        column.width = Math.min(maxLength + 2, 50);
      });
    });

    // Write to buffer
    const xlsxBuffer = await excelJsWorkbook.xlsx. writeBuffer();
    return xlsxBuffer;
    
  } catch (error) {
    throw new Error(`Failed to convert ${ext} to XLSX: ${error. message}`);
  }
}

// Check if file extension is supported
function isSupportedFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

// Generate a unique filename if the file already exists
async function getSafeFilename(typePath, filename) {
  const baseName = path.basename(filename, path.extname(filename));
  const extension = '. xlsx';
  let counter = 2;
  let newFilename = `${baseName}${extension}`;

  const listCommand = new ListObjectsCommand({
    Bucket: bucketName,
    Prefix: typePath,
  });

  const existingFiles = await s3.send(listCommand);

  while (
    existingFiles.Contents?. some(
      (item) => item.Key === `${typePath}${newFilename}`
    )
  ) {
    newFilename = `${baseName}(${counter})${extension}`;
    counter++;
  }

  return newFilename;
}

// Helper function to extract plain text from cell value
const extractPlainText = (cellValue) => {
  if (!cellValue) return "";
  
  // If it's a rich text object
  if (cellValue.richText && Array.isArray(cellValue.richText)) {
    return cellValue.richText.map(part => part.text || "").join("");
  }
  
  // If it's a regular value
  return cellValue.toString().trim();
};

// Normalize text for comparison (remove extra spaces, lowercase, trim)
function normalizeText(text) {
  if (!text) return "";
  return text.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

// Normalize difficulty level to numeric format (1, 2, 3)
function normalizeDifficultyLevel(difficulty) {
  if (!difficulty) return 1; // Default difficulty level
  
  const normalized = normalizeText(difficulty);
  
  // If it's already a number, validate and return
  const numValue = parseInt(difficulty);
  if (!isNaN(numValue) && numValue >= 1 && numValue <= 3) {
    return numValue;
  }
  
  // Map text variations to numbers
  if (normalized === 'easy' || normalized === 'e') {
    return 1;
  } else if (normalized === 'medium' || normalized === 'moderate' || normalized === 'm') {
    return 2;
  } else if (normalized === 'hard' || normalized === 'difficult' || normalized === 'h') {
    return 3;
  }
  
  // Default to 1 if unable to parse
  return 1;
}

// Check if two questions are duplicates
function isDuplicateQuestion(question1, question2) {
  // Compare question text
  if (normalizeText(question1.question) !== normalizeText(question2.question)) {
    return false;
  }
  
  // Compare all options
  if (normalizeText(question1.A) !== normalizeText(question2.A)) return false;
  if (normalizeText(question1.B) !== normalizeText(question2.B)) return false;
  if (normalizeText(question1.C) !== normalizeText(question2.C)) return false;
  if (normalizeText(question1.D) !== normalizeText(question2.D)) return false;
  
  // Compare Option E if both have it
  const hasE1 = question1.E && question1.E.trim() !== "";
  const hasE2 = question2.E && question2.E.trim() !== "";
  
  if (hasE1 && hasE2) {
    if (normalizeText(question1.E) !== normalizeText(question2.E)) return false;
  } else if (hasE1 !== hasE2) {
    return false; // One has E, other doesn't
  }
  
  return true;
}

// Check if a row contains valid question data
function isValidQuestionRow(rowData, headers) {
  // Must have a question
  if (!rowData.Question && !rowData.question) return false;
  
  // Must have at least options A-D
  const hasOptionA = rowData["Option A"] || rowData. A || rowData["option a"];
  const hasOptionB = rowData["Option B"] || rowData.B || rowData["option b"];
  const hasOptionC = rowData["Option C"] || rowData.C || rowData["option c"];
  const hasOptionD = rowData["Option D"] || rowData.D || rowData["option d"];
  
  if (!hasOptionA || !hasOptionB || !hasOptionC || !hasOptionD) return false;
  
  // Must have an answer
  const hasAnswer = rowData["Answer(No Option)"] || rowData.Answer || rowData. answer || rowData.correct_option;
  if (!hasAnswer) return false;
  
  return true;
}

// Check if sheet contains valid question data
function isValidQuestionSheet(worksheet) {
  let foundQuestionColumn = false;
  let foundOptionColumn = false;
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 20) return; // Only check first 20 rows for headers
    
    row.eachCell((cell) => {
      const cellValue = extractPlainText(cell.value).toLowerCase();
      
      if (cellValue === 'question') foundQuestionColumn = true;
      if (cellValue. includes('option') || cellValue === 'a' || cellValue === 'b') {
        foundOptionColumn = true;
      }
    });
  });
  
  return foundQuestionColumn && foundOptionColumn;
}

// Parse a single worksheet and extract questions
function parseWorksheetToQuestions(worksheet, sheetName) {
  // Helper to find header row
  let headerRowNumber = null;
  let headers = {};

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      const cellValue = extractPlainText(cell.value).toLowerCase();
      
      // Look for 'question' but NOT 'unit' anymore
      if (cellValue === 'question') {
        if (! headerRowNumber) {
          headerRowNumber = rowNumber;
        }
      }
    });
  });

  if (!headerRowNumber) {
    return null; // No valid header found
  }

  // Read headers
  worksheet.getRow(headerRowNumber).eachCell((cell, colNumber) => {
    const value = extractPlainText(cell. value);
    if (value) {
      headers[colNumber] = value;
    }
  });

  const data = [];

  // Read data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowNumber) return;

    const rowData = {};
    let hasData = false;

    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        const value = extractPlainText(cell.value);
        rowData[header] = value;
        if (value) hasData = true;
      }
    });

    // Only add valid question rows
    if (hasData && isValidQuestionRow(rowData, headers)) {
      data.push(rowData);
    }
  });

  return data. length > 0 ? { sheetName, data } : null;
}

// Parse Excel file from ALL sheets and convert to the required format
async function parseExcelToQuestions(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const allQuestions = [];
  const processedSheets = [];
  const skippedSheets = [];

  // Process each worksheet
  for (const worksheet of workbook.worksheets) {
    const sheetName = worksheet.name;
    
    // Check if sheet contains valid question data
    if (!isValidQuestionSheet(worksheet)) {
      skippedSheets.push(sheetName);
      continue;
    }

    // Parse the worksheet
    const result = parseWorksheetToQuestions(worksheet, sheetName);
    
    if (result && result.data. length > 0) {
      allQuestions.push(...result. data);
      processedSheets.push({ name: sheetName, count: result.data.length });
    } else {
      skippedSheets.push(sheetName);
    }
  }

  if (allQuestions.length === 0) {
    throw new Error("No valid question data found in any sheet");
  }

  // Group questions by topic (removed Unit from topic detection)
  const topicsMap = {};

  allQuestions.forEach((row) => {
    const topic = row.Topic || row.topic || "General";

  
    
    const question = {
      question: row. Question || row.question || "",
      A: row["Option A"] || row.A || "",
      B: row["Option B"] || row.B || "",
      C: row["Option C"] || row.C || "",
      D: row["Option D"] || row.D || "",
    };

    // Only add Option E if it has a value
    const optionE = row["Option E"] || row.E || "";
    if (optionE && optionE.trim() !== "") {
      question.E = optionE;
    }

    // Add correct answer
    question.correct_option = row["Answer(No Option)"] || row.Answer || row.answer || row.correct_option || "";

       // Add difficulty level as a NUMBER (1, 2, or 3)
    const difficultyValue = row["Difficulty Level"] || row["Difficulty"] || row.difficulty || row["difficulty level"] || "";
    question.difficulty_level = normalizeDifficultyLevel(difficultyValue);

    // Only add image if it exists
    const imageName = row["Images (Image name)"] || row.Images || row.image || "";
    if (imageName && imageName. trim() !== "") {
      question.image = imageName;
    }

   

    if (!topicsMap[topic]) {
      topicsMap[topic] = [];
    }

    topicsMap[topic].push(question);
  });

  // Convert to exam format
  const exam = Object.keys(topicsMap).map((topic) => ({
    topic,
    topic_question: topicsMap[topic],
  }));

  return {
    exam,
    metadata: {
      totalSheets: workbook.worksheets.length,
      processedSheets,
      skippedSheets,
      totalQuestions: allQuestions.length,
    }
  };
}

// Append questions to MongoDB with duplicate detection
async function appendQuestionsToMongo(filetype, newExam) {
  const db = getDb();
  const collectionName = COLLECTION_MAP[filetype];
  const collection = db.collection(collectionName);

  const subjectName = filetype.toUpperCase();

  const existingDoc = await collection.findOne({ subject_name: subjectName });

  let duplicatesFound = 0;
  let questionsAdded = 0;

  if (existingDoc) {
    const existingExam = existingDoc.exam || [];
    const mergedExam = [...existingExam];

    newExam.forEach((newTopic) => {
      const existingTopicIndex = mergedExam. findIndex(
        (t) => t.topic === newTopic.topic
      );

      if (existingTopicIndex !== -1) {
        // Topic exists, check for duplicate questions
        const existingQuestions = mergedExam[existingTopicIndex].topic_question;
        
        newTopic.topic_question. forEach((newQuestion) => {
          // Check if this question already exists
          const isDuplicate = existingQuestions. some(existingQuestion => 
            isDuplicateQuestion(newQuestion, existingQuestion)
          );
          
          if (!isDuplicate) {
            mergedExam[existingTopicIndex].topic_question.push(newQuestion);
            questionsAdded++;
          } else {
            duplicatesFound++;
          }
        });
      } else {
        // New topic, add all questions
        mergedExam. push(newTopic);
        questionsAdded += newTopic.topic_question. length;
      }
    });

    await collection.updateOne(
      { subject_name: subjectName },
      { $set: { exam: mergedExam } }
    );
  } else {
    // No existing document, insert all questions
    newExam.forEach((topic) => {
      questionsAdded += topic.topic_question.length;
    });

    await collection.insertOne({
      subject_name: subjectName,
      exam: newExam,
    });
  }

  return { duplicatesFound, questionsAdded };
}

// ================= UPLOAD CONTROLLER =================
const uploadFile = async (req, res) => {
  let responded = false;
  const safeRespond = (status, body) => {
    if (!responded) {
      responded = true;
      res.status(status).json(body);
    }
  };

  let filetype;
  let uploadBuffer;
  let originalFilename;
  let fileSize = 0;

  const busboy = Busboy({ headers: req.headers });

  busboy.on("field", (fieldname, value) => {
    if (fieldname === "filetype") {
      const lowerValue = value.toLowerCase().trim();
      
      if (TYPE_PATHS[lowerValue]) {
        filetype = lowerValue;
      }
    }
  });

  busboy.on("file", (fieldname, file, info) => {
    const { filename } = info;

    if (! filename || ! isSupportedFileType(filename)) {
      file.resume();
      return safeRespond(400, { 
        error: "Unsupported file type", 
        supported:  SUPPORTED_EXTENSIONS.join(', '),
        received: path.extname(filename).toLowerCase()
      });
    }

    originalFilename = filename;
    const chunks = [];

    file.on("data", (data) => {
      fileSize += data.length;
      chunks.push(data);
    });

    file.on("end", () => {
      uploadBuffer = Buffer.concat(chunks);
    });

    file.on("error", (err) => {
      safeRespond(500, { error: "File stream error" });
    });
  });

  busboy.on("finish", async () => {
    if (!uploadBuffer || ! filetype || !TYPE_PATHS[filetype]) {
      return safeRespond(400, {
        error: "Invalid upload or missing filetype",
        received_filetype: filetype,
        valid_filetypes: Object.keys(TYPE_PATHS),
      });
    }

    const typePath = TYPE_PATHS[filetype];

    try {
      // Convert the uploaded file to XLSX format
      const xlsxBuffer = await convertToXlsxBuffer(uploadBuffer, originalFilename);
      
      const safeName = await getSafeFilename(typePath, originalFilename);

      const uploadParams = {
        Bucket:  bucketName,
        Key:  `${typePath}${safeName}`,
        Body: xlsxBuffer,
        ContentType:  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      await s3.send(new PutObjectCommand(uploadParams));

      // Parse all sheets and extract valid question data
      const { exam:  parsedExam, metadata } = await parseExcelToQuestions(xlsxBuffer);

      // Append to MongoDB with duplicate detection
      const { duplicatesFound, questionsAdded } = await appendQuestionsToMongo(filetype, parsedExam);

      const originalExt = path.extname(originalFilename).toLowerCase();
      const wasConverted = originalExt !== '. xlsx';

      safeRespond(200, {
        success: true,
        message: "File uploaded and questions appended successfully",
        location: `${typePath}${safeName}`,
        topicsAdded: parsedExam.length,
        totalQuestionsInFile: metadata.totalQuestions,
        questionsAdded:  questionsAdded,
        duplicatesSkipped: duplicatesFound,
        originalFormat: originalExt,
        converted: wasConverted,
        finalFormat: '. xlsx',
        sheetsProcessed: metadata.processedSheets,
        sheetsSkipped: metadata.skippedSheets,
        totalSheets: metadata.totalSheets,
      });
    } catch (err) {
      safeRespond(500, {
        error: "File upload or database update failed",
        details: err. message,
      });
    }
  });

  busboy.on("error", (err) => {
    safeRespond(500, { error: "Upload parsing failed" });
  });

  req.pipe(busboy);
};

module.exports = { uploadFile };