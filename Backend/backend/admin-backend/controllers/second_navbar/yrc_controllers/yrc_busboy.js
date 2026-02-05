const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function yrcHandler(fileStream, docs, req, cb, filename, mimetype) {
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

    const effectiveimageMime = mimetype || filename?.mimeType || "image/jpeg";

    if (!effectiveimageMime.startsWith("image/")) {
      fileStream.resume();
      return cb(new Error("Only images are allowed"));
    }

    const doc = docs[0];
    const collection_type = doc.collection_type;
    const collectionName = doc.collectionName;
    const meta_data = doc.meta_data || {};

    // ---------- BUFFER FILE ----------
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    if (!fileBuffer.length) {
      throw new Error("Uploaded file is empty");
    }

    // ---------- FILE NAME LOGIC ----------
    const ext = path.extname(realimagename) || ".jpg";
    let last;

    if (collection_type === "team") {
      if (!meta_data?.name) {
        throw new Error("meta_data.name is required for team upload");
      }
      last = meta_data.name
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");
    } else if (collection_type === "events") {
      if (!meta_data?.title) {
        throw new Error("meta_data.title is required for events upload");
      }
      last = `event/${meta_data.title
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "")}`;
    } else if (collection_type === "awards") {
      if (!meta_data?.title) {
        throw new Error("meta_data.title is required for awards upload");
      }
      last = `award/${meta_data.title
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "")}`;
    } else {
      throw new Error("Unsupported collection type");
    }

    // ---------- S3 KEY ----------
    const s3Key = `temp/static/images/${collectionName}/${last}${ext}`;

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

    // ---------- MUTATE DOC FOR MONGO ----------
    doc.meta_data = {
      ...(doc.meta_data || {}),
      image_path: `/${s3Key}`, // 👈 written into Mongo by temp-store middleware
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
    console.error("❌ YRC upload failed:", err.message);
    cb(err);
  }
}

module.exports = yrcHandler;
