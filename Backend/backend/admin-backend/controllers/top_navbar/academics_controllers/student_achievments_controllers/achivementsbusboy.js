const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const deptMap = require("../../../../models/deptmap");

// Build reverse lookup once (model -> folderId)
const reverseDeptMap = Object.fromEntries(
  Object.entries(deptMap).map(([k, v]) => [v, k])
);

async function studentAchievementsHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFileName =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.webp";

    const effectiveMime =
      mimetype || filename?.mimeType || "image/webp";

    if (!effectiveMime.startsWith("image/")) {
      fileStream.resume();
      return cb(new Error("Only image files are allowed"));
    }

    const collectionType = docs[0]?.collection_type;  // "student_achievements"
    const collectionName = docs[0]?.collectionName;  // e.g. "AIDS_001"
    const meta_data = docs[0]?.meta_data;            

    if (collectionType !== "student_achievements") {
      return cb(new Error("Unsupported collection type"));
    }

    
  

    // ✅ Resolve folderId from model map using collectionName
    const folderId = reverseDeptMap[collectionName]; // "001"

    if (!folderId) {
      return cb(new Error("Invalid collectionName. Not found in deptMap"));
    }

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const s3Key = `temp/static/images/student_activities/${folderId}/${realFileName}`;

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
      mimetype: command.input.ContentType,
      event_name: meta_data?.event_name,
      image_content: meta_data?.image_content,
      category: docs[0]?.category,
      collectionName,
    });

    cb(null, data);
  } catch (err) {
    console.error("Student achievements upload error:", err);
    cb(err);
  }
}

module.exports = studentAchievementsHandler;
