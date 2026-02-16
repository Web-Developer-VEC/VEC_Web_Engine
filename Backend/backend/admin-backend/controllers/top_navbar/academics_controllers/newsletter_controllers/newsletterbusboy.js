const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const deptMap = require("../../../../models/deptmap");

// Build reverse lookup once (model -> folderId)
const reverseDeptMap = Object.fromEntries(
  Object.entries(deptMap).map(([k, v]) => [v, k])
);

async function newsletterHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realpdfname =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file.pdf";

    const effectivepdfMime =
      mimetype || filename?.mimeType || "application/pdf";

    if (!effectivepdfMime.startsWith("application/pdf")) {
      fileStream.resume();
      return cb(new Error("Only PDFs are allowed"));
    }

    const collectionType = docs[0]?.collection_type;
    const collectionName = docs[0]?.collectionName; // e.g. "CSE_005"
    const meta_data = docs[0]?.meta_data;

    if (collectionType !== "newsletter") {
      return cb(new Error("Unsupported collection type"));
    }

    if (!meta_data?.year) {
      return cb(new Error("Missing year in meta_data"));
    }

    // (Optional) If you want strict year format
    const yearRegex = /^\d{4}-\d{4}$/;
    if (!yearRegex.test(meta_data.year)) {
      return cb(new Error("Year must be in format 'YYYY-YYYY'"));
    }

    // ✅ Resolve folderId from model map using collectionName
    const folderId = reverseDeptMap[collectionName]; // "005"

    if (!folderId) {
      return cb(new Error("Invalid collectionName. Not found in deptMap"));
    }

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const s3Key = `temp/static/pdfs/newsletter/${folderId}/${realpdfname}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectivepdfMime,
    });

    const data = await s3.send(command);

    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: command.input.ContentType,
      year: meta_data.year,
      category: docs[0]?.category,
      collectionName,
    });

    cb(null, data);
  } catch (err) {
    console.error("Newsletter upload error:", err);
    cb(err);
  }
}

module.exports = newsletterHandler;
