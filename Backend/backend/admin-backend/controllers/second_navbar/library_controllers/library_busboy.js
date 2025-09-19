const path = require("path");
const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function libraryHandler(fileStream, docs, req, cb, filename, mimetype) {
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
    const category = docs[0]?.category;

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    let last, folder, s3Key, command;
    const ext = path.extname(realimagename) || ".jpg";

    if (collection_type === "hod") {
      last = `${collection_type}/${meta_data?.name}`;
    } else if (collection_type === "Faculty_Staff") {
      last = `faculty/${meta_data?.name}`;
    } else if (collection_type === "library_services") {
      if (category === "Image_Gallery") {
        last = `library_images/${meta_data.title}`;
      }
    } else if (collection_type === "digital_libraries") {
      last = `library_images/${meta_data.title}`;
    } else {
      return cb(new Error("Unsupported collection type"));
    }

    folder = `temp/static/images/${collectionName}/${last}${ext}`;
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

module.exports = libraryHandler;
