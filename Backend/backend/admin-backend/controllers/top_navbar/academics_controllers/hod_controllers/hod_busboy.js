const { s3, bucketName } = require("../../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const deptMap = require("../../../../models/constants/deptMap");

// Reverse lookup: "CSE_005" -> "005"
const reverseDeptMap = Object.fromEntries(
  Object.entries(deptMap).map(([k, v]) => [v.toUpperCase().trim(), k])
);

async function hodHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file";

    const effectiveMime =
      mimetype || filename?.mimeType || "application/octet-stream";

    const isImage = effectiveMime.startsWith("image/");
    const isPdf = effectiveMime === "application/pdf";

    // ✅ Allow only images + PDFs
    if (!isImage && !isPdf) {
      fileStream.resume();
      return cb(new Error("Only images and PDFs are allowed"));
    }

    const collectionName =
      docs[0]?.collectionName || docs[0]?.collection_name; // e.g. "CSE_005"

    if (!collectionName) {
      return cb(new Error("collectionName is missing"));
    }

    const normalizedName = collectionName.toUpperCase().trim();
    const folderId = reverseDeptMap[normalizedName]; // "005"

    if (!folderId) {
      return cb(new Error(`Invalid collectionName '${collectionName}'`));
    }

    // ✅ Decide folder based on file type
    const baseFolder = isPdf
      ? `temp/static/pdfs/faculty_profile/${folderId}/`
      : `temp/static/images/hods/${folderId}/`;

    // Optional: name files by unique_id for PDF
    const uniqueId = docs[0]?.members?.[0]?.unique_id; // if present
    const finalFilename = isPdf && uniqueId ? `${uniqueId}.pdf` : realFilename;

    const s3Key = baseFolder + finalFilename;

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

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
      department: folderId,
      type: isPdf ? "resume_pdf" : "hod_image",
    });

    cb(null, data);
  } catch (err) {
    console.error("HOD upload error:", err);
    cb(err);
  }
}

module.exports = hodHandler;
