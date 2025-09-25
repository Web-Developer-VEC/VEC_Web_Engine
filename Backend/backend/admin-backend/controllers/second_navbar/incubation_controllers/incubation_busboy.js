const { s3, bucketName } = require("../../../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function incubationHandler(fileStream, docs, req, cb, filename, mimetype) {
  try {
    const realFilename =
      typeof filename === "string"
        ? filename
        : filename?.filename || "image.jpg";

    const effectiveMime = mimetype || filename?.mimeType || "image/jpeg";

    console.log("Uploading incubation facilities images:", { realFilename, effectiveMime });

    // ✅ Allow only image formats
    if (!(effectiveMime.startsWith("image/") || effectiveMime === "application/pdf")) {
      fileStream.resume();
      return cb(new Error("Only images or PDFs are allowed"));
    }

    const collection_type = docs[0]?.collection_type;
    let s3Key 

    if (collection_type === "facilities") {
      const name = docs[0].meta_data.name;
      const folder = `temp/static/images/hostel/${name}`;
      s3Key = folder;
    }

    // Buffer the stream
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: effectiveMime,
    });

    const data = await s3.send(command);

    // Track uploaded files
    if (!req.uploadedFiles) req.uploadedFiles = [];
    req.uploadedFiles.push({
      key: s3Key,
      location: `/${s3Key}`, // replace with full S3 URL if needed
      mimetype: effectiveMime,
    });

    cb(null, data);
  } catch (err) {
    cb(err);
  }
}

module.exports = incubationHandler;
