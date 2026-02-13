const path = require("path");
const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const deptMap = require("../../../../models/deptmap");

async function syllabusHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realName =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file";

    const ext = path.extname(realName).toLowerCase();

    if (ext !== ".pdf") {
      fileStream.resume();
      return cb(new Error("Only PDF files allowed"));
    }

    const pdfMime = mimetype || "application/pdf";

    const { collection_type, collectionName, meta_data } = docs[0];

    if (collection_type !== "curriculum_and_syllabus") {
      return cb(new Error("Invalid collection type"));
    }

    if (!collectionName) {
      return cb(new Error("collectionName is required"));
    }

    /* ---------------- VALIDATE DEPARTMENT ---------------- */

    const validDepartments = Object.values(deptMap);

    if (!validDepartments.includes(collectionName)) {
      return cb(new Error("Invalid department collectionName"));
    }

    const { year, name } = meta_data;

    if (!year || !name) {
      return cb(new Error("year and name are required"));
    }

    /* ---------------- CLEAN VALUES ---------------- */

    const cleanYear = year.replace(/\s+/g, "").replace("-", "");
    const cleanName = name.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");

    const s3Key = `temp/static/pdfs/curriculum/${collectionName}/${cleanYear}/${cleanName}${ext}`;

    /* ---------------- BUFFER FILE ---------------- */

    const chunks = [];
    for await (const chunk of fileStream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    /* ---------------- UPLOAD ---------------- */

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: pdfMime,
      })
    );

    if (!req.uploadedFiles) req.uploadedFiles = [];

    req.uploadedFiles.push({
      key: s3Key,
      location: s3Key,
      mimetype: pdfMime,
    });

    /* ---------------- INJECT PATH ---------------- */

    meta_data.pdf_path = `/${s3Key}`;

    return cb(null, { key: s3Key });

  } catch (err) {
    cb(err);
  }
}

module.exports = syllabusHandler;
