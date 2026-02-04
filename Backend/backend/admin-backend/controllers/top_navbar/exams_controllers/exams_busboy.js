const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function examHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realName =
      typeof filename === "string"
        ? filename
        : filename?.filename || "file";

    const ext = path.extname(realName).toLowerCase();
    const isPdf = ext === ".pdf";
    const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);

    const pdfMime = mimetype || "application/pdf";
    const imageMime = mimetype || "image/jpeg";

    const collection_type = docs[0]?.collection_type;
    const category = docs[0]?.category;
    const meta_data = docs[0]?.meta_data || {};

    const safeName =
      meta_data.name ||
      path.basename(realName, ext).replace(/\s+/g, "_");

    /* ---------- NO FILE TYPES ---------- */
    if (collection_type === "exam_curriculum") {
      return cb(null, null);
    }

    /* ---------- VALIDATION ---------- */
    if (isPdf && !pdfMime.startsWith("application/pdf")) {
      fileStream.resume();
      return cb(new Error("Only PDF files are allowed"));
    }

    if (isImage && !imageMime.startsWith("image/")) {
      fileStream.resume();
      return cb(new Error("Only image files are allowed"));
    }

    /* ---------- BUFFER FILE ---------- */
    const chunks = [];
    for await (const chunk of fileStream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    let s3Key;
    let contentType;

    /* ---------- ROUTING ---------- */

    if (
      collection_type === "COE" &&
      ["COE", "Deputy COE", "Co-ordinator – Internal Examinations", "COE Staffs"]
        .includes(category)
    ) {
      contentType = imageMime;
      s3Key = `temp/static/images/coe/${safeName}${ext}`;
    }

    else if (collection_type === "regulation") {
      contentType = pdfMime;
      s3Key = `temp/static/pdfs/regulation_docs/${category}_${safeName}${ext}`;
    }

    else if (
      collection_type === "all_forms" &&
      ["student", "faculty"].includes(category)
    ) {
      contentType = pdfMime;
      s3Key = `temp/static/pdfs/all_forms/${safeName}${ext}`;
    }

    else if (collection_type === "rankholder") {
      contentType = pdfMime;
      s3Key = `temp/static/pdfs/rank_holder/${category}_${safeName}${ext}`;
    }

    else {
      return cb(new Error("Unsupported collection type"));
    }

    /* ---------- UPLOAD ---------- */
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    /* ---------- TRACK FILE ---------- */
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: contentType,
    });

    /* 🔥 REGULATION FIX: inject pdf_path directly */
    if (collection_type === "regulation") {
      meta_data.pdf_path = `/${s3Key}`;
    }

    cb(null, { key: s3Key });
  } catch (err) {
    cb(err);
  }
}

module.exports = examHandler;
