const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getDb } = require("../../../../main-backend/config/db");

// 🔹 Store counters in memory per collection type
const uploadCounters = {};

async function navyHandler(fileStream, docs, req, cb, filename, mimetype) {
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

    let nextIndex = null;

    // ---------- DB COUNTER LOGIC ----------
    const db = getDb();
    const mainCollection = db.collection(collectionName);

    if (collection_type === "events" || collection_type === "awards") {
      if (!uploadCounters[collection_type]) {
        const existingDoc = await mainCollection.findOne({ type: collection_type });
        const Data = existingDoc?.data || [];
        uploadCounters[collection_type] = Data.length; // base count from DB
      }
      uploadCounters[collection_type] += 1;
      nextIndex = uploadCounters[collection_type];
    }

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
      last = `events${String(nextIndex).padStart(2, "0")}`;
    } else if (collection_type === "awards") {
      last = `stud_achieve${String(nextIndex).padStart(2, "0")}`;
    } else {
      throw new Error("Unsupported collection type");
    }

    // ---------- S3 KEY ----------
    const s3Key = `temp/static/images/ncc/navy/${last}${ext}`;

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
      image_path: `/${s3Key}`,   // 👈 this will be written to Mongo by temp-store middleware
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
    console.error("❌ Navy upload failed:", err.message);
    cb(err);
  }
}

module.exports = navyHandler;
