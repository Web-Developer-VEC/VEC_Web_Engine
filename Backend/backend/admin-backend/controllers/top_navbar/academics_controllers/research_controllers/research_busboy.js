const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const deptMap = require("../../../../models/deptmap");

const reverseDeptMap = Object.fromEntries(
  Object.entries(deptMap).map(([k, v]) => [v.toUpperCase().trim(), k])
);

function shortYear(yearStr) {
  if (!yearStr) return null;

  const clean = yearStr
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const match = clean.match(/(\d{4})\s*-\s*(\d{4})/);
  if (!match) return null;

  return match[1].slice(2) + match[2].slice(2);
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

    const doc = docs[0];

    const collectionType = doc?.collection_type?.trim().toLowerCase();
    const collectionName = doc?.collectionName || doc?.collection_name;
    const meta_data = doc?.meta_data;
    const action = doc?.action;

    if (collectionType !== "research")
      return cb(new Error("Unsupported collection type"));

    if (!collectionName)
      return cb(new Error("Missing collectionName"));

    if (!meta_data?.year)
      return cb(new Error("Missing year in meta_data"));

    if (!Array.isArray(meta_data?.research))
      return cb(new Error("Research array missing"));

    const deptKey = reverseDeptMap[collectionName.toUpperCase().trim()];
    if (!deptKey)
      return cb(new Error("Invalid collectionName"));

    const yearFolder = shortYear(meta_data.year);
    if (!yearFolder)
      return cb(new Error("Year must be in format 'YYYY - YYYY'"));

    // Buffer stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const tempKey = `temp/static/pdfs/research/${deptKey}/${yearFolder}/${realPdfName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: tempKey,
        Body: fileBuffer,
        ContentType: effectiveMime,
      })
    );

    if (!req.uploadedFiles) req.uploadedFiles = [];

    const uploaded = {
      key: tempKey,
      location: `/${tempKey}`,
      mimetype: effectiveMime,
      year: meta_data.year,
      category: doc?.category,
      collectionName,
      action,
    };

    req.uploadedFiles.push(uploaded);

    // 🔥 MULTI-FILE SAFE ASSIGNMENT
    const index = meta_data.research.findIndex(item => {
      const oldFileName = item.pdf_path.split("/").pop();
      return oldFileName === realPdfName;
    });

    if (index === -1) {
      return cb(
        new Error(`No matching research item found for ${realPdfName}`)
      );
    }

    meta_data.research[index].pdf_path = uploaded.location;


    cb(null, uploaded);

  } catch (err) {
    console.error("Research upload error:", err);
    cb(err);
  }
}

module.exports = deptresearchHandler;