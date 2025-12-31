const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function nssHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realImageName =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg";

    const effectiveImageMime =
      mimetype || filename?.mimeType || "image/jpeg";

    // ✅ Allow only images
    if (!effectiveImageMime.startsWith("image/")) {
      fileStream.resume();
      return cb(new Error("Only images are allowed"));
    }

    const collection_type = docs[0]?.collection_type;
    const collectionName = docs[0]?.collectionName;
    const meta_data = docs[0]?.meta_data || {};

    // 🔹 Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const ext = path.extname(realImageName) || ".jpg";

    let fileNamePart;

    if (collection_type === "team") {
      // ✅ Student name → filename
      fileNamePart =
        meta_data.name?.trim() ||
        path.basename(realImageName, ext);
    } else if (collection_type === "events") {
      fileNamePart = `event/${meta_data.title?.trim() || Date.now()}`;
    } else {
      return cb(new Error("Unsupported collection type"));
    }

    // ✅ FINAL S3 KEY (TEMP PATH)
    const s3Key = `temp/static/images/${collectionName}/${fileNamePart}${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveImageMime,
    });

    const data = await s3.send(command);
    docs[0].meta_data = {
      ...meta_data,
      image_path: `/${s3Key}`, // → /temp/static/images/...
    };

    // ✅ Track uploaded files (used by temp middleware)
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`,
      mimetype: effectiveImageMime,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = nssHandler;
