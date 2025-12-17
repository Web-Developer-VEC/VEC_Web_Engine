const { getDb } = require("../../../main-backend/config/db");
const ExcelJS = require("exceljs");
const axios = require("axios");

function cleanCellValue(cell) {
  try {
    if (!cell) return "";
    if (typeof cell === "string") return cell.trim();
    if (cell.richText)
      return cell.richText.map(r => r.text || "").join("").trim();
    if (cell.text) return String(cell.text).trim();
    return String(cell).trim();
  } catch (e) {
    console.error("Cell parse error:", e);
    return "";
  }
}

async function downloadFromS3Url(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 60000
  });
  return Buffer.from(res.data);
}

async function ensureSubjectExists(subjectCode, subjectRecord) {
  const db = getDb();
  const col = db.collection("Question");

  // Already exists
  const existing = await col.findOne({ subjectCode });
  if (existing) return existing;

  const baseUrl = process.env.STATIC_FILES_BASE_URL;
  const excelUrl = `${baseUrl}${subjectRecord.excel_path}`;
  const excelFile = subjectRecord.excel_path.split("/").pop();
  const folderName = excelFile.replace(".xlsx", "");

  const buffer = await downloadFromS3Url(excelUrl);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];

  // Header detection
  const headers = {};
  let headerRow = 0;

  for (let i = 1; i <= sheet.rowCount; i++) {
    sheet.getRow(i).eachCell((cell, col) => {
      const h = cleanCellValue(cell.value).toLowerCase();
      if (h === "unit") headers.unit = col;
      if (h === "group") headers.group = col;
      if (h.includes("difficulty")) headers.difficulty = col;
      if (h === "question") headers.question = col;
      if (h === "co") headers.co = col;
      if (h === "mark") headers.mark = col;
      if (h.includes("bloom")) headers.bloom = col;
      if (h === "image") headers.image = col;
    });

    if (Object.keys(headers).length >= 6) {
      headerRow = i;
      break;
    }
  }

  const subjectDoc = {
    _id: subjectCode,
    subjectCode,
    subjectName: subjectRecord.name,
    units: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  sheet.eachRow((row, idx) => {
    if (idx <= headerRow) return;

    const unit = Number(row.getCell(headers.unit)?.value);
    const mark = Number(row.getCell(headers.mark)?.value);
    if (!unit || !mark) return;

    const part = mark === 2 ? "partA" : mark === 16 ? "partB" : null;
    if (!part) return;

    subjectDoc.units[unit] ??= { partA: [], partB: [] };

    const imageName = cleanCellValue(row.getCell(headers.image)?.value);

    subjectDoc.units[unit][part].push({
      questionCode: `${subjectCode}-U${unit}-${part === "partA" ? "A" : "B"}-${String(
        subjectDoc.units[unit][part].length + 1
      ).padStart(3, "0")}`,
      group: Number(row.getCell(headers.group)?.value) || 0,
      difficulty: Number(row.getCell(headers.difficulty)?.value) || 0,
      question: cleanCellValue(row.getCell(headers.question)?.value),
      co: cleanCellValue(row.getCell(headers.co)?.value),
      bloom: cleanCellValue(row.getCell(headers.bloom)?.value),
      image: imageName || null,
      imagePath: imageName
        ? `/static/images/exams/${folderName}/${imageName}.webp`
        : null
    });
  });

  await col.insertOne(subjectDoc);
  return subjectDoc;
}

module.exports = { ensureSubjectExists };
