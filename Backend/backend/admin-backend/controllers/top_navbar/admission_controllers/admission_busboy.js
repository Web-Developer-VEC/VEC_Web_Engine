const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

async function admissionsHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file";

    const effectiveMime =
      mimetype || filename?.mimeType || "application/octet-stream";

    const collection_type = docs[0]?.collection_type;
    const meta_data = docs[0]?.meta_data;

    const ext = path.extname(realFilename);
    let s3Key;

    /* ===============================
       VALIDATION
    =============================== */

    const isImage = effectiveMime.startsWith("image/");
    const isPDF = effectiveMime === "application/pdf";

    if (!isImage && !isPDF) {
      fileStream.resume();
      return cb(new Error("Only image and PDF files are allowed"));
    }

    /* ===============================
       IMAGE HANDLING
    =============================== */
    if (isImage) {
      if (collection_type !== "admission_team") {
        return cb(new Error("Images are allowed only for admission_team"));
      }

      if (!meta_data?.name) {
        return cb(new Error("Name required for admission_team upload"));
      }

      s3Key = `temp/static/images/admission_team/${meta_data.name}${ext}`;
    }

    /* ===============================
       PDF HANDLING
    =============================== */
   /* ===============================
   PDF HANDLING
=============================== */
if (isPDF) {
  if (!["ug", "mba"].includes(collection_type)) {
    return cb(new Error("PDF uploads not allowed for this collection type"));
  }

  let quotaKey = null;

  if (collection_type === "ug") {
    quotaKey = meta_data?.BE_Government
      ? "BE_Government"
      : meta_data?.BE_Management
      ? "BE_Management"
      : null;
  }

  if (collection_type === "mba") {
    quotaKey = meta_data?.MBA_Government
      ? "MBA_Government"
      : meta_data?.MBA_Management
      ? "MBA_Management"
      : null;
  }

  if (!quotaKey) {
    return cb(new Error("Invalid admission quota structure"));
  }

  const ext = path.extname(realFilename) || ".pdf";
  s3Key = `temp/static/pdfs/admission/${realFilename}`;

  // ✅ Inject pdf_path INSIDE quota object (like placement_details)
  meta_data[quotaKey].pdf_path = `/${s3Key}`;

  // ✅ Remove wrong root-level pdf_path if exists
  delete meta_data.pdf_path;
}


    /* ===============================
       BUFFER STREAM
    =============================== */
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    /* ===============================
       S3 UPLOAD
    =============================== */
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });

    const data = await s3.send(command);

    /* ===============================
       TRACK UPLOADS
    =============================== */
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectiveMime,
    });

    cb(null, data);
  } catch (err) {
    console.error("Upload error:", err);
    cb(err);
  }
}

module.exports = admissionsHandler;
