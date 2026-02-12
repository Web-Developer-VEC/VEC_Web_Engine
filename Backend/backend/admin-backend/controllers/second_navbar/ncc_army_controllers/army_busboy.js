const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function armyHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    // ---------- BASIC SAFETY ----------
    if (!docs || !docs.length) {
      throw new Error("No document metadata received");
    }

    if (!fileStream) {
      throw new Error("No file stream received");
    }

    const realimagename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg";

    const effectiveimageMime =
      mimetype || filename?.mimeType || "image/jpeg";

    const doc = docs[0];
    const collection_type = doc.collection_type;

    if (collection_type !== "team") {
      fileStream.resume();
      return cb(new Error("Unsupported collection type"));
    }

    // ---------- FILE TYPE VALIDATION ----------
    if (!effectiveimageMime.startsWith("image/")) {
      fileStream.resume();
      return cb(new Error("Only images are allowed"));
    }

    // ---------- FILE NAME (USE UPLOADED NAME) ----------
    const baseName = path.basename(realimagename, path.extname(realimagename));
    const ext = path.extname(realimagename) || ".jpg";

    const safeBaseName = baseName
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");

    const finalFileName = `${safeBaseName}${ext}`;

    // ---------- S3 KEY (TEMP PATH) ----------
    const s3Key = `temp/static/images/ncc/army/${finalFileName}`;

    // ---------- BUFFER FILE ----------
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }

    if (!chunks.length) {
      throw new Error("Uploaded file is empty");
    }

    const fileBuffer = Buffer.concat(chunks);

    // ---------- UPLOAD TO S3 ----------
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveimageMime,
      ContentLength: fileBuffer.length,
      CacheControl: "no-cache",
    });

    const data = await s3.send(command);

    // ---------- MUTATE DOC FOR MONGO (LIKE placementHandler) ----------
    doc.meta_data = {
      ...(doc.meta_data || {}),
      image_path: `/${s3Key}`,   // 👈 this is what gets written to Mongo
    };

    // ---------- TRACK UPLOAD ----------
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectiveimageMime,
      size: fileBuffer.length,
      originalName: realimagename,
    });

    cb(null, data);
  } catch (err) {
    console.error("❌ Army upload failed:", err.message);
    cb(err);
  }
}

module.exports = armyHandler;
