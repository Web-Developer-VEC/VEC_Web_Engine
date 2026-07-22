const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const deptMap = require("../../../../models/deptmap");
const path = require('path');

// Build reverse map once
const reverseDeptMap = Object.fromEntries(
  Object.entries(deptMap).map(([k, v]) => [v.toUpperCase().trim(), k])
);

async function activitiesHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file";

    const effectiveMime =
      mimetype || filename?.mimeType || "application/octet-stream";

    // ✅ Logic Changed: Allow ONLY PDFs
    const isPDF = effectiveMime === "application/pdf" || realFilename.toLowerCase().endsWith('.pdf');

    if (!isPDF) {
      // Important: Resume the stream to avoid memory leaks/hanging requests
      fileStream.resume();
      return cb(new Error("Only PDF documents are allowed"));
    }

    const collection_type = docs[0].collection_type;
    const collectionName = docs[0]?.collectionName || docs[0]?.collection_name;

    if (!collectionName) {
      return cb(new Error("collectionName is missing"));
    }

    const normalizedName = collectionName.toUpperCase().trim();
    const folderId = reverseDeptMap[normalizedName];
    let s3Key;

    if (collection_type === "activities") {
      // Changed folder naming convention from 'images' to 'documents' or 'files' for clarity
      const year = docs[0].meta_data.year.replace(/\s*-\s*/g, "-");

      const folder = `temp/static/pdfs/dept_activities/${folderId}/${year}/`; s3Key = folder + realFilename;
    }

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: "application/pdf", // Explicitly set PDF content type
    });
    const uploadedFileName = path.basename(realFilename);
    const data = await s3.send(command);
    const location = `/${s3Key}`;
    const activity = docs[0].meta_data.activities_tile.find(item => {
      if (!item.pdf_path) return false;

      return path.basename(item.pdf_path) === uploadedFileName;
    });

    if (activity) {
      activity.pdf_path = `/${s3Key}`;
    }

    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: "application/pdf",
      category: docs[0]?.category, // Ensure category is pulled from docs
      department: folderId,
    });

    cb(null, data);
  } catch (err) {
    console.error("PDF upload error:", err);
    cb(err);
  }
}

module.exports = activitiesHandler;