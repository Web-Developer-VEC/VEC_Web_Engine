const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function libraryHandler(fileStream, docs, req, cb, filename, mimetype) {
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
    const category = docs[0]?.category;

    if (!collection_type || !collectionName) {
      return cb(new Error("collection_type and collectionName are required"));
    }

    // 🔹 Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const ext = path.extname(realImageName) || ".jpg";

    let fileNamePart;

    // ===============================
    // 🔥 HANDLE COLLECTION TYPES
    // ===============================

    if (collection_type === "HOD") {
      fileNamePart =
        `HOD/${meta_data.name?.trim() || path.basename(realImageName, ext)}`;
    }

    else if (collection_type === "Faculty_Staff") {
      fileNamePart =
        `faculty/${meta_data.name?.trim() || path.basename(realImageName, ext)}`;
    }

    else if (collection_type === "library_services") {
      if (category === "Image_Gallery") {
        fileNamePart =
          `library_images/${meta_data.title?.trim() || Date.now()}`;
      } else {
        return cb(new Error("Invalid category for library_services"));
      }
    }

    else if (collection_type === "digital_libraries") {
      fileNamePart =
        `library_images/${meta_data.title?.trim() || Date.now()}`;
    }

    else {
      return cb(new Error("Unsupported collection type"));
    }

    // ===============================
    // ✅ FINAL S3 KEY (TEMP PATH)
    // ===============================
    const s3Key = `temp/static/images/${collectionName}/${fileNamePart}${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveImageMime,
    });

    const data = await s3.send(command);

    const imagePath = `/${s3Key}`;

    // ===============================
    // ✅ SAME AS NSS HANDLER
    // Attach image_path to meta_data only
    // ===============================
    docs[0].meta_data = {
      ...meta_data,
      image_path: imagePath,
    };

    // ===============================
    // ✅ Track uploaded files
    // ===============================
    if (!req.uploadedFiles) req.uploadedFiles = [];

    req.uploadedFiles.push({
      key: s3Key,
      location: imagePath,
      mimetype: effectiveImageMime,
    });

    cb(null, data);

  } catch (err) {
    cb(err);
  }
}

module.exports = libraryHandler;
