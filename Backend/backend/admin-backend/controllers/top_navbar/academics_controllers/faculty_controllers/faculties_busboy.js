const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const deptMap = require("../../../../models/deptmap");

// Build reverse map once
const reverseDeptMap = Object.fromEntries(
  Object.entries(deptMap).map(([k, v]) => [v.toUpperCase().trim(), k])
);

async function facultyHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file";

    const effectiveMime =
      mimetype || filename?.mimeType || "application/octet-stream";

    // ✅ Allow only images and PDFs
    const isImage = effectiveMime.startsWith("image/");
    const isPdf = effectiveMime === "application/pdf";

    if (!isImage && !isPdf) {
      fileStream.resume();
      return cb(new Error("Only images and PDFs are allowed"));
    }

    const category = docs[0]?.category; // head_of_department / teaching_staff / non_teaching_staff
    const collectionName = docs[0]?.collectionName || docs[0]?.collection_name; // e.g. AUTO_002

    if (!collectionName) {
      return cb(new Error("collectionName is missing"));
    }

    const normalizedName = collectionName.toUpperCase().trim();
    const folderId = reverseDeptMap[normalizedName]; // "002"

    if (!folderId) {
      return cb(new Error(`Invalid collectionName '${collectionName}'`));
    }

    // ✅ Decide folder based on file type
    const baseFolder = isPdf
      ? `temp/static/pdfs/faculty_profile/${folderId}/`
      : `temp/static/images/profile_photos/${folderId}/`;

    // Optional: name file by unique_id if available
    const uniqueId = docs[0]?.members?.[0]?.unique_id;
    const finalFilename = uniqueId
      ? isPdf
        ? `${uniqueId}.pdf`
        : realFilename
      : realFilename;

    const s3Key = baseFolder + finalFilename;

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

module.exports = facultyHandler;
