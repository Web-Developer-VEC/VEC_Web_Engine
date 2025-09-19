const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getDb } = require("../../../../main-backend/config/db");

// 🔹 Store counters in memory per collection type
const uploadCounters = {};

async function navyHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realimagename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg";

    const effectiveimageMime = mimetype || filename?.mimeType || "image/jpeg";

    if (!effectiveimageMime.startsWith("image/")) {
      fileStream.resume();
      return cb(new Error("Only images are allowed"));
    }

    const collection_type = docs[0]?.collection_type;
    const collectionName = docs[0]?.collectionName;
    const meta_data = docs[0]?.meta_data;
    let nextIndex = null;

    const db = getDb();
    const mainCollection = db.collection(collectionName);

    // Initialize counter if not set
    if(collection_type === "events" || collection_type === "awards"){
        
        if (!uploadCounters[collection_type]) {
          const existingDoc = await mainCollection.findOne({ type: collection_type });
          const Data = existingDoc?.data || [];
          uploadCounters[collection_type] = Data.length; // set base count from DB
        }
        // Increment counter for this request
        uploadCounters[collection_type] += 1;
        nextIndex = uploadCounters[collection_type];
    }


    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    let last, folder, s3Key, command;
    const ext = path.extname(realimagename) || ".jpg";

    if (collection_type === "team") {
      last = meta_data?.name;
    } else if (collection_type === "events") {
      last = `events${String(nextIndex).padStart(2, "0")}`;
    } else if (collection_type === "awards") {
      last = `stud_achieve${String(nextIndex).padStart(2, "0")}`;
    } else {
      return cb(new Error("Unsupported collection type"));
    }

    folder = `temp/static/images/ncc/navy/${last}${ext}`;
    s3Key = folder;

    command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveimageMime,
    });

    const data = await s3.send(command);

    // Track uploaded files
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: command.input.ContentType,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = navyHandler;
