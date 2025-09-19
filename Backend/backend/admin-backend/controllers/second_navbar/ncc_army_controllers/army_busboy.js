const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function armyHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realimagename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg";

    const effectiveimageMime =
      mimetype || filename?.mimeType || "image/jpeg";

    const collection_type = docs[0]?.collection_type;
    const collectionName = docs[0]?.collectionName;
    const meta_data = docs[0]?.meta_data;

    let ext, folder, s3Key, command, fileBuffer;

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    fileBuffer = Buffer.concat(chunks);

    if (collection_type === "team") {
      // ✅ Allow only images
      if (!effectiveimageMime.startsWith("image/")) {
        fileStream.resume();
        return cb(new Error("Only images are allowed"));
      }

      ext = path.extname(realimagename) || "";
      folder = `temp/static/images/ncc/army/${meta_data.name}${ext}`;
      s3Key = folder;

      command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: effectiveimageMime,
      });
    } else {
      return cb(new Error("Unsupported collection type"));
    }

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

module.exports = armyHandler;
