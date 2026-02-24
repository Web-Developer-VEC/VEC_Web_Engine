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

    // ✅ Allow only images and PDFs
    const isImage = effectiveMime.startsWith("image/");

    if (!isImage) {
      fileStream.resume();
      return cb(new Error("Only images  are allowed"));
    }

    const collection_type = docs[0].collection_type;
    const collectionName = docs[0]?.collectionName || docs[0]?.collection_name; // e.g. AUTO_002

    if (!collectionName) {
      return cb(new Error("collectionName is missing"));
    }

    const normalizedName = collectionName.toUpperCase().trim();
    const folderId = reverseDeptMap[normalizedName]; 
    let s3Key;

    if(collection_type === "activities"){

        const folder = `temp/static/images/dept_activities/${folderId}/`;
        s3Key = folder + realFilename;
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
      ContentType: effectiveMime,
    });

    const data = await s3.send(command);

    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectiveMime,
      category,
      department: folderId,
    });

    cb(null, data);
  } catch (err) {
    console.error("Faculty upload error:", err);
    cb(err);
  }
}

module.exports = activitiesHandler;
