const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const deptMap = require("../../../../models/deptmap");

// Reverse lookup: "AIDS_001" -> "001"
const reverseDeptMap = Object.fromEntries(
  Object.entries(deptMap).map(([k, v]) => [v.toUpperCase().trim(), k])
);

// Normalize " 2022 - 2029 " -> "2229"
function shortYear(yearStr) {
  if (!yearStr) return null;
  const clean = yearStr
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const match = clean.match(/(\d{4})\s*-\s*(\d{4})/);
  if (!match) return null;

  return match[1].slice(2) + match[2].slice(2); // "2229"
}

async function deptresearchHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realPdfName =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file.pdf";

    const effectiveMime =
      mimetype || filename?.mimeType || "application/pdf";

    if (effectiveMime !== "application/pdf") {
      fileStream.resume();
      return cb(new Error("Only PDFs are allowed for research uploads"));
    }

    const collectionType = docs[0]?.collection_type?.trim().toLowerCase();
    const collectionName =
      docs[0]?.collectionName || docs[0]?.collection_name;
    const meta_data = docs[0]?.meta_data;
    const action = docs[0]?.action;

    if (collectionType !== "research") {
      return cb(new Error("Unsupported collection type"));
    }

    if (!collectionName) {
      return cb(new Error("Missing collectionName"));
    }

    if (!meta_data?.year) {
      return cb(new Error("Missing year in meta_data"));
    }

    const deptKey = reverseDeptMap[collectionName.toUpperCase().trim()];
    if (!deptKey) {
      return cb(new Error("Invalid collectionName. Not found in deptMap"));
    }

    const yearFolder = shortYear(meta_data.year);
    if (!yearFolder) {
      return cb(new Error("Year must be in format 'YYYY - YYYY'"));
    }

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) chunks.push(chunk);
    const fileBuffer = Buffer.concat(chunks);

    const tempKey = `temp/static/pdfs/research/${deptKey}/${yearFolder}/${realPdfName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: tempKey,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });

    const data = await s3.send(command);

    // Track uploaded file for move step
    if (!req.uploadedFiles) req.uploadedFiles = [];
    const uploaded = {
      key: tempKey,
      location: `/${tempKey}`, // KEEP /temp path here
      mimetype: effectiveMime,
      year: meta_data.year,
      category: docs[0]?.category,
      collectionName,
      action,
    };
    req.uploadedFiles.push(uploaded);

    // ✅ Put pdf_path INSIDE research item (KEEP /temp path)
    if (meta_data?.research?.length) {
      const lastIndex = meta_data.research.length - 1;
      meta_data.research[lastIndex].pdf_path = uploaded.location;
    }

    // ❌ Ensure no top-level pdf_path remains
    if ("pdf_path" in meta_data) {
      delete meta_data.pdf_path;
    }

    cb(null, data);
  } catch (err) {
    console.error("Research upload error:", err);
    cb(err);
  }
}

module.exports = deptresearchHandler;
